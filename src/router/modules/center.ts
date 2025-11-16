/**
 * @Description:中西
 * @Author: 程前
 * @Date: 2025-07-23 15:48:37
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-23 16:02:19
 */
// const { VITE_HIDE_HOME } = import.meta.env;
// const Layout = () => import("@/layout/index.vue");

export default {
  path: "/backend",
  meta: {
    title: "灵工中心",
    icon: "ri:home-office-line",
    rank: 0
  },
  redirect: "/backend/index",
  children: [
    {
      path: "/backend/index",
      name: "WorkCenter",
      component: () => import("@/views/backend/index.vue"),
      meta: {
        title: "灵工中心",
        icon: "ri:home-office-line",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
