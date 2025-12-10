<!--
 * @Description: 工作中心页面
 * @Author: 程前  
 * @Date: 2025-12-09
-->
<template>
  <div class="bg-gray-100 min-h-screen">
    <!-- 顶部用户信息区域 -->
    <!-- 轮播图区域 -->
    <div class="mb-5">
      <el-carousel
        height="75px"
        indicator-position="none"
        arrow="always"
        direction="vertical"
        class="rounded-lg overflow-hidden shadow"
      >
        <el-carousel-item v-for="(item, idx) in carouselList" :key="idx">
          <img
            :src="item"
            style="height: 75px"
            class="w-full object-cover"
            alt="banner"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="bg-white rounded-lg p-5 mb-5 shadow-sm">
      <!-- 第一行：用户信息、账户信息、操作按钮 -->
      <div class="flex items-start justify-between gap-5 flex-wrap">
        <!-- 左侧：用户基本信息 -->
        <div class="flex items-start gap-4 shrink-0">
          <!-- 头像区域 -->
          <div class="relative">
            <el-avatar :size="60" :src="userInfo.tximg" />
            <!-- VIP头像框 -->
            <img
              v-if="userInfo.isVip === 1"
              src="@/assets/image/backend/优君电商VIP框.png"
              class="absolute -inset-2 w-[76px] h-[76px] object-contain pointer-events-none"
              alt="VIP框"
            />
          </div>
          <!-- 用户名、等级、评分信息 -->
          <div class="flex flex-col gap-1.5">
            <!-- 第一行 -->
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-gray-800">
                {{ userInfo.autoincrementUserId }}-{{
                  userInfo.userName ?? "-"
                }}
              </span>
              <!-- VIP徽章显示在昵称右边，带hover弹框 -->
              <el-popover
                v-if="userInfo.isVip === 1"
                placement="bottom"
                :width="200"
                trigger="hover"
                popper-class="vip-info-popover"
              >
                <template #reference>
                  <img
                    src="@/assets/image/backend/vip.png"
                    alt="VIP"
                    class="w-10 h-5 cursor-pointer"
                  />
                </template>
                <div class="text-center">
                  <div class="text-amber-500 text-sm mb-2">
                    到期时间：{{ userInfo.endVipTime || "-" }}
                  </div>
                  <el-button
                    type="warning"
                    size="small"
                    class="!w-full"
                    @click="handleBecomeVip"
                  >
                    成为VIP设计师
                  </el-button>
                </div>
              </el-popover>
              <!-- 非VIP用户显示"成为VIP"按钮 -->
              <el-button
                v-else
                type="warning"
                size="small"
                class="!py-0.5 !px-2 !text-xs"
                @click="handleBecomeVip"
              >
                <span class="flex items-center gap-1">
                  <img
                    src="@/assets/image/backend/vip.png"
                    alt="VIP"
                    class="w-4 h-4"
                  />
                  成为VIP
                </span>
              </el-button>
              <!-- 分隔线 -->
              <span class="text-gray-300 mx-1">|</span>
              <!-- 灵工类型 -->
              <span class="text-gray-800 text-sm">{{
                userInfo.userTypeName || "-"
              }}</span>
              <!-- 等级名称和分佣比例，带hover弹框 -->
              <el-popover
                v-if="currentUserGrade"
                placement="bottom"
                :width="850"
                trigger="hover"
                popper-class="grade-info-popover"
              >
                <template #reference>
                  <span
                    class="text-blue-500 text-sm cursor-pointer hover:underline"
                  >
                    {{ currentUserGrade.userGradeName }}({{
                      currentUserGrade.salaryRat
                    }}%)
                  </span>
                </template>
                <!-- 等级表格 -->
                <div class="p-2">
                  <table class="w-full border-collapse text-sm">
                    <thead>
                      <tr class="bg-gray-50">
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          等级名称
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          派单群
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          分佣比例
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          服务分
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          完结数
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          在途阈值
                        </th>
                        <th
                          class="border border-gray-200 px-3 py-2 text-center font-medium"
                        >
                          备注
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="grade in userInfo.userGrades"
                        :key="grade.id"
                        :class="{
                          'bg-blue-50':
                            grade.userGradeName === userInfo.userGradeName
                        }"
                      >
                        <td
                          class="border border-gray-200 px-3 py-2 text-center text-blue-500"
                        >
                          {{ grade.userGradeName }}
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center"
                        >
                          {{ grade.dispGroupName || "-" }}
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center"
                        >
                          {{ grade.salaryRat }}%
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center"
                        >
                          {{ grade.beginScore }}~{{ grade.endScore }}
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center"
                        >
                          {{ grade.taskOrder_Amount || 0 }}
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center"
                        >
                          {{ grade.transit_Amount || 0 }}
                        </td>
                        <td
                          class="border border-gray-200 px-3 py-2 text-center text-red-500"
                        >
                          {{ grade.isVipSpecial === 1 ? "VIP专享权益" : "" }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </el-popover>
            </div>
            <!-- 第二行：评分星级和统计 -->
            <div class="flex items-center gap-2">
              <div class="flex gap-0.5">
                <i
                  v-for="n in 5"
                  :key="n"
                  :class="
                    n <= userInfo.servicePoints
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  "
                  class="text-xs"
                  >★</i
                >
              </div>
              <span class="font-bold text-red-400 text-sm"
                >{{ userInfo.servicePoints }}分</span
              >
              <span class="text-gray-500 text-xs ml-1"
                >完成数{{ userInfo.wjNum }}</span
              >
              <span class="text-gray-500 text-xs ml-1"
                >评价数{{ userInfo.pjNum }}</span
              >
            </div>
          </div>
        </div>

        <!-- 中间：账户信息 -->
        <div class="flex-1 min-w-[400px]">
          <div class="flex justify-around gap-2">
            <div class="text-center flex-1">
              <div class="flex items-center justify-center gap-1 mb-1">
                <span class="block text-gray-400 text-xs whitespace-nowrap"
                  >账户余额</span
                >
                <el-icon
                  class="cursor-pointer text-gray-400 text-xs hover:text-blue-500"
                  @click="toggleBalance"
                >
                  <View v-if="!showBalance" />
                  <Hide v-else />
                </el-icon>
              </div>
              <span class="block text-base font-bold text-gray-800"
                >￥{{ showBalance ? userAmount.userBalance : "**" }}</span
              >
            </div>
            <div class="text-center flex-1">
              <span class="block text-gray-400 text-xs whitespace-nowrap mb-1"
                >保证金</span
              >
              <span class="block text-base font-bold text-gray-800"
                >￥{{ userAmount.userMoneyBond ?? "0.00" }}</span
              >
            </div>
            <div class="text-center flex-1">
              <span class="block text-gray-400 text-xs whitespace-nowrap mb-1"
                >在途金额</span
              >
              <span class="block text-base font-bold text-gray-800"
                >￥{{ userAmount.inTransitOrderAmount ?? "0.00" }}</span
              >
            </div>
            <div class="text-center flex-1">
              <span class="block text-gray-400 text-xs whitespace-nowrap mb-1"
                >冻结金额</span
              >
              <span class="block text-base font-bold text-gray-800"
                >￥{{ userAmount.userTeamMoneyBond ?? "0.00" }}</span
              >
            </div>
          </div>
          <!-- 操作链接 -->
          <!-- <div class="flex justify-around gap-2 mt-3">
            <el-link type="primary" class="text-xs">提现明细</el-link>
            <el-link type="primary" class="text-xs">资金明细</el-link>
            <el-link type="primary" class="text-xs">保证金管理</el-link>
            <el-link type="primary" class="text-xs">积分管理</el-link>
          </div> -->
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex flex-col gap-2 items-center shrink-0">
          <div class="flex gap-2">
            <el-button type="primary" @click="openRechargeDialog"
              >充值</el-button
            >
            <el-button @click="handleWithdraw">提现</el-button>
          </div>
        </div>
      </div>

      <!-- 第二行：状态标签 + 接单状态 -->
      <div class="flex items-center gap-4 pt-2 border-t border-gray-100">
        <!-- 状态标签 -->
        <div class="flex gap-1.5 flex-wrap">
          <span
            class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg border-0 flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': userInfo.infoNum === '已完善'
            }"
            @click="handleInfoBadgeClick('info')"
          >
            <IconifyIconOffline :icon="DocumentIcon" />
            {{ userInfo.infoNum }}
          </span>
          <span
            class="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-lg border-0 flex items-center gap-1 cursor-pointer hover:bg-green-100 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': userInfo.authState === '已认证'
            }"
            @click="handleInfoBadgeClick('auth')"
          >
            <IconifyIconOffline :icon="ShieldCheckIcon" />
            {{ userInfo.authState }}
          </span>
          <span
            class="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-lg border-0 flex items-center gap-1 cursor-pointer hover:bg-orange-100 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': userInfo.aliPayState === '已绑定'
            }"
            @click="handleInfoBadgeClick('alipay')"
          >
            <IconifyIconOffline :icon="AlipayIcon" />
            {{ userInfo.aliPayState }}</span
          >
          <span
            class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg border-0 flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': userInfo.wechatState === '已绑定'
            }"
            @click="handleInfoBadgeClick('wechat')"
          >
            <IconifyIconOffline :icon="WeixinIcon" />
            {{ userInfo.wechatState }}
          </span>
          <el-popover
            placement="bottom"
            :width="320"
            trigger="hover"
            popper-class="regularization-popover"
          >
            <template #reference>
              <span
                class="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-lg border-0 flex items-center gap-1 cursor-pointer hover:bg-red-100 transition-colors"
                :class="{
                  'bg-green-50 text-green-600 hover:bg-green-100':
                    userInfo.isState === 1
                }"
              >
                <IconifyIconOffline :icon="UserIcon" />
                {{ userInfo.isState === 1 ? "已转正" : "未转正" }}
              </span>
            </template>
            <!-- 转正条件弹框内容 -->
            <div class="p-2">
              <div class="text-sm font-medium mb-3 text-gray-700">转正条件</div>
              <div class="space-y-2">
                <div
                  v-for="(condition, index) in regularizationConditions"
                  :key="index"
                  class="flex items-center justify-between text-sm"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      :class="
                        condition.passed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      "
                    >
                      {{ condition.passed ? "✓" : "✗" }}
                    </span>
                    <span class="text-gray-600">{{ condition.label }}</span>
                  </div>
                  <div class="text-gray-500 text-xs">
                    <span class="text-gray-400">标准：</span>
                    <span>{{ condition.standard }}{{ condition.unit }}</span>
                    <span class="mx-1">|</span>
                    <span class="text-gray-400">当前：</span>
                    <span
                      :class="
                        condition.passed ? 'text-green-600' : 'text-red-600'
                      "
                      >{{ condition.current }}{{ condition.unit }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </el-popover>
        </div>

        <!-- 接单状态 -->
        <div class="flex items-center gap-2">
          <el-popover
            placement="bottom"
            :width="750"
            trigger="hover"
            popper-class="order-time-popover"
          >
            <template #reference>
              <span
                class="text-xs text-gray-500 whitespace-nowrap cursor-pointer"
              >
                接单状态</span
              >
            </template>
            <div class="p-2">
              <!-- 顶部按钮 -->
              <div class="flex gap-2 mb-4">
                <el-button type="primary" size="small" @click="selectAllTime"
                  >一键全选</el-button
                >
                <el-button size="small" @click="clearAllTime"
                  >一键取消</el-button
                >
              </div>
              <!-- 时间表格 -->
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-50">
                    <th
                      class="border border-gray-300 px-4 py-2 text-center text-sm font-medium"
                    >
                      接单日期
                    </th>
                    <th
                      class="border border-gray-300 px-4 py-2 text-center text-sm font-medium"
                      colspan="3"
                    >
                      接单时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in grabTimeList" :key="index">
                    <td
                      class="border border-gray-300 px-4 py-2 text-center text-sm"
                    >
                      {{ item.week }}
                    </td>
                    <td
                      v-for="(slot, slotIndex) in item.active"
                      :key="slotIndex"
                      class="border border-gray-300 px-4 py-2 text-center"
                    >
                      <el-checkbox
                        v-model="slot.isCheck"
                        :label="slot.time"
                        size="large"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- 底部保存按钮 -->
              <div class="flex justify-center mt-4">
                <el-button type="primary" @click="saveGrabTime">保存</el-button>
              </div>
            </div>
          </el-popover>
          <el-switch v-model="orderStatus" @change="handleOrderStatusChange" />
        </div>
      </div>
    </div>

    <!-- 订单统计区域 -->
    <div class="bg-white rounded-lg p-5 mb-5 shadow-sm">
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-xl font-normal text-gray-800 m-0">订单量</h2>
        <!-- <el-button type="primary" size="small">订单日历</el-button> -->
      </div>
      <div class="grid grid-cols-7 gap-5">
        <div
          v-for="stat in orderStats"
          :key="stat.type"
          class="flex flex-col items-center text-center"
        >
          <div
            class="w-15 h-15 rounded-full flex items-center justify-center mb-2.5"
            :style="{ backgroundColor: stat.color }"
          >
            <!-- 使用图标组件的状态 -->
            <IconifyIconOffline
              v-if="stat.iconComponent"
              :icon="stat.iconComponent"
              class="text-white"
              :style="{ fontSize: '24px' }"
            />
            <!-- 使用图片的状态 -->
            <img
              v-else
              :src="stat.icon"
              :alt="stat.label"
              class="w-6 h-6 brightness-0 invert"
            />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-800 mb-1">
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部内容区域 -->
    <div>
      <!-- 左侧新手指南 -->
      <!-- <div class="bg-white rounded-lg p-5 shadow-sm">
        <h3 class="m-0 mb-5 text-lg text-gray-800">新手接单指南</h3>
        <div>
          <div
            v-for="guide in guideList"
            :key="guide.id"
            class="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex-1 text-sm text-gray-800 leading-relaxed mr-2.5">
              {{ guide.title }}
            </div>
            <div class="text-xs text-gray-400 whitespace-nowrap">
              {{ guide.date }}
            </div>
          </div>
        </div>
      </div> -->

      <!-- 右侧雷达图 -->
      <div class="flex-1 bg-white rounded-lg p-5 shadow-sm">
        <h3 class="m-0 mb-5 text-lg text-gray-800 text-center">
          服务能力：<span class="text-blue-500 font-bold"
            >{{ (userServiceAbility.servicePoints || 0).toFixed(2) }}分</span
          >
        </h3>
        <div ref="radarChart" class="w-full h-[400px]" />
      </div>
    </div>

    <!-- 充值弹框 -->
    <RechargeDialog
      v-model:visible="showRechargeDialog"
      :current-balance="userAmount.userBalance"
      @confirm="handleRechargeConfirm"
    />
    <!-- 充值二维码弹框 -->
    <PayCodeModal
      v-model:visible="showPayCodeModal"
      :url="codeUrl"
      :money="currentMoney"
      :payment-method="currentPaymentMethod"
      @close="payCodeClose"
    />
    <!-- 服务能力弹窗 -->
    <ServiceAbilityDialog
      v-model:visible="showServiceAbilityDialog"
      :data="serviceAbilityData"
      :user-type-name="userInfo.userTypeName"
      @close="handleServiceAbilityClose"
    />
    <!-- 提现弹窗 -->
    <WithdrawDialog
      v-model:visible="showWithdrawDialog"
      :user-name="userInfo.userName || ''"
      :user-id="userInfo.autoincrementUserId || userInfo.id || 0"
      @success="handleWithdrawSuccess"
    />
    <!-- 个人认证弹窗 -->
    <IdDialog v-model="showAuthDialog" @auth-success="handleAuthSuccess" />
    <!-- 支付宝绑定弹窗 -->
    <AlipayBindDialog
      v-model="showAlipayBindDialog"
      :bind-type="bindType"
      @bind-success="handleBindSuccess"
    />

    <!-- 审核中蒙层 - 未转正时显示 -->
    <div
      v-if="showAuditOverlay"
      class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center">
          <!-- 审核中图标 -->
          <div
            class="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-10 h-10 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">审核中</h2>
          <!-- <div class="text-gray-600 text-left space-y-2 mb-6">
            <p>预计在2个工作日内审核</p>
            <p>请关注您微信服务通知及手机短信</p>
            <p>24小时服务热线：0731-24860005</p>
            <p>关注微信公众号：优君电商了解更多资讯</p>
          </div>
          <div class="flex justify-center mb-6">
            <img
              src="https://oms-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17829239212485.aaf"
              alt="公众号二维码"
              class="w-32 h-32 bg-gray-100 rounded-lg object-cover"
            />
          </div> -->
          <el-button type="primary" class="w-full mt-2" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  nextTick,
  onUnmounted,
  reactive,
  watch,
  computed
} from "vue";
import * as echarts from "echarts";
import { Hide, View } from "@element-plus/icons-vue";
import { ElMessage, type MessageBoxData } from "element-plus";
import RechargeDialog from "@/components/RechargeDialog/index.vue";
import PayCodeModal from "./payCodeModal.vue";
import ServiceAbilityDialog from "@/components/ServiceAbilityDialog/index.vue";
import WithdrawDialog from "@/components/WithdrawDialog/index.vue";
import IdDialog from "@/views/account/idDialog.vue";
import AlipayBindDialog from "@/components/AlipayBindDialog/index.vue";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";
import {
  getUserAmount,
  type UserAmount,
  wechatPayCallback
} from "@/api/backend";

