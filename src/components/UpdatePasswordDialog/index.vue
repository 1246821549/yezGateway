<!--
 * @Description: 修改登录密码弹框
 * @Author: 程前
 * @Date: 2025-09-20 10:28:15
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-28 15:43:22
-->
<template>
  <el-dialog
    v-model="modelValue"
    title="修改登录密码"
    width="550px"
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
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item label="确认密码:" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
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
import { ref, reactive, watch, computed, onUnmounted } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { sendCode, updatePwd } from "@/api/updatePwd";
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
const userInfo = ref<{ phone?: string; userName?: string }>({});

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
  if (!value) {
    callback(new Error("请再次输入新密码"));
  } else if (value !== form.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules: FormRules = {
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符",
      trigger: "blur"
    }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { len: 6, message: "验证码长度为6位", trigger: "blur" }
  ]
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    const res = await getCurrentUserInfo();
    if (res.code === 200 && res.result) {
      userInfo.value = {
        phone: res.result.phone,
        userName: res.result.userName
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
    const res = await sendCode();
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

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }

    if (!userInfo.value.userName) {
      ElMessage.error("获取用户信息失败，请刷新后重试");
      return;
    }

    try {
      submitting.value = true;
      const res = await updatePwd({
        userType: 1 as any,
        userName: userInfo.value.userName,
        passWord: form.newPassword,
        code: form.code
      });

      if (res.code === 200) {
        ElMessage.success("密码修改成功");
        emit("update-success");
        onClose();
      } else {
        ElMessage.error(res.message || "密码修改失败");
      }
    } catch (error) {
      console.error("修改密码失败:", error);
      ElMessage.error("修改密码失败，请重试");
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
  form.newPassword = "";
  form.confirmPassword = "";
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
</style>
