/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-24 10:48:43
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-22 16:44:59
 */
/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-24 10:48:43
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-24 10:48:43
 */
export default {
  path: "/account",
  meta: {
    title: "账户",
    icon: "ri:account-circle-line",
    rank: 100
  },
  redirect: "/account/index",
  children: [
    {
      path: "/account/index",
      name: "myAccount",
      component: () => import("@/views/account/index.vue"),
      meta: {
        title: "我的账户",
        icon: "ri:account-circle-line",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
