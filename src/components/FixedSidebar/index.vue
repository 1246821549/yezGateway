<!--
 * @Description: 固定侧边栏组件
 * @Author: 程前
 * @Date: 2025-01-14
-->
<script setup lang="ts">
import { ref, computed } from "vue";
import { Service, Postcard, Help, Share, Top } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey
} from "@/utils/auth";
// 侧边栏悬停状态
const hoveredItem = ref(null);

const router = useRouter();

// 侧边栏配置
const sidebarItems = [
  {
    id: "consult",
    icon: Service,
    text: "在线咨询",
    hoverImage:
      "https://yjds-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17982274641861.aaf"
  },
  {
    id: "employee",
    icon: Postcard,
    text: "员工入驻",
    hoverImage: null
  },
  {
    id: "service",
    icon: Help,
    text: "服务号",
    hoverImage:
      "https://oms-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17829239212485.aaf"
  },
  {
    id: "cooperation",
    icon: Share,
    text: "商务合作",
    hoverImage:
      "https://oms-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17829491979845.aaf"
  },
  {
    id: "backtop",
    icon: Top,
    text: "回顶部",
    hoverImage: null
  }
];

// 回顶部功能
const scrollToTop = () => {
  // 优先滚动主内容区域的scrollbar
  const scrollbarWrap = document.querySelector(".app-main .el-scrollbar__wrap");
  if (scrollbarWrap) {
    scrollbarWrap.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  } else {
    // 如果没有找到scrollbar，则滚动window
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
};

// 计算样式类
const ifLogin = computed(() => {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return Cookies.get(multipleTabsKey) && userInfo;
});

// 处理侧边栏项目点击
const handleSidebarClick = item => {
  if (item.id === "backtop") {
    scrollToTop();
  } else if (item.id === "employee") {
    // 跳转注册或其他逻辑
    ifLogin.value ? router.push("/backend") : router.push("/login");
  } else if (item.id === "consult") {
    // 在线咨询逻辑
    console.log("在线咨询");
  } else if (item.id === "service") {
    // 服务号逻辑
    console.log("服务号");
  } else if (item.id === "cooperation") {
    // 商务合作逻辑
    console.log("商务合作");
  }
};
</script>

<template>
  <!-- 右侧固定侧边栏 -->
  <div class="fixed right-4 top-1/2 -translate-y-1/2 z-50 space-y-2">
    <div
      v-for="item in sidebarItems"
      :key="item.id"
      class="relative group"
      @mouseenter="hoveredItem = item.id"
      @mouseleave="hoveredItem = null"
    >
      <!-- 侧边栏按钮 -->
      <div
        class="w-16 h-16 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 text-white text-center bg-neutral-600 hover:bg-neutral-800 backdrop-blur shadow-lg hover:shadow-2xl"
        @click="handleSidebarClick(item)"
      >
        <el-icon class="text-lg mb-1">
          <component :is="item.icon" />
        </el-icon>
        <div class="text-xs leading-tight">{{ item.text }}</div>
      </div>

      <!-- 悬停时显示的图片 -->
      <div
        v-if="item.hoverImage && hoveredItem === item.id"
        class="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl min-w-[150px] animate-in slide-in-from-right-5 duration-300"
      >
        <el-image
          :src="item.hoverImage"
          :alt="item.text"
          class="w-full h-full"
        />
        <!-- 箭头指示器 -->
        <div
          class="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-white border-t-4 border-b-4 border-t-transparent border-b-transparent"
        />
      </div>
    </div>
  </div>
</template>
