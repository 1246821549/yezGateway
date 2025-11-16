/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-23 17:14:19
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-23 17:14:44
 */
/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-23 17:14:19
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-23 17:14:19
 */
export default {
  path: "/user",
  meta: {
    title: "用户",
    icon: "ri:user-3-line"
  },
  redirect: "/user/info",
  children: [
    {
      path: "/user/info",
      name: "userInfo",
      component: () => import("@/views/user/info.vue"),
      meta: {
        title: "用户信息",
        icon: "ri:user-3-line",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