// 引入图标图片
import orderIcon from "@/assets/image/center/order.png";
import onroadIcon from "@/assets/image/center/onroad.png";
import finishIcon from "@/assets/image/center/finish.png";
import returnIcon from "@/assets/image/center/return.png";
import dispatchIcon from "@/assets/image/center/dispatch.png";
import errorIcon from "@/assets/image/center/error.png";
// 引入图标
import DocumentIcon from "~icons/ri/file-text-fill";
import AlipayIcon from "~icons/ri/alipay-fill";
import ShieldCheckIcon from "~icons/ri/shield-check-fill";
import WeixinIcon from "~icons/ri/wechat-fill";
import UserIcon from "~icons/ri/user-follow-line";
// 订单状态图标
import CheckCircleIcon from "~icons/ri/checkbox-circle-line";
import ArrowBackIcon from "~icons/ri/arrow-left-circle-line";
import SwapBoxIcon from "~icons/ri/refresh-line";
import ErrorWarningIcon from "~icons/ri/alert-line";
// 轮播图图片列表
import banner0 from "@/assets/image/backend/banner-0.jpg";
import banner1 from "@/assets/image/backend/banner-1.jpg";
import banner2 from "@/assets/image/backend/banner-2.jpg";
// api
import { getWechatPayUrl, getAlipayPayUrl } from "@/api/pay";
import {
  getCurrentUserInfo,
  type UserInfo,
  getUserServiceAbility,
  type UserServiceAbility,
  getDesignerGrabTime,
  type UserGrabTimeItem,
  updateDesignerGrabTime,
  type UpdateGrabTimeItem,
  updateGrabState,
  getUserServiceAbilityReport,
  type UserServiceAbilityReport
} from "@/api/user";
import { withdrawCheck } from "@/api/withdraw";

