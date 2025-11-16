export default {
  path: "/task",
  meta: {
    title: "任务管理",
    icon: "ri:task-line"
  },
  redirect: "/task/index",
  children: [
    {
      path: "/task/index",
      name: "taskList",
      component: () => import("@/views/task/index.vue"),
      meta: {
        title: "灵工订单",
        icon: "ri:file-list-3-line"
      }
    },
    {
      path: "/task/record",
      name: "recordList",
      component: () => import("@/views/task/record.vue"),
      meta: {
        title: "免责记录",
        icon: "ri:file-shield-2-line"
      }
    }
  ]
} satisfies RouteConfigsTable;
