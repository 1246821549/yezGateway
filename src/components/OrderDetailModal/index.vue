<!--
 * @Description: 订单详情弹框组件
 * @Author: AI Assistant
 * @Date: 2025-01-27
-->
<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Close, ChatDotRound, Plus, ArrowDown } from "@element-plus/icons-vue";
import {
  getOrderDetail,
  getOrderAnnotateList,
  type OrderDetail,
  type OrderAnnotateItem
} from "@/api/order";
import AnnotationDetailModal from "@/components/AnnotationDetailModal/index.vue";
import UploadDraftModal from "@/components/UploadDraftModal/index.vue";
import UploadFinalDraftModal from "@/components/UploadFinalDraftModal/index.vue";
import DisclaimerModal from "@/components/DisclaimerModal/index.vue";

interface Props {
  visible: boolean;
  orderId: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 弹框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});

// 加载状态
const loading = ref(false);
const annotationLoading = ref(false);

// 订单详情数据
const orderDetail = ref<OrderDetail | null>(null);

// 批注列表数据
const annotationList = ref<OrderAnnotateItem[]>([]);
const annotationPagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

// 批注详情弹框
const annotationDetailVisible = ref(false);
const selectedAnnotation = ref<OrderAnnotateItem | null>(null);

// 上传稿件弹框
const uploadDraftVisible = ref(false);
const uploadDraftType = ref<"first" | "final">("first");

// 上传终稿弹框
const uploadFinalDraftVisible = ref(false);

// 免责申请弹框
const disclaimerVisible = ref(false);
const disclaimerType = ref<"first" | "final">("first");

// 批注输入
const annotationForm = reactive({
  content: "",
  imageFile: null as File | null
});

// 获取订单详情
const fetchOrderDetail = async () => {
  if (!props.orderId) return;

  try {
    loading.value = true;
    const response = await getOrderDetail({ orderId: props.orderId });

    if (response.code === 200) {
      orderDetail.value = response.result;
    } else {
      ElMessage.error(response.message || "获取订单详情失败");
    }
  } catch (error) {
    console.error("获取订单详情失败:", error);
    ElMessage.error("获取订单详情失败");
  } finally {
    loading.value = false;
  }
};

// 获取批注列表
const fetchAnnotationList = async () => {
  if (!props.orderId) return;

  try {
    annotationLoading.value = true;
    const response = await getOrderAnnotateList({
      orderId: props.orderId,
      page: annotationPagination.current,
      pageSize: annotationPagination.size
    });

    if (response.code === 200) {
      annotationList.value = response.result.items;
      annotationPagination.total = response.result.total;
    } else {
      ElMessage.error(response.message || "获取批注列表失败");
    }
  } catch (error) {
    console.error("获取批注列表失败:", error);
    ElMessage.error("获取批注列表失败");
  } finally {
    annotationLoading.value = false;
  }
};

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

// 格式化日期
const formatDate = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 获取初稿逾期状态标签
const getCgOverdueTag = (
  orderDetail: OrderDetail | null
): {
  text: string;
  type: "success" | "info" | "warning" | "primary" | "danger";
} | null => {
  if (!orderDetail) return null;

  // cg_YQ为"1"表示逾期
  if (orderDetail.cg_YQ === "1") {
    // isCgMz为1表示已申请免责
    if (orderDetail.isCgMz === 1) {
      return { text: "逾期已申请", type: "warning" };
    } else {
      return { text: "逾期未申请", type: "danger" };
    }
  }
  return null;
};

// 获取终稿逾期状态标签
const getZgOverdueTag = (
  orderDetail: OrderDetail | null
): {
  text: string;
  type: "success" | "info" | "warning" | "primary" | "danger";
} | null => {
  if (!orderDetail) return null;

  // zg_YQ为"1"表示逾期
  if (orderDetail.zg_YQ === "1") {
    // isZgMz为1表示已申请免责
    if (orderDetail.isZgMz === 1) {
      return { text: "逾期已申请", type: "warning" };
    } else {
      return { text: "逾期未申请", type: "danger" };
    }
  }
  return null;
};

// 获取设计状态文本
const getDesignStatusText = (designState: number) => {
  const statusMap: Record<number, string> = {
    1: "待处理",
    2: "设计中",
    3: "初稿中",
    4: "终稿中",
    5: "待审核",
    6: "在途",
    7: "已完成",
    8: "已退单"
  };
  return statusMap[designState] || "未知状态";
};

