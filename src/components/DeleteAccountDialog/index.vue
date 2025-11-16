<!--
 * @Description: 注销账户弹框
 * @Author: 程前
 * @Date: 2025-09-15 11:30:20
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-22 14:25:33
-->
<template>
  <el-dialog
    v-model="modelValue"
    title="注销账户"
    width="550px"
    :show-close="true"
    center
    @close="onClose"
  >
    <div class="text-center py-4">
      <p class="text-gray-600 text-base">
        确定注销账户?注销后你的所有账户信息都将被清除,请谨慎操作!
      </p>
    </div>

    <template #footer>
      <div class="flex justify-center gap-3">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirm">
          继续注销
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { userCancel } from "@/api/userAuth";
import { useUserStoreHook } from "@/store/modules/user";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const modelValue = ref(props.modelValue);
const submitting = ref(false);

/**
 * 确认注销账户
 */
const handleConfirm = async () => {
  try {
    submitting.value = true;
    const res = await userCancel();

    if (res.code === 200) {
      ElMessage.success("账户注销成功");
      // 注销成功后退出登录
      await useUserStoreHook().logOut();
      onClose();
    } else {
      ElMessage.error(res.message || "账户注销失败");
    }
  } catch (error) {
    console.error("注销账户失败:", error);
    ElMessage.error("账户注销失败，请重试");
  } finally {
    submitting.value = false;
  }
};

/**
 * 关闭弹框
 */
const onClose = () => {
  modelValue.value = false;
};

// 监听弹框显示状态
watch(
  () => props.modelValue,
  val => {
    modelValue.value = val;
  }
);

watch(modelValue, val => emit("update:modelValue", val));
</script>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px 24px;
}

:deep(.el-dialog__footer) {
  padding: 0 24px 20px;
}
</style>
