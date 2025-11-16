<!--
 * @Description: 批注详情弹框组件
 * @Author: AI Assistant
 * @Date: 2025-01-27
-->
<script setup lang="ts">
import { ref, computed } from "vue";
import { Close } from "@element-plus/icons-vue";
import type { OrderAnnotateItem } from "@/api/order";

interface Props {
  visible: boolean;
  annotation: OrderAnnotateItem | null;
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

// 关闭弹框
const handleClose = () => {
  emit("close");
};

// 预览图片
const previewImage = (imageUrl: string) => {
  // 使用Element Plus的图片预览功能
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    // 可以在这里实现图片预览功能
    console.log("预览图片:", imageUrl);
  };
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="批注详情"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div v-if="annotation" class="annotation-detail-content">
      <!-- 操作人 -->
      <div class="detail-item">
        <span class="label">操作人:</span>
        <span class="value">{{
          annotation.userName || annotation.adminUserName || "系统"
        }}</span>
      </div>

      <!-- 操作时间 -->
      <div class="detail-item">
        <span class="label">操作时间:</span>
        <span class="value">{{ formatTime(annotation.createTime) }}</span>
      </div>

      <!-- 批注内容 -->
      <div class="detail-item">
        <span class="label">批注内容:</span>
        <div class="value content-text">
          {{ annotation.annotationsReason }}
        </div>
      </div>

      <!-- 批注图片 -->
      <div v-if="annotation.imagePath" class="detail-item">
        <span class="label">批注图片:</span>
        <div class="value">
          <div class="image-gallery">
            <img
              :src="annotation.imagePath"
              alt="批注图片"
              class="annotation-image"
              @click="previewImage(annotation.imagePath)"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.annotation-detail-content {
  .detail-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    .label {
      min-width: 100px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .value {
      color: #333;
      font-size: 14px;
      flex: 1;
      word-break: break-all;

      &.content-text {
        line-height: 1.6;
        white-space: pre-wrap;
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #e9ecef;
      }
    }
  }

  .image-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .annotation-image {
      width: 120px;
      height: 120px;
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

.dialog-footer {
  text-align: right;
}

// 响应式适配
@media (max-width: 768px) {
  .annotation-detail-content {
    .detail-item {
      flex-direction: column;
      align-items: flex-start;

      .label {
        min-width: auto;
        margin-bottom: 8px;
        margin-right: 0;
      }
    }

    .image-gallery {
      .annotation-image {
        width: 100px;
        height: 100px;
      }
    }
  }
}
</style>