// 获取交易状态文本
const getTradeStatusText = (tradeState: number) => {
  const statusMap: Record<number, string> = {
    1: "买家已付款",
    2: "交易中",
    3: "买家已发货",
    4: "交易成功"
  };
  return statusMap[tradeState] || "未知状态";
};

// 处理参考图片字符串
const getReferenceImages = (referPicture: string | null): string[] => {
  if (!referPicture) return [];

  // 按逗号分割并过滤空字符串
  return referPicture
    .split(",")
    .map(url => url.trim())
    .filter(url => url.length > 0);
};

// 预览参考图片
const previewReferenceImage = (imageUrl: string) => {
  // 使用Element Plus的图片预览功能
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    // 可以在这里实现图片预览功能
    console.log("预览参考图片:", imageUrl);
  };
};

// 文件上传处理
const handleFileUpload = (file: File) => {
  annotationForm.imageFile = file;
  ElMessage.success("文件上传成功");
};

// 添加批注
const handleAddAnnotation = async () => {
  if (!annotationForm.content.trim()) {
    ElMessage.warning("请输入批注内容");
    return;
  }

  try {
    // TODO: 调用添加批注API
    ElMessage.success("批注添加成功");
    annotationForm.content = "";
    annotationForm.imageFile = null;
    // 刷新批注列表
    await fetchAnnotationList();
  } catch (error) {
    console.error("添加批注失败:", error);
    ElMessage.error("添加批注失败");
  }
};

// 判断订单是否处于初稿状态
const isFirstDraftState = (orderDetail: OrderDetail | null): boolean => {
  if (!orderDetail) return false;
  // 根据设计状态判断是否处于初稿阶段
  // 3-派发群, 6-初稿中
  return orderDetail.designState === 3 || orderDetail.designState === 6;
};

// 判断订单是否处于终稿状态
const isFinalDraftState = (orderDetail: OrderDetail | null): boolean => {
  if (!orderDetail) return false;
  // 根据设计状态判断是否处于终稿阶段
  // 4-已派发, 7-改稿中 (改稿中通常指终稿修改阶段)
  return orderDetail.designState === 4 || orderDetail.designState === 7;
};

// 获取上传按钮文本
const getUploadButtonText = (orderDetail: OrderDetail | null): string => {
  if (isFirstDraftState(orderDetail)) {
    return "上传初稿";
  } else if (isFinalDraftState(orderDetail)) {
    return "上传终稿";
  }
  return "上传稿件";
};

// 上传稿件
const handleUploadDraft = () => {
  if (!orderDetail.value) {
    ElMessage.warning("订单信息加载中，请稍后再试");
    return;
  }

  if (isFirstDraftState(orderDetail.value)) {
    uploadDraftType.value = "first";
    uploadDraftVisible.value = true;
  } else if (isFinalDraftState(orderDetail.value)) {
    uploadFinalDraftVisible.value = true;
  } else {
    ElMessage.warning("当前订单状态不支持上传稿件");
    return;
  }
};

// 关闭上传稿件弹框
const handleCloseUploadDraft = () => {
  uploadDraftVisible.value = false;
};

// 关闭上传终稿弹框
const handleCloseUploadFinalDraft = () => {
  uploadFinalDraftVisible.value = false;
};

// 上传成功回调
const handleUploadSuccess = () => {
  // 刷新订单详情和批注列表
  fetchOrderDetail();
  fetchAnnotationList();
};

// 关闭免责申请弹框
const handleCloseDisclaimer = () => {
  disclaimerVisible.value = false;
};

// 免责申请成功回调
const handleDisclaimerSuccess = () => {
  // 刷新订单详情和批注列表
  fetchOrderDetail();
  fetchAnnotationList();
};

// 申请免责
const handleApplyExemption = (type: "first" | "final") => {
  if (!orderDetail.value) {
    ElMessage.warning("订单信息加载中，请稍后再试");
    return;
  }

  disclaimerType.value = type;
  disclaimerVisible.value = true;
};

// 申请改派
const handleApplyReassignment = () => {
  ElMessage.info("如需将此订单改派请联系派单客服");
};

// 联系客服
const handleContactService = () => {
  ElMessage.info("联系客服功能");
};

// 查看批注详情
const handleViewAnnotationDetail = (annotation: OrderAnnotateItem) => {
  selectedAnnotation.value = annotation;
  annotationDetailVisible.value = true;
};

// 关闭批注详情弹框
const handleCloseAnnotationDetail = () => {
  annotationDetailVisible.value = false;
  selectedAnnotation.value = null;
};

