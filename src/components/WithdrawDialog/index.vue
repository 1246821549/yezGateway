<!--
 * @Description: 提现弹框组件
 * @Author: 程前
 * @Date: 2025-01-28
-->
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { withdrawData, withdraw, type WithdrawData } from "@/api/withdraw";
import { InfoFilled } from "@element-plus/icons-vue";
import WithdrawPasswordDialog from "@/components/WithdrawPasswordDialog/index.vue";

interface Props {
  visible: boolean;
  userName?: string;
  userId?: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  userName: "",
  userId: 0
});

const emit = defineEmits<Emits>();

// 提现表单数据
const withdrawForm = ref({
  money: null as number | null,
  paymentMethod: 2 as 1 | 2 // 1：微信，2：支付宝，默认支付宝
});

// 提现数据
const withdrawInfo = ref<WithdrawData["result"] | null>(null);
const loading = ref(false);

// 提现密码弹框
const showPasswordDialog = ref(false);

// 可提现余额
const balance = computed(() => {
  return withdrawInfo.value?.balance || 0;
});

// 提现金额最小值
const minMoney = computed(() => {
  return withdrawInfo.value?.minMoney || 0;
});

/**
 * 提现说明文本
 */
const withdrawDescriptionText = `提现说明：

1、平台默认为月结，无须扣押保证金，即每间隔30天可免费手续费提现一次，超限次数提现须扣除2%手续费。

2、如您最近两次间隔小于7天，系统视您自动转为周结，需扣押500元保证金，即每间隔7天可免费手续费提现一次，超限次数提现须扣除5%手续费。

3、佣金余额显示负数是由于佣金账户余额不够扣处罚款，订单分佣入账后会自动抵扣，请认真自查！

4、新用户首次提现的起始时间为设计师在优君电商系统入职审核日期，您的入职审核日期为：2025-01-06

5、服务能力过低的设计师不支持周结。

6、周结用户保证金仅扣一次，离职审核后系统自动退还。

7、如余额为负数，系统自动将您的账号设置为异常，从而无法接单，如需解决请在我的账户>充值页面进行充值对应的金额后联系设计师服务解除异常方可继续接单。

8、绑定已实名的支付宝必须与系统实名一致，否则无法提现成功。

9、当前用户类型提现金额不得低于10元`;

/**
 * 提现说明文本处理
 */
const withdrawDescription = computed(() => {
  return withdrawDescriptionText.replace(/\n/g, "<br>");
});

// 监听弹框显示状态，获取提现数据
watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      await fetchWithdrawData();
      resetForm();
    }
  }
);

/**
 * 获取提现数据
 */
const fetchWithdrawData = async () => {
  try {
    loading.value = true;
    const res = await withdrawData();
    if (res.code === 200 && res.result) {
      withdrawInfo.value = res.result;
    } else {
      ElMessage.error(res.message || "获取提现数据失败");
    }
  } catch (error) {
    console.error("获取提现数据失败:", error);
    ElMessage.error("获取提现数据失败，请重试");
  } finally {
    loading.value = false;
  }
};

/**
 * 重置表单
 */
const resetForm = () => {
  withdrawForm.value = {
    money: null,
    paymentMethod: 2 // 默认支付宝
  };
};

/**
 * 选择提现方式
 */
const selectPaymentMethod = (method: 1 | 2) => {
  // 当前只支持支付宝提现，微信暂时禁用
  if (method === 1) {
    ElMessage.warning("暂未开放!请选择支付宝提现");
    return;
  }
  withdrawForm.value.paymentMethod = method;
};

/**
 * 全部提现
 */
const withdrawAll = () => {
  if (balance.value > 0) {
    withdrawForm.value.money = balance.value;
  } else {
    ElMessage.warning("可提现余额为0");
  }
};

/**
 * 立即提现
 */