defineOptions({
  name: "WorkCenter"
});

// 轮播图图片列表
const carouselList = ref([banner0, banner1, banner2]);

onMounted(async () => {
  await getData();
  // 检查是否需要显示服务能力弹窗
  checkAndShowServiceAbilityDialog();
});

/**
 * 获取用户数据
 */
const userInfo = reactive<Partial<UserInfo["result"]>>({
  userName: "",
  userTypeName: "",
  isVip: 0
});
const userAmount = reactive<Partial<UserAmount["result"]>>({});
const userServiceAbility = reactive<Partial<UserServiceAbility["result"]>>({});
const getData = async () => {
  const res = await getCurrentUserInfo();
  const serviceAbilityRes = await getUserServiceAbility();
  const amountRes = await getUserAmount(res.result.id);
  if (res.code === 200) {
    Object.assign(userInfo, res.result);
    // 设置接单状态
    orderStatus.value = res.result.state_xx === 1;
  }
  if (amountRes.code === 200) {
    Object.assign(userAmount, amountRes.result);
  }
  if (serviceAbilityRes.code === 200) {
    Object.assign(userServiceAbility, serviceAbilityRes.result);
    // 更新订单统计数据
    updateOrderStats();
    // 更新雷达图
    nextTick(() => {
      initRadarChart();
    });
  }
  // 获取接单时间
  await getGrabTimeData();
};

