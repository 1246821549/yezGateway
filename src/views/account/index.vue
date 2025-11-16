<!--
 * @Description: 账户设置页面
 * @Author: 程前
 * @Date: 2025-07-24 10:49:44
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-22 16:42:36
-->
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import IdDialog from "./idDialog.vue";
import AlipayBindDialog from "@/components/AlipayBindDialog/index.vue";
import MessageNotificationModal from "@/components/MessageNotificationModal/index.vue";
import UpdatePasswordDialog from "@/components/UpdatePasswordDialog/index.vue";
import UpdatePayPasswordDialog from "@/components/UpdatePayPasswordDialog/index.vue";
import UpdatePhoneDialog from "@/components/UpdatePhoneDialog/index.vue";
import DeleteAccountDialog from "@/components/DeleteAccountDialog/index.vue";
// 导入默认图片
import idCardFrontImg from "@/assets/image/account/idcard-front.png";
import idCardBackImg from "@/assets/image/account/idcard-back.png";
import { ElMessage } from "element-plus";
import {
  User,
  CreditCard,
  ChatRound,
  Lock,
  Key,
  Phone,
  Bell,
  Warning,
  Plus,
  Close
} from "@element-plus/icons-vue";
import { uploadIdCardFront, uploadIdCardBack } from "@/api/userAuth";
import { getUserInfo, type PageUserInfo } from "@/api/user";

defineOptions({
  name: "myAccount"
});

// 个人认证弹窗状态
const showAuthDialog = ref(false);

// 支付宝绑定弹窗状态
const showAlipayBindDialog = ref(false);

// 微信绑定弹窗状态
const showWechatBindDialog = ref(false);

// 修改登录密码弹窗状态
const showUpdatePasswordDialog = ref(false);

// 修改支付密码弹窗状态
const showUpdatePayPasswordDialog = ref(false);

// 修改手机号弹窗状态
const showUpdatePhoneDialog = ref(false);

// 注销账户弹窗状态
const showDeleteAccountDialog = ref(false);

// 消息通知设置弹窗状态
const showMessageNotificationDialog = ref(false);

// 用户信息状态
const userDetailInfo = reactive<Partial<PageUserInfo["result"]>>({});

// 个人认证表单数据
const authForm = reactive({
  realName: "",
  idNumber: "",
  frontImage: "",
  backImage: ""
});

// 图片预览URLs
const imagePreview = reactive({
  front: "",
  back: ""
});

// 设置项数据
const settingItems = ref([
  {
    id: 1,
    icon: User,
    title: "个人认证",
    description: "身份认证用于提升安全性",
    actionText: "前往绑定",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 2,
    icon: CreditCard,
    title: "支付宝绑定",
    description: "支付宝认证会在一个工作日内完成",
    actionText: "前往绑定",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 3,
    icon: ChatRound,
    title: "微信绑定",
    description: "为了账户安全，建议绑定微信",
    actionText: "前往绑定",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 4,
    icon: Lock,
    title: "登录密码",
    description: "为了安全建议修改登录密码",
    actionText: "前往修改",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 5,
    icon: Key,
    title: "支付密码",
    description: "为了安全建议修改支付密码",
    actionText: "前往修改",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 6,
    icon: Phone,
    title: "修改手机号",
    description: "修改手机号将迁移整个账户信息，请谨慎",
    actionText: "前往修改",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 7,
    icon: Bell,
    title: "消息通知设置",
    description: "设置账户接收哪些消息通知",
    actionText: "前往设置",
    actionType: "primary",
    status: "pending"
  },
  {
    id: 8,
    icon: Warning,
    title: "注销账户",
    description: "若注销账号，您将不能再使用优品电商的任何服务",
    actionText: "申请注销",
    actionType: "danger",
    status: "danger"
  }
]);

