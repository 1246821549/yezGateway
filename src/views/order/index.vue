<!--
 * @Description: 订单列表页面
 * @Author: 程前
 * @Date: 2025-08-13 16:16:30
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-26 10:18:37
-->
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElLoading } from "element-plus";
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import FixedSideBar from "@/components/FixedSidebar/index.vue";
import {
  getOrderTypeList,
  getOrderDetailPage,
  type OrderTypeItem,
  type OrderDetailPageItem
} from "@/api/order";
import { isMobileDevice } from "@/utils/smt";

defineOptions({
  name: "OrderList"
});

const router = useRouter();

// 响应式数据
const loading = ref(false);
const orderList = ref<OrderDetailPageItem[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
});

// 订单类型数据
const orderTypes = ref<OrderTypeItem[]>([]);
const selectedParentTypeId = ref<number | undefined>(undefined);
const selectedChildTypeId = ref<number | undefined>(undefined);

// 排序方式
const sortType = ref<"default" | "price" | "time">("default");
const sortPrice = ref<boolean | null>(null);
const sortTime = ref<boolean | null>(null);

// 当前选中父级类型的子类列表
const currentChildTypes = computed(() => {
  if (!selectedParentTypeId.value) return [];
  const parentType = orderTypes.value.find(
    t => t.id === selectedParentTypeId.value
  );
  return parentType?.childrens || [];
});

/**
 * 获取订单类型列表
 */
const fetchOrderTypes = async () => {
  try {
    const res = await getOrderTypeList({});
    console.log("订单类型返回数据:", res);
    if (res.code === 200) {
      orderTypes.value = res.result || [];
      console.log("订单类型列表:", orderTypes.value);
    } else {
      console.error("获取订单类型失败:", res.message);
    }
  } catch (error) {
    console.error("获取订单类型失败:", error);
  }
};

/**
 * 获取订单列表
 */
const fetchOrderList = async () => {
  try {
    loading.value = true;
    let orderTypeId = undefined;
    if (selectedChildTypeId.value) {
      orderTypeId = selectedChildTypeId.value;
    } else if (selectedParentTypeId.value) {
      orderTypeId = selectedParentTypeId.value;
    }

    const res = await getOrderDetailPage({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderTypeId: orderTypeId,
      sortPrice: sortPrice.value,
      sortTime: sortTime.value
    });

    console.log("订单列表返回数据:", res);
    if (res.code === 200) {
      orderList.value = res.result.items;
      console.log("订单列表:", orderList.value);
      pagination.total = res.result.total || 0;
    } else {
      ElMessage.error(res.message || "获取订单列表失败");
    }
  } catch (error) {
    console.error("获取订单列表失败:", error);
    ElMessage.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 切换父级类型
 */
const handleParentTypeChange = (typeId?: number) => {
  selectedParentTypeId.value = typeId;
  selectedChildTypeId.value = undefined;
  pagination.page = 1;
  fetchOrderList();
};

/**
 * 切换子类型
 */
const handleChildTypeChange = (typeId?: number) => {
  selectedChildTypeId.value = typeId;
  pagination.page = 1;
  fetchOrderList();
};

/**
 * 切换排序方式
 */
const handleSortChange = (type: "default" | "price" | "time") => {
  if (type === "default") {
    sortType.value = "default";
    sortPrice.value = null;
    sortTime.value = null;
  } else if (type === "price") {
    sortType.value = "price";
    // 切换价格排序：null -> true -> false -> true...
    if (sortPrice.value === null) {
      sortPrice.value = true; // 升序
    } else if (sortPrice.value === true) {
      sortPrice.value = false; // 降序
    } else {
      sortPrice.value = true; // 升序
    }
    sortTime.value = null;
  } else if (type === "time") {
    sortType.value = "time";
    sortPrice.value = null;
    // 切换时间排序：null -> true -> false -> true...
    if (sortTime.value === null) {
      sortTime.value = true; // 升序
    } else if (sortTime.value === true) {
      sortTime.value = false; // 降序
    } else {
      sortTime.value = true; // 升序
    }
  }

  pagination.page = 1;
  fetchOrderList();
};

/**
 * 分页处理
 */
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchOrderList();
};

/**
 * 改变每页显示数量
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchOrderList();
};

/**
 * 查看订单详情（新标签页打开）
 */
const handleViewDetail = (orderId: number) => {
  const routeUrl = router.resolve({
    name: "OrderDetailPage",
    params: { id: orderId }
  });
  window.open(routeUrl.href, "_blank");
};

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `初稿时间:${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

/**
 * 计算相对时间
 */
const getRelativeTime = (timeStr: string) => {
  if (!timeStr) return "";
  const now = new Date();
  const time = new Date(timeStr);
  const diff = now.getTime() - time.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}分钟前发布`;
  } else if (hours < 24) {
    return `${hours}小时前发布`;
  } else {
    return `${days}天前发布`;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchOrderTypes();
  fetchOrderList();
});
</script>

