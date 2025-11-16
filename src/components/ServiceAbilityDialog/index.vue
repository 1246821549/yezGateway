<!--
 * @Description: 灵工服务能力智能提醒弹窗
 * @Author: 程前
 * @Date: 2025-10-31
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="灵工服务能力智能提醒"
    align-center
    center
    width="60%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="service-ability-content">
      <!-- 头部信息 -->
      <div class="header-info mb-4">
        <div class="flex items-center justify-between">
          <span class="text-base font-semibold"
            >灵工类型: {{ userTypeName || "-" }}</span
          >
          <span class="text-base font-semibold">
            灵工等级: {{ data?.userGradeInfo?.userGradeName || "-" }}
            <el-tooltip content="等级说明" placement="top">
              <el-icon class="cursor-pointer text-gray-400 ml-1">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </span>
          <span class="text-base font-semibold">
            分佣比例: {{ data?.userGradeInfo?.salaryRat || 0 }}%
          </span>
        </div>
      </div>

      <!-- 服务指标表格 -->
      <el-table :data="tableData" border style="width: 100%" class="mb-4">
        <el-table-column label="服务指标" width="150" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <span>{{ row.name }}</span>
              <el-tooltip
                :content="row.description"
                placement="top"
                raw-content
              >
                <el-icon class="cursor-pointer text-gray-400">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="平台要求标准"
          prop="standard"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.name !== '服务分'">{{ row.standard }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="您的表现"
          prop="performance"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.name !== '服务分'">{{ row.performance }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="指标得分"
          prop="score"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.name !== '服务分'">{{ row.score }}</span>
            <span v-else>{{ row.performance }}</span>
          </template>
        </el-table-column>
        <el-table-column label="" width="200" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <i
                v-for="n in 5"
                :key="n"
                :class="getStarClass(row.score, n)"
                class="text-xl"
              >
                {{ getStarIcon(row.score, n) }}
              </i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="表现星级及建议" min-width="300" align="center">
          <template #default="{ row }">
            <div class="text-left px-2">
              {{ row.suggestion }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { QuestionFilled } from "@element-plus/icons-vue";
import type { UserServiceAbilityReport } from "@/api/user";

interface Props {
  visible?: boolean;
  data?: UserServiceAbilityReport["result"] | null;
  userTypeName?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: null,
  userTypeName: "内部设计师"
});

const emit = defineEmits<Emits>();

const dialogVisible = ref(props.visible);

// 监听 props.visible 变化
watch(
  () => props.visible,
  newVal => {
    dialogVisible.value = newVal;
  }
);

// 监听 dialogVisible 变化
watch(dialogVisible, newVal => {
  emit("update:visible", newVal);
});

/**
 * 服务指标说明
 */
const descriptions = {
  jd_Cg_Rate:
    "代表订单成功完成交付能力，数值越高越好，权重最核心的指标，公式为：接单成功率=已完成÷总接单数",
  td_Rate:
    "代表订单未能完成导致订单退款的数量占比，数值越低越好，权重较重要的指标，公式为：已退单数÷总接单数（免责除外）",
  gp_Rate:
    "代表订单未能完成导致改派给他人的数量占比，数值越低越好，权重较重要的指标，公式为：已改派数÷总接单数（免责除外）",
  cg_Zs_Rate:
    "代表订单未能准时初稿出图的数量占比，数值越高越好，权重较重要的指标，公式为：初稿准时数÷应交初稿数量（免责除外）",
  zg_Zs_Rate:
    "代表订单未能准时交付终稿的数量占比，数值越高越好，权重一般的指标，公式为：终稿准时数÷应交终稿数量（免责除外）",
  avgPrice:
    "200元为较均衡的标准值，客单价越低于标准值，得分越低，权重一般的指标",
  activeScore:
    "最近3天有接单满分，7天内有接单4分，15天内有接单3分，21天内有接单2分，30天内有接单1分，超过一个月未接单为0分，权重一般的指标",
  goodCommentScore:
    "最近30天有10笔好评为满分，好评单量越低于满分标准，得分越低，权重一般的指标",
  badScore:
    "代表最近30天被客户差评或被因过错被平台登记差评的数量，每差评一次扣除0.1分，此项指标只作扣分项，发生即扣分，影响未来30天，期满后自动恢复正常，情节严重者将同时面临被经济处罚",
  servicePoints:
    "代表您在平台的服务能力，满分5分，最低0分，分数越高代表服务能力越好，接单优先级相对更高，分佣比例及所在派单群随之自动变化"
};

/**
 * 表格数据
 */
