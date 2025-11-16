<!--
 * @Description: 修改手机号弹框
 * @Author: 程前
 * @Date: 2025-09-08 14:15:10
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-18 09:47:52
-->
<template>
  <el-dialog
    v-model="modelValue"
    title="修改手机号码"
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
      <!-- 新手机号 -->
      <el-form-item label="新手机号:" prop="newPhone" required>
        <el-input
          v-model="form.newPhone"
          placeholder="请输入新手机号"
          maxlength="11"
        />
      </el-form-item>

      <!-- 验证码 -->
      <el-form-item label="验证码:" prop="code" required>
        <div class="flex items-center gap-3">
          <el-input
            v-model="form.code"
            placeholder="请输入验证码"
            class="flex-1"
            maxlength="6"
          />
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 whitespace-nowrap">
              手机尾号{{ phoneTail }}
            </span>
            <el-button
              :disabled="countdown > 0 || !isPhoneValid"
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
import { sendCodePhone, updatePwdPhone } from "@/api/updatePwd";
import { getCurrentUserInfo } from "@/api/user";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  /**
   * 手机号修改成功后触发
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

// 表单数据
const form = reactive({
  newPhone: "",
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

// 验证手机号格式
const validatePhone = (
  rule: any,
  value: string,
  callback: (error?: Error) => void
) => {
  if (!value) {
    callback(new Error("请输入新手机号"));
  } else {
    const regex =
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    if (!regex.test(value)) {
      callback(new Error("请输入正确的手机号"));
    } else if (value === userInfo.value.phone) {
      callback(new Error("新手机号不能与当前手机号相同"));
    } else {
      callback();
    }
  }
};

// 验证手机号是否有效（用于控制获取验证码按钮）
const isPhoneValid = computed(() => {
  if (!form.newPhone) return false;
  const regex =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  return regex.test(form.newPhone) && form.newPhone !== userInfo.value.phone;
});

const rules: FormRules = {
  newPhone: [
    { required: true, message: "请输入新手机号", trigger: "blur" },
    { validator: validatePhone, trigger: "blur" }
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
 * 发送验证码（发送到新手机号）
 */
const handleSendCode = async () => {
  // 先验证手机号格式
  if (!isPhoneValid.value) {
    ElMessage.warning("请输入正确的新手机号");
    return;
  }

  try {
    sendingCode.value = true;
    const res = await sendCodePhone(form.newPhone);
    if (res.code === 200) {
      ElMessage.success(
        `验证码已发送到 ${form.newPhone.slice(-4)} 尾号的手机，请注意查收`
      );
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
 * 提交修改手机号
 */
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }

    try {
      submitting.value = true;
      const res = await updatePwdPhone({
        userName: form.newPhone,
        code: form.code
      });

      if (res.code === 200) {
        ElMessage.success("手机号修改成功");
        emit("update-success");
        onClose();
      } else {
        ElMessage.error(res.message || "手机号修改失败");
      }
    } catch (error) {
      console.error("修改手机号失败:", error);
      ElMessage.error("修改手机号失败，请重试");
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
  form.newPhone = "";
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

:deep(.el-form-item__label::before) {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}
</style>
