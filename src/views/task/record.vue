<!--
 * @Description: 免责记录页面
 * @Author: 程前
 * @Date: 2025-07-24 09:34:15
 * @LastEditors: 程前
 * @LastEditTime: 2025-07-24 09:51:55
-->
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh, CopyDocument } from "@element-plus/icons-vue";
import {
  getExemptionHistoryList,
  type ExemptionHistoryItem
} from "@/api/order";

defineOptions({
  name: "recordList"
});

// 搜索表单数据
const searchForm = reactive({
  orderNumber: "", // 订单编号
  dateRange: [], // 时间范围
  exemptionType: "", // 免责类型
  approvalStatus: "" // 申核状态
});

// 表格数据
const tableData = ref<ExemptionHistoryItem[]>([]);

// 免责类型选项
const exemptionTypeOptions = [
  { label: "初稿免责", value: "初稿免责" },
  { label: "终稿免责", value: "终稿免责" },
  { label: "改派免责", value: "改派免责" },
  { label: "退单免责", value: "退单免责" }
];

// 申核状态选项
const approvalStatusOptions = [
  { label: "未处理", value: 0 },
  { label: "已处理", value: 1 },
  { label: "已拒绝", value: 2 }
];

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

// 加载状态
const loading = ref(false);

// 数据清理函数，确保字段类型正确
const cleanApiData = (data: ExemptionHistoryItem[]): ExemptionHistoryItem[] => {
  return data.map(item => ({
    ...item,
    disclaimerRmark: item.disclaimerRmark ? String(item.disclaimerRmark) : "",
    disclaimerReason: item.disclaimerReason
      ? String(item.disclaimerReason)
      : "",
    disclaimerType: item.disclaimerType ? String(item.disclaimerType) : "",
    replyContent: item.replyContent ? String(item.replyContent) : "",
    isStateName: item.isStateName ? String(item.isStateName) : "",
    orderNumber: item.orderNumber ? String(item.orderNumber) : "",
    createTime: item.createTime ? String(item.createTime) : ""
  }));
};

// 获取免责记录列表
const fetchExemptionHistory = async () => {
  try {
    loading.value = true;

    const params = {
      page: pagination.current,
      pageSize: pagination.size,
      isState:
        searchForm.approvalStatus !== ""
          ? Number(searchForm.approvalStatus)
          : null,
      orderNumber: searchForm.orderNumber || "",
      beginTime:
        searchForm.dateRange && searchForm.dateRange[0]
          ? searchForm.dateRange[0]
          : "",
      endTime:
        searchForm.dateRange && searchForm.dateRange[1]
          ? searchForm.dateRange[1]
          : "",
      disclaimerType: searchForm.exemptionType || ""
    };

    const response = await getExemptionHistoryList(params);

    if (response.code === 200) {
      // 新的API结构：result包含items数组和分页信息
      const result = response.result;
      if (result && Array.isArray(result.items)) {
        tableData.value = cleanApiData(result.items);
        pagination.total = result.total || 0;
        pagination.current = result.page || 1;
        pagination.size = result.pageSize || 10;
      } else {
        tableData.value = [];
        pagination.total = 0;
        console.warn("API返回的result结构不正确:", result);
      }
    } else {
      ElMessage.error(response.message || "获取数据失败");
    }
  } catch (error) {
    console.error("获取免责记录失败:", error);
    ElMessage.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  pagination.current = 1;
  fetchExemptionHistory();
};

// 重置搜索
const handleReset = () => {
  searchForm.orderNumber = "";
  searchForm.dateRange = [];
  searchForm.exemptionType = "";
  searchForm.approvalStatus = "";
  pagination.current = 1;
  fetchExemptionHistory();
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchExemptionHistory();
};

// 页面大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  fetchExemptionHistory();
};

// 页面加载时获取数据
onMounted(() => {
  fetchExemptionHistory();
});

// 获取状态标签类型
const getStatusTagType = (status: any) => {
  if (!status || typeof status !== "string") {
    return "info";
  }
  switch (status) {
    case "已处理":
      return "success";
    case "未处理":
      return "warning";
    case "已拒绝":
      return "danger";
    default:
      return "info";
  }
};

