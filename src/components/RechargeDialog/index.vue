<!--
 * @Description: 充值弹框组件
 * @Author: 程前
 * @Date: 2025-10-27 09:15:30
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-30 16:42:18
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

interface RechargeForm {
  money: number;
  accountType: 1 | 2; //1余额 2保证金
  paymentMethod: "wechat" | "alipay";
}

interface Props {
  visible: boolean;
  currentBalance?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "confirm", data: RechargeForm): void;
}

const props = withDefaults(defineProps<Props>(), {
  currentBalance: "1.00"
});

const emit = defineEmits<Emits>();

const rechargeForm = ref<RechargeForm>({
  money: null,
  accountType: 1,
  paymentMethod: "wechat"
});

// 监听弹框显示状态，重置表单
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      resetForm();
    }
  }
);

// 重置表单
const resetForm = () => {
  rechargeForm.value = {
    money: null,
    accountType: 1,
    paymentMethod: "wechat"
  };
};

/**
 * 选择充值类型
 * @param type
 */
const selectChargeAccount = (type: 1 | 2) => {
  rechargeForm.value.accountType = type;
};

// 关闭弹框
const handleClose = () => {
  emit("update:visible", false);
};

// 立即充值
const handleRecharge = () => {
  if (!rechargeForm.value.money) {
    ElMessage.warning("请输入充值金额");
    return;
  }

  const money = parseFloat(rechargeForm.value.money);
  if (money <= 0) {
    ElMessage.warning("充值金额必须大于0");
    return;
  }

  // 触发确认事件，传递表单数据
  emit("confirm", rechargeForm.value);
  handleClose();
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="充值"
    width="600px"
    center
    :before-close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="space-y-6 p-3">
      <!-- 当前余额 -->
      <div class="flex items-center">
        <span class="text-gray-700 mr-3">当前余额:</span>
        <span class="text-red-500 text-lg font-semibold"
          >¥ {{ currentBalance }}</span
        >
      </div>

      <!-- 充值金额 -->
      <div>
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="text-gray-700">充值金额:</span>
        </div>
        <el-input
          v-model="rechargeForm.money"
          placeholder="请输入充值金额"
          type="number"
          size="large"
          class="w-full"
          :min="0"
          :step="0.01"
        />
      </div>

      <!-- 收款账户 -->
      <div>
        <div class="text-gray-700 mb-3">收款账户:</div>
        <div class="flex gap-3">
          <el-button
            :type="rechargeForm.accountType === 1 ? 'primary' : 'default'"
            class="flex-1"
            @click="selectChargeAccount(1)"
          >
            余额账户
          </el-button>
          <el-button
            :type="rechargeForm.accountType === 2 ? 'primary' : 'default'"
            class="flex-1"
            @click="selectChargeAccount(2)"
          >
            保证金账户
          </el-button>
        </div>
      </div>

      <!-- 付款方式 -->
      <div>
        <div class="text-gray-700 mb-3">付款方式:</div>
        <div class="flex gap-3">
          <button
            :class="[
              'flex-1 h-12 rounded border-2 flex items-center justify-center gap-2 transition-colors',
              rechargeForm.paymentMethod === 'alipay'
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-gray-100'
            ]"
            @click="rechargeForm.paymentMethod = 'alipay'"
          >
            <div
              class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs"
            >
              支
            </div>
            <span class="text-gray-600">支付宝</span>
          </button>
          <button
            :class="[
              'flex-1 h-12 rounded border-2 flex items-center justify-center gap-2 transition-colors',
              rechargeForm.paymentMethod === 'wechat'
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 bg-gray-100'
            ]"
            @click="rechargeForm.paymentMethod = 'wechat'"
          >
            <div
              class="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs"
            >
              微
            </div>
            <span class="text-gray-600">微信</span>
          </button>
        </div>
      </div>

      <!-- 立即充值按钮 -->
      <div class="flex justify-center pt-4">
        <el-button
          type="primary"
          size="large"
          class="w-40"
          @click="handleRecharge"
        >
          立即充值
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
