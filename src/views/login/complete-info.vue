<!--
 * @Description: 完善信息页面
 * @Author: 程前
 * @Date: 2025-07-25
-->
<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import { message } from "@/utils/message";
import { regionData } from "element-china-area-data";
import { registerNewUser } from "@/api/register";
import type { FormInstance } from "element-plus";
import {
  getDesignerType,
  getDictList,
  getSkillSoftList,
  getSkillPlatformList,
  getProductList,
  getOrderTypeList
} from "@/api/sysDictType";

defineOptions({
  name: "CompleteInfo"
});

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();

// 缓存的注册信息
type RegisterInfo = {
  userName: string;
  suggest_UserId?: number;
  passWord: string;
  source?: number;
};
const registeCodeInfo = reactive<RegisterInfo>({
  userName: "",
  suggest_UserId: null,
  passWord: "",
  source: null
});

onMounted(() => {
  const tempInfo = JSON.parse(sessionStorage.getItem("registerinfo"));
  if (tempInfo && tempInfo.userName) {
    Object.assign(registeCodeInfo, tempInfo);
    formData.value.phone = registeCodeInfo.userName;
  } else {
    message("手机号未找到，请返回注册页面重新注册", { type: "error" });
    return router.push("/register");
  }
  getDesignerList();
  handleDicttData();
});

onUnmounted(() => {
  sessionStorage.removeItem("registerinfo");
});

// 表单数据
const formData = ref({
  phone: "", // 手机号码
  workState: null, // 目前的工作状态
  sex: "", // 性别
  school: "", // 毕业院校
  position: "", // 意向职位
  education: null, // 学历
  urgent_Phone: "", // 紧急联系人电话
  realName: "", // 真实姓名
  selectedOptions: [], // 省市区级联选择
  work_Exp: null, // 工作经验
  user_TypeId: null, // 设计师类型
  dateBirth: "", // 出生日期
  isBaoma: null, // 是否宝妈
  specialty_des: [], // 擅长订单
  specialty_soft: [], // 擅长软件
  specialty_plat: [], // 擅长平台
  specialty_shop: [], // 擅长产品
  fullDaySalary: null, // 全日薪资
  halfDaySalary: null // 半日薪资
});

// 选项数据
const options = reactive({
  workStatus: [],
  education: [],
  workExperience: [],
  designerType: [],
  intendedPosition: [],
  skillOrders: [],
  skillSoftware: [],
  skillPlatforms: [],
  skillProducts: []
});

/**
 * 添加用户
 */
const handleSubmit = async () => {
  // 处理数据
  const formDataWithArea = {
    ...formData.value,
    ...registeCodeInfo,
    specialty_des: formData.value.specialty_des.join(","), // 擅长订单
    specialty_soft: formData.value.specialty_soft.join(","), // 擅长软件
    specialty_plat: formData.value.specialty_plat.join(","), // 擅长平台
    specialty_shop: formData.value.specialty_shop.join(","), // 擅长产品
    province: formData.value.selectedOptions[0] || "",
    city: formData.value.selectedOptions[1] || "",
    area: formData.value.selectedOptions[2] || ""
  };
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const res = await registerNewUser(formDataWithArea);
      if (res.code === 200) {
        message("注册成功，请登录", { type: "success" });
        router.push("/login");
        // 清除缓存的注册信息
        sessionStorage.removeItem("registerinfo");
      } else {
        message(res.message || "注册失败，请稍后再试", { type: "error" });
      }
    } else {
      console.log("表单验证失败");
    }
  });
};

/**
 * 获取设计师类型
 */
const designerList = ref([]);
const getDesignerList = async () => {
  try {
    const res = await getDesignerType();
    if (res.code === 200) {
      designerList.value = res.result;
      options.designerType = res.result.map((item: any) => ({
        label: item.name,
        value: item.code
      }));
    } else {
      console.error("获取设计师类型失败", res.message);
    }
  } catch (error) {
    console.error("获取设计师类型异常", error);
  }
};

/**
 * 设计师类型变化处理
 */
const onChangeDesignerType = async (value: any) => {
  console.log("设计师类型变化", value);
  const result = designerList.value.find((item: any) => item.code === value);
  // 根据设计师类型id获取订单
  const skillOrders = await getOrderTypeList(result.id);
  options.skillOrders = skillOrders.result.map((item: any) => ({
    label: item.label,
    value: item.value
  }));
};

/**
 * 获取字典数据
 */
const getAnotherDictList = async (code: string) => {
  try {
    const res = await getDictList({ code });
    if (res.code === 200) {
      return res.result;
    } else {
      console.error("获取字典数据失败", res.message);
    }
  } catch (error) {
    console.error("获取字典数据异常", error);
  }
};

/**
 * 处理其余字典数据
 */
