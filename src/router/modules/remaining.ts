/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-14 17:06:00
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-25 10:08:24
 */
const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/index",
    name: "Index",
    component: () => import("@/views/home/index.vue"),
    meta: {
      title: "门户首页",
      showLink: false,
      rank: 101
    }
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      showLink: false,
      rank: 102
    }
  },
  {
    path: "/login/complete-info",
    name: "CompleteInfo",
    component: () => import("@/views/login/complete-info.vue"),
    meta: {
      title: "完善信息",
      showLink: false,
      rank: 104
    }
  },
  {
    path: "/orderList",
    name: "OrderList",
    meta: {
      title: "pc订单列表",
      showLink: false
    },
    component: () => import("@/views/order/index.vue")
  },
  {
    path: "/orderDetail/:id?",
    name: "orderDetail",
    meta: {
      title: "pc订单详情",
      showLink: false
    },
    component: () => import("@/views/order/order.vue")
  },
  {
    path: "/order/detail/:id",
    name: "OrderDetailPage",
    meta: {
      title: "订单详情",
      showLink: false
    },
    component: () => import("@/views/order/detail.vue")
  },
  {
    path: "/h5/orderDetial/:id?",
    name: "h5order",
    meta: {
      title: "h5订单页详情",
      showLink: false
    },
    component: () => import("@/views/phone/order.vue")
  },
  {
    path: "/redirect",
    component: Layout,
    meta: {
      title: "加载中...",
      showLink: false,
      rank: 105
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/redirect.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
