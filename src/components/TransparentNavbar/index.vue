<!--
 * @Description: 透明导航栏组件
 * @Author: 程前
 * @Date: 2025-07-22
-->
<script setup lang="ts">
import { defineEmits, computed, withDefaults } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey
} from "@/utils/auth";
import { useNav } from "@/layout/hooks/useNav";

// 导入SVG图片
import logoIcon from "@/assets/svg/logo-white.svg?component";
import logoText from "@/assets/image/home/nav-text.svg?component";
import loginLogoIcon from "@/assets/image/login/nav-logo.svg?component";
import loginLogoText from "@/assets/image/login/nav-text.svg?component";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import BackendLine from "~icons/ri/computer-line";

defineOptions({
  name: "TransparentNavbar"
});

const router = useRouter();
const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar
} = useNav();

// 定义 props
const props = withDefaults(
  defineProps<{
    theme?: "light" | "dark";
  }>(),
  {
    theme: "dark"
  }
);

// 定义事件
const emit = defineEmits<{
  register: [];
  login: [];
}>();

// 计算样式类
const ifLogin = computed(() => {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return Cookies.get(multipleTabsKey) && userInfo;
});

const navItemClass = computed(() => {
  return props.theme === "light"
    ? "text-gray-700 hover:text-blue-600"
    : "text-white/90 hover:text-white";
});

const activeNavItemClass = computed(() => {
  return props.theme === "light" ? "text-blue-600" : "text-white";
});

const underlineClass = computed(() => {
  return props.theme === "light" ? "bg-blue-600" : "bg-white";
});

const registerButtonClass = computed(() => {
  return props.theme === "light"
    ? "text-gray-700 hover:text-green-600"
    : "text-white hover:text-green-300/90";
});

const loginButtonClass = computed(() => {
  return props.theme === "light"
    ? "text-gray-700 hover:text-blue-600"
    : "text-white hover:text-yellow-200";
});

const separatorClass = computed(() => {
  return props.theme === "light" ? "text-gray-400" : "text-white/60";
});

const navbarBgClass = computed(() => {
  return props.theme === "light"
    ? "bg-white/90 border-gray-200"
    : "bg-white/10 border-white/20 border";
});

// 根据主题选择logo组件
const currentLogoIcon = computed(() => {
  return props.theme === "light" ? "logo" : "logo-white";
});

const currentLogoText = computed(() => {
  return props.theme === "light" ? loginLogoText : logoText;
});

const navItems = [
  { name: "首页", active: true, path: "/index" },
  // { name: "雇佣设计师" },
  // { name: "远程工作" },
  // { name: "案例作品" },
  { name: "灵活接单", path: "/orderList" }
];

// 处理注册
const handleRegister = () => {
  if (router.currentRoute.value.path === "/login") {
    emit("register");
  } else {
    sessionStorage.setItem("loginMode", "register");
    router.push("/login");
  }
};

// 处理登录
const handleLogin = () => {
  if (router.currentRoute.value.path === "/login") {
    emit("login");
  } else {
    router.push("/login");
  }
};

// 处理导航点击
const handleNavClick = (item: any) => {
  if (item.path) {
    router.push(item.path);
  }
};

// 返回后天
const back = () => {
  router.push("/backend");
};
</script>

<template>
  <nav id="nav-bar" class="relative z-20 w-full px-6 py-2">
    <div class="container mx-auto">
      <div
        :class="[
          'flex items-center justify-between rounded-2xl px-6 py-3',
          navbarBgClass
        ]"
      >
        <!-- 左侧Logo区域 -->
        <div class="flex items-center space-x-3">
          <!-- Logo SVG -->
          <div class="w-10 h-10 flex items-center justify-center">
            <svg-icon :name="currentLogoIcon" style="font-size: 40px" />
          </div>
          <!-- 品牌文字 SVG -->
          <div class="w-10 h-10 flex items-center scale-250 ml-8">
            <component :is="currentLogoText" />
          </div>
        </div>

        <!-- 中间导航菜单 -->
        <div class="hidden md:flex items-center space-x-8">
          <div
            v-for="item in navItems"
            :key="item.name"
            class="relative cursor-pointer group"
            @click="handleNavClick(item)"
          >
            <span
              :class="[
                navItemClass,
                'transition-colors duration-300 font-medium',
                item.active ? activeNavItemClass : ''
              ]"
            >
              {{ item.name }}
            </span>
            <!-- 悬停下划线动画 -->
            <div
              :class="[
                'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300',
                underlineClass
              ]"
            />
          </div>
        </div>

        <!-- 右侧登录注册区域 -->
        <div v-if="!ifLogin" class="flex items-center space-x-2">
          <!-- 注册按钮 -->
          <span
            :class="[
              registerButtonClass,
              'transition-colors duration-300 font-medium cursor-pointer'
            ]"
            @click="handleRegister"
          >
            注册
          </span>
          <span :class="separatorClass">|</span>
          <!-- 登录按钮 -->
          <span
            :class="[
              loginButtonClass,
              'transition-colors duration-300 font-medium cursor-pointer'
            ]"
            @click="handleLogin"
          >
            登录
          </span>
        </div>
        <div v-else class="info-box">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link navbar-bg-hover select-none">
              <img :src="userAvatar" :style="avatarsStyle" />
              <p v-if="username" class="dark:text-white">{{ username }}</p>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="logout">
                <el-dropdown-item @click="back">
                  <IconifyIconOffline :icon="BackendLine" style="margin: 5px" />
                  返回后台
                </el-dropdown-item>
                <el-dropdown-item @click="logout">
                  <IconifyIconOffline
                    :icon="LogoutCircleRLine"
                    style="margin: 5px"
                  />
                  退出系统
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 确保导航栏覆盖在轮播图上方 */
#nav-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
}
.info-box {
  .el-dropdown-link {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 48px;
    padding: 10px;
    color: #000000d9;
    cursor: pointer;

    p {
      font-size: 14px;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
  .el-dropdown-link:hover {
    background-color: transparent;
  }
}
</style>