const orderStatus = ref(false);
const radarChart = ref<HTMLDivElement>();

// 当前用户等级
const currentUserGrade = computed(() => {
  if (!userInfo.userGrades || userInfo.userGrades.length === 0) {
    return null;
  }
  // 根据userGradeName匹配当前等级
  const currentGrade = userInfo.userGrades.find(
    grade => grade.userGradeName === userInfo.userGradeName
  );
  return currentGrade || userInfo.userGrades[0];
});

// 是否显示审核中蒙层
const showAuditOverlay = computed(() => {
  return userInfo.isState !== 1;
  // return false;
});

// 转正条件配置
const regularizationConditions = computed(() => {
  const infoNumStr = userInfo.infoNum || "0%";
  let currentInfoNum = 0;
  if (infoNumStr === "已完善") {
    currentInfoNum = 100;
  } else {
    const match = infoNumStr.match(/(\d+)/);
    currentInfoNum = match ? parseInt(match[1]) : 0;
  }

  return [
    {
      label: "完成量",
      standard: 2,
      current: userInfo.wjNum || 0,
      passed: (userInfo.wjNum || 0) >= 2,
      unit: ""
    },
    {
      label: "服务分",
      standard: 4,
      current: (userInfo.servicePoints || 0).toFixed(2),
      passed: (userInfo.servicePoints || 0) >= 4,
      unit: ""
    },
    {
      label: "简历完善度",
      standard: 80,
      current: currentInfoNum,
      passed: currentInfoNum >= 80,
      unit: ""
    },
    {
      label: "实名认证",
      standard: "已实名",
      current: userInfo.authState === "已认证" ? "已实名" : "未实名",
      passed: userInfo.authState === "已认证",
      unit: ""
    },
    {
      label: "绑定微信",
      standard: "已绑定",
      current: userInfo.wechatState === "已绑定" ? "已绑定" : "未绑定",
      passed: userInfo.wechatState === "已绑定",
      unit: ""
    },
    {
      label: "账号状态",
      standard: "正常",
      current: "正常",
      passed: true,
      unit: ""
    }
  ];
});

