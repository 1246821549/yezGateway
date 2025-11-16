<!--
 * @Description: 提现密码确认弹框
 * @Author: 程前
 * @Date: 2025-01-28
-->
<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { withdraw, type WithdrawResult } from "@/api/withdraw";

interface Props {
  visible: boolean;
  money: number;
  paymentMethod: number;
  type: number;
  userId: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
  (e: "reset-password"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const router = useRouter();

// 6位密码输入框数组
const passwordBoxes = ref<string[]>(Array(6).fill(""));
const passwordInputs = ref<(HTMLInputElement | null)[]>([]);
const password = ref("");
const loading = ref(false);

// 监听弹框显示状态
watch(
  () => props.visible,
  newVal => {
    if (newVal) {
      resetPassword();
      // 聚焦第一个输入框
      nextTick(() => {
        passwordInputs.value[0]?.focus();
      });
    }
  }
);

/**
 * 处理密码输入
 */
const handlePasswordInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ""); // 只允许数字
  passwordBoxes.value[index] = value;

  // 同步到密码变量
  password.value = passwordBoxes.value.join("");

  // 自动聚焦下一个输入框
  if (value && index < 5 && passwordInputs.value[index + 1]) {
    nextTick(() => {
      passwordInputs.value[index + 1]?.focus();
    });
  }
};

/**
 * 处理键盘事件（退格、删除等）
 */
const handleKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;

  if (event.key === "Backspace" && !target.value && index > 0) {
    event.preventDefault();
    nextTick(() => {
      if (passwordInputs.value[index - 1]) {
        passwordInputs.value[index - 1]?.focus();
        passwordInputs.value[index - 1]?.select();
      }
    });
  } else if (event.key === "ArrowLeft" && index > 0) {
    event.preventDefault();
    nextTick(() => {
      passwordInputs.value[index - 1]?.focus();
    });
  } else if (event.key === "ArrowRight" && index < 5) {
    event.preventDefault();
    nextTick(() => {
      passwordInputs.value[index + 1]?.focus();
    });
  }
};

/**
 * 处理粘贴事件
 */
const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData("text") || "";
  const numbers = pastedText.replace(/\D/g, "").slice(0, 6); // 只取数字，最多6位

  for (let i = 0; i < 6; i++) {
    passwordBoxes.value[i] = numbers[i] || "";
  }
  password.value = passwordBoxes.value.join("");

  // 聚焦到最后一个已输入的框或最后一个框
  const lastIndex = Math.min(numbers.length - 1, 5);
  nextTick(() => {
    passwordInputs.value[lastIndex]?.focus();
  });
};

/**
 * 重置密码（仅清空输入框）
 */
const resetPassword = () => {
  passwordBoxes.value = Array(6).fill("");
  password.value = "";
};

/**
 * 处理重置按钮点击
 */
const handleReset = () => {
  emit("reset-password");
  handleClose();
  router.push({
    path: "/account/index",
    query: {
      showPayPassword: "true"
    }
  });
};

/**
 * 确定提现
 */
const handleConfirm = async () => {
  // 验证密码
  if (password.value.length !== 6) {
    ElMessage.warning("请输入6位提现密码");
    return;
  }

  try {
    loading.value = true;
    // 调用提现接口
    const res = await withdraw({
      money: props.money,
      paymentMethod: props.paymentMethod,
      type: props.type,
      userId: props.userId
    });

    if (res.code === 200) {
      ElMessage.success("提现成功, 请等待收款到账!");
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.message || "提现失败");
    }
  } catch (error) {
    console.error("提现失败:", error);
    ElMessage.error("提现失败，请重试");
  } finally {
    loading.value = false;
  }
};

/**
 * 关闭弹框
 */
const handleClose = () => {
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="请输入提现密码"
    width="600px"
    center
    :before-close="handleClose"
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-loading="loading" class="space-y-6 p-3">
      <!-- 密码输入区域 -->
      <div class="flex items-center gap-3">
        <div class="flex gap-2 flex-1">
          <input
            v-for="(item, index) in passwordBoxes"
            :key="index"
            :ref="
              el => {
                if (el) passwordInputs[index] = el as HTMLInputElement;
              }
            "
            v-model="passwordBoxes[index]"
            type="password"
            maxlength="1"
            class="password-input"
            @input="handlePasswordInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste($event)"
          />
        </div>
        <el-button size="small" @click="handleReset">重置</el-button>
      </div>

      <!-- 确定提现按钮 -->
      <div class="flex justify-center pt-2">
        <el-button
          type="primary"
          size="large"
          class="w-40"
          :loading="loading"
          @click="handleConfirm"
        >
          确定提现
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.password-input {
  width: 48px;
  height: 48px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  outline: none;
  transition: all 0.3s;
}

.password-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.password-input:hover {
  border-color: #c0c4cc;
}
</style>
