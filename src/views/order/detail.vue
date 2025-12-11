<!--
 * @Description: 订单详情页面
 * @Author: 程前
 * @Date: 2025-10-30 10:22:15
 * @LastEditors: 程前
 * @LastEditTime: 2025-12-11 16:37:31
-->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey, multipleTabsKey } from "@/utils/auth";
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import FixedSideBar from "@/components/FixedSidebar/index.vue";
import {
  getHomeOrderDetailById,
  checkSeizeOrder,
  seizeOrder,
  type OrderDetailInfo,
  type SeizeOrderCheckResponse
} from "@/api/order";

defineOptions({
  name: "OrderDetailPage"
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
    if (!id && id !== 0) {
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
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * 计算相对时间
 */
const getRelativeTime = (timeStr: string) => {
  if (!timeStr) return "";
  const now = new Date();
  const time = new Date(timeStr);
  const diff = now.getTime() - time.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}分钟前发布`;
  } else if (hours < 24) {
    return `${hours}小时前发布`;
  } else {
    return `${days}天前发布`;
  }
};

/**
 * 处理参考图片（可能是多张，逗号分隔）
 */
const referPictureList = computed(() => {
  if (!orderDetail.value?.referPicture) return [];
  // 按逗号分割，并过滤空字符串
  return orderDetail.value.referPicture
    .split(",")
    .map(url => url.trim())
    .filter(url => url.length > 0);
});

/**
 * 抢单按钮文本
 */
const grabButtonText = computed(() => {
  if (!orderDetail.value) return "加载中...";
  if (orderDetail.value.distributionState === 1) return "已派发";
  if (orderDetail.value.isSeize === 1) return "已抢单";
  return "我要抢单";
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

onMounted(() => {
  fetchOrderDetail();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 pt-24 pb-10">
    <TransparentNavbar :theme="'light'" />
    <FixedSideBar />

    <div v-loading="loading" class="container mx-auto px-6">
      <!-- 订单详情卡片 -->
      <el-card v-if="orderDetail" shadow="hover" class="mt-8">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <el-tag
                v-if="orderDetail.isEmergent === 1"
                type="danger"
                size="large"
              >
                紧急
              </el-tag>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ orderDetail.orderTypeName }}
              </h1>
            </div>
            <div class="flex text-right">
              <span class="text-black-600 text-2xl">任务金额：</span>
              <p class="text-red-500 text-2xl font-bold">
                ￥{{ orderDetail.taskAmount }}
              </p>
            </div>
          </div>
        </template>

        <!-- 订单信息 -->
        <div class="space-y-4 mb-6">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">
              {{ orderDetail.orderNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="平台类型">
              {{ orderDetail.platTypeName }}
            </el-descriptions-item>
            <el-descriptions-item label="产品类型">
              {{ orderDetail.productTypeName || "暂无" }}
            </el-descriptions-item>
            <el-descriptions-item label="平台名称">
              {{ orderDetail.platformName || "暂无" }}
            </el-descriptions-item>
            <el-descriptions-item label="初稿时间">
              {{ formatTime(orderDetail.firstDraftTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="终稿时间">
              {{ formatTime(orderDetail.finalTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="发布时间" :span="2">
              {{ formatTime(orderDetail.createTime) }}
              <span class="text-gray-400 ml-2">
                ({{ getRelativeTime(orderDetail.createTime) }})
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <!-- 需求说明 -->
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">需求说明</h2>
          <p class="text-gray-700 leading-7 whitespace-pre-wrap">
            {{ orderDetail.demandIllustrate || "暂无需求说明" }}
          </p>
        </div>

        <!-- 参考资料 -->
        <div
          v-if="orderDetail.referWebsite || orderDetail.referPicture"
          class="mb-6"
        >
          <el-divider />
          <h2 class="text-xl font-bold text-gray-900 mb-4">参考资料</h2>
          <div class="space-y-3">
            <div v-if="orderDetail.referWebsite">
              <span class="text-gray-600">参考网站：</span>
              <el-link
                :href="orderDetail.referWebsite"
                type="primary"
                target="_blank"
              >
                {{ orderDetail.referWebsite }}
              </el-link>
            </div>
            <div v-if="referPictureList.length > 0">
              <span class="text-gray-600 block mb-2">参考图片：</span>
              <div class="flex flex-wrap gap-3">
                <el-image
                  v-for="(img, index) in referPictureList"
                  :key="index"
                  :src="img"
                  :preview-src-list="referPictureList"
                  :initial-index="index"
                  fit="cover"
                  class="w-40 h-40 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  :preview-teleported="true"
                />
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <!-- 发布人信息和抢单按钮 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <el-avatar :size="50" :src="orderDetail.adminTx">
              {{ orderDetail.adminName?.charAt(0) || "客" }}
            </el-avatar>
            <div>
              <p class="text-base font-medium text-gray-900">
                {{ orderDetail.adminName || "优君电商系统" }}
              </p>
              <p class="text-sm text-gray-500">
                {{ getRelativeTime(orderDetail.createTime) }}
              </p>
            </div>
          </div>

          <el-button
            type="primary"
            size="large"
            :loading="grabLoading"
            :disabled="isGrabDisabled"
            @click="handleGrabOrder"
          >
            {{ grabLoading ? "抢单中..." : grabButtonText }}
          </el-button>
        </div>
      </el-card>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && !orderDetail"
        description="订单不存在或已被删除"
        :image-size="200"
      />
    </div>
  </div>
  <!-- 页尾 -->
  <AppFooter />
</template>

<style scoped>
:deep(.el-card__header) {
  padding: 24px;
  background-color: #f9fafb;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.el-descriptions__content) {
  color: #6b7280;
}

/* 参考图片样式 */
:deep(.el-image) {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
}

:deep(.el-image__inner) {
  object-fit: cover;
}
</style>
