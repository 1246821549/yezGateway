<!--
 * @Description: 消息通知设置弹框
 * @Author: 程前
 * @Date: 2025-01-27
-->
<template>
  <el-dialog
    v-model="visible"
    title="消息通知设置"
    width="600px"
    :before-close="handleClose"
    class="message-notification-modal"
  >
    <div class="notification-content">
      <div class="notification-grid">
        <!-- 第一行 -->
        <div class="notification-row">
          <el-checkbox
            v-model="notificationSettings.msg_yy"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            邀请接单
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_pf"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            派发消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_gp"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            改派消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_td"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            退单消息
          </el-checkbox>
        </div>

        <!-- 第二行 -->
        <div class="notification-row">
          <el-checkbox
            v-model="notificationSettings.msg_wj"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            完结消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_js"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            结算消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_tx"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            提现消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_yq"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            逾期消息
          </el-checkbox>
        </div>

        <!-- 第三行 -->
        <div class="notification-row">
          <el-checkbox
            v-model="notificationSettings.msg_cf"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            处罚消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_tz"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            通知消息
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_jl"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            奖励通知
          </el-checkbox>
          <el-checkbox
            v-model="notificationSettings.msg_cw"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            账务消息
          </el-checkbox>
        </div>

        <!-- 第四行 -->
        <div class="notification-row">
          <el-checkbox
            v-model="notificationSettings.msg_xt"
            :true-value="1"
            :false-value="0"
            class="notification-item"
          >
            系统消息（其它）
          </el-checkbox>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { updateUserInfo, getUserInfo } from "@/api/user";

interface Props {
  modelValue: boolean;
  userInfo: any;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "update:success"): void;
  (e: "update:userInfo", userInfo: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = ref(false);
const saving = ref(false);

// 消息通知设置
const notificationSettings = reactive({
  msg_xt: 1, // 系统消息（其它）
  msg_yy: 1, // 邀请接单（邀约通知）
  msg_pf: 1, // 派发消息（订单派发）
  msg_gp: 1, // 改派消息（订单改派）
  msg_td: 1, // 退单消息（订单退款）
  msg_wj: 1, // 完结消息（订单完成）
  msg_js: 1, // 结算消息（确认结算）
  msg_tx: 1, // 提现消息（提现）
  msg_yq: 1, // 逾期消息（初稿、终稿）
  msg_cf: 1, // 处罚消息（差评、行政扣款）
  msg_tz: 1, // 通知消息（通知、公告）
  msg_jl: 1, // 奖励通知（任务奖励、推荐奖励）
  msg_cw: 1 // 账务消息（奖罚扣补）
});

// 监听弹框显示状态
watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal;
    if (newVal && props.userInfo) {
      // 初始化消息通知设置
      initNotificationSettings();
    }
  }
);

// 监听visible变化，同步到父组件
watch(visible, newVal => {
  emit("update:modelValue", newVal);
});

// 监听userInfo变化，实时更新设置
watch(
  () => props.userInfo,
  newVal => {
    if (newVal && visible.value) {
      initNotificationSettings();
    }
  },
  { deep: true }
);

// 初始化消息通知设置
const initNotificationSettings = () => {
  if (props.userInfo) {
    Object.assign(notificationSettings, {
      msg_xt: props.userInfo.msg_xt ?? 1,
      msg_yy: props.userInfo.msg_yy ?? 1,
      msg_pf: props.userInfo.msg_pf ?? 1,
      msg_gp: props.userInfo.msg_gp ?? 1,
      msg_td: props.userInfo.msg_td ?? 1,
      msg_wj: props.userInfo.msg_wj ?? 1,
      msg_js: props.userInfo.msg_js ?? 1,
      msg_tx: props.userInfo.msg_tx ?? 1,
      msg_yq: props.userInfo.msg_yq ?? 1,
      msg_cf: props.userInfo.msg_cf ?? 1,
      msg_tz: props.userInfo.msg_tz ?? 1,
      msg_jl: props.userInfo.msg_jl ?? 1,
      msg_cw: props.userInfo.msg_cw ?? 1
    });
  }
};

// 关闭弹框
const handleClose = () => {
  visible.value = false;
};

// 保存设置
const handleSave = async () => {
  try {
    saving.value = true;

    const updateData = {
      msg_xt: notificationSettings.msg_xt,
      msg_yy: notificationSettings.msg_yy,
      msg_pf: notificationSettings.msg_pf,
      msg_gp: notificationSettings.msg_gp,
      msg_td: notificationSettings.msg_td,
      msg_wj: notificationSettings.msg_wj,
      msg_js: notificationSettings.msg_js,
      msg_tx: notificationSettings.msg_tx,
      msg_yq: notificationSettings.msg_yq,
      msg_cf: notificationSettings.msg_cf,
      msg_tz: notificationSettings.msg_tz,
      msg_jl: notificationSettings.msg_jl,
      msg_cw: notificationSettings.msg_cw
    };

    const res = await updateUserInfo(updateData);

    if (res.code === 200) {
      ElMessage.success("消息通知设置保存成功");

      // 重新获取用户信息以刷新数据
      try {
        const userInfoRes = await getUserInfo();
        if (userInfoRes.code === 200) {
          // 通知父组件更新用户信息
          emit("update:userInfo", userInfoRes.result);
        }
      } catch (error) {
        console.error("刷新用户信息失败:", error);
      }

      emit("update:success");
      handleClose();
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    console.error("保存消息通知设置失败:", error);
    ElMessage.error("保存失败，请重试");
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.message-notification-modal {
  .notification-content {
    padding: 20px 0;
  }

  .notification-grid {
    .notification-row {
      display: flex;
      flex-wrap: wrap;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .notification-item {
      flex: 1;
      min-width: 120px;
      margin-bottom: 12px;

      :deep(.el-checkbox__label) {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #409eff;
        border-color: #409eff;
      }
    }
  }

  .dialog-footer {
    text-align: center;
    padding: 20px 0 0;

    .el-button {
      min-width: 80px;
      margin: 0 8px;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .message-notification-modal {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 5vh auto;
    }

    .notification-grid {
      .notification-row {
        flex-direction: column;
        gap: 12px;
      }

      .notification-item {
        min-width: auto;
        width: 100%;
      }
    }
  }
}
</style>
