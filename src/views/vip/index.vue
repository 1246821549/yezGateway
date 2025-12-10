<template>
  <div
    class="min-h-screen bg-gradient-to-b from-amber-50 to-gray-100 flex flex-col"
  >
    <!-- 顶部标题栏 -->
    <div class="py-3">
      <div
        class="max-w-[1400px] mx-auto px-6 flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold text-amber-800">优君电商</span>
          <img
            src="@/assets/image/backend/vip.png"
            alt="VIP"
            class="w-16 h-6"
          />
        </div>
        <div class="flex items-center gap-4">
          <el-button
            class="!bg-amber-500 !border-none !text-white hover:!bg-amber-600 !px-4 !py-1.5 !rounded !text-sm"
            @click="goBack"
          >
            返回
          </el-button>
          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click">
            <div
              class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-black/5 transition-colors"
            >
              <el-avatar :src="userInfo.tximg" :size="40" />
              <span class="text-gray-800 text-sm">
                {{ userInfo.autoincrementUserId }}-{{ userInfo.userName }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goBack">
                  <el-icon class="mr-1"><BackendLine /></el-icon>
                  返回后台
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  <el-icon class="mr-1"><LogoutCircleRLine /></el-icon>
                  退出系统
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="flex-1 max-w-[1400px] w-full mx-auto px-5 py-5">
      <div class="grid grid-cols-[240px_1fr] gap-5 items-start lg-grid-cols-1">
        <!-- 左侧：会员特权列表 -->
        <div
          class="rounded-lg p-5"
          style="background: linear-gradient(180deg, #ffe5b4 0%, #fff9d9 100%)"
        >
          <h1 class="text-xl font-bold text-amber-700 mb-4 leading-relaxed">
            开通优君电商会员<br />畅享 16 大专属权益
          </h1>
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, index) in privileges"
              :key="index"
              class="flex items-center gap-2 text-sm text-amber-700 py-1.5"
            >
              <img
                src="@/assets/image/backend/right.png"
                alt="√"
                class="w-4 h-4 flex-shrink-0"
              />
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：会员套餐和支付 -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <!-- 会员套餐卡片 -->
          <div
            v-loading="loading"
            class="grid grid-cols-3 gap-4 mb-6 lg-grid-cols-1"
          >
            <div
              v-for="plan in vipPlans"
              :key="plan.id"
              :class="[
                'border rounded-md p-5 text-center cursor-pointer transition-all min-h-[205px] flex flex-col justify-center',
                selectedPlan?.id === plan.id
                  ? 'border-amber-500 border-2 bg-amber-100 '
                  : 'border-gray-200 hover:border-amber-300'
              ]"
              @click="selectPlan(plan)"
            >
              <div class="text-base font-medium text-gray-800 mb-3">
                {{ getPlanName(plan.month) }}
              </div>
              <div class="flex items-baseline justify-center">
                <span class="text-lg text-red-500">¥</span>
                <span class="text-5xl font-bold text-red-500 leading-none">
                  {{ plan.discountAmount || plan.amount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 支付方式：仅余额支付 -->
          <div
            class="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100"
          >
            <span class="text-sm text-gray-800 whitespace-nowrap"
              >支付方式:</span
            >
            <div
              class="flex items-center gap-2.5 px-4 py-2.5 border border-blue-500 bg-blue-50 rounded-md min-w-[200px]"
            >
              <img
                src="@/assets/image/backend/vip.png"
                alt="余额"
                class="w-5 h-5"
              />
              <span class="text-sm text-gray-800">余额支付</span>
              <span class="text-xs text-gray-400 ml-2">
                当前余额：{{ userBalance }}
              </span>
            </div>
          </div>

          <!-- 下半部分：左右分栏布局 -->
          <div
            class="grid grid-cols-2 gap-6 items-start bg-gray-100 p-8 rounded-xl lg-grid-cols-1"
          >
            <!-- 左侧：金额和支付密码 -->
            <div>
              <!-- 充值金额显示 -->
              <div class="mb-5 !ml-[90px]">
                <span class="text-xl text-red-500">¥</span>
                <span class="text-5xl font-bold text-red-500 leading-none pl-2">
                  {{
                    selectedPlan?.discountAmount || selectedPlan?.amount || 0
                  }}
                </span>
              </div>

              <!-- 支付密码输入 -->
              <div class="mb-5">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-800 whitespace-nowrap"
                    >支付密码:</span
                  >
                  <div class="flex gap-2">
                    <input
                      v-for="(item, index) in 6"
                      :key="index"
                      :ref="
                        el => {
                          if (el)
                            passwordInputs[index] = el as HTMLInputElement;
                        }
                      "
                      v-model="passwordDigits[index]"
                      type="password"
                      maxlength="1"
                      class="w-9 h-9 border border-gray-300 rounded text-center text-lg outline-none focus:border-blue-500"
                      @input="handlePasswordInput(index, $event)"
                      @keydown="handlePasswordKeydown(index, $event)"
                      @paste="handlePasswordPaste"
                    />
                  </div>
                  <el-button
                    class="!text-gray-500 !text-sm ml-2"
                    @click="resetPayPsw"
                    >重置</el-button
                  >
                </div>
              </div>

              <!-- 确认充值按钮 -->
              <el-button
                type="primary"
                class="!bg-blue-500 !border-none !rounded !px-6 !py-2.5 !text-sm !ml-[90px] !mt-3 hover:!bg-blue-600 disabled:!bg-blue-300"
                :disabled="!canSubmit"
                :loading="submitting"
                @click="handleSubmit"
              >
                确定充值
              </el-button>
            </div>

            <!-- 右侧：充值记录滚动 -->
            <div>
              <div v-loading="recordLoading" class="rounded-md overflow-hidden">
                <div class="h-[200px] overflow-hidden">
                  <div class="flex flex-col" :style="scrollStyle">
                    <div
                      v-for="(record, index) in displayRecords"
                      :key="index"
                      class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 border-b border-gray-100 last:border-b-0"
                    >
                      <el-avatar :src="record.tximg" :size="28" />
                      <span class="text-gray-800 font-medium">
                        {{ maskName(record.realName) }}
                      </span>
                      <span class="text-amber-500 text-xs">刚刚</span>
                      <span class="text-gray-600"
                        >购买了{{ record.userVipTypeName }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 协议 -->
          <div
            class="text-right text-xs text-gray-400 mt-4 cursor-pointer hover:text-blue-500"
          >
            《优君电商会员服务协议》
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <AppFooter />

    <!-- 右侧悬浮栏 -->
    <FixedSidebar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getVipType, getVipRecord, rechargeVip } from "@/api/vip";
import { getCurrentUserInfo } from "@/api/user";
import { getUserAmount } from "@/api/backend";
import AppFooter from "@/components/AppFooter/index.vue";
import FixedSidebar from "@/components/FixedSidebar/index.vue";
import { useNav } from "@/layout/hooks/useNav";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import BackendLine from "~icons/ri/computer-line";

defineOptions({
  name: "VipPage"
});

const router = useRouter();
const { logout } = useNav();

// 返回
const goBack = () => {
  router.push("/backend/index");
};

// 退出登录
const handleLogout = () => {
  logout();
};

// 用户信息
const userInfo = ref({
  id: 0,
  userName: "",
  tximg: "",
  autoincrementUserId: 0
});

const userBalance = ref(0);

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await getCurrentUserInfo();
    if (res.code === 200) {
      userInfo.value = res.result;
      // 获取余额
      const amountRes = await getUserAmount(res.result.id);
      if (amountRes.code === 200) {
        userBalance.value = amountRes.result.userBalance || 0;
      }
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 固定的会员特权列表
const privileges = [
  "VIP徽章",
  "专属客服",
  "不限额授单",
  "可接包月客户",
  "可接远程工作",
  "最高派单优先级",
  "不限在途订单",
  "支持免责申诉",
  "提现手续费全免",
  "支持免责申诉",
  "支持初稿准时奖励",
  "支持终稿准时奖励",
  "支持接单任务奖励",
  "分佣比例最高70%",
  "支持晋级资深设计师",
  "支持团队资质"
];

// VIP套餐列表
interface VipPlan {
  id: number;
  month: number;
  amount: number;
  discountAmount: number;
  explain: string;
  firstDiscount: number;
  firstDiscountAmount: number;
  aheadDay: number;
  renewDiscount: number;
  renewDiscountAmount: number;
}

const loading = ref(false);
const vipPlans = ref<VipPlan[]>([]);
const selectedPlan = ref<VipPlan | null>(null);

// 获取VIP套餐名称
const getPlanName = (month: number) => {
  if (month === 1) return "月度会员";
  if (month === 3) return "季度会员";
  if (month === 12) return "年度会员";
  return `${month}月会员`;
};

// 获取VIP套餐
const getVipPlans = async () => {
  loading.value = true;
  try {
    const res = await getVipType();
    if (res.code === 200 && res.result) {
      // 接口返回单个对象，构造为数组
      const baseData = res.result;
      vipPlans.value = [
        { ...baseData, id: 1, month: 1, amount: 299, discountAmount: 299 },
        { ...baseData, id: 2, month: 3, amount: 599, discountAmount: 599 },
        { ...baseData, id: 3, month: 12, amount: 1680, discountAmount: 1680 }
      ];
      // 默认选中第一个
      if (vipPlans.value.length > 0) {
        selectedPlan.value = vipPlans.value[0];
      }
    }
  } catch (error) {
    console.error("获取VIP套餐失败:", error);
  } finally {
    loading.value = false;
  }
};

const resetPayPsw = () => {
  passwordDigits.value = ["", "", "", "", "", ""];
};

// 选择套餐
const selectPlan = (plan: VipPlan) => {
  selectedPlan.value = plan;
  // 清空密码
  passwordDigits.value = ["", "", "", "", "", ""];
};

// 支付密码
const passwordDigits = ref<string[]>(["", "", "", "", "", ""]);
const passwordInputs = ref<(HTMLInputElement | null)[]>([]);
const submitting = ref(false);

// 处理密码输入
const handlePasswordInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value.length > 0) {
    passwordDigits.value[index] = value.slice(-1);
    if (index < 5 && passwordInputs.value[index + 1]) {
      passwordInputs.value[index + 1]?.focus();
    }
  }
};

// 处理键盘事件
const handlePasswordKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !passwordDigits.value[index] && index > 0) {
    passwordInputs.value[index - 1]?.focus();
  }
};

