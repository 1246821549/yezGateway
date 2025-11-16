/** 
 * @Description: 侧边菜单栏配置
 * @Author: 程前
 * @Date: 2025-07-23 10:55:39
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-23 13:34:43
 */


export interface MenuConfig {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuConfig[];
  badge?: string | number;
  disabled?: boolean;
  // 页面配置
  pageConfig?: {
    title: string;
    description?: string;
    content?: string;
  };
}

/**
 * 后台侧边菜单配置
 * 
 * 图标使用 iconify 格式，支持以下几种方式：
 * - Element Plus 图标：ep:home-filled
 * - Remix Icon：ri:home-line
 * - 本地 SVG 图标：直接导入的组件
 * 
 * 更多图标可以在这里查找：https://icon-sets.iconify.design/
 */
export const backendMenuConfig: MenuConfig[] = [
  {
    id: "work-center",
    title: "灵工中心",
    icon: "ri:home-office-line",
    path: "/backend/index",
    pageConfig: {
      title: "灵工中心",
      description: "查看工作概览、待办事项等",
      content: "欢迎来到灵工中心！这里您可以查看所有的工作概览信息。"
    }
  },
  {
    id: "task",
    title: "任务管理",
    icon: "ri:task-line",
    children: [
      {
        id: "task-list",
        title: "灵工订单",
        icon: "ri:file-list-3-line",
        path: "/task/index",
        pageConfig: {
          title: "灵工订单",
          description: "查看和管理您的订单",
          content: "这里显示所有的订单信息"
        }
      },
      {
        id: "record-list",
        title: "免责记录",
        icon: "ri:file-shield-2-line",
        path: "/task/record",
        pageConfig: {
          title: "免责记录",
          description: "查看免责声明记录",
          content: "这里显示免责记录信息"
        }
      }
    ]
  },
  {
    id: "user-info",
    title: "用户信息",
    icon: "ri:user-3-line",
    path: "/user/info",
    pageConfig: {
      title: "用户信息",
      description: "查看和编辑个人信息",
      content: "管理您的个人资料和设置"
    }
  },
  {
    id: "my-account",
    title: "我的账户",
    icon: "ri:account-circle-line",
    path: "/account/index",
    pageConfig: {
      title: "我的账户",
      description: "账户安全设置",
      content: "管理您的账户安全和隐私设置"
    }
  },
];  