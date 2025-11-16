/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-23 09:22:26
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-23 16:04:29
 */
// const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ep/home-filled",
    title: "首页",
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "首页",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
