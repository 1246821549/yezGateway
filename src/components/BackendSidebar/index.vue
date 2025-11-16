<!--
 * @Description: 后台侧边栏菜单组件
 * @Author: 程前
 * @Date: 2025-07-23
-->
<template>
  <div :class="['backend-sidebar', { collapsed: sidebarCollapsed }]">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div v-if="!sidebarCollapsed" class="logo-container">
        <el-icon size="24" color="#409EFF">
          <House />
        </el-icon>
        <span class="title">菜单</span>
      </div>
      <el-button @click="toggleSidebar" :icon="sidebarCollapsed ? ArrowRight : ArrowLeft" circle size="small"
        type="primary" plain />
    </div>

    <!-- Element Plus 菜单 -->
    <div class="menu-container">
      <el-menu :default-active="currentPage" :collapse="sidebarCollapsed" :collapse-transition="false"
        background-color="#34495e" text-color="#ffffff" active-text-color="#409EFF" @select="handleMenuSelect">
        <template v-for="menu in backendMenuConfig" :key="menu.id">
          <!-- 有子菜单的项目 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.id">
            <template #title>
              <el-icon v-if="menu.icon">
                <component :is="useRenderIcon(menu.icon)" />
              </el-icon>
              <span>{{ menu.title }}</span>
              <el-badge v-if="menu.badge" :value="menu.badge" class="menu-badge" />
            </template>
            <el-menu-item v-for="child in menu.children" :key="child.id" :index="child.id">
              <el-icon v-if="child.icon">
                <component :is="useRenderIcon(child.icon)" />
              </el-icon>
              <template #title>
                <span>{{ child.title }}</span>
                <el-badge v-if="child.badge" :value="child.badge" class="menu-badge" />
              </template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单的项目 -->
          <el-menu-item v-else :index="menu.id">
            <el-icon v-if="menu.icon">
              <component :is="useRenderIcon(menu.icon)" />
            </el-icon>
            <template #title>
              <span>{{ menu.title }}</span>
              <el-badge v-if="menu.badge" :value="menu.badge" class="menu-badge" />
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { backendMenuConfig, type MenuConfig } from '@/config/menu';
import { House, ArrowRight, ArrowLeft } from "@element-plus/icons-vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const router = useRouter();
const route = useRoute();

// 当前激活的页面
const currentPage = ref('work-center');

// 侧边栏是否折叠
const sidebarCollapsed = ref(false);

// 菜单选中处理 - 使用路由跳转
const handleMenuSelect = (index: string) => {
  const menuConfig = findPageConfig(index);
  if (menuConfig?.path) {
    router.push(menuConfig.path);
    console.log('路由跳转到:', menuConfig.path);
  }
};

// 递归查找当前页面配置
const findPageConfig = (menuId: string, menus: MenuConfig[] = backendMenuConfig): MenuConfig | null => {
  for (const menu of menus) {
    if (menu.id === menuId) {
      return menu;
    }
    if (menu.children) {
      const found = findPageConfig(menuId, menu.children);
      if (found) return found;
    }
  }
  return null;
};

// 根据路由路径查找菜单ID
const findMenuIdByPath = (path: string, menus: MenuConfig[] = backendMenuConfig): string | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu.id;
    }
    if (menu.children) {
      const found = findMenuIdByPath(path, menu.children);
      if (found) return found;
    }
  }
  return null;
};

// 监听路由变化，更新当前激活的菜单
watch(() => route.path, (newPath) => {
  const menuId = findMenuIdByPath(newPath);
  if (menuId) {
    currentPage.value = menuId;
  }
}, { immediate: true });

// 切换侧边栏折叠
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 暴露给父组件的方法和状态
defineExpose({
  sidebarCollapsed,
  toggleSidebar
});
</script>

<style scoped lang="scss">
.backend-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  
  :deep(.el-menu) {
    border-right: none;
  }
  
  :deep(.el-menu-item) {
    &.is-active {
      background-color: #409EFF !important;
      color: #fff;
    }
  }
  
  :deep(.el-sub-menu__title) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
  }
}

.menu-badge {
  margin-left: 8px;
}
</style> 