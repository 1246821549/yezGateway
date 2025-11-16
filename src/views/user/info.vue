<!--
 * @Description: 用户信息页面
 * @Author: 程前
 * @Date: 2025-07-23 17:15:16
 * @LastEditors: 程前
 * @LastEditTime: 2025-10-30 16:43:34
-->
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Upload } from "@element-plus/icons-vue";
import { regionData } from "element-china-area-data";
import { getUserInfo, updateUserInfo, type PageUserInfo } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";
import type { FormRules, FormInstance } from "element-plus";
import {
  getDesignerType,
  getDictList,
  getSkillSoftList,
  getSkillPlatformList,
  getProductList,
  getOrderTypeList
} from "@/api/sysDictType";

defineOptions({
  name: "userInfo"
});
/**用户信息 */
const userInfo = reactive<Partial<PageUserInfo["result"]>>({
  nickName: "",
  realName: "",
  education: 0,
  sex: "",
  workState: 0,
  dateBirth: null,
  work_Exp: 0,
  urgent_Phone: "",
  qq: "",
  wechat: "",
  alipay: "",
  school: "",
  email: "",
  isBaoma: 0,
  province: "",
  city: "",
  area: "",
  address: "",
  gzimg: "",
  isAuth: 0,
  specialty_des: "",
  specialty_soft: "",
  specialty_plat: "",
  specialty_shop: "",
  user_TypeName: "",
  autoincrementUserId: 0,
  isShowNick: 0
});
const rules: FormRules = {
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  dateBirth: [{ required: true, message: "请选择出生日期", trigger: "change" }],
  education: [{ required: true, message: "请选择学历", trigger: "change" }],
  work_Exp: [{ required: true, message: "请选择工作经验", trigger: "change" }],
  urgent_Phone: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("紧急联系人电话不能为空"));
        }
        if (value === useUserStoreHook().userInfo.phone) {
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
  qq: [
    {
      required: false,
      message: "请输入正确的QQ号",
      trigger: "blur"
    }
  ],
  isBaoma: [{ required: true, message: "请选择是否宝妈", trigger: "change" }],
  workState: [{ required: true, message: "请选择工作状态", trigger: "change" }],
  area: [{ required: true, message: "请选择省市区", trigger: "change" }],
  address: [{ required: false, message: "请输入详细地址", trigger: "blur" }],
  school: [{ required: true, message: "请输入毕业院校", trigger: "blur" }],
  email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: "blur" }],
  wechat: [{ required: false }],
  alipay: [{ required: false }]
};

const formRef = ref<FormInstance>();

onMounted(async () => {
  try {
    loading.value = true;
    await getDesignerList();
    await handleDicttData();
    await getUserData();
  } catch (error) {
    console.error("获取用户信息异常", error);
  } finally {
    loading.value = false;
  }
});

/**
 * loading效果
 */
const loading = ref(false);

/**
 * 获取用户信息
 */
