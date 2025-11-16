<!--
 * @Description: 上传终稿弹框组件
 * @Author: 程前
 * @Date: 2025-10-30
-->
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Delete, Document } from "@element-plus/icons-vue";
import { uploadFileToOss } from "@/api/upload";
import {
  uploadFinalDraft,
  getFinalDraftHistoryList,
  type HistoryDraftItem
} from "@/api/order";

interface Props {
  visible: boolean;
  orderId: number;
  orderTypeId?: number; // 订单类型ID
  orderDetail: any; // 订单详情
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
  (e: "success"): void; // 上传成功回调
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 弹框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});

// 当前标签页
const activeTab = ref("upload");

// 上传相关状态
const uploading = ref(false);
const mainImageList = ref<File[]>([]); // 主图列表
const sourceFile = ref<File | null>(null); // 源文件（压缩包）
const detailImageList = ref<File[]>([]); // 终稿详情图
const sliceImageList = ref<File[]>([]); // 终稿详情切片图

// 历史稿件相关状态
const historyDraftList = ref<HistoryDraftItem[]>([]);
const historyLoading = ref(false);

// 是否需要上传额外图片（订单类型717）
const needExtraImages = computed(() => props.orderTypeId === 717);

// 主图上传处理
const handleMainImageUpload = (file: File) => {
  // 检查文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("只支持 JPG、PNG、GIF 格式的图片");
    return false;
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("图片大小不能超过 5MB");
    return false;
  }

  mainImageList.value.push(file);
  return false; // 阻止自动上传
};

// 源文件上传处理
const handleSourceFileUpload = (file: File) => {
  // 检查文件类型（压缩包）
  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-rar"
  ];
  const isValidType =
    allowedTypes.includes(file.type) ||
    file.name.toLowerCase().endsWith(".rar") ||
    file.name.toLowerCase().endsWith(".zip");

  if (!isValidType) {
    ElMessage.error("只支持 RAR、ZIP 格式的压缩包");
    return false;
  }

  sourceFile.value = file;
  return false; // 阻止自动上传
};

// 终稿详情图上传处理
const handleDetailImageUpload = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("只支持 JPG、PNG、GIF 格式的图片");
    return false;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("图片大小不能超过 5MB");
    return false;
  }

  detailImageList.value.push(file);
  return false;
};

// 终稿详情切片图上传处理
const handleSliceImageUpload = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("只支持 JPG、PNG、GIF 格式的图片");
    return false;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("图片大小不能超过 5MB");
    return false;
  }

  sliceImageList.value.push(file);
  return false;
};

// 删除主图
const removeMainImage = (index: number) => {
  mainImageList.value.splice(index, 1);
};

// 删除源文件
const removeSourceFile = () => {
  sourceFile.value = null;
};

// 删除终稿详情图
const removeDetailImage = (index: number) => {
  detailImageList.value.splice(index, 1);
};

// 删除终稿详情切片图
const removeSliceImage = (index: number) => {
  sliceImageList.value.splice(index, 1);
};

// 上传文件到OSS
const uploadToOss = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await uploadFileToOss(formData);
    if (response.code === 200) {
      return response.result.url;
    } else {
      throw new Error(response.message || "上传失败");
    }
  } catch (error) {
    console.error("上传到OSS失败:", error);
    throw error;
  }
};

