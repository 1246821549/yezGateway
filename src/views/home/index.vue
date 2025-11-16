<!--
 * @Description: 首页
 * @Author: 程前
 * @Date: 2025-07-14 17:06:00
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-13 16:40:16
-->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import FixedSideBar from "@/components/FixedSidebar/index.vue";
import {
  getOrderTypeList,
  getOrderDetailPage,
  type OrderTypeItem,
  type OrderDetailPageItem
} from "@/api/order";

defineOptions({
  name: "Welcome"
});

const router = useRouter();

// 订单类型列表
const orderTypes = ref<OrderTypeItem[]>([]);
// 选中的订单类型ID
const selectedTypeId = ref<number | undefined>(undefined);
// 订单列表
const orderList = ref<OrderDetailPageItem[]>([]);
// 加载状态
const loading = ref(false);

/**
 * 获取订单类型列表
 */
const fetchOrderTypes = async () => {
  try {
    const response = await getOrderTypeList({ pid: 0, isHide: true });
    console.log("订单类型返回数据:", response);
    if (response.code === 200) {
      orderTypes.value = response.result || [];
      console.log("订单类型列表:", orderTypes.value);
    } else {
      console.error("获取订单类型失败:", response.message);
    }
  } catch (error) {
    console.error("获取订单类型失败:", error);
  }
};

/**
 * 获取订单列表
 */