const tableData = computed(() => {
  if (!props.data) return [];

  return [
    {
      name: "接单成功率",
      standard: "90%",
      performance: `${(props.data.jd_Cg_Rate || 0).toFixed(3)}%`,
      score: props.data.jd_Cg_Rate_Point || 0,
      description: descriptions.jd_Cg_Rate,
      suggestion: getSuggestion(props.data.jd_Cg_Rate_Point || 0)
    },
    {
      name: "订单退单率",
      standard: "5%",
      performance: `${(props.data.td_Rate || 0).toFixed(3)}%`,
      score: props.data.td_Rate_Point || 0,
      description: descriptions.td_Rate,
      suggestion: getSuggestion(props.data.td_Rate_Point || 0)
    },
    {
      name: "订单改派率",
      standard: "5%",
      performance: `${(props.data.gp_Rate || 0).toFixed(3)}%`,
      score: props.data.gp_Rate_Point || 0,
      description: descriptions.gp_Rate,
      suggestion: getSuggestion(props.data.gp_Rate_Point || 0)
    },
    {
      name: "初稿准时率",
      standard: "98%",
      performance: `${(props.data.cg_Zs_Rate || 0).toFixed(3)}%`,
      score: props.data.cg_Zs_Rate_Point || 0,
      description: descriptions.cg_Zs_Rate,
      suggestion: getSuggestion(props.data.cg_Zs_Rate_Point || 0)
    },
    {
      name: "终稿准时率",
      standard: "95%",
      performance: `${(props.data.zg_Zs_Rate || 0).toFixed(3)}%`,
      score: props.data.zg_Zs_Rate_Point || 0,
      description: descriptions.zg_Zs_Rate,
      suggestion: getSuggestion(props.data.zg_Zs_Rate_Point || 0)
    },
    {
      name: "客单价",
      standard: "200元",
      performance: (props.data.avgPrice || 0).toFixed(3),
      score: props.data.avgPrice_Point || 0,
      description: descriptions.avgPrice,
      suggestion: getSuggestion(props.data.avgPrice_Point || 0)
    },
    {
      name: "最近30天活跃度",
      standard: "----",
      performance: "----",
      score: props.data.activeScore || 0,
      description: descriptions.activeScore,
      suggestion: getSuggestion(props.data.activeScore || 0)
    },
    {
      name: "最近30天好评度",
      standard: "----",
      performance: "----",
      score: props.data.goodCommentScore || 0,
      description: descriptions.goodCommentScore,
      suggestion: getSuggestion(props.data.goodCommentScore || 0)
    },
    {
      name: "最近30天差评数",
      standard: "0笔",
      performance: "----",
      score: props.data.badScore || 0,
      description: descriptions.badScore,
      suggestion: getSuggestion(props.data.badScore || 0)
    },
    {
      name: "服务分",
      standard: "",
      performance: (props.data.servicePoints || 0).toFixed(2),
      score: 0,
      description: descriptions.servicePoints,
      suggestion: getSuggestion(props.data.servicePoints || 0)
    }
  ];
});

/**
 * 根据得分获取建议文本
 * <4分：表现很一般，建议提升能力
 * >=4且<5：表现很优秀，加油接单
 * =5：表现非常不错，继续保持
 */
function getSuggestion(score: number): string {
  if (score === 5) {
    return "表现非常不错，继续保持";
  } else if (score >= 4) {
    return "表现很优秀，加油接单";
  } else {
    return "表现很一般，建议提升能力";
  }
}

/**
 * 获取星星的样式类
 */
function getStarClass(score: number, position: number): string {
  const fullStars = Math.floor(score);
  const hasHalfStar = score - fullStars >= 0.5;

  if (position <= fullStars) {
    return "text-yellow-400";
  } else if (position === fullStars + 1 && hasHalfStar) {
    return "text-yellow-400";
  } else {
    return "text-gray-300";
  }
}

/**
 * 获取星星图标
 */
function getStarIcon(score: number, position: number): string {
  const fullStars = Math.floor(score);
  const hasHalfStar = score - fullStars >= 0.5;

  if (position <= fullStars) {
    return "★";
  } else if (position === fullStars + 1 && hasHalfStar) {
    return "✬";
  } else {
    return "★";
  }
}

/**
 * 关闭弹窗
 */
function handleClose() {
  emit("close");
  emit("update:visible", false);
}
</script>

<style scoped lang="scss">
.service-ability-content {
  padding: 10px 0;

  .header-info {
    padding: 8px;
    border-radius: 4px;
  }
  :deep(.el-table) {
    font-size: 14px;

    .el-table__header th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      text-align: center;
    }

    .el-table__body td {
      padding: 12px 0;
    }
  }
}
</style>