// 提交上传
const handleSubmit = async () => {
  if (mainImageList.value.length === 0) {
    ElMessage.warning("请先选择要上传的主图");
    return;
  }

  if (!sourceFile.value) {
    ElMessage.warning("请上传源文件");
    return;
  }

  // 如果是717订单，检查额外图片
  if (needExtraImages.value) {
    if (detailImageList.value.length === 0) {
      ElMessage.warning("请上传终稿详情图");
      return;
    }
    if (sliceImageList.value.length === 0) {
      ElMessage.warning("请上传终稿详情切片图");
      return;
    }
  }

  try {
    uploading.value = true;
    const mainImageUrls: string[] = [];
    const detailImageUrls: string[] = [];
    const sliceImageUrls: string[] = [];

    // 上传主图
    for (let i = 0; i < mainImageList.value.length; i++) {
      const file = mainImageList.value[i];
      try {
        const url = await uploadToOss(file);
        mainImageUrls.push(url);
      } catch (error) {
        ElMessage.error(`第${i + 1}张主图上传失败`);
        return;
      }
    }

    // 上传源文件
    let sourceFileUrl = "";
    try {
      sourceFileUrl = await uploadToOss(sourceFile.value);
    } catch (error) {
      ElMessage.error("源文件上传失败");
      return;
    }

    // 如果是717订单，上传额外图片
    if (needExtraImages.value) {
      // 上传终稿详情图
      for (let i = 0; i < detailImageList.value.length; i++) {
        const file = detailImageList.value[i];
        try {
          const url = await uploadToOss(file);
          detailImageUrls.push(url);
        } catch (error) {
          ElMessage.error(`第${i + 1}张终稿详情图上传失败`);
          return;
        }
      }

      // 上传终稿详情切片图
      for (let i = 0; i < sliceImageList.value.length; i++) {
        const file = sliceImageList.value[i];
        try {
          const url = await uploadToOss(file);
          sliceImageUrls.push(url);
        } catch (error) {
          ElMessage.error(`第${i + 1}张终稿详情切片图上传失败`);
          return;
        }
      }
    }

    // 调用上传终稿接口
    const uploadData: {
      id: number;
      imgPaths: string[];
      zipPath: string;
      detialPaths?: string[];
      detialsPaths?: string[];
    } = {
      id: props.orderId,
      imgPaths: mainImageUrls,
      zipPath: sourceFileUrl
    };

    // 如果是717订单，添加额外图片
    if (needExtraImages.value) {
      uploadData.detialPaths = detailImageUrls;
      uploadData.detialsPaths = sliceImageUrls;
    }

    await uploadFinalDraft(uploadData as any);

    ElMessage.success("上传终稿成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败，请重试");
  } finally {
    uploading.value = false;
  }
};

// 关闭弹框
const handleClose = () => {
  emit("close");
  // 重置数据
  mainImageList.value = [];
  sourceFile.value = null;
  detailImageList.value = [];
  sliceImageList.value = [];
  activeTab.value = "upload";
};

// 监听弹框显示状态
watch(
  () => props.visible,
  visible => {
    if (visible) {
      // 弹框打开时重置数据
      mainImageList.value = [];
      sourceFile.value = null;
      detailImageList.value = [];
      sliceImageList.value = [];
      activeTab.value = "upload";
    }
  }
);

// 监听标签页切换
watch(activeTab, newTab => {
  if (newTab === "history") {
    fetchHistoryDraftList();
  }
});

// 获取文件预览URL
const getFilePreviewUrl = (file: File) => {
  return URL.createObjectURL(file);
};

// 获取历史稿件列表
const fetchHistoryDraftList = async () => {
  if (!props.orderId) return;

  try {
    historyLoading.value = true;
    const response = await getFinalDraftHistoryList({ id: props.orderId });

    if (response.code === 200) {
      historyDraftList.value = response.result;
    } else {
      ElMessage.error(response.message || "获取历史稿件失败");
    }
  } catch (error) {
    console.error("获取历史稿件失败:", error);
    ElMessage.error("获取历史稿件失败");
  } finally {
    historyLoading.value = false;
  }
};

// 获取历史记录的主图列表
const getRecordImages = (record: HistoryDraftItem): string[] => {
  if (!record?.finalImagePath) return [];
  return record.finalImagePath
    .split("|")
    .map(url => url.trim())
    .filter(url => url);
};

// 获取历史记录的终稿详情图列表
const getRecordDetailImages = (record: HistoryDraftItem): string[] => {
  if (!record?.finalDetialPath) return [];
  return record.finalDetialPath
    .split("|")
    .map(url => url.trim())
    .filter(url => url);
};

