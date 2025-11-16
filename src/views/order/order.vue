<!--
 * @Description: 职位详情（TailwindCSS）
 * @Author: 程前
 * @Date: 2025-08-13 16:55:12
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-13 17:21:34
-->
<script setup lang="ts">
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import FixedSideBar from "@/components/FixedSidebar/index.vue";

defineOptions({
  name: "OrderDetail"
});

// 静态示例数据
const job = {
  title: "平面设计",
  cycle: "1个月",
  experience: "五年以上",
  salary: "￥ 100元/月",
  description:
    "负责公司内部日常图文海报设计 每天2-3张 主要用于发布公众号，小红薯等 预算工资：3000元每月",
  publishTime: "1年前发布",
  appliedCount: 243
};

const avatars = new Array(5).fill(0).map((_, i) => ({
  id: i + 1,
  src: new URL("../../assets/user.jpg", import.meta.url).href
}));
</script>

<template>
  <div class="min-h-screen bg-gray-100 pt-24 pb-10">
    <TransparentNavbar :theme="'light'" />
    <FixedSideBar />
    <div class="pt-4">
      <img
        class="w-full rounded-lg"
        src="@/assets/image/order/pc_order.png"
        alt="banner"
      />
    </div>
    <div class="container mx-auto px-6 pt-10">
      <div class="bg-white rounded-xl shadow p-6 md:p-8">
        <!-- 标题与薪资 -->
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ job.title }}</h1>
            <p class="mt-4 text-gray-500">
              {{ job.cycle }}
              <span class="mx-2">|</span>
              {{ job.experience }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-red-500 text-3xl font-bold">{{ job.salary }}</p>
          </div>
        </div>

        <div class="my-6 border-t border-gray-200" />

        <!-- 职位描述 -->
        <h2 class="text-2xl font-bold text-gray-900 mb-4">职位描述</h2>
        <p class="text-gray-700 leading-7">
          {{ job.description }}
        </p>
        <p class="text-gray-400 text-sm mt-4">{{ job.publishTime }}</p>

        <div class="my-6 border-t border-gray-200" />

        <!-- 投递与头像 -->
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div class="flex items-center">
            <span class="text-gray-600">
              已有 {{ job.appliedCount }} 人投递
            </span>
            <div class="ml-3 flex -space-x-3">
              <img
                v-for="item in avatars"
                :key="item.id"
                :src="item.src"
                alt="avatar"
                class="w-9 h-9 rounded-full ring-2 ring-white object-cover"
              />
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full md:w-auto h-12 px-10 rounded-md text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors"
          >
            我要投递
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <!-- 顶部导航与侧边栏 -->
  <!-- 页尾 -->
  <AppFooter />
</template>