<template>
  <div>
    <div class="min-h-screen bg-gray-200 py-8 pt-24">
      <!-- 透明导航栏 -->
      <TransparentNavbar :theme="'light'" />
      <!-- 侧边栏 -->
      <FixedSideBar />

      <div class="container mx-auto px-6">
        <!-- 页面标题 -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">灵活接单</h2>
        </div>

        <!-- 招聘类型筛选（一级分类） -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div class="flex items-center">
            <span
              class="text-sm font-medium text-gray-700 mr-4 whitespace-nowrap"
            >
              招聘类型
            </span>
            <div class="flex items-center flex-wrap gap-2">
              <el-button
                :type="selectedParentTypeId === undefined ? 'primary' : ''"
                size="default"
                round
                @click="handleParentTypeChange(undefined)"
              >
                全部
              </el-button>
              <el-button
                v-for="type in orderTypes"
                :key="type.id"
                :type="selectedParentTypeId === type.id ? 'primary' : ''"
                size="default"
                round
                @click="handleParentTypeChange(type.id)"
              >
                {{ type.name }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 子类型筛选（二级分类） -->
        <div
          v-if="currentChildTypes.length > 0"
          class="bg-white rounded-lg shadow-sm p-4 mb-4"
        >
          <div class="flex items-center">
            <span
              class="text-sm font-medium text-gray-700 mr-4 whitespace-nowrap"
            >
              细分类型
            </span>
            <div class="flex items-center flex-wrap gap-2">
              <el-button
                :type="selectedChildTypeId === undefined ? 'primary' : ''"
                size="default"
                round
                @click="handleChildTypeChange(undefined)"
              >
                全部
              </el-button>
              <el-button
                v-for="childType in currentChildTypes"
                :key="childType.id"
                :type="selectedChildTypeId === childType.id ? 'primary' : ''"
                size="default"
                round
                @click="handleChildTypeChange(childType.id)"
              >
                {{ childType.name }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 排序方式 -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex items-center">
            <span
              class="text-sm font-medium text-gray-700 mr-4 whitespace-nowrap"
            >
              排序方式
            </span>
            <div class="flex items-center flex-wrap gap-2">
              <el-button
                :type="sortType === 'default' ? 'primary' : ''"
                size="default"
                @click="handleSortChange('default')"
              >
                综合排序
              </el-button>
              <el-button
                :type="sortType === 'price' ? 'primary' : ''"
                size="default"
                @click="handleSortChange('price')"
              >
                价格排序
                <el-icon v-if="sortType === 'price'" class="ml-1">
                  <svg
                    v-if="sortPrice === true"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M488 359.6V784h48V359.6l208 212.6 33.9-35.2L512 262.6 246.1 537l33.9 35.2 208-212.6z"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M536 664.4V240h-48v424.4L280 452.8l-33.9 35.2L512 761.4 777.9 488 744 452.8 536 664.4z"
                    />
                  </svg>
                </el-icon>
              </el-button>
              <el-button
                :type="sortType === 'time' ? 'primary' : ''"
                size="default"
                @click="handleSortChange('time')"
              >
                发布时间
                <el-icon v-if="sortType === 'time'" class="ml-1">
                  <svg
                    v-if="sortTime === true"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M488 359.6V784h48V359.6l208 212.6 33.9-35.2L512 262.6 246.1 537l33.9 35.2 208-212.6z"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M536 664.4V240h-48v424.4L280 452.8l-33.9 35.2L512 761.4 777.9 488 744 452.8 536 664.4z"
                    />
                  </svg>
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 订单列表 -->
        <div
          v-loading="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <el-card
            v-for="order in orderList"
            :key="order.id"
            shadow="hover"
            class="order-card cursor-pointer"
            :body-style="{ padding: '20px' }"
            @click="handleViewDetail(order.id)"
          >
            <!-- 卡片头部：标题和状态 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-start gap-2 flex-1">
                <!-- 特殊标签 -->
                <el-tag
                  v-if="order.isEmergent === 1"
                  type="danger"
                  size="small"
                  class="special-tag"
                >
                  海量天单
                </el-tag>
                <!-- 订单标题 -->
                <h3 class="text-base font-semibold text-gray-800 leading-6">
                  {{ order.orderTypeName || "订单" }}
                </h3>
              </div>
              <!-- 派发状态 -->
              <el-tag
                :type="order.isDistribute === 0 ? 'primary' : 'info'"
                size="small"
                class="status-tag"
              >
                {{ order.isDistribute === 0 ? "派发中" : "已派发" }}
              </el-tag>
            </div>

            <!-- 初稿时间 -->
            <div class="mb-3">
              <p class="text-sm text-gray-500">
                {{ formatTime(order.firstDraftTime) }}
              </p>
            </div>

            <!-- 需求说明 -->
            <div class="mb-4 order-description">
              <p class="text-sm text-gray-600 line-clamp-2">
                {{ order.demandIllustrate || "暂无需求说明" }}
              </p>
            </div>

            <!-- 底部信息：客户和价格 -->
            <div
              class="flex items-center justify-between pt-3 border-t border-gray-100"
            >
              <div class="flex items-center space-x-2">
                <el-avatar :size="32" class="bg-gray-300 text-gray-600">
                  {{
                    order.realName?.charAt(0) ||
                    order.platName?.charAt(0) ||
                    "客"
                  }}
                </el-avatar>
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700 font-medium">
                    {{ order.realName || order.platName || "优君电商系统" }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ getRelativeTime(order.createTime) }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p
                  :class="[
                    'text-2xl font-bold',
                    order.isDistribute === 0 ? 'text-red-500' : 'text-gray-400'
                  ]"
                >
                  ￥{{ order.taskAmount || 0 }}
                </p>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && orderList.length === 0"
          description="暂无订单数据"
          :image-size="200"
        />

        <!-- 分页 -->
        <div v-if="orderList.length > 0" class="flex justify-center mt-8">
          <el-pagination
            v-model:current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
    <!-- 页尾区域 -->
    <AppFooter />
  </div>
</template>

<style scoped>
/* 订单卡片样式 */
.order-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  height: 100%;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 特殊标签样式 */
.special-tag {
  flex-shrink: 0;
}

/* 状态标签样式 */
.status-tag {
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
}

/* 需求说明区域 */
.order-description {
  min-height: 40px;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* Element Plus Avatar 自定义 */
:deep(.el-avatar) {
  background-color: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

/* Element Plus Card 自定义 */
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