// 处理点击事件
const handleAction = (item: any) => {
  console.log("处理操作:", item);

  switch (item.id) {
    case 1:
      // 个人认证
      if (userDetailInfo.isAuth === 1) {
        ElMessage.info("您已完成实名认证");
        return;
      }
      showAuthDialog.value = true;
      break;
    case 2:
      // 支付宝绑定
      if (userDetailInfo.alipay) {
        ElMessage.info("您已绑定支付宝");
        return;
      }
      showAlipayBindDialog.value = true;
      break;
    case 3:
      // 微信绑定
      if (userDetailInfo.wechat) {
        ElMessage.info("您已绑定微信");
        return;
      }
      showWechatBindDialog.value = true;
      break;
    case 4:
      // 修改登录密码
      showUpdatePasswordDialog.value = true;
      break;
    case 5:
      // 修改支付密码
      showUpdatePayPasswordDialog.value = true;
      break;
    case 6:
      // 修改手机号
      showUpdatePhoneDialog.value = true;
      break;
    case 7:
      // 消息通知设置
      showMessageNotificationDialog.value = true;
      break;
    case 8:
      // 注销账户
      showDeleteAccountDialog.value = true;
      break;
    default:
      ElMessage.info("功能开发中");
  }
};

/**
 * 身份证上传
 * @param type
 * @param event
 */
const handleImageUpload = (type: "front" | "back", event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      imagePreview[type] = result;
      const formData = new FormData();
      formData.append("file", file);
      if (type === "front") {
        const res = await uploadIdCardFront(formData);
      } else {
        // authForm.backImage = result;
      }
    };
    reader.readAsDataURL(file);
  }
};

// 触发文件选择
const triggerFileSelect = (type: "front" | "back") => {
  const input = document.getElementById(`${type}-upload`) as HTMLInputElement;
  input.click();
};

// 删除图片
const removeImage = (type: "front" | "back") => {
  imagePreview[type] = "";
  if (type === "front") {
    authForm.frontImage = "";
  } else {
    authForm.backImage = "";
  }
};

/**
 * 提交个人认证
 */
const submitAuth = () => {
  if (!authForm.frontImage || !authForm.backImage) {
    ElMessage.error("请上传身份证正反面照片");
    return;
  }

  if (!authForm.realName.trim()) {
    ElMessage.error("请输入真实姓名");
    return;
  }

  if (!authForm.idNumber.trim()) {
    ElMessage.error("请输入身份证号");
    return;
  }

  // 简单的身份证号验证
  const idRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!idRegex.test(authForm.idNumber)) {
    ElMessage.error("请输入正确的身份证号");
    return;
  }

  console.log("提交认证信息:", authForm);
  ElMessage.success("个人认证信息已提交，等待审核");
  closeAuthDialog();
};

/**
 *  关闭认证弹窗
 */
const closeAuthDialog = () => {
  showAuthDialog.value = false;
  // 重置表单
  authForm.realName = "";
  authForm.idNumber = "";
  authForm.frontImage = "";
  authForm.backImage = "";
  imagePreview.front = "";
  imagePreview.back = "";
};

// 获取图标颜色
const getIconColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-blue-500";
    case "completed":
      return "text-green-500";
    case "danger":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

// 获取按钮类型
const getButtonType = (actionType: string) => {
  switch (actionType) {
    case "danger":
      return "danger";
    case "success":
      return "success";
    default:
      return "primary";
  }
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    const userDetailRes = await getUserInfo();

    if (userDetailRes.code === 200) {
      Object.assign(userDetailInfo, userDetailRes.result);
      // 更新设置项状态
      updateSettingItemsStatus();
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    ElMessage.error("获取用户信息失败");
  }
};

/**
 * 根据用户信息更新设置项状态
 */
const updateSettingItemsStatus = () => {
  // 更新实名认证状态
  if (userDetailInfo.isAuth === 1) {
    settingItems.value[0].status = "completed";
    settingItems.value[0].actionText = "已认证";
    settingItems.value[0].actionType = "success";
  }

  // 更新支付宝绑定状态
  if (userDetailInfo.alipay) {
    settingItems.value[1].status = "completed";
    settingItems.value[1].actionText = "已绑定";
    settingItems.value[1].actionType = "success";
  }

  // 更新微信绑定状态
  if (userDetailInfo.wechat) {
    settingItems.value[2].status = "completed";
    settingItems.value[2].actionText = "已绑定";
    settingItems.value[2].actionType = "success";
  }
};