// 处理粘贴
const handlePasswordPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const paste = event.clipboardData?.getData("text") || "";
  const digits = paste.slice(0, 6).split("");
  digits.forEach((digit, index) => {
    if (index < 6) {
      passwordDigits.value[index] = digit;
    }
  });
  const lastIndex = Math.min(digits.length, 5);
  passwordInputs.value[lastIndex]?.focus();
};

// 是否可以提交
const canSubmit = computed(() => {
  return (
    selectedPlan.value !== null &&
    passwordDigits.value.every(digit => digit !== "")
  );
});

// 提交充值
const handleSubmit = async () => {
  if (!canSubmit.value) return;

  const paymentPassword = passwordDigits.value.join("");

  submitting.value = true;
  try {
    const data = {
      userId: userInfo.value.id,
      userVipTypeId: selectedPlan.value!.id,
      userRechargeId: 0,
      amount: selectedPlan.value!.discountAmount || selectedPlan.value!.amount,
      integral: 0,
      paymentMethod: 1,
      paymentPassword
    };

    await rechargeVip(data);

    ElMessage.success("充值成功！");
    passwordDigits.value = ["", "", "", "", "", ""];
    await getUserInfo();
    setTimeout(() => {
      goBack();
    }, 1500);
  } catch (error: any) {
    console.error("充值失败:", error);
    ElMessage.error(error.message || "充值失败，请重试");
  } finally {
    submitting.value = false;
  }
};

