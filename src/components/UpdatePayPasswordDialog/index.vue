<!--
 * @Description: 修改支付密码弹框
 * @Author: 程前
 * @Date: 2025-09-12 16:45:30
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-25 11:32:45
-->
<template>
  <el-dialog
    v-model="modelValue"
    title="设置支付密码"
    width="600px"
    :show-close="true"
    center
    @close="onClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- 新密码 -->
      <el-form-item label="新密码:" prop="newPassword">
        <div class="flex items-center gap-3">
          <div class="flex gap-2">
            <input
              v-for="(item, index) in newPasswordBoxes"
              :key="index"
              :ref="
                el => {
                  if (el) newPasswordInputs[index] = el as HTMLInputElement;
                }
              "
              v-model="newPasswordBoxes[index]"
              type="password"
              maxlength="1"
              class="password-input"
              @input="handleNewPasswordInput(index, $event)"
              @keydown="handleKeydown('new', index, $event)"
              @paste="handlePaste('new', $event)"
            />
          </div>
          <el-button size="small" @click="resetNewPassword">重置</el-button>
        </div>
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码:" prop="confirmPassword">
        <div class="flex items-center gap-3">
          <div class="flex gap-2">
            <input
              v-for="(item, index) in confirmPasswordBoxes"
              :key="index"
              :ref="
                el => {
                  if (el) confirmPasswordInputs[index] = el as HTMLInputElement;
                }
              "
              v-model="confirmPasswordBoxes[index]"
              type="password"
              maxlength="1"
              class="password-input"
              @input="handleConfirmPasswordInput(index, $event)"
              @keydown="handleKeydown('confirm', index, $event)"
              @paste="handlePaste('confirm', $event)"
            />
          </div>
          <el-button size="small" @click="resetConfirmPassword">重置</el-button>
        </div>
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item label="验证码:" prop="code">
        <div class="flex items-center gap-3">
          <el-input
            v-model="form.code"
            placeholder="请输入验证码"
            class="flex-1"
          />
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 whitespace-nowrap">
              手机尾号{{ phoneTail }}
            </span>
            <el-button
              type="primary"
              :disabled="countdown > 0"
              :loading="sendingCode"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
            </el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-center gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { sendCodePay, updatePwdPay } from "@/api/updatePwd";
import { getCurrentUserInfo } from "@/api/user";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /**
   * 密码修改成功后触发
   */
  "update-success"?: [];
}>();

const modelValue = ref(props.modelValue);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const sendingCode = ref(false);
const countdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 用户信息
const userInfo = ref<{ phone?: string }>({});

// 6位密码输入框数组
const newPasswordBoxes = ref<string[]>(Array(6).fill(""));
const confirmPasswordBoxes = ref<string[]>(Array(6).fill(""));

// 输入框引用
const newPasswordInputs = ref<(HTMLInputElement | null)[]>([]);
const confirmPasswordInputs = ref<(HTMLInputElement | null)[]>([]);

// 表单数据
const form = reactive({
  newPassword: "",
  confirmPassword: "",
  code: ""
});

// 手机尾号（显示后4位）
const phoneTail = computed(() => {
  const phone = userInfo.value.phone || "";
  if (phone.length >= 4) {
    return phone.slice(-4);
  }
  return "****";
});

// 验证规则
const validateConfirmPassword = (
  rule: any,
  value: string,
  callback: (error?: Error) => void
) => {
  if (!value || value.length !== 6) {
    callback(new Error("请输入6位支付密码"));
  } else if (value !== form.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  newPassword: [
    { required: true, message: "请输入6位支付密码", trigger: "blur" },
    {
      len: 6,
      message: "支付密码必须为6位数字",
      trigger: "blur"
    },
    {
      pattern: /^\d+$/,
      message: "支付密码必须为数字",
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入6位支付密码", trigger: "blur" },
    {
      len: 6,
      message: "支付密码必须为6位数字",
      trigger: "blur"
    },
    {
      pattern: /^\d+$/,
      message: "支付密码必须为数字",
      trigger: "blur"
    },
    { validator: validateConfirmPassword, trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码长度为6位", trigger: "blur" }
  ]
};

/**
 * 处理新密码输入
 */
const handleNewPasswordInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ""); // 只允许数字
  newPasswordBoxes.value[index] = value;

  // 同步到隐藏输入框
  form.newPassword = newPasswordBoxes.value.join("");

  // 自动聚焦下一个输入框
  if (value && index < 5 && newPasswordInputs.value[index + 1]) {
    nextTick(() => {
      newPasswordInputs.value[index + 1]?.focus();
    });
  }
};

/**
 * 处理确认密码输入
 */
const handleConfirmPasswordInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ""); // 只允许数字
  confirmPasswordBoxes.value[index] = value;

  // 同步到隐藏输入框
  form.confirmPassword = confirmPasswordBoxes.value.join("");

  // 自动聚焦下一个输入框
  if (value && index < 5 && confirmPasswordInputs.value[index + 1]) {
    nextTick(() => {
      confirmPasswordInputs.value[index + 1]?.focus();
    });
  }
};