const handleDicttData = async () => {
  try {
    // 获取学历
    const education = await getAnotherDictList("education");
    options.education = education.map((item: any) => ({
      label: item.label,
      value: item.value
    }));

    // 获取工作状态
    const skillSoftware = await getAnotherDictList("working_condition");
    options.workStatus = skillSoftware.map((item: any) => ({
      label: item.label,
      value: item.value
    }));

    // 获取工作经验
    const workExperience = await getAnotherDictList("work_experience");
    options.workExperience = workExperience.map((item: any) => ({
      label: item.label,
      value: item.value
    }));

    // 获取意向岗位
    const intendedPosition = await getAnotherDictList("Job_Post");
    options.intendedPosition = intendedPosition.map((item: any) => ({
      label: item.label,
      value: item.value
    }));

    // 获取擅长软件
    const skillSoft = await getSkillSoftList();
    options.skillSoftware = skillSoft.result.map((item: any) => ({
      label: item.label,
      value: item.value
    }));
    // 获取擅长平台
    const skillPlatforms = await getSkillPlatformList();
    options.skillPlatforms = skillPlatforms.result.map((item: any) => ({
      label: item.label,
      value: item.value
    }));
    // 获取擅长产品
    const skillProducts = await getProductList();
    console.log(skillProducts, "skillProducts");
    options.skillProducts = skillProducts.result;
  } catch (error) {
    console.error("获取字典数据异常", error);
  }
};

/**
 * 校验规则
 */
const rules = reactive({
  phone: [{ required: true, message: "手机号码不能为空", trigger: "blur" }],
  realName: [{ required: true, message: "真实姓名不能为空", trigger: "blur" }],
  urgent_Phone: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("紧急联系人电话不能为空"));
        }
        if (value === registeCodeInfo.userName) {
          callback(new Error("紧急联系人电话不能与手机号码相同"));
        }
        const regex =
          /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
        if (!regex.test(value)) {
          callback(new Error("紧急联系人电话格式不正确"));
        } else {
          callback();
        }
      }
    }
  ],
  dateBirth: [
    { required: true, message: "出生日期不能为空", trigger: "change" }
  ],
  school: [{ required: true, message: "毕业院校不能为空", trigger: "blur" }],
  workState: [
    { required: true, message: "目前的工作状态不能为空", trigger: "change" }
  ],
  education: [{ required: true, message: "学历不能为空", trigger: "change" }],
  work_Exp: [
    { required: true, message: "工作经验不能为空", trigger: "change" }
  ],
  user_TypeId: [
    { required: true, message: "设计师类型不能为空", trigger: "change" }
  ],
  position: [
    { required: true, message: "意向职位不能为空", trigger: "change" }
  ],
  sex: [{ required: true, message: "性别不能为空", trigger: "change" }],
  selectedOptions: [
    {
      required: true,
      message: "所在地址不能为空",
      trigger: "change"
    }
  ],
  isBaoma: [{ required: true, message: "是否宝妈不能为空", trigger: "change" }]
});
</script>