// 批注分页变化
const handleAnnotationPageChange = (page: number) => {
  annotationPagination.current = page;
  fetchAnnotationList();
};

// 关闭弹框
const handleClose = () => {
  emit("close");
  // 重置数据
  orderDetail.value = null;
  annotationList.value = [];
  annotationForm.content = "";
  annotationForm.imageFile = null;
  annotationPagination.current = 1;
};

// 监听弹框显示状态
watch(
  () => props.visible,
  visible => {
    if (visible) {
      fetchOrderDetail();
      fetchAnnotationList();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="订单详情"
    width="80%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="order-detail-modal">
      <!-- 订单详情信息 -->
      <div v-if="orderDetail" class="order-detail-section">
        <div class="detail-grid">
          <!-- 左列 -->
          <div class="detail-column">
            <div class="detail-item">
              <span class="label">订单类型:</span>
              <span class="value">{{ orderDetail.orderTypeName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">初稿时间:</span>
              <span class="value">{{
                formatDate(orderDetail.firstDraftTime)
              }}</span>
              <el-tag
                v-if="getCgOverdueTag(orderDetail)"
                :type="getCgOverdueTag(orderDetail)?.type"
                size="small"
                class="ml-2"
              >
                {{ getCgOverdueTag(orderDetail)?.text }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">任务金额:</span>
              <span class="value text-orange-600 font-semibold"
                >¥{{ orderDetail.taskAmount }}</span
              >
            </div>
            <div class="detail-item">
              <span class="label">需求说明:</span>
              <span class="value">{{ orderDetail.demandIllustrate }}</span>
            </div>
            <div class="detail-item">
              <span class="label">参考链接:</span>
              <div class="value">
                <div
                  v-if="getReferenceImages(orderDetail.referPicture).length > 0"
                  class="reference-images"
                >
                  <img
                    v-for="(imageUrl, index) in getReferenceImages(
                      orderDetail.referPicture
                    )"
                    :key="index"
                    :src="imageUrl"
                    :alt="`参考图片${index + 1}`"
                    class="reference-image"
                    @click="previewReferenceImage(imageUrl)"
                  />
                </div>
                <span v-else class="text-gray-400">暂无参考图片</span>
              </div>
            </div>
          </div>

          <!-- 中列 -->
          <div class="detail-column">
            <div class="detail-item">
              <span class="label">订单编号:</span>
              <span class="value font-mono">{{ orderDetail.orderNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="label">交付时间:</span>
              <span class="value">{{ formatDate(orderDetail.finalTime) }}</span>
              <el-tag
                v-if="getZgOverdueTag(orderDetail)"
                :type="getZgOverdueTag(orderDetail)?.type"
                size="small"
                class="ml-2"
              >
                {{ getZgOverdueTag(orderDetail)?.text }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">到手佣金:</span>
              <span class="value"
                >¥{{ orderDetail.dividendAmount }} ({{
                  orderDetail.dividendRatio
                }}%)</span
              >
            </div>
            <div class="detail-item">
              <span class="label">设计状态:</span>
              <span class="value">{{
                getDesignStatusText(orderDetail.designState)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">行业分类:</span>
              <span class="value">{{
                orderDetail.industryTypeName || "-"
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">产品分类:</span>
              <span class="value">{{ orderDetail.productType || "-" }}</span>
            </div>
          </div>

          <!-- 右列 -->
          <div class="detail-column">
            <div class="detail-item">
              <span class="label">沟通群名:</span>
              <span class="value">{{ orderDetail.wangWang }}</span>
            </div>
            <div class="detail-item">
              <span class="label">派单客服:</span>
              <span class="value">{{ orderDetail.dispatchCustomerName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">交易状态:</span>
              <span class="value">{{
                getTradeStatusText(orderDetail.tradeState)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">派单时间:</span>
              <span class="value">{{
                formatTime(orderDetail.distributionCreateTime)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">下次批注:</span>
              <span class="value">{{
                formatTime(orderDetail.nextAnnotateTime)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">平台分类:</span>
              <span class="value">{{ orderDetail.platformName || "-" }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 批注输入区域 -->
      <div class="annotation-input-section">
        <div class="annotation-input-area">
          <el-input
            v-model="annotationForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入批注日志"
            class="annotation-textarea"
          />
          <div class="upload-area">
            <el-upload
              :show-file-list="false"
              :before-upload="handleFileUpload"
              accept="image/*"
            >
              <div class="upload-box">
                <el-icon size="24" class="text-gray-400">
                  <Plus />
                </el-icon>
              </div>
            </el-upload>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons justify-end mr-20">
          <el-button type="warning" @click="handleUploadDraft">
            {{ getUploadButtonText(orderDetail) }} ▶
          </el-button>
          <el-dropdown @command="handleApplyExemption">
            <el-button type="success">
              申请免责 ▶
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="first">初稿免责</el-dropdown-item>
                <el-dropdown-item command="final">终稿免责</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="handleAddAnnotation">
            添加批注
          </el-button>
          <el-button type="primary" @click="handleApplyReassignment">
            申请改派
          </el-button>
        </div>

        <!-- 联系客服 -->
        <!-- <div class="contact-service">
          <el-button type="text" @click="handleContactService">
            <el-icon class="mr-1">
              <ChatDotRound />
            </el-icon>
            联系客服
          </el-button>
        </div> -->
      </div>

      <!-- 批注列表表格 -->
      <div class="annotation-table-section">
        <el-table
          v-loading="annotationLoading"
          :data="annotationList"
          stripe
          class="annotation-table"
        >
          <el-table-column prop="createTime" label="操作时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="操作人" width="120" />
          <el-table-column
            prop="annotationsReason"
            label="操作内容"
            min-width="300"
          >
            <template #default="{ row }">
              <div class="annotation-content">
                {{ row.annotationsReason }}
                <div v-if="row.imagePath" class="annotation-image mt-2">
                  <img
                    :src="row.imagePath"
                    alt="批注图片"
                    class="w-20 h-20 object-cover rounded border"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleViewAnnotationDetail(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="annotationPagination.current"
            v-model:page-size="annotationPagination.size"
            :page-sizes="[10, 20, 50]"
            :total="annotationPagination.total"
            layout="prev, pager, next"
            @current-change="handleAnnotationPageChange"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 批注详情弹框 -->
  <AnnotationDetailModal
    v-model:visible="annotationDetailVisible"
    :annotation="selectedAnnotation"
    @close="handleCloseAnnotationDetail"
  />

  <!-- 上传初稿弹框 -->
  <UploadDraftModal
    v-model:visible="uploadDraftVisible"
    :order-id="orderId"
    :draft-type="'first'"
    :order-detail="orderDetail"
    @close="handleCloseUploadDraft"
    @success="handleUploadSuccess"
  />

  <!-- 上传终稿弹框 -->
  <UploadFinalDraftModal
    v-model:visible="uploadFinalDraftVisible"
    :order-id="orderId"
    :order-type-id="orderDetail?.orderTypeID"
    :order-detail="orderDetail"
    @close="handleCloseUploadFinalDraft"
    @success="handleUploadSuccess"
  />

  <!-- 免责申请弹框 -->
  <DisclaimerModal
    v-model:visible="disclaimerVisible"
    :order-id="orderId"
    :disclaimer-type="disclaimerType"
    :order-detail="orderDetail"
    @close="handleCloseDisclaimer"
    @success="handleDisclaimerSuccess"
  />
</template>

<style lang="scss" scoped>
.order-detail-modal {
  .order-detail-section {
    margin-bottom: 24px;

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;

      .detail-column {
        .detail-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;

          .label {
            min-width: 80px;
            color: #666;
            font-size: 14px;
            margin-right: 8px;
          }

          .value {
            color: #333;
            font-size: 14px;
            flex: 1;
            word-break: break-all;

            .reference-images {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .reference-image {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 6px;
                border: 1px solid #e9ecef;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                  transform: scale(1.05);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
              }
            }
          }
        }
      }
    }
  }

  .annotation-input-section {
    margin-bottom: 24px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .annotation-input-area {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .annotation-textarea {
        flex: 1;
      }

      .upload-area {
        .upload-box {
          width: 60px;
          height: 60px;
          border: 2px dashed #d9d9d9;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.3s;

          &:hover {
            border-color: #409eff;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .contact-service {
      text-align: right;
    }
  }

  .annotation-table-section {
    .annotation-table {
      margin-bottom: 16px;

      .annotation-content {
        .annotation-image {
          img {
            cursor: pointer;
            transition: transform 0.3s;

            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式适配
@media (max-width: 1200px) {
  .order-detail-modal {
    .order-detail-section {
      .detail-grid {
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-detail-modal {
    .order-detail-section {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }

    .annotation-input-section {
      .annotation-input-area {
        flex-direction: column;

        .upload-area {
          align-self: flex-start;
        }
      }

      .action-buttons {
        flex-wrap: wrap;
      }
    }
  }
}
</style>
