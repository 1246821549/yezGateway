<!--
 * @Description: 上传初稿弹框组件
 * @Author: AI Assistant
 * @Date: 2025-01-27
-->
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { uploadFileToOss, type UploadFileToOssResponse } from "@/api/upload";
import {
  uploadFirstDraft,
  getFirstDraftHistoryList,
  type HistoryDraftItem
} from "@/api/order";

interface Props {
  visible: boolean;
  orderId: number;
  draftType?: "first"; // 保留以兼容旧代码，但只支持初稿
  orderDetail: any; // 订单详情，用于判断状态
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
const fileList = ref<File[]>([]);
const uploadedUrls = ref<string[]>([]);
const currentImageIndex = ref(0);

// 历史稿件相关状态
const historyDraftList = ref<HistoryDraftItem[]>([]);
const historyLoading = ref(false);

// 计算属性
const modalTitle = "上传初稿";
const uploadButtonText = "上传初稿";

// 获取历史记录的图片列表
const getRecordImages = (record: HistoryDraftItem): string[] => {
  if (!record?.firstDraftImagePath) return [];
  const result = record.firstDraftImagePath
    .split("|")
    .map(url => url.trim())
    .filter(url => url);
  console.log(result);
  return result;
};

// 文件上传处理
const handleFileUpload = (file: File) => {
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

  fileList.value.push(file);
  return false; // 阻止自动上传
};

// 删除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
  uploadedUrls.value.splice(index, 1);
  if (currentImageIndex.value >= fileList.value.length) {
    currentImageIndex.value = Math.max(0, fileList.value.length - 1);
  }
};

// 上一张图片
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// 下一张图片
const nextImage = () => {
  if (currentImageIndex.value < fileList.value.length - 1) {
    currentImageIndex.value++;
  }
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
  if (fileList.value.length === 0) {
    ElMessage.warning("请先选择要上传的图片");
    return;
  }

  try {
    uploading.value = true;
    const urls: string[] = [];

    // 逐个上传文件
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i];
      try {
        const url = await uploadToOss(file);
        urls.push(url);
        uploadedUrls.value[i] = url;
      } catch (error) {
        ElMessage.error(`第${i + 1}张图片上传失败`);
        return;
      }
    }

    // 调用上传初稿接口
    const uploadData = {
      id: props.orderId,
      imgPaths: urls
    };

    await uploadFirstDraft(uploadData);

    ElMessage.success("上传初稿成功");
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
  fileList.value = [];
  uploadedUrls.value = [];
  currentImageIndex.value = 0;
  activeTab.value = "upload";
};

// 监听弹框显示状态
watch(
  () => props.visible,
  visible => {
    if (visible) {
      // 弹框打开时重置数据
      fileList.value = [];
      uploadedUrls.value = [];
      currentImageIndex.value = 0;
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

    // 获取初稿历史列表
    const response = await getFirstDraftHistoryList({ id: props.orderId });

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
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="upload-draft-modal">
      <!-- 标签页 -->
      <div class="tab-header">
        <div
          :class="['tab-item', { active: activeTab === 'upload' }]"
          @click="activeTab = 'upload'"
        >
          {{ modalTitle }}
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
        <div class="upload-area">
          <el-upload
            :show-file-list="false"
            :before-upload="handleFileUpload"
            accept="image/*"
            multiple
            drag
          >
            <div class="upload-content">
              <el-icon size="48" class="upload-icon">
                <Plus />
              </el-icon>
              <div class="upload-text">
                <p>
                  拖拽图片到这里，或<span class="click-upload">点击上传</span>
                </p>
                <p class="upload-tip">
                  支持多张上传。仅限图片格式，例如：JPG、GIF、PNG
                </p>
              </div>
            </div>
          </el-upload>
        </div>

        <!-- 已选择的文件列表 -->
        <div v-if="fileList.length > 0" class="file-list">
          <div class="file-preview">
            <!-- <div class="preview-container">
              <img
                v-if="fileList[currentImageIndex]"
                :src="getFilePreviewUrl(fileList[currentImageIndex])"
                alt="预览图片"
                class="preview-image"
              />
              <div v-else class="no-image">暂无图片</div>
            </div> -->

            <!-- 导航按钮 -->
            <!-- <div v-if="fileList.length > 1" class="nav-buttons">
              <el-button
                :disabled="currentImageIndex === 0"
                circle
                size="small"
                @click="prevImage"
              >
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <span class="image-counter">
                {{ currentImageIndex + 1 }} / {{ fileList.length }}
              </span>
              <el-button
                :disabled="currentImageIndex === fileList.length - 1"
                circle
                size="small"
                @click="nextImage"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div> -->
          </div>

          <!-- 文件列表 -->
          <div class="file-items">
            <div
              v-for="(file, index) in fileList"
              :key="index"
              :class="['file-item', { active: index === currentImageIndex }]"
              @click="currentImageIndex = index"
            >
              <img
                :src="getFilePreviewUrl(file)"
                alt="缩略图"
                class="file-thumbnail"
              />
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">
                  {{ (file.size / 1024 / 1024).toFixed(2) }}MB
                </div>
              </div>
              <el-button
                type="danger"
                size="small"
                circle
                @click.stop="removeFile(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 说明文字 -->
        <div class="disclaimer">
          <p class="disclaimer-text">
            初稿上传并非需要客户认可稿件，只要是真实已完成的初稿效果即可。
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

              <!-- 图片展示区域 -->
              <div class="history-images-container">
                <!-- 缩略图列表 -->
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
.upload-draft-modal {
  max-height: 100%;
  .tab-header {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 20px;

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
    .upload-area {
      margin-bottom: 20px;

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
          }
        }
      }
    }

    .file-list {
      .file-preview {
        margin-bottom: 20px;
        text-align: center;

        .preview-container {
          width: 100%;
          height: 200px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;

          .preview-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .no-image {
            color: #909399;
          }
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          .image-counter {
            font-size: 14px;
            color: #666;
          }
        }
      }

      .file-items {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        max-height: 200px;
        overflow-y: auto;

        .file-item {
          display: flex;
          align-items: center;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            border-color: #409eff;
            background-color: #f0f9ff;
          }

          &:hover {
            border-color: #409eff;
          }

          .file-thumbnail {
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

            .file-size {
              font-size: 11px;
              color: #909399;
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
      max-height: 500px;
      overflow-y: auto;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .history-item {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 10px;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .history-timestamp {
          text-align: left;
          color: #666;
          font-size: 14px;
          padding: 4px 0;
        }

        .history-images-container {
          .thumbnails-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 6px;
            background: #f9fafb;
            border-radius: 8px;

            .thumbnail-image {
              width: 60px;
              height: 60px;
              border-radius: 6px;
              cursor: pointer;
              overflow: hidden;

              :deep(img) {
                border-radius: 6px;
                transition: all 0.2s;
              }

              &:hover {
                :deep(img) {
                  transform: scale(1.1);
                }
              }
            }
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
  .upload-draft-modal {
    .file-list {
      .file-items {
        grid-template-columns: 1fr;
      }
    }

    .history-section {
      .history-list {
        .history-item {
          .history-images-container {
            .thumbnails-wrapper {
              .thumbnail-image {
                width: 80px;
                height: 80px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