// 充值记录
interface VipRecord {
  realName: string;
  tximg: string;
  createTime: string;
  userVipTypeName: string;
}

const recordLoading = ref(false);
const vipRecords = ref<VipRecord[]>([]);
const displayRecords = ref<VipRecord[]>([]);
const scrollTop = ref(0);

// 名字脱敏
const maskName = (name: string) => {
  if (!name) return "用户";
  if (name.length === 1) return name + "**";
  if (name.length === 2) return name[0] + "**";
  return name[0] + "**";
};

// 获取充值记录
const getVipRecords = async () => {
  recordLoading.value = true;
  try {
    const res = await getVipRecord({
      page: 1,
      pageSize: 999
    });

    if (res.code === 200 && res.result?.itmes && res.result.itmes.length > 0) {
      vipRecords.value = res.result.itmes;
      displayRecords.value = [...res.result.itmes, ...res.result.itmes];
    } else {
      // 使用假数据
      const mockData: VipRecord[] = [
        {
          realName: "张三",
          tximg: "",
          createTime: "17点53分",
          userVipTypeName: "年度会员"
        },
        {
          realName: "李四",
          tximg: "",
          createTime: "16点30分",
          userVipTypeName: "季度会员"
        },
        {
          realName: "王五",
          tximg: "",
          createTime: "15点20分",
          userVipTypeName: "月度会员"
        },
        {
          realName: "赵六",
          tximg: "",
          createTime: "14点15分",
          userVipTypeName: "年度会员"
        },
        {
          realName: "钱七",
          tximg: "",
          createTime: "13点10分",
          userVipTypeName: "季度会员"
        }
      ];
      vipRecords.value = mockData;
      displayRecords.value = [...mockData, ...mockData];
    }

    // 启动滚动
    startScroll();
  } catch (error) {
    console.error("获取充值记录失败:", error);
    // 接口失败也使用假数据
    const mockData: VipRecord[] = [
      {
        realName: "张三",
        tximg: "",
        createTime: "17点53分",
        userVipTypeName: "年度会员"
      },
      {
        realName: "李四",
        tximg: "",
        createTime: "16点30分",
        userVipTypeName: "季度会员"
      },
      {
        realName: "王五",
        tximg: "",
        createTime: "15点20分",
        userVipTypeName: "月度会员"
      }
    ];
    vipRecords.value = mockData;
    displayRecords.value = [...mockData, ...mockData];
    startScroll();
  } finally {
    recordLoading.value = false;
  }
};

// 滚动样式
const scrollStyle = computed(() => {
  return {
    transform: `translateY(-${scrollTop.value}px)`,
    transition: "transform 0.5s linear"
  };
});

// 滚动定时器
let scrollTimer: ReturnType<typeof setInterval> | null = null;

// 开始滚动
const startScroll = () => {
  if (vipRecords.value.length === 0) return;

  scrollTimer = setInterval(() => {
    scrollTop.value += 40;

    if (scrollTop.value >= vipRecords.value.length * 40) {
      scrollTop.value = 0;
    }
  }, 3000);
};

// 停止滚动
const stopScroll = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
};

onMounted(() => {
  getUserInfo();
  getVipPlans();
  getVipRecords();
});

onUnmounted(() => {
  stopScroll();
});
</script>

<style scoped>
/* 响应式覆盖 - 小屏幕 */
@media (max-width: 1024px) {
  .lg-grid-cols-1 {
    grid-template-columns: 1fr;
  }
}
</style>
