<!--
 * @Description: 订单管理页面
 * @Author: 程前
 * @Date: 2025-07-24 09:33:25
 * @LastEditors: 程前
 * @LastEditTime: 2025-11-24 18:17:13
-->
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Search,
  Refresh,
  More,
  Upload,
  View,
  ArrowDown,
  CopyDocument
} from "@element-plus/icons-vue";
import {
  getOrderList,
  type OrderItem,
  type OrderListResponse
} from "@/api/order";
import OrderDetailModal from "@/components/OrderDetailModal/index.vue";
import UploadDraftModal from "@/components/UploadDraftModal/index.vue";
import UploadFinalDraftModal from "@/components/UploadFinalDraftModal/index.vue";
import DisclaimerModal from "@/components/DisclaimerModal/index.vue";
import SearchForm, {
  type SearchFieldConfig
} from "@/components/SearchForm/index.vue";

defineOptions({
  name: "taskList"
});

// 响应式数据
const loading = ref(false);
const orderList = ref<OrderItem[]>([]);

// 搜索表单数据
const searchForm = reactive({
  isZG_YQ: undefined as number | undefined, // 是否终稿逾期
  isCG_YQ: undefined as number | undefined, // 是否初稿逾期
  startTime: "", // 开始时间
  endTime: "", // 结束时间
  orderNumber: "", // 订单编号
  keyword: "", // 关键词
  dateRange: [] as any[] // 时间周期
});

// 搜索表单配置
const searchFields: SearchFieldConfig[] = [
  {
    type: "input",
    field: "orderNumber",
    label: "订单编号",
    placeholder: "输入订单编号",
    width: "w-80"
  },
  {
    type: "input",
    field: "keyword",
    label: "沟通群名",
    placeholder: "输入沟通群名",
    width: "w-80"
  },
  {
    type: "date-range",
    field: "dateRange",
    label: "时间周期",
    width: "300px"
  },
  {
    type: "checkbox",
    field: "isCG_YQ",
    label: "初稿逾期",
    trueValue: 1,
    falseValue: undefined
  },
  {
    type: "checkbox",
    field: "isZG_YQ",
    label: "终稿逾期",
    trueValue: 1,
    falseValue: undefined
  }
];

// 状态统计
const statusStats = reactive({
  all: 0, // 当前页订单数
  inProgress: 0, // 在途订单数 (zt_num)
  completed: 0, // 已完成订单数
  settled: 0, // 已结算订单数
  reassigned: 0, // 已改派订单数
  returned: 0, // 已退单订单数
  abnormal: 0 // 异常订单数 (yc_num)
});

// 当前选中的状态
const activeStatus = ref("all");

// 订单详情弹框
const orderDetailVisible = ref(false);
const selectedOrderId = ref<number | null>(null);

// 上传稿件弹框
const uploadDraftVisible = ref(false);
const uploadDraftType = ref<"first" | "final">("first");
const selectedOrderForUpload = ref<OrderItem | null>(null);

// 上传终稿弹框
const uploadFinalDraftVisible = ref(false);
const selectedOrderForFinalUpload = ref<OrderItem | null>(null);

// 免责申请弹框
const disclaimerVisible = ref(false);
const disclaimerType = ref<"first" | "final">("first");
const selectedOrderForDisclaimer = ref<OrderItem | null>(null);

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  totalPages: 0
});

// 状态标签配置
const statusTabs = computed(() => [
  { key: "all", label: "全部", count: statusStats.all, showBadge: false },
  {
    key: "inProgress",
    label: "在途中",
    count: statusStats.inProgress,
    showBadge: true
  },
  {
    key: "completed",
    label: "已完成",
    count: statusStats.completed,
    showBadge: false
  },
  {
    key: "settled",
    label: "已结算",
    count: statusStats.settled,
    showBadge: false
  },
  {
    key: "reassigned",
    label: "已改派",
    count: statusStats.reassigned,
    showBadge: false
  },
  {
    key: "returned",
    label: "已退单",
    count: statusStats.returned,
    showBadge: false
  },
  {
    key: "abnormal",
    label: "异常",
    count: statusStats.abnormal,
    showBadge: true
  }
]);

