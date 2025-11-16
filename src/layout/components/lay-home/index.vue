<!--
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-13 09:47:13
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-13 09:56:31
-->
<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
function goIndex() {
  router.push("/index");
}
</script>

<template>
  <div>
    <div
      class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover"
      @click="goIndex"
    >
      <IconifyIconOffline icon="ri/home-2-line" />
    </div>
  </div>
</template>