<template>
  <div class="complete-info-page min-h-screen relative bg-gray-50">
    <!-- 顶部区域 -->
    <div class="h-20 bg-white shadow-sm">
      <TransparentNavbar theme="light" />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content py-6">
      <div class="container mx-auto px-6">
        <div
          class="complete-info-box bg-white rounded-3xl shadow-2xl p-8 w-full"
        >
          <!-- 页面标题 -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">
              完善信息
            </h2>
          </div>

          <!-- 表单 -->
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="120px"
            class="complete-form"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              <!-- 手机号码 -->
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="formData.phone"
                  :disabled="true"
                  :placeholder="formData.phone"
                />
              </el-form-item>

              <!-- 学历 -->
              <el-form-item label="学历" prop="education">
                <el-select
                  v-model="formData.education"
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.education"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 真实姓名 -->
              <el-form-item label="真实姓名" prop="realName">
                <el-input
                  v-model="formData.realName"
                  placeholder="请输入真实姓名"
                />
              </el-form-item>

              <!-- 目前的工作状态 -->
              <el-form-item label="目前的工作状态" prop="workState">
                <el-select
                  v-model="formData.workState"
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.workStatus"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 紧急联系人电话 -->
              <el-form-item label="紧急联系人电话" prop="urgent_Phone">
                <el-input
                  v-model="formData.urgent_Phone"
                  placeholder="请输入紧急联系人电话"
                  maxlength="11"
                />
              </el-form-item>

              <!-- 性别 -->
              <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="formData.sex">
                  <el-radio value="男">男</el-radio>
                  <el-radio value="女">女</el-radio>
                </el-radio-group>
              </el-form-item>
              <!-- 所在地址 -->
              <el-form-item
                label="所在地址"
                class="lg:col-span-2"
                prop="selectedOptions"
              >
                <el-cascader
                  v-model="formData.selectedOptions"
                  :options="regionData as any"
                  placeholder="请选择省市区"
                  class="w-full"
                  clearable
                />
              </el-form-item>

              <!-- 工作经验 -->
              <el-form-item label="工作经验" prop="work_Exp">
                <el-select
                  v-model="formData.work_Exp"
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.workExperience"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 设计师类型 -->
              <el-form-item label="设计师类型" prop="user_TypeId">
                <el-select
                  v-model="formData.user_TypeId"
                  placeholder="请选择"
                  class="w-full"
                  @change="onChangeDesignerType"
                >
                  <el-option
                    v-for="item in options.designerType"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 出生日期 -->
              <el-form-item label="出生日期" prop="dateBirth">
                <el-date-picker
                  v-model="formData.dateBirth"
                  type="date"
                  placeholder="年/月/日"
                  class="w-full"
                  format="YYYY/MM/DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>

              <!-- 毕业院校 -->
              <el-form-item label="毕业院校" prop="school">
                <el-input
                  v-model="formData.school"
                  placeholder="请输入毕业院校"
                />
              </el-form-item>

              <!-- 是否宝妈 -->
              <el-form-item label="是否宝妈" prop="isBaoma">
                <el-radio-group v-model="formData.isBaoma">
                  <el-radio :value="0">是</el-radio>
                  <el-radio :value="1">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 意向职位 -->
              <el-form-item label="意向职位" prop="position">
                <el-select
                  v-model="formData.position"
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.intendedPosition"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- <el-form-item label="全日薪资(月)">
                <el-input
                  v-model="formData.fullDaySalary"
                  type="number"
                  placeholder="¥"
                  class="w-full"
                />
              </el-form-item>

              <el-form-item label="半日薪资(月)">
                <el-input
                  v-model="formData.halfDaySalary"
                  placeholder="¥"
                  type="number"
                  class="w-full"
                />
              </el-form-item> -->
            </div>

            <!-- 多选项目 -->
            <div class="mt-8 space-y-6">
              <!-- 擅长订单 -->
              <el-form-item label="擅长订单(可多选)" class="full-width">
                <el-tree-select
                  v-model="formData.specialty_des"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                  :props="{
                    label: 'name',
                    value: 'id',
                    children: 'childrens'
                  }"
                >
                  <el-option
                    v-for="item in options.skillOrders"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-tree-select>
              </el-form-item>

              <!-- 擅长软件 -->
              <el-form-item label="擅长软件(可多选)" class="full-width">
                <el-select
                  v-model="formData.specialty_soft"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.skillSoftware"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 擅长平台 -->
              <el-form-item label="擅长平台(可多选)" class="full-width">
                <el-select
                  v-model="formData.specialty_plat"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                >
                  <el-option
                    v-for="item in options.skillPlatforms"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <!-- 擅长产品 -->
              <el-form-item label="擅长产品(可多选)" class="full-width">
                <el-tree-select
                  v-model="formData.specialty_shop"
                  :data="options.skillProducts"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                  :props="{
                    label: 'name',
                    value: 'id',
                    children: 'childrens'
                  }"
                />
              </el-form-item>
            </div>

            <!-- 提交按钮 -->
            <div class="text-center mt-12">
              <el-button
                type="primary"
                size="large"
                class="complete-btn"
                @click="handleSubmit"
              >
                完成注册
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <AppFooter />
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (width <= 768px) {
  .complete-info-box {
    padding: 32px 24px;
    margin: 0 20px;
  }

  .grid {
    grid-template-columns: 1fr !important;
  }

  :deep(.complete-form .el-form-item__label) {
    width: 100px !important;
  }

  :deep(.complete-btn) {
    width: 200px;
  }
}

@media (width <= 480px) {
  .complete-info-box {
    padding: 24px 16px;
    margin: 0 16px;
  }

  :deep(.complete-form .el-form-item__label) {
    width: 80px !important;
    font-size: 13px;
  }

  :deep(.complete-btn) {
    width: 180px;
    font-size: 14px;
  }
}

.main-content {
  min-height: calc(100vh - 160px);
}

/* 完善信息框样式 */
.complete-info-box {
  border: 1px solid rgb(255 255 255 / 30%);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
  backdrop-filter: blur(20px);
}

/* 表单样式 */
:deep(.complete-form) {
  max-width: 100%;
}

:deep(.complete-form .el-form-item) {
  margin-bottom: 24px;
}

:deep(.complete-form .full-width) {
  grid-column: 1 / -1;
}

/* 完成注册按钮样式 */
:deep(.complete-btn) {
  width: 240px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #4da6ff 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(59 130 246 / 30%);
}

:deep(.complete-btn:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 24px rgb(59 130 246 / 40%);
  transform: translateY(-1px);
}

/* 输入框和选择框样式优化 */
:deep(.el-input__wrapper) {
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgb(59 130 246 / 15%);
}

:deep(.el-select .el-input__wrapper) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgb(59 130 246 / 15%);
}

/* 级联选择器样式优化 */
:deep(.el-cascader .el-input__wrapper) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

:deep(.el-cascader .el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-cascader .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgb(59 130 246 / 15%);
}

/* 日期选择器样式 */
:deep(.el-date-editor) {
  width: 100%;
}

:deep(.el-date-editor .el-input__wrapper) {
  width: 100%;
}

/* 单选按钮样式 */
:deep(.el-radio) {
  margin-right: 24px;
}

:deep(.el-radio__label) {
  font-size: 14px;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

/* 多选标签样式 */
:deep(.el-select__tags) {
  max-width: calc(100% - 40px);
}

/* 主要内容区域 */
</style>
