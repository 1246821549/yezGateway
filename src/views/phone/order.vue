<!--
 * @Description: 接单详情-H5页面
 * @Author: 程前
 * @Date: 2025-08-13 15:05:57
 * @LastEditors: 程前
 * @LastEditTime: 2025-12-09 10:00:00
-->
<script setup lang="ts">
import { ref, computed, onMounted, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey, multipleTabsKey } from "@/utils/auth";
import ChatLine from "~icons/ri/chat-1-line";
import {
  getHomeOrderDetailById,
  checkSeizeOrder,
  seizeOrder,
  type OrderDetailInfo
} from "@/api/order";

defineOptions({
  name: "PhoneOrderDetail"
});

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const grabLoading = ref(false);
const orderDetail = ref<OrderDetailInfo | null>(null);

/**
 * 检查是否登录
 */
const isLoggedIn = computed(() => {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return !!(Cookies.get(multipleTabsKey) && userInfo);
});

/**
 * 获取订单详情
 */
const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
    if (!id) {
      ElMessage.error("订单ID不存在");
      return;
    }

    const response = await getHomeOrderDetailById({ id });
    console.log("订单详情返回数据:", response);
    if (response.code === 200) {
      orderDetail.value = response.result;
    } else {
      ElMessage.error(response.message || "获取订单详情失败");
    }
  } catch (error) {
    console.error("获取订单详情失败:", error);
    ElMessage.error("获取订单详情失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
};

/**
 * 抢单按钮文本
 */
const grabButtonText = computed(() => {
  if (!orderDetail.value) return "加载中...";
  if (orderDetail.value.distributionState === 1) return "已派发";
  if (orderDetail.value.isSeize === 1) return "已抢单";
  return "立即抢单";
});

/**
 * 抢单按钮是否禁用
 */
const isGrabDisabled = computed(() => {
  if (!orderDetail.value) return true;
  return (
    orderDetail.value.distributionState === 1 || orderDetail.value.isSeize === 1
  );
});

/**
 * 抢单
 */
const handleGrabOrder = async () => {
  // 1. 检查是否登录
  if (!isLoggedIn.value) {
    ElMessage.warning("请先登录后再抢单");
    // 跳转到登录页，登录成功后返回当前页面
    router.push({
      path: "/login",
      query: { redirect: route.fullPath }
    });
    return;
  }

  if (!orderDetail.value) return;

  if (orderDetail.value.isSeize === 1) {
    ElMessage.warning("您已抢过该订单");
    return;
  }

  try {
    grabLoading.value = true;

    // 2. 先检查是否可以抢单
    const checkRes = await checkSeizeOrder({ id: orderDetail.value.id });
    console.log("抢单检查返回:", checkRes);

    // 检查 result 中的 code 是否为 200
    if (checkRes.result?.code !== 200) {
      ElMessage.error(
        checkRes.result?.message || checkRes.message || "抢单检查失败"
      );
      return;
    }

    // 3. 检查通过，正式抢单
    const seizeRes = await seizeOrder({ id: orderDetail.value.id });
    console.log("抢单返回:", seizeRes);

    if (seizeRes.code === 200) {
      ElMessage.success(seizeRes.message || "抢单成功");
      // 刷新订单详情
      await fetchOrderDetail();
    } else {
      ElMessage.error(seizeRes.message || "抢单失败");
    }
  } catch (error) {
    console.error("抢单失败:", error);
    ElMessage.error("抢单失败，请稍后重试");
  } finally {
    grabLoading.value = false;
  }
};

/**
 * 联系客服
 */
const handleContactService = () => {
  ElMessage.info("客服功能开发中...");
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<template>
  <div v-loading="loading" class="min-h-screen bg-gray-100">
    <div v-if="orderDetail" class="pt-4 px-4">
      <img
        class="w-full rounded-lg"
        src="@/assets/image/order/h5_order.jpg"
        alt="banner"
      />
    </div>
    <section
      v-if="orderDetail"
      class="mx-4 my-3 p-4 bg-white rounded-xl shadow"
    >
      <div class="flex items-center justify-between pb-2">
        <div class="text-base font-semibold text-gray-900">
          {{ orderDetail.orderTypeName }}
          <span class="ml-1 text-lg text-gray-400">›</span>
        </div>
        <span
          v-if="orderDetail.distributionState === 1"
          class="text-sm text-blue-500"
        >
          已派发
        </span>
        <span
          v-else-if="orderDetail.isSeize === 1"
          class="text-sm text-green-500"
        >
          已抢单
        </span>
        <span v-else class="text-sm text-orange-500">待抢单</span>
      </div>

      <ul class="m-0 p-0 list-none">
        <li class="flex items-center flex-wrap py-2">
          <span class="text-sm text-gray-500">订单编号：</span>
          <span class="text-sm text-gray-800 flex-1 mr-1">
            {{ orderDetail.orderNumber }}
          </span>
          <span
            v-if="orderDetail.isEmergent === 1"
            class="ml-auto text-xs text-red-500 bg-red-50 rounded-md px-2 py-1"
          >
            紧急
          </span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">派单客服：</span>
          <span class="text-sm text-gray-800">
            {{ orderDetail.adminName || "优君电商系统" }}
          </span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">任务金额：</span>
          <span class="text-sm text-red-500 font-semibold">
            ¥{{ orderDetail.taskAmount }}
          </span>
        </li>
        <li class="flex items-center flex-wrap py-2">
          <span class="text-sm text-gray-500">初稿时间：</span>
          <span class="text-sm text-gray-800">
            {{ formatTime(orderDetail.firstDraftTime) }}
          </span>
          <span class="mx-2 text-gray-400">~</span>
          <span class="text-sm text-gray-500">交付时间：</span>
          <span class="text-sm text-gray-800">
            {{ formatTime(orderDetail.finalTime) }}
          </span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">产品分类：</span>
          <span class="text-sm text-gray-800">
            {{ orderDetail.productTypeName || "暂无" }}
          </span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">平台分类：</span>
          <span class="text-sm text-gray-800">
            {{ orderDetail.platTypeName }}
          </span>
        </li>
      </ul>

      <div class="mt-2">
        <div class="text-sm text-gray-500 mb-1">需求说明：</div>
        <p class="m-0 text-sm text-gray-700 whitespace-pre-wrap">
          {{ orderDetail.demandIllustrate || "暂无需求说明" }}
        </p>
      </div>
    </section>

    <!-- 空状态 -->
    <div
      v-if="!loading && !orderDetail"
      class="flex flex-col items-center justify-center py-20"
    >
      <p class="text-gray-400 text-base">订单不存在或已被删除</p>
    </div>

    <div class="h-20" />

    <footer
      v-if="orderDetail"
      class="fixed left-0 right-0 bottom-0 h-16 bg-white border-t border-gray-100 flex items-center gap-3 px-4"
    >
      <el-button
        class="flex-1 bg-gray-100 text-gray-800 h-10 inline-flex items-center justify-center gap-2"
        @click="handleContactService"
      >
        <IconifyIconOffline
          :icon="ChatLine"
          class="text-blue-400"
          style="margin-right: 8px"
        />
        联系客服
      </el-button>
      <el-button
        :type="isGrabDisabled ? 'info' : 'primary'"
        :loading="grabLoading"
        :disabled="isGrabDisabled"
        class="w-36 h-10"
        @click="handleGrabOrder"
      >
        {{ grabLoading ? "抢单中..." : grabButtonText }}
      </el-button>
    </footer>
  </div>
</template>
<style scoped>
.main-content {
  margin: 3px;
}
</style>
