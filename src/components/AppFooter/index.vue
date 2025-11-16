<!--
 * @Description: 页尾组件
 * @Author: 程前
 * @Date: 2025-01-27
-->
<script setup lang="ts">
defineOptions({
  name: "AppFooter"
});
</script>

<template>
  <footer class="bg-neutral-800 text-white pt-12 pb-3">
    <div class="container mx-auto px-6">
      <div class="flex justify-between">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-24">
          <!-- 联系我们栏 -->
          <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <ul class="space-y-2 text-sm">
              <li class="text-gray-300">服务热线</li>
              <li class="text-white">19866068760</li>
            </ul>
          </div>
        </div>
        <div class="flex justify-around w-150">
          <!-- 服务号二维码 -->
          <div class="flex flex-col items-center">
            <div class="bg-white p-1 rounded-lg mb-2">
              <div
                class="w-26 h-26 bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
              >
                <el-image
                  src="https://oms-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17829239212485.aaf"
                  class="w-full h-full"
                />
              </div>
            </div>
            <p class="text-sm text-center">
              <span class="text-blue-400">服务号：优君电商</span><br />
              <span class="text-gray-300">关注公众号</span>
            </p>
          </div>

          <!-- 客服二维码 -->
          <div class="flex flex-col items-center">
            <div class="bg-white p-1 rounded-lg mb-2">
              <div
                class="w-26 h-26 bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
              >
                <el-image
                  src="https://yjds-other.oss-cn-hangzhou.aliyuncs.com/system-basic/17982274641861.aaf"
                  class="w-full h-full"
                />
              </div>
            </div>
            <p class="text-sm text-center">
              <span class="text-blue-400">热线：19866068760</span><br />
              <span class="text-gray-300">咨询在线客服</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div
        class="pt-4 mt-4 border-t border-gray-600 text-center text-white text-xs"
      >
        <p>
          湖南优君电子商务有限公司 | 长沙市岳麓区联云路18号 ©2018-2023
          备案号:湘ICP备20210178115-1 | www.youjun168.com
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer响应式设计 */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-3 {
    gap: 12px;
  }

  .gap-24 {
    gap: 3rem;
  }

  .justify-end {
    justify-content: center;
  }
}
</style>