// 获取历史记录的终稿详情切片图列表
const getRecordSliceImages = (record: HistoryDraftItem): string[] => {
  if (!record?.finalDetialsPath) return [];
  return record.finalDetialsPath
    .split("|")
    .map(url => url.trim())
    .filter(url => url);
};

// 获取源文件路径
const getSourceFilePath = (record: HistoryDraftItem): string => {
  return record?.finalFilePath || "";
};

// 下载源文件
const handleDownloadSourceFile = (url: string) => {
  if (!url) return;
  window.open(url, "_blank");
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

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="上传终稿"
    width="1200px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="upload-final-draft-modal">
      <!-- 标签页 -->
      <div class="tab-header">
        <div
          :class="['tab-item', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          上传终稿
        </div>
        <div
          :class="['tab-item', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          历史稿件
        </div>
      </div>

      <!-- 上传区域 -->
      <div v-if="activeTab === 'upload'" class="upload-section">
        <div class="upload-grid">
          <!-- 左侧：主图上传 -->
          <div class="upload-left">
            <h3 class="upload-title">主图</h3>
            <el-upload
              :show-file-list="false"
              :before-upload="handleMainImageUpload"
              accept="image/*"
              multiple
              drag
              class="upload-area"
            >
              <div class="upload-content">
                <el-icon size="48" class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">
                  <p>
                    主图，拖拽图片到这里，或<span class="click-upload"
                      >点击上传</span
                    >
                  </p>
                  <p class="upload-tip">
                    请上传(单)主图，支持多张上传。仅限图片格式，例如：JPG、gif、png
                  </p>
                </div>
              </div>
            </el-upload>

            <!-- 已选择的主图列表 -->
            <div v-if="mainImageList.length > 0" class="file-list">
              <div
                v-for="(file, index) in mainImageList"
                :key="index"
                class="file-item"
              >
                <img
                  :src="getFilePreviewUrl(file)"
                  alt="缩略图"
                  class="file-thumbnail"
                />
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeMainImage(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧：源文件上传 -->
          <div class="upload-right">
            <h3 class="upload-title">源文件</h3>
            <el-upload
              :show-file-list="false"
              :before-upload="handleSourceFileUpload"
              accept=".zip,.rar"
              drag
              class="upload-area"
            >
              <div class="upload-content">
                <el-icon size="48" class="upload-icon">
                  <Document />
                </el-icon>
                <div class="upload-text">
                  <p>
                    拖拽源文件压缩包到这里，或<span class="click-upload"
                      >点击上传</span
                    >
                  </p>
                  <p class="upload-tip">
                    请上传(保)档案定稿包(须含全水印图)及PSD/CDR/AI等源文件(仅压缩包格式，例如：RAR、ZIP
                  </p>
                </div>
              </div>
            </el-upload>

            <!-- 已选择的源文件 -->
            <div v-if="sourceFile" class="file-list">
              <div class="file-item">
                <el-icon size="40" class="file-icon">
                  <Document />
                </el-icon>
                <div class="file-info">
                  <div class="file-name">{{ sourceFile.name }}</div>
                  <div class="file-size">
                    {{ formatFileSize(sourceFile.size) }}
                  </div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeSourceFile"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 717订单额外上传区域 -->
        <div v-if="needExtraImages" class="extra-upload-section">
          <!-- 终稿详情图 -->
          <div class="extra-upload-item">
            <h3 class="upload-title">终稿详情图</h3>
            <el-upload
              :show-file-list="false"
              :before-upload="handleDetailImageUpload"
              accept="image/*"
              multiple
              drag
              class="upload-area-small"
            >
              <div class="upload-content">
                <el-icon size="36" class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">
                  <p>
                    拖拽图片到这里，或<span class="click-upload">点击上传</span>
                  </p>
                  <p class="upload-tip">支持多张上传，仅限图片格式</p>
                </div>
              </div>
            </el-upload>

            <!-- 已选择的终稿详情图 -->
            <div v-if="detailImageList.length > 0" class="file-list-small">
              <div
                v-for="(file, index) in detailImageList"
                :key="index"
                class="file-item-small"
              >
                <img
                  :src="getFilePreviewUrl(file)"
                  alt="缩略图"
                  class="file-thumbnail-small"
                />
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeDetailImage(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 终稿详情切片图 -->
          <div class="extra-upload-item">
            <h3 class="upload-title">终稿详情切片图</h3>
            <el-upload
              :show-file-list="false"
              :before-upload="handleSliceImageUpload"
              accept="image/*"
              multiple
              drag
              class="upload-area-small"
            >
              <div class="upload-content">
                <el-icon size="36" class="upload-icon">
                  <Plus />
                </el-icon>
                <div class="upload-text">
                  <p>
                    拖拽图片到这里，或<span class="click-upload">点击上传</span>
                  </p>
                  <p class="upload-tip">支持多张上传，仅限图片格式</p>
                </div>
              </div>
            </el-upload>

            <!-- 已选择的终稿详情切片图 -->
            <div v-if="sliceImageList.length > 0" class="file-list-small">
              <div
                v-for="(file, index) in sliceImageList"
                :key="index"
                class="file-item-small"
              >
                <img
                  :src="getFilePreviewUrl(file)"
                  alt="缩略图"
                  class="file-thumbnail-small"
                />
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="removeSliceImage(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 说明文字 -->
        <div class="disclaimer">
          <p class="disclaimer-text">
            终稿上传必须是客户认可的最终效果。不闪随意上传,否则随意上传!
          </p>
        </div>
      </div>

      <!-- 历史稿件区域 -->
      <div v-else class="history-section">
        <div v-loading="historyLoading" class="history-content">
          <div v-if="historyDraftList.length > 0" class="history-list">
            <div
              v-for="(record, recordIndex) in historyDraftList"
              :key="recordIndex"
              class="history-item"
            >
              <div class="history-timestamp">
                {{ formatTime(record.createTime) }}
              </div>

              <!-- 主图展示区域 -->
              <div
                v-if="getRecordImages(record).length > 0"
                class="history-images-section"
              >
                <h4 class="section-title">主图</h4>
                <div class="thumbnails-wrapper">
                  <el-image
                    v-for="(imgUrl, imgIndex) in getRecordImages(record)"
                    :key="imgIndex"
                    :src="imgUrl"
                    :preview-src-list="getRecordImages(record)"
                    :initial-index="imgIndex"
                    class="thumbnail-image"
                    fit="cover"
                    :preview-teleported="true"
                  />
                </div>
              </div>

              <!-- 源文件下载 -->
              <div
                v-if="getSourceFilePath(record)"
                class="history-images-section"
              >
                <h4 class="section-title">源文件</h4>
                <div class="source-file-wrapper">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleDownloadSourceFile(getSourceFilePath(record))"
                  >
                    下载源文件
                  </el-button>
                </div>
              </div>

              <!-- 终稿详情图 -->
              <div
                v-if="getRecordDetailImages(record).length > 0"
                class="history-images-section"
              >
                <h4 class="section-title">终稿详情图</h4>
                <div class="thumbnails-wrapper">
                  <el-image
                    v-for="(imgUrl, imgIndex) in getRecordDetailImages(record)"
                    :key="imgIndex"
                    :src="imgUrl"
                    :preview-src-list="getRecordDetailImages(record)"
                    :initial-index="imgIndex"
                    class="thumbnail-image"
                    fit="cover"
                    :preview-teleported="true"
                  />
                </div>
              </div>

              <!-- 终稿详情切片图 -->
              <div
                v-if="getRecordSliceImages(record).length > 0"
                class="history-images-section"
              >
                <h4 class="section-title">终稿详情切片图</h4>
                <div class="thumbnails-wrapper">
                  <el-image
                    v-for="(imgUrl, imgIndex) in getRecordSliceImages(record)"
                    :key="imgIndex"
                    :src="imgUrl"
                    :preview-src-list="getRecordSliceImages(record)"
                    :initial-index="imgIndex"
                    class="thumbnail-image"
                    fit="cover"
                    :preview-teleported="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 无历史稿件 -->
          <div v-else class="no-history">
            <p>暂无历史稿件</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="activeTab === 'upload'"
          type="primary"
          :loading="uploading"
          @click="handleSubmit"
        >
          确定提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.upload-final-draft-modal {
  max-height: 70vh;
  overflow-y: auto;

  .tab-header {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;

    .tab-item {
      padding: 12px 24px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;

      &.active {
        color: #409eff;
        border-bottom-color: #409eff;
      }

      &:hover:not(.active) {
        color: #409eff;
      }
    }
  }

  .upload-section {
    .upload-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .upload-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;

      .upload-left,
      .upload-right {
        .upload-area {
          :deep(.el-upload) {
            width: 100%;
          }

          :deep(.el-upload-dragger) {
            padding: 20px;
            width: 100%;
            height: auto;
            min-height: 200px;
          }
        }

        .upload-content {
          text-align: center;

          .upload-icon {
            color: #c0c4cc;
            margin-bottom: 16px;
          }

          .upload-text {
            .click-upload {
              color: #409eff;
              cursor: pointer;
            }

            .upload-tip {
              color: #909399;
              font-size: 12px;
              margin-top: 8px;
              line-height: 1.4;
            }
          }
        }

        .file-list {
          margin-top: 12px;
          max-height: 150px;
          overflow-y: auto;

          .file-item {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 8px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
            }

            .file-thumbnail {
              width: 50px;
              height: 50px;
              object-fit: cover;
              border-radius: 4px;
              margin-right: 12px;
            }

            .file-icon {
              width: 50px;
              height: 50px;
              color: #409eff;
              margin-right: 12px;
            }

            .file-info {
              flex: 1;
              min-width: 0;

              .file-name {
                font-size: 13px;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .file-size {
                font-size: 12px;
                color: #909399;
                margin-top: 4px;
              }
            }
          }
        }
      }
    }

    .extra-upload-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;

      .extra-upload-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .upload-area-small {
          :deep(.el-upload) {
            width: 100%;
          }

          :deep(.el-upload-dragger) {
            padding: 16px;
            width: 100%;
            height: auto;
            min-height: 120px;
          }
        }

        .file-list-small {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          max-height: 120px;
          overflow-y: auto;

          .file-item-small {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
            }

            .file-thumbnail-small {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 4px;
              margin-right: 8px;
            }

            .file-info {
              flex: 1;
              min-width: 0;

              .file-name {
                font-size: 12px;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
    }

    .disclaimer {
      margin-top: 20px;
      padding: 12px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;

      .disclaimer-text {
        color: #dc2626;
        font-size: 12px;
        margin: 0;
        line-height: 1.4;
      }
    }
  }

  .history-section {
    .history-content {
      min-height: 200px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .history-item {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 20px;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .history-timestamp {
          text-align: left;
          color: #666;
          font-size: 14px;
          font-weight: 600;
          padding: 4px 0 12px 0;
          margin-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .history-images-section {
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }

          .thumbnails-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px;
            background: #f9fafb;
            border-radius: 8px;

            .thumbnail-image {
              width: 80px;
              height: 80px;
              border-radius: 6px;
              cursor: pointer;
              overflow: hidden;
              border: 2px solid transparent;
              transition: all 0.2s;

              :deep(img) {
                border-radius: 4px;
                transition: all 0.2s;
              }

              &:hover {
                border-color: #409eff;

                :deep(img) {
                  transform: scale(1.05);
                }
              }
            }
          }

          .source-file-wrapper {
            padding: 8px;
            background: #f9fafb;
            border-radius: 8px;
          }
        }
      }
    }

    .no-history {
      text-align: center;
      padding: 60px 20px;
      color: #909399;
      font-size: 14px;
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式适配
@media (max-width: 768px) {
  .upload-final-draft-modal {
    .upload-section {
      .upload-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
