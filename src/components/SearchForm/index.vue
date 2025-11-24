<!--
 * @Description: 老项目移植过来的通用搜索表单组件
 * @Author: 程前
 * @Date: 2025-07-24 09:33:25
 * @LastEditors: 程前
 * @LastEditTime: 2025-11-24 17:47:26
-->
<script setup lang="ts">
import { reactive, watch } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";

export interface SearchFieldConfig {
  type: "input" | "select" | "date-range" | "checkbox" | "date";
  field: string;
  label?: string;
  placeholder?: string;
  width?: string; // Tailwind 宽度类名，如 'w-80', 'w-96'
  options?: Array<{ label: string; value: any }>; // 用于 select
  clearable?: boolean;
  format?: string; // 用于日期
  valueFormat?: string; // 用于日期
  trueValue?: any; // 用于 checkbox
  falseValue?: any; // 用于 checkbox
}

interface Props {
  fields: SearchFieldConfig[];
  loading?: boolean;
  modelValue?: Record<string, any>;
}

interface Emits {
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "search"): void;
  (e: "reset"): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  modelValue: () => ({})
});

const emit = defineEmits<Emits>();

// 初始化表单数据
const formData = reactive<Record<string, any>>({ ...props.modelValue });

// 监听表单数据变化
watch(
  formData,
  newVal => {
    emit("update:modelValue", { ...newVal });
  },
  { deep: true }
);

// 监听外部传入的 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    Object.keys(newVal).forEach(key => {
      formData[key] = newVal[key];
    });
  },
  { deep: true }
);

// 搜索
const handleSearch = () => {
  emit("search");
};

// 重置
const handleReset = () => {
  // 重置所有字段
  props.fields.forEach(field => {
    if (field.type === "checkbox") {
      formData[field.field] = field.falseValue ?? undefined;
    } else if (field.type === "date-range") {
      formData[field.field] = [];
    } else {
      formData[field.field] = "";
    }
  });
  emit("reset");
};

// 获取字段宽度 - 转换为实际的 style 对象
const getFieldStyle = (field: SearchFieldConfig) => {
  let width = field.width;

  // 如果没有指定宽度，使用默认值
  if (!width) {
    switch (field.type) {
      case "date-range":
        width = "w-96";
        break;
      case "checkbox":
        width = "w-auto";
        break;
      default:
        width = "w-80";
        break;
    }
  }

  // 解析宽度值
  let parsedWidth = width;

  // 如果是 w-数字 格式，转换为像素值
  if (width.startsWith("w-")) {
    const numStr = width.substring(2);

    // 标准 Tailwind 宽度映射 (rem 转 px，1rem = 16px)
    const standardWidths: Record<string, string> = {
      "48": "192px", // 12rem
      "52": "208px", // 13rem
      "64": "256px", // 16rem
      "80": "320px", // 20rem
      "96": "384px", // 24rem
      auto: "auto"
    };

    if (standardWidths[numStr]) {
      parsedWidth = standardWidths[numStr];
    } else {
      // 自定义数字，直接作为像素值
      parsedWidth = numStr + "px";
    }
  }

  return {
    width: parsedWidth,
    minWidth: parsedWidth,
    maxWidth: parsedWidth,
    flex: parsedWidth === "auto" ? "0 0 auto" : `0 0 ${parsedWidth}`
  };
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <el-form :model="formData" class="search-form">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- 动态渲染表单项 -->
        <template v-for="field in fields" :key="field.field">
          <!-- 输入框 -->
          <div
            v-if="field.type === 'input'"
            class="search-field-wrapper"
            :style="getFieldStyle(field)"
          >
            <el-form-item :label="field.label">
              <el-input
                v-model="formData[field.field]"
                :placeholder="field.placeholder || '请输入'"
                :clearable="field.clearable !== false"
              />
            </el-form-item>
          </div>

          <!-- 下拉选择 -->
          <div
            v-else-if="field.type === 'select'"
            class="search-field-wrapper"
            :style="getFieldStyle(field)"
          >
            <el-form-item :label="field.label">
              <el-select
                v-model="formData[field.field]"
                :placeholder="field.placeholder || '请选择'"
                :clearable="field.clearable !== false"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </div>

          <!-- 日期范围选择 -->
          <div
            v-else-if="field.type === 'date-range'"
            class="search-field-wrapper"
            :style="getFieldStyle(field)"
          >
            <el-form-item :label="field.label">
              <el-date-picker
                v-model="formData[field.field]"
                type="daterange"
                range-separator="至"
                start-placeholder="年/月/日"
                end-placeholder="年/月/日"
                :format="field.format || 'YYYY/MM/DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
              />
            </el-form-item>
          </div>

          <!-- 单个日期选择 -->
          <div
            v-else-if="field.type === 'date'"
            class="search-field-wrapper"
            :style="getFieldStyle(field)"
          >
            <el-form-item :label="field.label">
              <el-date-picker
                v-model="formData[field.field]"
                type="date"
                :placeholder="field.placeholder || '选择日期'"
                :format="field.format || 'YYYY/MM/DD'"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
              />
            </el-form-item>
          </div>

          <!-- 复选框 -->
          <div
            v-else-if="field.type === 'checkbox'"
            class="search-field-wrapper"
            :style="getFieldStyle(field)"
          >
            <el-form-item>
              <el-checkbox
                v-model="formData[field.field]"
                :true-value="field.trueValue ?? 1"
                :false-value="field.falseValue ?? undefined"
                :label="field.label"
              />
            </el-form-item>
          </div>
        </template>

        <!-- 操作按钮 -->
        <div class="search-field-wrapper" style="width: auto; flex: 0 0 auto">
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
        </div>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.search-field-wrapper {
  box-sizing: border-box;
}

.search-field-wrapper :deep(.el-form-item) {
  margin-bottom: 0;
  width: 100%;
}

.search-field-wrapper :deep(.el-form-item__label) {
  font-weight: 500;
  flex-shrink: 0;
}

.search-field-wrapper :deep(.el-form-item__content) {
  flex: 1;
  width: 100%;
}

.search-field-wrapper :deep(.el-input),
.search-field-wrapper :deep(.el-select),
.search-field-wrapper :deep(.el-date-editor) {
  width: 100% !important;
}
</style>