/**
 * 处理键盘事件（退格、删除等）
 */
const handleKeydown = (
  type: "new" | "confirm",
  index: number,
  event: KeyboardEvent
) => {
  const target = event.target as HTMLInputElement;
  const boxes =
    type === "new" ? newPasswordBoxes.value : confirmPasswordBoxes.value;

  const inputs =
    type === "new" ? newPasswordInputs.value : confirmPasswordInputs.value;

  if (event.key === "Backspace" && !target.value && index > 0) {
    // 退格时，如果当前框为空，聚焦到上一个框
    event.preventDefault();
    nextTick(() => {
      if (inputs[index - 1]) {
        inputs[index - 1]?.focus();
        inputs[index - 1]?.select();
      }
    });
  } else if (event.key === "ArrowLeft" && index > 0) {
    // 左箭头，聚焦到上一个框
    event.preventDefault();
    nextTick(() => {
      inputs[index - 1]?.focus();
    });
  } else if (event.key === "ArrowRight" && index < 5) {
    // 右箭头，聚焦到下一个框
    event.preventDefault();
    nextTick(() => {
      inputs[index + 1]?.focus();
    });
  }
};

/**
 * 处理粘贴事件
 */
const handlePaste = (type: "new" | "confirm", event: ClipboardEvent) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData("text") || "";
  const numbers = pastedText.replace(/\D/g, "").slice(0, 6); // 只取数字，最多6位

  if (type === "new") {
    for (let i = 0; i < 6; i++) {
      newPasswordBoxes.value[i] = numbers[i] || "";
    }
    form.newPassword = newPasswordBoxes.value.join("");
  } else {
    for (let i = 0; i < 6; i++) {
      confirmPasswordBoxes.value[i] = numbers[i] || "";
    }
    form.confirmPassword = confirmPasswordBoxes.value.join("");
  }
};

/**
 * 重置新密码
 */
const resetNewPassword = () => {
  newPasswordBoxes.value = Array(6).fill("");
  form.newPassword = "";
};

/**
 * 重置确认密码
 */
const resetConfirmPassword = () => {
  confirmPasswordBoxes.value = Array(6).fill("");
  form.confirmPassword = "";
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    const res = await getCurrentUserInfo();
    if (res.code === 200 && res.result) {
      userInfo.value = {
        phone: res.result.phone
      };
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

/**
 * 开始倒计时
 */
const startCountdown = () => {
  if (countdown.value > 0) return;
  countdown.value = 60;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      clearInterval(countdownTimer!);
      countdownTimer = null;
      countdown.value = 0;
    } else {
      countdown.value -= 1;
    }
  }, 1000);
};

/**
 * 发送验证码
 */
const handleSendCode = async () => {
  try {
    sendingCode.value = true;
    const res = await sendCodePay();
    if (res.code === 200) {
      ElMessage.success("验证码已发送，请注意查收");
      startCountdown();
    } else {
      ElMessage.error(res.message || "获取验证码失败");
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    ElMessage.error("获取验证码失败，请重试");
  } finally {
    sendingCode.value = false;
  }
};

/**
 * 提交修改密码
 */
const handleSubmit = async () => {
  if (!formRef.value) return;

  // 提交前先检查新密码和确认密码是否一致
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning("两次输入的密码不一致");
    return;
  }

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }

    try {
      submitting.value = true;
      const res = await updatePwdPay({
        pwd_tx: form.newPassword,
        code: form.code
      });

      if (res.code === 200) {
        ElMessage.success("支付密码设置成功");
        emit("update-success");
        onClose();
      } else {
        ElMessage.error(res.message || "支付密码设置失败");
      }
    } catch (error) {
      console.error("设置支付密码失败:", error);
      ElMessage.error("设置支付密码失败，请重试");
    } finally {
      submitting.value = false;
    }
  });
};

/**
 * 关闭弹框
 */
const onClose = () => {
  modelValue.value = false;
  // 重置表单
  resetNewPassword();
  resetConfirmPassword();
  form.code = "";
  formRef.value?.resetFields();
  // 重置倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdown.value = 0;
};

// 监听弹框显示状态
watch(
  () => props.modelValue,
  val => {
    modelValue.value = val;
    if (val) {
      fetchUserInfo();
    }
  }
);

watch(modelValue, val => emit("update:modelValue", val));

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

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