// 过滤后的订单列表
const filteredOrderList = computed(() => {
  if (activeStatus.value === "all") {
    return orderList.value;
  }
  if (activeStatus.value === "abnormal") {
    return orderList.value.filter(order => order.abnormalState === 1);
  }
  if (activeStatus.value === "inProgress") {
    return orderList.value.filter(order => order.designState === 6);
  }
  if (activeStatus.value === "completed") {
    return orderList.value.filter(order => order.designState === 7);
  }
  if (activeStatus.value === "settled") {
    return orderList.value.filter(order => order.settlementState === 1);
  }
  if (activeStatus.value === "reassigned") {
    return orderList.value.filter(order => order.isReassignment === 1);
  }
  if (activeStatus.value === "returned") {
    return orderList.value.filter(order => order.designState === 8);
  }
  return orderList.value;
});

/**
 * 获取订单列表
 */
const fetchOrderList = async () => {
  try {
    loading.value = true;
    const searchFormData = {
      page: pagination.current,
      pageSize: pagination.size,
      isZG_YQ: searchForm.isZG_YQ,
      isCG_YQ: searchForm.isCG_YQ,
      startTime: searchForm.dateRange?.[0] || searchForm.startTime || undefined,
      endTime: searchForm.dateRange?.[1] || searchForm.endTime || undefined,
      orderNumber: searchForm.orderNumber || undefined,
      keyword: searchForm.keyword || undefined
    };

    const response = await getOrderList(searchFormData);

    if (response.code === 200) {
      orderList.value = response.result.Data.items;
      pagination.total = response.result.Data.total;
      pagination.totalPages = response.result.Data.totalPages;

      // 更新状态统计 - 使用接口返回的统计数据
      statusStats.all = response.result.Data.items.length; // 当前页订单数
      statusStats.inProgress = response.result.zt_num; // 在途订单数
      statusStats.abnormal = response.result.yc_num; // 异常订单数
    } else {
      ElMessage.error(response.message || "获取订单列表失败");
    }
  } catch (error) {
    console.error("获取订单列表失败:", error);
    ElMessage.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 获取当前搜索参数
 */
const getCurrentSearchParams = () => {
  return {
    isZG_YQ: searchForm.isZG_YQ,
    isCG_YQ: searchForm.isCG_YQ,
    startTime: searchForm.dateRange?.[0] || searchForm.startTime || undefined,
    endTime: searchForm.dateRange?.[1] || searchForm.endTime || undefined,
    orderNumber: searchForm.orderNumber || undefined,
    keyword: searchForm.keyword || undefined
  };
};

// 搜索功能
const handleSearch = async () => {
  pagination.current = 1;
  await fetchOrderListByStatus(activeStatus.value);
};

// 重置搜索
const handleReset = () => {
  searchForm.orderNumber = "";
  searchForm.keyword = "";
  searchForm.dateRange = [];
  searchForm.isCG_YQ = undefined;
  searchForm.isZG_YQ = undefined;
  searchForm.startTime = "";
  searchForm.endTime = "";
  pagination.current = 1;
  fetchOrderListByStatus(activeStatus.value);
};

// 切换状态标签
const handleStatusChange = async (status: string) => {
  activeStatus.value = status;
  await fetchOrderListByStatus(status);
};

/**
 * 根据状态获取订单列表
 */
const fetchOrderListByStatus = async (status: string) => {
  try {
    loading.value = true;
    const searchFormData: any = {
      page: pagination.current,
      pageSize: pagination.size,
      ...getCurrentSearchParams()
    };

    // 根据状态添加相应的筛选参数
    switch (status) {
      case "inProgress":
        searchFormData.designState = 6; // 6-在途
        break;
      case "completed":
        searchFormData.designState = 7; // 7-已完成
        break;
      case "returned":
        searchFormData.designState = 8; // 8-已退单
        break;
      case "settled":
        searchFormData.settlementState = 1; // 1-已结算
        break;
      case "reassigned":
        searchFormData.isReassignment = 1; // 1-是
        break;
      case "abnormal":
        searchFormData.abnormalState = 1; // 1-是
        break;
      case "all":
      default:
        // 全部状态，不添加额外筛选参数
        break;
    }

    const response = await getOrderList(searchFormData);

    if (response.code === 200) {
      orderList.value = response.result.Data.items;
      pagination.total = response.result.Data.total;
      pagination.totalPages = response.result.Data.totalPages;

      // 更新状态统计
      statusStats.all = response.result.Data.items.length;
      statusStats.inProgress = response.result.zt_num;
      statusStats.abnormal = response.result.yc_num;
      console.log(orderList.value);
    } else {
      ElMessage.error(response.message || "获取订单列表失败");
    }
  } catch (error) {
    console.error("获取订单列表失败:", error);
    ElMessage.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取订单状态文本
const getOrderStatus = (order: OrderItem) => {
  if (order.orderCompleteState === 1) {
    return "已完成";
  }
  if (order.designState === 6) {
    return "设计中";
  }
  return "待处理";
};

// 获取订单状态颜色
const getOrderStatusColor = (order: OrderItem) => {
  if (order.orderCompleteState === 1) {
    return "success";
  }
  if (order.designState === 6) {
    return "info";
  }
  return "warning";
};

// 获取进度步骤
const getProgressStep = (order: OrderItem) => {
  // 如果订单已完成，直接返回4
  if (order.orderCompleteState === 1) {
    return 4; // 完成
  }

  // 如果终稿实际完成时间有值，说明终稿已完成
  if (order.zg_Wc_Time) {
    return 4; // 完成
  }

  // 如果初稿实际完成时间有值，说明初稿已完成
  if (order.cg_Wc_Time) {
    return 3; // 终稿阶段
  }

  // 如果派发时间有值，说明已派发
  if (order.distributionCreateTime) {
    return 2; // 初稿阶段
  }

  // 默认返回1（派发阶段）
  return 1; // 派发
};

// 获取进度步骤名称
const getStepName = (step: number) => {
  const steps = ["派发", "初稿", "终稿", "完成"];
  return steps[step - 1] || "";
};

// 获取标签列表
const getOrderTags = (order: OrderItem) => {
  const tags = [];

  if (order.abnormalState === 1) {
    tags.push("异常");
  }
  if (order.isEmergent === 1) {
    tags.push("紧急");
  }
  if (order.cg_YQ === "逾期") {
    tags.push("初稿逾期");
  }
  if (order.zg_YQ === "逾期") {
    tags.push("终稿逾期");
  }
  if (order.tradeState === 3) {
    tags.push("买家已发货");
  }
  if (order.tradeState === 1) {
    tags.push("买家已付款");
  }

  return tags;
};

// 获取标签类型
const getTagType = (tag: string) => {
  if (tag.includes("异常")) return "danger";
  if (tag.includes("逾期")) return "warning";
  if (tag.includes("紧急")) return "danger";
  if (tag.includes("已发货")) return "success";
  if (tag.includes("已付款")) return "primary";
  return "info";
};

// 判断订单是否处于初稿状态
const isFirstDraftState = (order: OrderItem): boolean => {
  // 状态6-初稿中，可以上传初稿
  return order.designState === 6;
};

// 判断订单是否处于终稿状态
const isFinalDraftState = (order: OrderItem): boolean => {
  // 状态7-改稿中（即终稿阶段），可以上传终稿
  return order.designState === 7;
};

// 判断订单是否支持上传稿件
const canUploadDraft = (order: OrderItem): boolean => {
  return isFirstDraftState(order) || isFinalDraftState(order);
};

// 获取上传按钮文本
const getUploadButtonText = (order: OrderItem): string => {
  if (isFirstDraftState(order)) {
    return "上传初稿";
  } else if (isFinalDraftState(order)) {
    return "上传终稿";
  }
  return "上传稿件";
};

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// 查看详情
const handleViewDetail = (order: OrderItem) => {
  selectedOrderId.value = order.id;
  orderDetailVisible.value = true;
};

// 上传稿件
const handleUploadDraft = (order: OrderItem) => {
  console.log(order);

  if (isFirstDraftState(order)) {
    uploadDraftType.value = "first";
    selectedOrderForUpload.value = order;
    uploadDraftVisible.value = true;
  } else if (isFinalDraftState(order)) {
    selectedOrderForFinalUpload.value = order;
    uploadFinalDraftVisible.value = true;
  } else {
    ElMessage.warning("当前订单状态不支持上传稿件");
    return;
  }
};

// 更多操作
const handleMoreActions = (command: string, order: OrderItem) => {
  if (command === "edit") {
    // 初稿免责
    disclaimerType.value = "first";
    selectedOrderForDisclaimer.value = order;
    disclaimerVisible.value = true;
  } else if (command === "cancel") {
    // 终稿免责
    disclaimerType.value = "final";
    selectedOrderForDisclaimer.value = order;
    disclaimerVisible.value = true;
  } else if (command === "reassign") {
    // 申请改派
    ElMessage.info("如需将此订单改派请联系派单客服");
  }
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchOrderListByStatus(activeStatus.value);
};

// 页面大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  fetchOrderListByStatus(activeStatus.value);
};

// 复制订单号
const copyOrderNumber = async (orderNumber: string) => {
  try {
    await navigator.clipboard.writeText(orderNumber);
    ElMessage.success("订单号复制成功");
  } catch (err) {
    // 兼容不支持 clipboard API 的浏览器
    const textArea = document.createElement("textarea");
    textArea.value = orderNumber;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    ElMessage.success("订单号复制成功");
  }
};

// 关闭订单详情弹框
const handleCloseOrderDetail = () => {
  orderDetailVisible.value = false;
  selectedOrderId.value = null;
};

// 关闭上传初稿弹框
const handleCloseUploadDraft = () => {
  uploadDraftVisible.value = false;
  selectedOrderForUpload.value = null;
};

// 关闭上传终稿弹框
const handleCloseUploadFinalDraft = () => {
  uploadFinalDraftVisible.value = false;
  selectedOrderForFinalUpload.value = null;
};

// 上传成功回调
const handleUploadSuccess = () => {
  // 刷新订单列表
  fetchOrderListByStatus(activeStatus.value);
};

// 关闭免责申请弹框
const handleCloseDisclaimer = () => {
  disclaimerVisible.value = false;
  selectedOrderForDisclaimer.value = null;
};

// 免责申请成功回调
const handleDisclaimerSuccess = () => {
  // 刷新订单列表
  fetchOrderListByStatus(activeStatus.value);
};

// 页面加载时获取数据
onMounted(() => {
  fetchOrderListByStatus(activeStatus.value);
});
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- 搜索区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6 w-full">
      <div class="flex flex-wrap gap-3 items-center justify-between">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">订单编号</span>
            <el-input
              v-model="searchForm.orderNumber"
              placeholder="输入订单编号"
              clearable
              style="width: 250px"
            />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">沟通群名</span>
            <el-input
              v-model="searchForm.keyword"
              placeholder="输入沟通群名"
              clearable
              style="width: 200px"
            />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">时间周期</span>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="年/月/日"
              end-placeholder="年/月/日"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              style="width: 384px"
            />
          </div>

          <el-checkbox
            v-model="searchForm.isCG_YQ"
            :true-value="1"
            :false-value="undefined"
            label="初稿逾期"
          />

          <el-checkbox
            v-model="searchForm.isZG_YQ"
            :true-value="1"
            :false-value="undefined"
            label="终稿逾期"
          />
        </div>

        <div class="flex gap-2">
          <el-button
            type="primary"
            :icon="Search"
            :loading="loading"
            class="bg-blue-600 hover:bg-blue-700"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
        </div>
      </div>
    </div>

    <!-- 状态标签栏 -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="flex items-center space-x-6 p-4 border-b">
        <div
          v-for="tab in statusTabs"
          :key="tab.key"
          :class="[
            'flex items-center cursor-pointer px-3 py-2 rounded transition-colors',
            activeStatus === tab.key
              ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          ]"
          @click="handleStatusChange(tab.key)"
        >
          <span>{{ tab.label }}</span>
          <el-badge
            v-if="tab.showBadge && tab.count > 0"
            :value="tab.count > 99 ? '99+' : tab.count"
            :type="tab.key === 'abnormal' ? 'danger' : 'primary'"
            class="ml-2"
          />
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-lg shadow-sm">
      <div v-loading="loading" class="min-h-56">
        <div
          v-for="order in filteredOrderList"
          :key="order.id"
          class="border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors"
        >
          <!-- 整体布局：左侧内容 + 右侧操作 -->
          <div class="flex gap-6">
            <!-- 左侧主要内容 -->
            <div class="flex-1">
              <!-- 订单头部 -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center">
                    <h3 class="text-base font-bold text-gray-900 mr-2">
                      订单编号 {{ order.orderNumber }}
                    </h3>
                    <el-icon
                      class="text-gray-400 hover:text-blue-500 cursor-pointer ml-1"
                      size="16"
                      @click="copyOrderNumber(order.orderNumber)"
                    >
                      <CopyDocument />
                    </el-icon>
                    <div class="flex space-x-2 ml-2">
                      <el-tag
                        v-show="order.tradeStateName"
                        type="primary"
                        size="small"
                      >
                        {{ order.tradeStateName }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <div class="flex items-center justify-end">
                    <span class="text-sm text-gray-500 mr-2">任务金额</span>
                    <span class="text-lg font-semibold text-orange-600">
                      ￥{{ order.orderAmount }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 订单详情和到手佣金 -->
              <div class="flex items-center justify-between mb-3">
                <div
                  class="grid grid-cols-4 gap-6 text-sm text-gray-600 flex-1"
                >
                  <div>
                    <span class="text-gray-500">初稿时间:</span>
                    <span class="ml-1">
                      {{ formatTime(order.firstDraftTime) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">终稿时间:</span>
                    <span class="ml-1">{{ formatTime(order.finalTime) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">派单客服:</span>
                    <span class="ml-1">
                      {{ order.documentaryCustomerName }}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-500">沟通群名:</span>
                    <span class="ml-1">{{ order.wangWang }}</span>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <div class="text-sm text-gray-500">
                    到手佣金 {{ order.dividendAmount }}
                  </div>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="flex items-center mb-3 relative">
                <!-- 背景连接线 -->
                <div
                  class="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-300 transform -translate-y-1/2"
                />
                <!-- 已完成的连接线 -->
                <div
                  class="absolute top-1/2 left-3 h-0.5 bg-green-500 transform -translate-y-1/2"
                  :style="{
                    width: `calc(${((getProgressStep(order) - 1) / 3) * 100}% - 12px)`
                  }"
                />
                <div class="flex justify-between w-full">
                  <div
                    v-for="(step, index) in 4"
                    :key="index"
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium relative z-10',
                      step <= getProgressStep(order)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    ]"
                  >
                    {{ step }}
                  </div>
                </div>
              </div>

              <!-- 进度标签 -->
              <div class="flex justify-between mb-3 text-sm">
                <div
                  v-for="(step, index) in 4"
                  :key="index"
                  :class="[
                    'text-center',
                    step <= getProgressStep(order)
                      ? 'text-green-600 font-medium'
                      : 'text-gray-500'
                  ]"
                >
                  {{ getStepName(step) }}
                </div>
              </div>

              <!-- 派发时间 -->
              <div class="text-sm text-gray-500 text-left">
                派发({{ formatTime(order.orderAddTime) }})
              </div>
            </div>

            <!-- 右侧操作按钮列 -->
            <div
              class="flex flex-col justify-between self-stretch min-w-max py-1"
            >
              <el-button
                type="primary"
                size="default"
                class="w-24"
                @click="handleViewDetail(order)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="canUploadDraft(order)"
                type="primary"
                size="default"
                class="w-24"
                @click="handleUploadDraft(order)"
              >
                {{ getUploadButtonText(order) }}
              </el-button>
              <el-dropdown
                @command="command => handleMoreActions(command, order)"
              >
                <el-button size="default" class="w-24">
                  更多操作
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-if="order.cg_YQ === '逾期'"
                      command="edit"
                      >初稿免责</el-dropdown-item
                    >
                    <el-dropdown-item
                      v-if="order.zg_YQ === '逾期'"
                      command="cancel"
                      >终稿免责</el-dropdown-item
                    >
                    <el-dropdown-item command="reassign"
                      >申请改派</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="flex justify-end p-4 border-t">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 订单详情弹框 -->
    <OrderDetailModal
      v-model:visible="orderDetailVisible"
      :order-id="selectedOrderId || 0"
      @close="handleCloseOrderDetail"
    />

    <!-- 上传初稿弹框 -->
    <UploadDraftModal
      v-model:visible="uploadDraftVisible"
      :order-id="selectedOrderForUpload?.id || 0"
      :draft-type="'first'"
      :order-detail="selectedOrderForUpload"
      @close="handleCloseUploadDraft"
      @success="handleUploadSuccess"
    />

    <!-- 上传终稿弹框 -->
    <UploadFinalDraftModal
      v-model:visible="uploadFinalDraftVisible"
      :order-id="selectedOrderForFinalUpload?.id || 0"
      :order-type-id="selectedOrderForFinalUpload?.orderTypeId"
      :order-detail="selectedOrderForFinalUpload"
      @close="handleCloseUploadFinalDraft"
      @success="handleUploadSuccess"
    />

    <!-- 免责申请弹框 -->
    <DisclaimerModal
      v-model:visible="disclaimerVisible"
      :order-id="selectedOrderForDisclaimer?.id || 0"
      :disclaimer-type="disclaimerType"
      :order-detail="selectedOrderForDisclaimer"
      @close="handleCloseDisclaimer"
      @success="handleDisclaimerSuccess"
    />
  </div>
</template>

<style lang="scss" scoped>
// 响应式适配
@media (width <= 1200px) {
  .search-form {
    .el-form-item {
      margin-right: 12px;
    }
  }

  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 768px) {
  .p-6 {
    padding: 1rem;
  }

  .search-form {
    .el-form-item {
      display: block;
      margin-right: 0;
    }
  }

  .grid-cols-4 {
    grid-template-columns: 1fr;
  }

  .flex.space-x-12 {
    flex-direction: column;

    .flex.items-center {
      margin-bottom: 1rem;
    }
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 16px;
  }

  .el-form-item__label {
    font-weight: 500;
    color: #333;
  }
}

:deep(.el-select) {
  min-width: 100px;
}

// 进度条样式优化
.progress-step {
  position: relative;

  &::after {
    position: absolute;
    top: 50%;
    right: -24px;
    width: 48px;
    height: 2px;
    content: "";
    background-color: #e5e7eb;
    transform: translateY(-50%);
  }

  &.completed::after {
    background-color: #10b981;
  }

  &:last-child::after {
    display: none;
  }
}

// 标签栏样式
.status-tabs {
  border-bottom: 1px solid #e5e7eb;

  .tab-item {
    position: relative;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      color: #2563eb;

      &::after {
        position: absolute;
        right: 0;
        bottom: -1px;
        left: 0;
        height: 2px;
        content: "";
        background-color: #2563eb;
      }
    }

    &:hover:not(.active) {
      color: #2563eb;
      background-color: #f8fafc;
    }
  }
}

// 订单卡片样式
.order-card {
  transition: all 0.3s;

  &:hover {
    background-color: #f8fafc;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }
}

.el-button + .el-button {
  margin-left: 0;
}
</style>