// 获取免责类型标签类型
const getExemptionTypeTagType = (disclaimerType: any) => {
  if (!disclaimerType || typeof disclaimerType !== "string") {
    return "info";
  }
  switch (disclaimerType) {
    case "初稿免责":
      return "success";
    case "终稿免责":
      return "primary";
    case "改派免责":
      return "warning";
    case "退单免责":
      return "info";
    default:
      return "info";
  }
};

// 查看详情
const handleView = (row: any) => {
  console.log("查看详情:", row);
  ElMessage.info("查看详情功能");
};

// 编辑操作
const handleEdit = (row: any) => {
  console.log("编辑记录:", row);
  ElMessage.info("编辑功能");
};

// 复制订单号
const copyOrderNumber = async (orderNumber: string) => {
  try {
    await navigator.clipboard.writeText(orderNumber);
    ElMessage.success("订单号已复制到剪贴板");
  } catch (error) {
    // 降级处理：使用传统方法
    const textArea = document.createElement("textarea");
    textArea.value = orderNumber;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      ElMessage.success("订单号已复制到剪贴板");
    } catch (fallbackError) {
      ElMessage.error("复制失败，请手动复制");
    }
    document.body.removeChild(textArea);
  }
};
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- 搜索区域 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="订单编号">
          <el-input
            v-model="searchForm.orderNumber"
            placeholder="输入订单编号"
            clearable
            class="w-48"
          />
        </el-form-item>

        <el-form-item label="时间周期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="年/月/日"
            end-placeholder="年/月/日"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            class="w-64"
          />
        </el-form-item>

        <el-form-item label="免责类型">
          <el-select
            v-model="searchForm.exemptionType"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in exemptionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="申核状态">
          <el-select
            v-model="searchForm.approvalStatus"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="item in approvalStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            :loading="loading"
            class="bg-blue-600 hover:bg-blue-700"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button :icon="Refresh" class="ml-2" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="bg-white rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        class="custom-table"
      >
        <el-table-column prop="orderNumber" label="订单编号" width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-icon
                class="text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                title="复制订单号"
                @click="copyOrderNumber(row.orderNumber)"
              >
                <CopyDocument />
              </el-icon>
              <span class="text-blue-600 cursor-pointer hover:underline">
                {{ row.orderNumber }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="createTime"
          label="申请时间"
          width="190"
          sortable
        />

        <el-table-column prop="disclaimerType" label="免责类型" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getExemptionTypeTagType(row.disclaimerType)"
              size="small"
            >
              {{ row.disclaimerType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="disclaimerReason" label="免责理由" width="150" />

        <el-table-column prop="disclaimerRmark" label="免责原因" width="220">
          <template #default="{ row }">
            <el-tooltip
              v-if="
                row.disclaimerRmark &&
                typeof row.disclaimerRmark === 'string' &&
                row.disclaimerRmark.length > 15
              "
              :content="row.disclaimerRmark"
              placement="top"
            >
              <span>{{ row.disclaimerRmark.slice(0, 15) }}...</span>
            </el-tooltip>
            <span v-else>{{ row.disclaimerRmark || "-" }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="replyContent" label="申核回复" width="200">
          <template #default="{ row }">
            <span v-if="row.replyContent">{{ row.replyContent }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="isStateName" label="申核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.isStateName)" size="small">
              {{ row.isStateName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right">
          <!-- <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
          </template> -->
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination-custom"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 响应式适配
@media (width <= 1200px) {
  .search-form {
    .el-form-item {
      margin-right: 12px;
    }
  }
}

@media (width <= 768px) {
  .p-6 {
    padding: 1rem;
  }

  .search-form {
    .el-form-item {
      display: block;
      margin-right: 0;
    }
  }
}

.search-form {
  .el-form-item {
    margin-bottom: 16px;
  }

  .el-form-item__label {
    font-weight: 500;
    color: #333;
  }
}

.custom-table {
  .el-table__header {
    th {
      font-weight: 600;
      color: #333;
      background-color: #f8f9fa;
    }
  }

  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.pagination-custom {
  :deep(.el-pagination__total) {
    color: #666;
  }
}

:deep(.el-select) {
  min-width: 100px;
}
</style>
