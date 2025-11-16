<!--
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-12 16:29:29
 * @LastEditors: 程前
 * @LastEditTime: 2025-09-20 10:15:47
-->
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  name: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: ""
});

// 生成图标名称，与vite.config.ts中的symbolId配置对应
const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return "svg-icon";
});
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentcolor;
}
</style>
