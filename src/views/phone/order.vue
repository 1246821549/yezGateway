<!--
 * @Description: 接单详情-静态页
 * @Author: 程前
 * @Date: 2025-08-13 15:05:57
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-13 16:20:48
-->
<script setup lang="ts">
import ChatLine from "~icons/ri/chat-1-line";
// function isMobileDevice() {
//   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//     navigator.userAgent
//   );
// }

defineOptions({
  name: "PhoneOrderDetail"
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="pt-4 px-4">
      <img
        class="w-full rounded-lg"
        src="@/assets/image/order/h5_order.jpg"
        alt="banner"
      />
    </div>
    <section class="mx-4 my-3 p-4 bg-white rounded-xl shadow">
      <div class="flex items-center justify-between pb-2">
        <div class="text-base font-semibold text-gray-900">
          电商设计-主图车图
          <span class="ml-1 text-lg text-gray-400">›</span>
        </div>
        <a class="text-sm text-blue-500">已派发</a>
      </div>

      <ul class="m-0 p-0 list-none">
        <li class="flex items-center flex-wrap py-2">
          <span class="text-sm text-gray-500">订单编号：</span>
          <span class="text-sm text-gray-800 flex-1 mr-1">
            4645375200561849819
          </span>
          <span
            class="ml-auto text-xs text-blue-500 bg-blue-50 rounded-md px-2 py-1"
          >
            交易成功
          </span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">派单客服：</span>
          <span class="text-sm text-gray-800">优君电商系统</span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">任务金额：</span>
          <span class="text-sm text-gray-800 font-semibold">¥50</span>
        </li>
        <li class="flex items-center flex-wrap py-2">
          <span class="text-sm text-gray-500">初稿时间：</span>
          <span class="text-sm text-gray-800">07-22 23:59</span>
          <span class="mx-2 text-gray-400">~</span>
          <span class="text-sm text-gray-500">交付时间：</span>
          <span class="text-sm text-gray-800">07-23 23:59</span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">产品分类：</span>
          <span class="text-sm text-gray-800">百货市场</span>
        </li>
        <li class="flex items-center py-2">
          <span class="text-sm text-gray-500">平台分类：</span>
          <span class="text-sm text-gray-800">淘宝天猫</span>
        </li>
      </ul>

      <div class="mt-2">
        <div class="text-sm text-gray-500 mb-1">需求说明：</div>
        <p class="m-0 text-sm text-gray-300">设计一张抱枕的主图模版</p>
      </div>
    </section>

    <div class="h-20" />

    <footer
      class="fixed left-0 right-0 bottom-0 h-16 bg-white border-t border-gray-100 flex items-center gap-3 px-4"
    >
      <el-button
        class="flex-1 bg-gray-100 text-white-800 h-10 inline-flex items-center justify-center gap-2"
      >
        <span class="pr-2">
          <IconifyIconOffline :icon="ChatLine" class="text-blue-400" />
        </span>
        联系客服
      </el-button>
      <el-button
        class="w-36 h-10 text-white opacity-90 cursor-not-allowed"
        disabled
      >
        已派发
      </el-button>
    </footer>
  </div>
</template>
<style scoped>
.main-content {
  margin: 3px;
}
</style>
