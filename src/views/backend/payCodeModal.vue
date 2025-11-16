<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import QRCode from "qrcode";
interface Props {
  visible: boolean;
  url: string;
  money: number;
  paymentMethod?: "wechat" | "alipay";
}

interface Emits {
  (e: "update:visible", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  paymentMethod: "wechat"
});

const emit = defineEmits<Emits>();

// 监听弹框显示状态，重置表单
watch(
  () => props.url,
  newVal => {
    if (newVal) {
      generateQRCode();
    }
  }
);

/**
 * 生成二维码
 */
const qrCodeUrl = ref<string>("");
const generateQRCode = async () => {
  if (props.url) {
    qrCodeUrl.value = await QRCode.toDataURL(props.url, {
      width: 300,
      margin: 2
    });
  }
};
// 关闭弹框
const handleClose = () => {
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title=""
    width="500px"
    center
    top="30vh"
    :before-close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <h3 class="w-full text-center font-bold text-black">
      {{ props.paymentMethod === "wechat" ? "微信支付码" : "支付宝支付码" }}
    </h3>
    <div class="flex flex-col items-center">
      <img :src="qrCodeUrl" class="w-[200px] h-full object-cover" />
      <div class="w-full text-center font-bold">
        {{
          props.paymentMethod === "wechat"
            ? `微信扫码充值，金额：${props.money}元`
            : `支付宝扫码充值，金额：${props.money}元`
        }}
      </div>
    </div>
  </el-dialog>
</template>
