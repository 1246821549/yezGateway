<!--
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-20 10:04:06
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-22 16:26:28
-->
<template>
  <el-dialog
    v-model="visible"
    title="裁剪身份证照片"
    width="60vw"
    top="10vh"
    :show-close="false"
    center
    class="crop-dialog"
  >
    <!-- 操作提示 -->
    <div class="mb-4 p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center text-blue-600 text-sm">
        <el-icon class="mr-2"><InfoFilled /></el-icon>
        <span
          >请调整裁剪框位置和大小，确保身份证信息完整清晰。支持旋转、缩放操作。</span
        >
      </div>
    </div>

    <div class="flex gap-5 min-h-[500px] md:flex-row flex-col">
      <!-- 裁剪区域 -->
      <div
        class="flex-1 min-h-[400px] border border-gray-300 rounded-lg overflow-hidden"
      >
        <VueCropper
          ref="cropperRef"
          :img="imageSrc"
          :output-size="1"
          :output-type="outputType"
          :info="true"
          :full="false"
          :fixed="true"
          :fixed-number="[3.5, 2.2]"
          :can-move="true"
          :can-move-box="true"
          :original="false"
          :auto-crop="true"
          :auto-crop-width="400"
          :auto-crop-height="250"
          :center-box="true"
          :high="true"
          :info-true="true"
          :max-img-size="3000"
          :enlarge="1"
          :mode="cropMode"
          :max-real-scale="5"
          :min-real-scale="0.1"
          :can-scale="true"
          :can-rotate="true"
          :no-rotate="false"
          @real-time="realTime"
        />
      </div>

      <!-- 操作按钮区域 -->
      <div
        class="w-full md:w-52 flex flex-row md:flex-col gap-5 justify-between md:justify-start"
      >
        <!-- 预览区域 -->
        <div class="flex-1 md:flex-none">
          <h4 class="text-sm font-medium text-gray-700 mb-3">裁剪预览</h4>
          <div>
            <div
              class="w-full md:w-52 h-32 border border-gray-300 rounded overflow-hidden bg-gray-50"
            >
              <img
                v-if="previewData.url"
                :src="previewData.url"
                alt="裁剪预览"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
              >
                裁剪预览
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 md:flex-none">
          <h4 class="text-sm font-medium text-gray-700 mb-3">旋转操作</h4>
          <div
            class="flex flex-row md:flex-col gap-2 justify-center md:justify-start pt-3"
          >
            <el-button :icon="RefreshLeft" size="small" @click="rotateLeft"
              >向左旋转</el-button
            >
            <el-button :icon="RefreshRight" size="small" @click="rotateRight"
              >向右旋转</el-button
            >
          </div>
        </div>

        <div class="flex-1 md:flex-none">
          <h4 class="text-sm font-medium text-gray-700 mb-3">缩放操作</h4>
          <div
            class="flex flex-row md:flex-col gap-2 justify-center md:justify-start pt-3"
          >
            <el-button :icon="ZoomIn" size="small" @click="zoomIn"
              >放大</el-button
            >
            <el-button :icon="ZoomOut" size="small" @click="zoomOut"
              >缩小</el-button
            >
          </div>
        </div>

        <div class="flex-1 md:flex-none">
          <h4 class="text-sm font-medium text-gray-700 mb-3">重置操作</h4>
          <div
            class="flex flex-row md:flex-col gap-2 justify-center md:justify-start pt-3"
          >
            <el-button :icon="Refresh" size="small" @click="resetCrop"
              >重置</el-button
            >
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center gap-4">
        <el-button class="min-w-[80px] rounded-md" @click="onCancel">
          取消
        </el-button>
        <el-button
          type="primary"
          class="min-w-[80px] rounded-md"
          :loading="confirmLoading"
          @click="onConfirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  watch,
  defineProps,
  defineEmits,
  defineOptions
} from "vue";
import { ElMessage } from "element-plus";
import {
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut,
  Refresh,
  InfoFilled
} from "@element-plus/icons-vue";
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";

// 注册组件
defineOptions({
  components: {
    VueCropper
  }
});

const props = defineProps<{
  modelValue: boolean;
  imageSrc: string;
  cropType: "front" | "back";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "crop-confirm": [croppedImage: string, type: "front" | "back"];
}>();

const visible = ref(props.modelValue);
const cropperRef = ref();
const confirmLoading = ref(false);

// 裁剪配置
const outputType = ref<"png" | "jpeg" | "webp">("png");
const cropMode = ref<"contain" | "cover" | "fill">("contain");

// 预览数据
const previewData = reactive({
  url: "",
  info: null as any
});

// 监听props变化
watch(
  () => props.modelValue,
  val => (visible.value = val)
);

watch(visible, val => emit("update:modelValue", val));

// 向左旋转
const rotateLeft = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateLeft();
  }
};

// 向右旋转
const rotateRight = () => {
  if (cropperRef.value) {
    cropperRef.value.rotateRight();
  }
};

// 放大
const zoomIn = () => {
  if (cropperRef.value) {
    cropperRef.value.changeScale(1);
  }
};

// 缩小
const zoomOut = () => {
  if (cropperRef.value) {
    cropperRef.value.changeScale(-1);
  }
};

// 重置裁剪
const resetCrop = () => {
  if (cropperRef.value) {
    cropperRef.value.refresh();
  }
};

// 实时预览
const realTime = (data: any) => {
  // 更新预览数据
  previewData.url = data.url;
  previewData.info = data;
};

// 取消操作
const onCancel = () => {
  visible.value = false;
};

/**
 * 确认裁剪
 */
const onConfirm = () => {
  if (!cropperRef.value) {
    ElMessage.error("裁剪器未初始化");
    return;
  }

  confirmLoading.value = true;

  try {
    cropperRef.value.getCropData((data: string) => {
      if (data) {
        // 发送裁剪后的图片数据
        emit("crop-confirm", data, props.cropType);
        visible.value = false;
        ElMessage.success("裁剪完成");
      } else {
        ElMessage.error("裁剪失败，请重试");
      }
      confirmLoading.value = false;
    });
  } catch (error) {
    console.error("裁剪失败:", error);
    ElMessage.error("裁剪失败，请重试");
    confirmLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.crop-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

// 确保按钮样式正确
:deep(.el-button) {
  width: 100%;
  justify-content: center;
}
:deep(.el-button + .el-button) {
  margin-left: 0;
}
// 移动端按钮样式调整
@media (max-width: 768px) {
  :deep(.el-button) {
    width: auto;
    min-width: 80px;
  }
}
</style>