// 消息通知设置成功后的处理
const handleMessageNotificationSuccess = () => {
  // 重新获取用户信息以更新状态
  fetchUserInfo();
};

// 处理用户信息更新
const handleUserInfoUpdate = (newUserInfo: any) => {
  Object.assign(userDetailInfo, newUserInfo);
  updateSettingItemsStatus();
};

const route = useRoute();

/**
 * 监听路由参数，自动打开相应的弹窗
 */
watch(
  () => route.query,
  async query => {
    // 确保用户信息已加载
    if (!userDetailInfo.phone && (query.showAuth === "true" || query.showPayPassword === "true")) {
      await fetchUserInfo();
    }
    
    // 如果路由参数中有 showAuth，则打开个人认证弹窗
    if (query.showAuth === "true") {
      showAuthDialog.value = true;
    }
    // 如果路由参数中有 showPayPassword，则打开支付密码弹窗
    if (query.showPayPassword === "true") {
      showUpdatePayPasswordDialog.value = true;
    }
  },
  { immediate: true }
);

// 组件挂载时获取用户信息
onMounted(async () => {
  await fetchUserInfo();
  // 检查路由参数，立即处理
  const query = route.query;
  if (query.showAuth === "true") {
    showAuthDialog.value = true;
  }
  if (query.showPayPassword === "true") {
    showUpdatePayPasswordDialog.value = true;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">账户设置</h1>
        <p class="text-gray-600">完成以下安全设置，账户更安全</p>
      </div>

      <!-- 设置项列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div
          v-for="(item, index) in settingItems"
          :key="item.id"
          :class="[
            'flex items-center justify-between p-6 hover:bg-gray-50 transition-colors',
            index < settingItems.length - 1 ? 'border-b border-gray-100' : ''
          ]"
        >
          <!-- 左侧内容 -->
          <div class="flex items-center space-x-4">
            <!-- 图标 -->
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center',
                item.status === 'pending'
                  ? 'bg-blue-50'
                  : item.status === 'completed'
                    ? 'bg-green-50'
                    : item.status === 'danger'
                      ? 'bg-red-50'
                      : 'bg-gray-50'
              ]"
            >
              <el-icon :size="20" :class="getIconColor(item.status)">
                <component :is="item.icon" />
              </el-icon>
            </div>

            <!-- 标题和描述 -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-1">
                {{ item.title }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ item.description }}
              </p>
            </div>
          </div>

          <!-- 右侧操作按钮 -->
          <div>
            <el-button
              :type="getButtonType(item.actionType)"
              size="default"
              @click="handleAction(item)"
            >
              {{ item.actionText }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 安全提示
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <el-icon class="text-blue-500 mt-0.5" size="16">
            <Warning />
          </el-icon>
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">安全提示</p>
            <p>
              为了您的账户安全，建议完成身份认证、绑定手机号和设置安全密码。如果遇到可疑活动，请及时联系客服。
            </p>
          </div>
        </div>
      </div> -->
    </div>
    <IdDialog v-model="showAuthDialog" @auth-success="fetchUserInfo" />
    <AlipayBindDialog
      v-model="showAlipayBindDialog"
      bind-type="alipay"
      @bind-success="fetchUserInfo"
    />
    <AlipayBindDialog
      v-model="showWechatBindDialog"
      bind-type="wechat"
      @bind-success="fetchUserInfo"
    />
    <UpdatePasswordDialog
      v-model="showUpdatePasswordDialog"
      @update-success="fetchUserInfo"
    />
    <UpdatePayPasswordDialog
      v-model="showUpdatePayPasswordDialog"
      @update-success="fetchUserInfo"
    />
    <UpdatePhoneDialog
      v-model="showUpdatePhoneDialog"
      @update-success="fetchUserInfo"
    />
    <DeleteAccountDialog v-model="showDeleteAccountDialog" />
    <MessageNotificationModal
      v-model="showMessageNotificationDialog"
      :user-info="userDetailInfo"
      @update:success="handleMessageNotificationSuccess"
      @update:userInfo="handleUserInfoUpdate"
    />
  </div>
</template>

<style lang="scss" scoped>
// 响应式适配
@media (width <= 768px) {
  .p-6 {
    padding: 1rem;
  }

  .max-w-4xl {
    max-width: 100%;
  }

  .flex.items-center.justify-between {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .flex.items-center.space-x-4 {
    width: 100%;
  }

  .el-button {
    width: 100%;
  }

  // 个人认证弹窗移动端适配
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;

    .el-dialog__body {
      padding: 16px;
    }
  }

  .auth-dialog-content {
    .upload-section {
      .flex.space-x-8 {
        flex-direction: column;
        gap: 16px;
        align-items: center;
      }

      .upload-item .upload-area {
        width: 280px;
        height: 180px;
      }
    }
  }
}

@media (width <= 480px) {
  .text-2xl {
    font-size: 1.5rem;
  }

  .w-12.h-12 {
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
  }

  // 个人认证弹窗小屏幕适配
  .auth-dialog-content {
    .upload-section {
      .upload-item .upload-area {
        width: 240px;
        height: 150px;
      }
    }

    .form-section {
      :deep(.el-form) {
        .el-form-item {
          margin-bottom: 16px;
        }

        .el-form-item__label {
          font-size: 14px;
        }
      }
    }
  }
}

.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
  transition: background-color 0.2s ease;
}

