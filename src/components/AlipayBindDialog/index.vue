<!--
 * @Description: 绑定弹框（支持支付宝和微信）
 * @Author: 程前
 * @Date: 2025-10-29 08:30:15
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-29 17:22:48
-->
<template>
  <el-dialog
    v-model="modelValue"
    :title="dialogTitle"
    width="550px"
    :show-close="true"
    center
    @close="onClose"
  >
    <div class="flex flex-col items-center">
      <!-- 二维码区域 -->
      <div
        class="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg mb-4"
      >
        <div v-if="loading" class="text-gray-500">
          <el-icon class="animate-spin"><Loading /></el-icon>
          <p class="mt-2">正在生成二维码...</p>
        </div>
        <div
          v-else-if="qrCodeUrl"
          class="w-full h-full flex items-center justify-center"
        >
          <img
            :src="qrCodeUrl"
            :alt="`${bindType === 'alipay' ? '支付宝' : '微信'}绑定二维码`"
            class="max-w-full max-h-full"
          />
        </div>
        <div v-else class="text-gray-500">
          <el-icon><Warning /></el-icon>
          <p class="mt-2">二维码生成失败</p>
        </div>
      </div>

      <!-- 提示文字 -->
      <p class="text-gray-600 text-sm">{{ tipText }}</p>
    </div>

    <template #footer>
      <div class="flex justify-center">
        <el-button @click="onClose">关闭</el-button>
        <el-button type="primary" :loading="loading" @click="refreshQrCode">
          刷新二维码
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Loading, Warning } from "@element-plus/icons-vue";
import QRCode from "qrcode";
import { getAlipayBindUrl } from "@/api/userAuth";
import { getWechatAuthUrl } from "@/api/pay";

/**
 * 绑定类型：支付宝或微信
 */
type BindType = "alipay" | "wechat";

const props = defineProps<{
  modelValue: boolean;
  /**
   * 绑定类型，默认为支付宝
   */
  bindType?: BindType;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /**
   * 绑定成功后触发，通知父组件刷新用户信息
   */
  "bind-success"?: [];
}>();

const modelValue = ref(props.modelValue);
const loading = ref(false);
const qrCodeUrl = ref("");

// 默认绑定类型为支付宝（保持向后兼容）
const bindType = computed(() => props.bindType || "alipay");

// 弹框标题
const dialogTitle = computed(() => {
  return bindType.value === "alipay" ? "绑定支付宝" : "绑定微信";
});

// 提示文字
const tipText = computed(() => {
  return bindType.value === "alipay" ? "支付宝扫码绑定" : "微信扫码绑定";
});

// 监听弹框显示状态
watch(
  () => props.modelValue,
  val => {
    modelValue.value = val;
    if (val) {
      generateQrCode();
    }
  }
);

watch(modelValue, val => emit("update:modelValue", val));

/**
 * 生成二维码
 */
const generateQrCode = async () => {
  try {
    loading.value = true;
    qrCodeUrl.value = "";

    let response;
    let bindUrl = "";

    // 根据绑定类型调用不同的接口
    if (bindType.value === "alipay") {
      // 支付宝绑定
      response = await getAlipayBindUrl();
      if (response.code === 200 && response.result?.currUrl) {
        bindUrl = response.result.currUrl;
      }
    } else {
      // 微信绑定
      response = await getWechatAuthUrl({ tyep: 1 });
      if (response.code === 200 && response.result?.currUrl) {
        bindUrl = response.result.currUrl;
      }
    }

    if (bindUrl) {
      // 使用qrcode生成二维码
      const qrCodeDataUrl = await QRCode.toDataURL(bindUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      qrCodeUrl.value = qrCodeDataUrl;
    } else {
      ElMessage.error(response?.message || "获取绑定链接失败");
    }
  } catch (error) {
    console.error("生成二维码失败:", error);
    ElMessage.error("生成二维码失败，请重试");
  } finally {
    loading.value = false;
  }
};

/**
 * 刷新二维码
 */
const refreshQrCode = () => {
  generateQrCode();
};

/**
 * 关闭弹框
 */
const onClose = () => {
  modelValue.value = false;
  qrCodeUrl.value = "";
};

// 组件挂载时如果弹框已显示，则生成二维码
onMounted(() => {
  if (props.modelValue) {
    generateQrCode();
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