const getUserData = async () => {
  try {
    const res = await getUserInfo();
    if (res.code === 200) {
      // 先设置用户信息
      Object.assign(userInfo, {
        ...res.result,
        // 处理省市区数据
        area:
          res.result.province && res.result.city && res.result.area
            ? [res.result.province, res.result.city, res.result.area]
            : [],
        specialty_soft: res.result.specialty_soft
          ? res.result.specialty_soft
              .split(",")
              .map((item: string) => Number(item))
          : [],
        specialty_shop: res.result.specialty_shop
          ? res.result.specialty_shop
              .split(",")
              .map((item: string) => Number(item))
          : [],
        specialty_plat: res.result.specialty_plat
          ? res.result.specialty_plat
              .split(",")
              .map((item: string) => Number(item))
          : [],
        specialty_des: res.result.specialty_des
          ? res.result.specialty_des
              .split(",")
              .map((item: string) => Number(item))
          : []
      });

      // 根据用户类型获取擅长订单选项
      if (res.result.user_TypeName) {
        const skillOrders = await getOrderTypeList(res.result.user_TypeName);
        // 如果返回的数据是树形结构，直接使用；否则转换为树形结构
        if (skillOrders.result && skillOrders.result.length > 0) {
          // 检查是否有children字段来判断是否为树形结构
          const hasChildren = skillOrders.result.some(
            (item: any) => item.children || item.childrens
          );
          if (hasChildren) {
            options.skillOrders = skillOrders.result;
          } else {
            // 如果是平级数据，转换为树形结构
            options.skillOrders = skillOrders.result.map((item: any) => ({
              label: item.label,
              value: item.value,
              children: item.children || item.childrens || []
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error("获取用户信息异常", error);
  } finally {
    loading.value = false;
  }
};

// 图片上传
const handleAvatarSuccess = (response: any, file: any) => {
  userInfo.gzimg = URL.createObjectURL(file.raw);
};

const beforeAvatarUpload = (file: any) => {
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("头像图片只能是 JPG/PNG 格式!");
  }
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
  }
  return isJPG && isLt2M;
};

/**
 * 更新用户信息
 */
const submitLoading = ref(false);
const handleSave = async () => {
  // 先校验表单
  try {
    await formRef.value.validate();
  } catch (error) {
    console.log("表单校验未通过", error);
    return;
  }

  // 处理省市区数据
  const { area: areaArray, ...restUserInfo } = userInfo;
  const formDataWithArea = {
    ...restUserInfo,
    province: (areaArray as unknown as string[])?.[0] || "",
    city: (areaArray as unknown as string[])?.[1] || "",
    area: (areaArray as unknown as string[])?.[2] || "", // area字段应该是区/县的值
    specialty_des: (userInfo.specialty_des as unknown as number[]).join(","), // 擅长订单
    specialty_soft: (userInfo.specialty_soft as unknown as number[]).join(","), // 擅长软件
    specialty_plat: (userInfo.specialty_plat as unknown as number[]).join(","), // 擅长平台
    specialty_shop: (userInfo.specialty_shop as unknown as number[]).join(",") // 擅长产品
  };

  submitLoading.value = true;
  try {
    const res = await updateUserInfo(formDataWithArea);
    if (res.code === 200) {
      ElMessage.success("保存成功!");
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    console.error("保存用户信息异常", error);
  } finally {
    submitLoading.value = false;
  }
};

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
  if (result) {
    // 根据设计师类型id获取订单
    const skillOrders = await getOrderTypeList(result.id);
    if (skillOrders.result && skillOrders.result.length > 0) {
      // 检查是否有children字段来判断是否为树形结构
      const hasChildren = skillOrders.result.some(
        (item: any) => item.children || item.childrens
      );
      if (hasChildren) {
        options.skillOrders = skillOrders.result;
      } else {
        // 如果是平级数据，转换为树形结构
        options.skillOrders = skillOrders.result.map((item: any) => ({
          label: item.label,
          value: item.value,
          children: item.children || item.childrens || []
        }));
      }
    }
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
      value: Number(item.value)
    }));

    // 获取工作状态
    const workState = await getAnotherDictList("working_condition");
    options.workStatus = workState.map((item: any) => ({
      label: item.label,
      value: Number(item.value)
    }));

    // 获取工作经验
    const workExperience = await getAnotherDictList("work_experience");
    options.workExperience = workExperience.map((item: any) => ({
      label: item.label,
      value: Number(item.value)
    }));

    // // 获取意向岗位
    // const intendedPosition = await getAnotherDictList("Job_Post");
    // options.intendedPosition = intendedPosition.map((item: any) => ({
    //   label: item.label,
    //   value: item.value
    // }));

    // 获取擅长软件
    const skillSoft = await getSkillSoftList();
    options.skillSoftware = skillSoft.result.map((item: any) => ({
      label: item.label,
      value: Number(item.value)
    }));
    // 获取擅长平台
    const skillPlatforms = await getSkillPlatformList();
    options.skillPlatforms = skillPlatforms.result.map((item: any) => ({
      label: item.label,
      value: Number(item.value)
    }));
    // 获取擅长产品
    const skillProducts = await getProductList();
    options.skillProducts = skillProducts.result;
  } catch (error) {
    console.error("获取字典数据异常", error);
  }
};
const changeasd = (value: any) => {
  console.log(value);
};
</script>

<template>
  <div class="min-h-svh bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-8">
        <!-- 表单主体 -->
        <el-form
          ref="formRef"
          v-loading="loading"
          :model="userInfo"
          :rules="rules"
          label-width="120px"
          class="user-info-form"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 左侧表单 -->
            <div class="space-y-6">
              <!-- 真实姓名 -->
              <el-form-item label="真实姓名" prop="realName">
                <el-input
                  v-model="userInfo.realName"
                  placeholder="请输入真实姓名"
                />
              </el-form-item>

              <!-- 性别 -->
              <el-form-item label="性别" prop="sex">
                <el-radio-group v-model="userInfo.sex">
                  <el-radio value="男">男</el-radio>
                  <el-radio value="女">女</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 出生日期 -->
              <el-form-item label="出生日期" prop="dateBirth">
                <el-date-picker
                  v-model="userInfo.dateBirth"
                  type="date"
                  placeholder="请选择出生日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                  @change="changeasd"
                />
              </el-form-item>

              <!-- 学历 -->
              <el-form-item label="学历" prop="education">
                <el-select
                  v-model="userInfo.education"
                  placeholder="请选择学历"
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

              <!-- 工作经验 -->
              <el-form-item label="工作经验" prop="work_Exp">
                <el-select
                  v-model="userInfo.work_Exp"
                  placeholder="请选择工作经验"
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

              <!-- 紧急联系电话 -->
              <el-form-item label="紧急联系电话" prop="urgent_Phone">
                <el-input
                  v-model="userInfo.urgent_Phone"
                  placeholder="请输入紧急联系电话"
                />
              </el-form-item>

              <!-- 联系QQ -->
              <el-form-item label="联系QQ" prop="qq">
                <el-input v-model="userInfo.qq" placeholder="请输入QQ号码" />
              </el-form-item>

              <!-- 所在省份 -->
              <el-form-item label="所在省份" prop="area">
                <el-cascader
                  v-model="userInfo.area"
                  :options="regionData as any"
                  placeholder="请选择省市区"
                  class="w-full"
                  clearable
                />
              </el-form-item>

              <!-- 设计师类型 -->
              <el-form-item label="设计师类型" prop="user_TypeName">
                <el-select
                  v-model="userInfo.user_TypeName"
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

              <!-- 是否宝妈 -->
              <el-form-item label="是否宝妈" prop="isBaoma">
                <el-radio-group v-model="userInfo.isBaoma">
                  <el-radio :value="0">是</el-radio>
                  <el-radio :value="1">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 擅长软件 -->
              <el-form-item label="擅长软件" prop="specialty_soft">
                <el-select
                  v-model="userInfo.specialty_soft"
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

              <!-- 擅长产品 -->
              <el-form-item label="擅长产品" prop="specialty_shop">
                <el-tree-select
                  v-model="userInfo.specialty_shop"
                  :data="options.skillProducts"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                  :props="{
                    label: 'name',
                    value: 'value',
                    children: 'childrens'
                  }"
                />
              </el-form-item>
            </div>

            <!-- 右侧表单 -->
            <div class="space-y-6">
              <!-- 工作照 -->
              <el-form-item label="工作照" prop="gzimg">
                <el-upload
                  class="avatar-uploader w-32 h-32"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  accept=".jpg,.png,.jpeg"
                >
                  <img
                    v-if="userInfo.gzimg"
                    :src="userInfo.gzimg"
                    class="w-32 h-32 rounded-lg object-cover"
                  />
                  <div
                    v-else
                    class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer"
                  >
                    <el-icon class="text-gray-400 text-2xl mb-2"
                      ><Plus
                    /></el-icon>
                    <span class="text-gray-400 text-sm">上传图片</span>
                  </div>
                </el-upload>
              </el-form-item>

              <!-- 工作状态 -->
              <el-form-item label="工作状态" prop="workState">
                <el-select
                  v-model="userInfo.workState"
                  placeholder="请选择工作状态"
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

              <!-- 昵称 -->
              <el-form-item label="昵称" prop="nickName">
                <el-input
                  v-model="userInfo.nickName"
                  placeholder="请输入昵称"
                />
              </el-form-item>

              <!-- 邮箱 -->
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
              </el-form-item>

              <!-- 微信账号 -->
              <el-form-item label="微信账号" prop="wechat">
                <el-input v-model="userInfo.wechat" :disabled="true" />
              </el-form-item>

              <!-- 支付宝账号 -->
              <el-form-item label="支付宝账号" prop="alipay">
                <el-input v-model="userInfo.alipay" :disabled="true" />
              </el-form-item>

              <!-- 详细地址 -->
              <el-form-item label="详细地址" prop="address">
                <el-input
                  v-model="userInfo.address"
                  placeholder="请输入详细地址"
                />
              </el-form-item>

              <!-- 毕业院校 -->
              <el-form-item label="毕业院校" prop="school">
                <el-input
                  v-model="userInfo.school"
                  placeholder="请输入毕业院校"
                />
              </el-form-item>

              <!-- 擅长订单 -->
              <el-form-item label="擅长订单" prop="specialty_des">
                <el-cascader
                  v-model="userInfo.specialty_des"
                  :options="options.skillOrders"
                  multiple
                  placeholder="请选择"
                  class="w-full"
                  clearable
                  collapse-tags
                  collapse-tags-tooltip
                  :props="{
                    label: 'label',
                    value: 'value',
                    children: 'children',
                    multiple: true,
                    checkStrictly: true
                  }"
                />
              </el-form-item>

              <!-- 擅长平台 -->
              <el-form-item label="擅长平台" prop="specialty_plat">
                <el-select
                  v-model="userInfo.specialty_plat"
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
            </div>
          </div>

          <!-- 保存按钮 -->
          <div class="flex justify-center mt-12">
            <el-button
              v-loading="submitLoading"
              type="primary"
              size="large"
              class="px-12 py-3 text-lg"
              @click="handleSave"
            >
              保存
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-info-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-date-editor) {
    width: 100%;
  }

  :deep(.el-radio-group) {
    .el-radio {
      margin-right: 24px;
    }
  }

  :deep(.el-tag) {
    color: #262626;
    background-color: #f0f2f5;
    border-color: #d9d9d9;
    border-radius: 4px;
  }

  .avatar-uploader {
    :deep(.el-upload) {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
    }
  }
}
</style>