const showBalance = ref(false);
const showRechargeDialog = ref(false);
const showWithdrawDialog = ref(false);
const showServiceAbilityDialog = ref(false);
const serviceAbilityData = ref<UserServiceAbilityReport["result"] | null>(null);

// 认证和绑定相关弹窗
const showAuthDialog = ref(false); // 个人认证弹窗
const showAlipayBindDialog = ref(false); // 支付宝绑定弹窗
const showWechatBindDialog = ref(false); // 微信绑定弹窗

/**
 * 接单时间列表
 */
const grabTimeList = ref<UserGrabTimeItem[]>([]);

/**
 * 获取接单时间数据
 */
const getGrabTimeData = async () => {
  try {
    const res = await getDesignerGrabTime();
    if (res.code === 200 && res.result) {
      const allTimeSlots = ["08:00-12:00", "12:00-18:00", "18:00-00:00"];

      grabTimeList.value = res.result.map(item => {
        const selectedTimes = item.time ? item.time.split(",") : [];

        const active = allTimeSlots.map(timeSlot => ({
          time: timeSlot,
          isCheck: selectedTimes.includes(timeSlot)
        }));

        return {
          id: item.id,
          week: item.week,
          active,
          time: item.time
        };
      });
    }
  } catch (error) {
    console.error("获取接单时间失败:", error);
  }
};

/**
 * 一键全选接单时间
 */
const selectAllTime = () => {
  grabTimeList.value.forEach(item => {
    item.active.forEach(slot => {
      slot.isCheck = true;
    });
  });
};

/**
 * 一键取消接单时间
 */
const clearAllTime = () => {
  grabTimeList.value.forEach(item => {
    item.active.forEach(slot => {
      slot.isCheck = false;
    });
  });
};

/**
 * 保存接单时间
 */