const fetchOrderList = async (orderTypeId?: number) => {
  try {
    loading.value = true;
    const requestData = {
      page: 1,
      pageSize: 12,
      orderTypeId: orderTypeId
    };
    const response = await getOrderDetailPage(requestData);
    if (response.code === 200) {
      orderList.value = response.result.items;
    } else {
      console.error("获取订单列表失败:", response);
      ElMessage.error(response.message || "获取订单列表失败");
    }
  } catch (error) {
    console.error("获取订单列表异常:", error);
    ElMessage.error("获取订单列表失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 切换订单类型
 */
const handleTypeChange = (typeId?: number) => {
  selectedTypeId.value = typeId;
  fetchOrderList(typeId);
};

/**
 * 查看更多订单
 */
const handleViewMore = () => {
  router.push("/orderList");
};

/**
 * 查看订单详情（新标签页打开）
 */
const handleViewDetail = (orderId: number) => {
  const routeUrl = router.resolve({
    name: "OrderDetailPage",
    params: { id: orderId }
  });
  window.open(routeUrl.href, "_blank");
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
 * 格式化时间
 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `初稿时间:${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 导航栏动画
onMounted(() => {
  fetchOrderTypes();
  fetchOrderList();
});

// 处理注册
const handleRegister = () => {
  console.log("跳转注册页面");
};
</script>

<template>
  <div class="min-h-screen">
    <!-- 透明导航栏 -->
    <TransparentNavbar @register="handleRegister" />
    <!-- 侧边栏 -->
    <FixedSideBar />
    <!-- 轮播图区域 -->
    <div class="relative z-10 w-full">
      <el-carousel
        height="615px"
        :interval="4000"
        arrow="hover"
        class="home-carousel"
      >
        <el-carousel-item>
          <div class="carousel-item">
            <img
              src="@/assets/image/home/carousel-0.jpg"
              alt="轮播图1"
              class="w-full h-full object-cover"
            />
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="carousel-item">
            <img
              src="@/assets/image/home/carousel-1.png"
              alt="轮播图2"
              class="w-full h-full object-cover"
            />
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 bg-gray-50 min-h-screen py-8">
      <div class="container mx-auto px-6">
        <!-- 竞价接单区域 -->
        <div class="mb-12">
          <!-- 标题和筛选区域 -->
          <div class="flex items-center justify-between pb-6 flex-wrap gap-4">
            <div class="flex items-center flex-wrap gap-4">
              <h2 class="text-2xl font-bold text-gray-800">灵活接单</h2>

              <!-- 订单类型筛选 -->
              <div class="flex items-center flex-wrap gap-2">
                <el-button
                  :type="selectedTypeId === undefined ? 'primary' : ''"
                  size="default"
                  round
                  @click="handleTypeChange(undefined)"
                >
                  全部
                </el-button>
                <el-button
                  v-for="type in orderTypes"
                  :key="type.id"
                  :type="selectedTypeId === type.id ? 'primary' : ''"
                  size="default"
                  round
                  @click="handleTypeChange(type.id)"
                >
                  {{ type.name }}
                </el-button>
              </div>
            </div>

            <!-- 查看更多按钮 -->
            <el-button type="primary" link @click="handleViewMore">
              查看更多
              <el-icon class="ml-1">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"
                  />
                </svg>
              </el-icon>
            </el-button>
          </div>

          <!-- 接单卡片列表 -->
          <div
            v-loading="loading"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <el-card
              v-for="order in orderList"
              :key="order.id"
              shadow="hover"
              class="order-card cursor-pointer"
              :body-style="{ padding: '20px' }"
              @click="handleViewDetail(order.id)"
            >
              <!-- 卡片头部：标题和状态 -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-start gap-2 flex-1">
                  <!-- 特殊标签 -->
                  <el-tag
                    v-if="order.isEmergent === 1"
                    type="danger"
                    size="small"
                    class="special-tag"
                  >
                    海量天单
                  </el-tag>
                  <!-- 订单标题 -->
                  <h3 class="text-base font-semibold text-gray-800 leading-6">
                    {{ order.orderTypeName || "订单" }}
                  </h3>
                </div>
                <!-- 派发状态 -->
                <el-tag
                  :type="order.isDistribute === 0 ? 'primary' : 'info'"
                  size="small"
                  class="status-tag"
                >
                  {{ order.isDistribute === 0 ? "派发中" : "已派发" }}
                </el-tag>
              </div>

              <!-- 初稿时间 -->
              <div class="mb-3">
                <p class="text-sm text-gray-500">
                  {{ formatTime(order.firstDraftTime) }}
                </p>
              </div>

              <!-- 需求说明 -->
              <div class="mb-4 order-description">
                <p class="text-sm text-gray-600 line-clamp-2">
                  {{ order.demandIllustrate || "暂无需求说明" }}
                </p>
              </div>

              <!-- 底部信息：客户和价格 -->
              <div
                class="flex items-center justify-between pt-3 border-t border-gray-100"
              >
                <div class="flex items-center space-x-2">
                  <el-avatar :size="32" class="bg-gray-300 text-gray-600">
                    {{
                      order.realName?.charAt(0) ||
                      order.platName?.charAt(0) ||
                      "客"
                    }}
                  </el-avatar>
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-700 font-medium">
                      {{ order.realName || order.platName || "优君电商系统" }}
                    </span>
                    <span class="text-xs text-gray-400">
                      {{ getRelativeTime(order.createTime) }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p
                    :class="[
                      'text-2xl font-bold',
                      order.isDistribute === 0
                        ? 'text-red-500'
                        : 'text-gray-400'
                    ]"
                  >
                    ￥{{ order.taskAmount || 0 }}
                  </p>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="!loading && orderList.length === 0"
            description="暂无订单数据"
            :image-size="200"
          />
        </div>
      </div>
    </div>

    <!-- 右侧固定侧边栏已抽离到全局组件 -->

    <!-- 页尾区域 -->
    <AppFooter />
  </div>
</template>

<style scoped>
/* 轮播图样式 */
.home-carousel {
  width: 100%;
}

.carousel-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 订单卡片样式 */
.order-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  height: 100%;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 特殊标签样式 */
.special-tag {
  flex-shrink: 0;
}

/* 状态标签样式 */
.status-tag {
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
}

/* 需求说明区域 */
.order-description {
  min-height: 40px;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* Element Plus Avatar 自定义 */
:deep(.el-avatar) {
  background-color: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
}

/* Element Plus Card 自定义 */
:deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 侧边栏样式已迁移到独立组件 */
</style>