// 按钮样式优化
:deep(.el-button) {
  min-width: 80px;
  font-weight: 500;
  border-radius: 6px;
}

:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;

  &:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }
}

:deep(.el-button--danger) {
  background-color: #ef4444;
  border-color: #ef4444;

  &:hover {
    background-color: #dc2626;
    border-color: #dc2626;
  }
}

// 图标容器样式
.w-12.h-12 {
  min-width: 48px;
  min-height: 48px;
}

// 个人认证弹窗样式
.auth-dialog-content {
  .upload-section {
    .upload-item {
      .upload-area {
        position: relative;
        width: 200px;
        height: 130px;
        overflow: hidden;
        cursor: pointer;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background-color: #f8fafc;
          border-color: #3b82f6;
        }

        .upload-placeholder {
          position: relative;
          width: 100%;
          height: 100%;

          .default-image {
            position: relative;
            width: 100%;
            height: 100%;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 6px;
              opacity: 0.7;
              transition: opacity 0.3s ease;
            }

            .upload-overlay {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: rgb(255 255 255 / 80%);
              transition: all 0.3s ease;

              .upload-text {
                margin: 8px 0 0;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
              }
            }
          }

          &:hover .upload-overlay {
            background-color: rgb(59 130 246 / 10%);
          }

          &:hover .default-image img {
            opacity: 0.5;
          }
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-overlay {
            position: absolute;
            top: 4px;
            right: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            cursor: pointer;
            background-color: rgb(0 0 0 / 60%);
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &:hover .image-overlay {
            opacity: 1;
          }
        }
      }
    }
  }

  .tip-section {
    .bg-gray-50 {
      background-color: #f9fafb;
    }
  }

  .form-section {
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #374151;
    }

    :deep(.el-input__inner) {
      border-radius: 6px;
    }
  }
}

// 弹窗样式覆盖
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    padding: 20px 24px 0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
  }

  .el-dialog__body {
    padding: 20px 24px;
  }

  .el-dialog__footer {
    padding: 0 24px 20px;
    text-align: center;

    .el-button {
      min-width: 80px;
      font-weight: 500;
      border-radius: 6px;
    }

    .el-button + .el-button {
      margin-left: 12px;
    }
  }
} // 悬停效果优化
</style>