const saveGrabTime = async () => {
  try {
    // 构建提交数据
    const times: UpdateGrabTimeItem[] = grabTimeList.value.map(item => {
      // 获取选中的时间段
      const selectedTimes = item.active
        .filter(slot => slot.isCheck)
        .map(slot => slot.time);
      return {
        id: item.id,
        week: item.week,
        time: selectedTimes.join(",")
      };
    });

    const res = await updateDesignerGrabTime({ times });
    if (res.code === 200) {
      ElMessage.success("保存成功");
      // 重新获取接单时间数据
      await getGrabTimeData();
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    console.error("保存接单时间失败:", error);
    ElMessage.error("保存失败");
  }
};

/**
 * 处理接单状态变更
 */
const handleOrderStatusChange = async (value: boolean) => {
  if (value) {
    try {
      const stateRes = await updateGrabState({ state_xx: 1 });
      if (stateRes.code === 200) {
        const times: UpdateGrabTimeItem[] = grabTimeList.value.map(item => {
          const selectedTimes = item.active
            .filter(slot => slot.isCheck)
            .map(slot => slot.time);
          return {
            id: item.id,
            week: item.week,
            time: selectedTimes.join(",")
          };
        });
        await updateDesignerGrabTime({ times });
        const userInfoRes = await getCurrentUserInfo();
        if (userInfoRes.code === 200) {
          Object.assign(userInfo, userInfoRes.result);
        }
        ElMessage.success("已开启接单状态");
      } else {
        ElMessage.error(stateRes.message || "操作失败");
        orderStatus.value = false;
      }
    } catch (error) {
      console.error("开启接单状态失败:", error);
      ElMessage.error("操作失败");
      orderStatus.value = false;
    }
  } else {
    ElMessageBox.confirm("确定切换为休息模式吗?", "提醒", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(async () => {
        try {
          const res = await updateGrabState({ state_xx: 0 });
          if (res.code === 200) {
            const userInfoRes = await getCurrentUserInfo();
            if (userInfoRes.code === 200) {
              Object.assign(userInfo, userInfoRes.result);
            }
            ElMessage.success("已关闭接单状态");
          } else {
            ElMessage.error(res.message || "操作失败");
            orderStatus.value = true;
          }
        } catch (error) {
          console.error("关闭接单状态失败:", error);
          ElMessage.error("操作失败");
          orderStatus.value = true;
        }
      })
      .catch(() => {
        orderStatus.value = true;
      });
  }
};

/**
 * 处理信息完整度徽章点击
 */
const bindType = ref<"alipay" | "wechat">("alipay");
const handleInfoBadgeClick = (badgeType: string) => {
  switch (badgeType) {
    case "info":
      // 基本信息 - 跳转到用户信息页面
      router.push("/user/info");
      break;
    case "auth":
      // 未认证 - 打开个人认证弹窗
      if (userInfo.authState === "未实名") {
        showAuthDialog.value = true;
      } else {
        ElMessage.info("您已完成实名认证");
      }
      break;
    case "alipay":
      // 支付宝 - 打开支付宝绑定弹窗
      if (userInfo.aliPayState === "未绑定") {
        bindType.value = "alipay";
        showAlipayBindDialog.value = true;
      } else {
        ElMessage.info("您已绑定支付宝");
      }
      break;
    case "wechat":
      // 微信 - 打开微信绑定弹窗
      if (userInfo.wechatState === "未绑定") {
        bindType.value = "wechat";
        showAlipayBindDialog.value = true;
      } else {
        ElMessage.info("您已绑定微信");
      }
      break;
    default:
      break;
  }
};

/**
 * 处理"成为VIP"按钮点击
 */
const handleBecomeVip = () => {
  router.push("/vip");
};

/**
 * 认证成功后刷新用户信息
 */
const handleAuthSuccess = async () => {
  await getData();
  ElMessage.success("认证成功");
};

/**
 * 绑定成功后刷新用户信息
 */
const handleBindSuccess = async () => {
  await getData();
  ElMessage.success("绑定成功");
};

// 切换余额显示/隐藏
const toggleBalance = () => {
  showBalance.value = !showBalance.value;
};

// 打开充值弹框
const openRechargeDialog = () => {
  showRechargeDialog.value = true;
};

const router = useRouter();

/**
 * 退出登录（审核中用户使用）
 */
const handleLogout = async () => {
  try {
    await useUserStoreHook().logOut();
  } catch (error) {
    console.error("退出登录失败:", error);
    ElMessage.error("退出登录失败");
  }
};

/**
 * 处理提现点击
 */
const handleWithdraw = async () => {
  try {
    // 调用提现校验接口
    const res = await withdrawCheck();

    // 显示返回的消息提示给用户
    if (res.message) {
      ElMessage.warning(res.message);
    }

    // 如果返回的 code 是 200，说明校验通过
    if (res.code === 200) {
      // 校验通过，打开提现弹窗
      showWithdrawDialog.value = true;
      return;
    }

    // 检查 message 中是否包含"账号未实名"
    if (res.message && res.message.includes("账号未实名")) {
      // 跳转到账户设置页面，并自动弹出个人认证弹窗
      router.push({
        path: "/account/index",
        query: {
          showAuth: "true"
        }
      });
      return;
    }

    // 检查 message 中是否包含"账号未设置支付密码"
    if (res.message && res.message.includes("账号未设置支付密码")) {
      // 跳转到账户设置页面，并自动弹出支付密码弹窗
      router.push({
        path: "/account/index",
        query: {
          showPayPassword: "true"
        }
      });
      return;
    }
  } catch (error) {
    console.error("提现校验失败:", error);
    ElMessage.error("提现校验失败，请重试");
  }
};

/**
 * 处理提现成功
 */
const handleWithdrawSuccess = async () => {
  // 刷新用户余额
  try {
    const userInfoRes = await getCurrentUserInfo();
    if (userInfoRes.code === 200) {
      const amountRes = await getUserAmount(userInfoRes.result.id);
      if (amountRes.code === 200) {
        Object.assign(userAmount, amountRes.result);
      }
    }
  } catch (error) {
    console.error("刷新余额失败:", error);
  }
};

/**
 *  处理充值确认
 */
const showPayCodeModal = ref<boolean>(false);
const codeUrl = ref<string>("");
const currentMoney = ref<number>(null);
const currentPaymentMethod = ref<"wechat" | "alipay">("wechat");
const userRechargeId = ref<number | null>(null);
let pollTimer: NodeJS.Timeout | null = null;
let pollStartTime: number | null = null;
const MAX_POLL_TIME = 5 * 60 * 1000; // 最大轮询时间：5分钟

const handleRechargeConfirm = async (data: {
  money: number;
  accountType: 1 | 2;
  paymentMethod: "wechat" | "alipay";
}) => {
  const payData = {
    money: Number(data.money),
    rechargeTypeId: data.accountType,
    terminal: 2,
    userType: 2,
    typeId: 0,
    integral: 0
  };

  // 根据支付方式调用不同的接口
  const res =
    data.paymentMethod === "wechat"
      ? await getWechatPayUrl(payData)
      : await getAlipayPayUrl(payData);

  if (res.code === 200) {
    codeUrl.value = res.result.url;
    currentMoney.value = data.money;
    currentPaymentMethod.value = data.paymentMethod;
    userRechargeId.value = res.result.userRechargeId;
    showPayCodeModal.value = true;
    // 开始轮询检查支付状态（微信和支付宝都使用同一个轮询接口）
    if (userRechargeId.value) {
      startPollingPaymentStatus();
    }
  }
};

/**
 * 开始轮询支付状态
 */
const startPollingPaymentStatus = () => {
  // 清除之前的定时器
  stopPollingPaymentStatus();
  pollStartTime = Date.now();

  pollTimer = setInterval(async () => {
    // 是否还有充值订单ID
    if (!userRechargeId.value) {
      stopPollingPaymentStatus();
      return;
    }

    // 检是否超过最大轮询时间
    if (pollStartTime && Date.now() - pollStartTime > MAX_POLL_TIME) {
      stopPollingPaymentStatus();
      ElMessage.warning("支付超时，请稍后查看充值结果");
      return;
    }

    try {
      const res = await wechatPayCallback(userRechargeId.value);
      if (res.result.code === 200) {
        stopPollingPaymentStatus();
        ElMessage.success(`充值成功！金额：${currentMoney.value}元`);
        showPayCodeModal.value = false;
        payCodeClose();
        // 刷新用户余额
        const userInfoRes = await getCurrentUserInfo();
        if (userInfoRes.code === 200) {
          const amountRes = await getUserAmount(userInfoRes.result.id);
          if (amountRes.code === 200) {
            Object.assign(userAmount, amountRes.result);
          }
        }
      }
    } catch (error) {
      console.error("查询支付状态失败:", error);
    }
  }, 3000);
};

/**
 * 停止轮询支付状态
 */
const stopPollingPaymentStatus = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  pollStartTime = null;
};

/**
 * 重置二维码数据
 */
const payCodeClose = () => {
  codeUrl.value = "";
  currentMoney.value = null;
  currentPaymentMethod.value = "wechat";
  userRechargeId.value = null;
  stopPollingPaymentStatus();
};

/**
 * 监听支付弹框关闭，停止轮询
 */
watch(
  () => showPayCodeModal.value,
  newVal => {
    if (!newVal) {
      stopPollingPaymentStatus();
    }
  }
);
/**
 * 订单统计数据
 */
const orderStats = ref([
  {
    type: "grab",
    label: "总抢单",
    value: 0,
    color: "#5DADE2",
    icon: orderIcon,
    iconComponent: null
  },
  {
    type: "receive",
    label: "总接单",
    value: 0,
    color: "#48C9B0",
    icon: orderIcon,
    iconComponent: null
  },
  {
    type: "progress",
    label: "在途",
    value: 0,
    color: "#85C1E9",
    icon: onroadIcon,
    iconComponent: null
  },
  {
    type: "completed",
    label: "已完成",
    value: 0,
    color: "#58D68D",
    icon: finishIcon,
    iconComponent: CheckCircleIcon
  },
  {
    type: "returned",
    label: "已退单",
    value: 0,
    color: "#D2B48C",
    icon: returnIcon,
    iconComponent: ArrowBackIcon
  },
  {
    type: "reassigned",
    label: "已改派",
    value: 0,
    color: "#F7DC6F",
    icon: dispatchIcon,
    iconComponent: SwapBoxIcon
  },
  {
    type: "abnormal",
    label: "异常",
    value: 0,
    color: "#EC7063",
    icon: errorIcon,
    iconComponent: ErrorWarningIcon
  }
]);

/**
 * 更新订单统计数据
 */
const updateOrderStats = () => {
  const data = userServiceAbility;
  orderStats.value.forEach(stat => {
    switch (stat.type) {
      case "grab":
        stat.value = data.qd_Number || 0;
        break;
      case "receive":
        stat.value = data.jd_Number || 0;
        break;
      case "progress":
        stat.value = data.zt_Number || 0;
        break;
      case "completed":
        stat.value = data.wj_Number || 0;
        break;
      case "returned":
        stat.value = data.td_Number || 0;
        break;
      case "reassigned":
        stat.value = data.gp_Number || 0;
        break;
      case "abnormal":
        stat.value = data.yc_Number || 0;
        break;
    }
  });
};

// 雷达图实例
let radarChartInstance: echarts.ECharts | null = null;
// 窗口大小调整事件处理器
let resizeHandler: (() => void) | null = null;

/**
 * 初始化雷达图
 */
const initRadarChart = () => {
  if (!radarChart.value) return;

  // 如果已存在实例，先销毁
  if (radarChartInstance) {
    radarChartInstance.dispose();
    radarChartInstance = null;
  }

  // 移除旧的 resize 事件监听器
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  const chart = echarts.init(radarChart.value);
  radarChartInstance = chart;

  // 获取服务能力数据
  const data = userServiceAbility;

  // 计算雷达图指标的最大值
  const maxValues = [
    100, // 接单成功率最大值
    100, // 退单率最大值
    5, // 好评度最大值
    5, // 活跃度最大值
    Math.max(1000, (data.avgPrice || 0) * 1.2), // 客单价最大值（动态计算，至少是当前值的1.2倍或1000）
    100, // 改派率最大值
    100, // 终稿准时率最大值
    100 // 初稿准时率最大值
  ];

  // 获取实际数据值
  const radarValues = [
    data.jd_Cg_Rate || 0, // 接单成功率
    data.td_Rate || 0, // 退单率
    data.goodCommentScore || 0, // 好评度
    data.activeScore || 0, // 活跃度
    data.avgPrice || 0, // 客单价
    data.gp_Rate || 0, // 改派率
    data.zg_Zs_Rate || 0, // 终稿准时率
    data.cg_Zs_Rate || 0 // 初稿准时率
  ];

  const option = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        const names = [
          "接单成功率",
          "退单率",
          "好评度",
          "活跃度",
          "客单价",
          "改派率",
          "终稿准时率",
          "初稿准时率"
        ];
        const value = params.value[params.dataIndex];
        const name = names[params.dataIndex];
        if (params.dataIndex === 2 || params.dataIndex === 3) {
          // 好评度、活跃度
          return `${name}: ${value}分`;
        } else if (params.dataIndex === 4) {
          // 客单价
          return `${name}: ${value}元`;
        } else {
          // 百分比
          return `${name}: ${value}%`;
        }
      }
    },
    radar: {
      indicator: [
        { name: "接单成功率", max: maxValues[0] },
        { name: "退单率", max: maxValues[1] },
        { name: "好评度", max: maxValues[2] },
        { name: "活跃度", max: maxValues[3] },
        { name: "客单价", max: maxValues[4] },
        { name: "改派率", max: maxValues[5] },
        { name: "终稿准时率", max: maxValues[6] },
        { name: "初稿准时率", max: maxValues[7] }
      ],
      center: ["50%", "55%"],
      radius: "85%",
      axisLabel: {
        fontSize: 11,
        color: "#999",
        show: false
      },
      axisName: {
        fontSize: 14,
        color: "#666",
        fontWeight: "normal"
      },
      splitLine: {
        lineStyle: {
          color: "#ddd",
          width: 1
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(250,250,250,0.3)", "rgba(200,200,200,0.1)"]
        }
      },
      axisLine: {
        lineStyle: {
          color: "#ddd"
        }
      }
    },
    series: [
      {
        name: "服务能力",
        type: "radar",
        data: [
          {
            value: radarValues,
            name: "服务能力评分"
          }
        ],
        areaStyle: {
          color: "rgba(64, 158, 255, 0.1)"
        },
        lineStyle: {
          color: "#409EFF",
          width: 2
        },
        itemStyle: {
          color: "#409EFF",
          borderColor: "#409EFF",
          borderWidth: 2
        },
        symbol: "circle",
        symbolSize: 8,
        label: {
          show: true,
          formatter: function (params: any) {
            const value = params.value;
            const index = params.dataIndex;
            if (index === 2 || index === 3) {
              // 好评度、活跃度
              return value.toFixed(2) + "分";
            } else if (index === 4) {
              // 客单价
              return value.toFixed(2) + "元";
            } else {
              // 百分比
              return value.toFixed(2) + "%";
            }
          },
          fontSize: 12,
          color: "#409EFF",
          fontWeight: "bold"
        }
      }
    ]
  };

  chart.setOption(option);

  // 响应式处理
  resizeHandler = () => {
    chart.resize();
  };
  window.addEventListener("resize", resizeHandler);
};
/**
 * 审核提醒弹框
 */