const handleWithdraw = async () => {
  // 验证提现金额
  if (!withdrawForm.value.money) {
    ElMessage.warning("请输入提现金额");
    return;
  }

  const money = Number(withdrawForm.value.money);

  if (money <= 0) {
    ElMessage.warning("提现金额必须大于0");
    return;
  }

  if (money < minMoney.value) {
    ElMessage.warning(`提现金额不能低于${minMoney.value}元`);
    return;
  }

  if (money > balance.value) {
    ElMessage.warning("提现金额不能超过可提现余额");
    return;
  }

  // 检查是否选择了微信（虽然界面已经禁用，但做双重验证）
  if (withdrawForm.value.paymentMethod === 1) {
    ElMessage.warning("暂未开放!请选择支付宝提现");
    return;
  }

  // 打开提现密码输入弹框
  showPasswordDialog.value = true;
};

/**
 * 关闭弹框
 */
const handleClose = () => {
  emit("update:visible", false);
};

/**
 * 金额输入框变化，确保不超过可提现余额
 */
const handleMoneyChange = (value: number | null) => {
  if (value !== null && value > balance.value) {
    withdrawForm.value.money = balance.value;
    ElMessage.warning("提现金额不能超过可提现余额");
  }
};

/**
 * 处理提现密码确认成功
 */
const handlePasswordConfirmSuccess = () => {
  emit("success");
  handleClose();
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="提现"
    width="600px"
    center
    :before-close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-loading="loading" class="space-y-6 p-3">
      <!-- 可提现余额 -->
      <div class="flex items-center">
        <span class="text-gray-700 mr-3">可提现余额:</span>
        <span class="text-red-500 text-lg font-semibold"
          >¥ {{ balance.toFixed(2) }}</span
        >
        <!-- <el-tooltip
          :content="withdrawDescription"
          placement="top"
          :width="400"
          raw-content
        >
          <el-icon class="text-gray-400 ml-1 cursor-pointer">
            <InfoFilled />
          </el-icon>
        </el-tooltip> -->
      </div>

      <!-- 收款人 -->
      <div class="flex items-center">
        <span class="text-gray-700 mr-3">收款人:</span>
        <span class="text-gray-800">{{ userName || "-" }}</span>
      </div>

      <!-- 提现方式 -->
      <div>
        <div class="text-gray-700 mb-3">提现方式:</div>
        <div class="flex gap-3">
          <!-- 支付宝 -->
          <button
            :class="[
              'flex-1 h-12 rounded border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer',
              withdrawForm.paymentMethod === 2
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-gray-100'
            ]"
            @click="selectPaymentMethod(2)"
          >
            <div
              class="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs"
            >
              支
            </div>
            <span class="text-gray-600">支付宝</span>
          </button>

          <!-- 微信 -->
          <button
            :class="[
              'flex-1 h-12 rounded border-2 flex items-center justify-center gap-2 transition-colors cursor-not-allowed opacity-60',
              withdrawForm.paymentMethod === 1
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 bg-gray-100'
            ]"
            @click="selectPaymentMethod(1)"
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

      <!-- 提现金额 -->
      <div>
        <div class="flex items-center mb-2">
          <span class="text-red-500 mr-1">*</span>
          <span class="text-gray-700">提现金额:</span>
        </div>
        <div class="flex gap-2">
          <el-input-number
            v-model="withdrawForm.money"
            placeholder="请输入提现金额"
            size="large"
            class="flex-1"
            :min="0"
            :max="balance"
            :precision="2"
            :step="0.01"
            controls-position="right"
            @change="handleMoneyChange"
          />
          <el-button style="height: 40px" type="primary" @click="withdrawAll"
            >全部提现</el-button
          >
        </div>
        <div v-if="minMoney > 0" class="mt-1 text-xs text-gray-500">
          最低提现金额：{{ minMoney }}元
        </div>
      </div>

      <!-- 立即提现按钮 -->
      <div class="flex justify-center pt-4">
        <el-button
          type="primary"
          size="large"
          class="w-40"
          :loading="loading"
          @click="handleWithdraw"
        >
          立即提现
        </el-button>
      </div>
    </div>
  </el-dialog>

  <!-- 提现密码输入弹框 -->
  <WithdrawPasswordDialog
    v-model:visible="showPasswordDialog"
    :money="withdrawForm.money || 0"
    :payment-method="withdrawForm.paymentMethod"
    :type="1"
    :user-id="props.userId || 0"
    @success="handlePasswordConfirmSuccess"
    @reset-password="handleClose"
  />
</template>

<style scoped>
:deep(.el-input-number) {
  width: 100%;
}
</style>