const elBox = ref<MessageBoxData | null>(null);
const showAuditDialog = async () => {
  elBox.value = await ElMessageBox({
    message: `
      <div class="flex justify-center font-bold text-lg mt-2">审核中</div>
      <div class="flex items-start gap-6 p-2">
        <div class="flex-1 min-w-[180px]">
          <div class="mb-2">预计在2个工作日内审核</div>
          <div class="mb-2">请关注您微信服务通知及手机短信</div>
          <div class="mb-2">24小时服务热线：0731-24860005</div>
          <div class="mb-2">关注微信公众号：优君电商了解更多资讯</div>
        </div>
        <div class="flex-shrink-0">
          <img src="https://oms-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17829239212485.aaf" alt="图片" class="w-[120px] h-[120px] bg-gray-100 rounded-lg object-cover" />
        </div>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    showCancelButton: false,
    showConfirmButton: false,
    customClass: "audit-dialog-box",
    closeOnClickModal: false
  });
};

/**
 * 检查并显示服务能力弹窗
 */
const checkAndShowServiceAbilityDialog = async () => {
  try {
    // 检查 sessionStorage 中是否已显示过
    const hasShown = sessionStorage.getItem("hasShownServiceAbilityDialog");

    if (!hasShown) {
      // 调用接口获取服务能力报表数据
      const res = await getUserServiceAbilityReport();
      if (res.code === 200 && res.result) {
        serviceAbilityData.value = res.result;
        showServiceAbilityDialog.value = true;
        // 设置标记，表示本次会话已显示过
        sessionStorage.setItem("hasShownServiceAbilityDialog", "true");
      }
    }
  } catch (error) {
    console.error("获取服务能力报表失败:", error);
  }
};

/**
 * 关闭服务能力弹窗
 */
const handleServiceAbilityClose = () => {
  showServiceAbilityDialog.value = false;
};

/**
 * 组件卸载时清理资源
 */
onUnmounted(() => {
  // 停止轮询
  stopPollingPaymentStatus();
  // 移除窗口大小调整事件监听器
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }
  // 销毁雷达图实例
  if (radarChartInstance) {
    radarChartInstance.dispose();
    radarChartInstance = null;
  }
});
</script>

<style scoped>
/* 响应式处理 */
@media (max-width: 1200px) {
  .grid-cols-\[1fr_400px\] {
    grid-template-columns: 1fr;
  }

  .grid-cols-7 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-cols-7 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<!-- VIP弹框样式需要全局 -->
<style>
.vip-info-popover {
  background: #1a1a1a !important;
  border: none !important;
  border-radius: 8px !important;
}

.vip-info-popover .el-popover__title,
.vip-info-popover .el-popper__arrow::before {
  background: #1a1a1a !important;
}

/* 等级弹框样式 */
.grade-info-popover {
  padding: 0 !important;
}

.grade-info-popover table {
  border-spacing: 0;
}
</style>
