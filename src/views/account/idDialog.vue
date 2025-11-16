<!--
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-18 17:39:11
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-22 16:27:20
-->
<template>
  <el-dialog
    v-model="modelValue"
    title="个人认证"
    width="40vw"
    top="20vh"
    :show-close="false"
    center
  >
    <!-- 上传区域 -->
    <div
      v-loading="uploadLoading"
      class="flex flex-col md:flex-row justify-center gap-8 mb-6"
    >
      <!-- 身份证正面上传 -->
      <div>
        <div
          class="relative w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 transition"
          @click="triggerFileSelect('front')"
        >
          <template v-if="!imagePreview.front">
            <img
              :src="idCardFrontImg"
              alt="身份证正面示例"
              class="w-full h-full object-cover opacity-70 rounded-md"
            />
          </template>
          <template v-else>
            <img
              :src="imagePreview.front"
              alt="身份证正面"
              class="w-full h-full object-cover rounded-md"
              style="height: 100%"
            />
            <div
              class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-80 hover:opacity-100"
              @click.stop="removeImage('front')"
            >
              <el-icon size="18" class="text-white"><Close /></el-icon>
            </div>
          </template>
          <input
            id="front-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload('front', $event)"
          />
        </div>
      </div>
      <!-- 身份证背面上传 -->
      <div>
        <div
          class="relative w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-50 transition"
          @click="triggerFileSelect('back')"
        >
          <template v-if="!imagePreview.back">
            <img
              :src="idCardBackImg"
              alt="身份证背面示例"
              class="w-full h-full object-cover opacity-70 rounded-md"
            />
          </template>
          <template v-else>
            <img
              :src="imagePreview.back"
              alt="身份证背面"
              class="w-full h-full object-cover rounded-md"
              style="height: 100%"
            />
            <div
              class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-80 hover:opacity-100"
              @click.stop="removeImage('back')"
            >
              <el-icon size="18" class="text-white z-10"><Close /></el-icon>
            </div>
          </template>
          <input
            id="back-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload('back', $event)"
          />
        </div>
      </div>
    </div>
    <!-- 提示信息 -->
    <div
      class="bg-gray-50 rounded-lg p-3 mb-6 text-center text-sm text-gray-600"
    >
      上传后从图片自动识别姓名，无需手动填写
    </div>
    <!-- 表单区域 -->
    <el-form
      ref="formRef"
      :rules="rules"
      :model="authForm"
      label-width="80px"
      class="space-y-4"
    >
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="authForm.realName"
          placeholder="请上传身份证照片进行识别"
          disabled
          clearable
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="身份证号" prop="idNumber">
        <el-input
          v-model="authForm.idNumber"
          placeholder="请上传身份证照片进行识别"
          clearable
          disabled
          maxlength="18"
          class="w-full"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-center gap-4">
        <el-button class="min-w-[80px] rounded-md" @click="onCancel"
          >取消</el-button
        >
        <el-button
          type="primary"
          class="min-w-[80px] rounded-md"
          @click="onSubmit"
          >确定</el-button
        >
      </div>
    </template>
  </el-dialog>

  <!-- 裁剪弹窗 -->
  <CropDialog
    v-model="showCropDialog"
    :image-src="cropImageSrc"
    :crop-type="cropType"
    @crop-confirm="handleCropConfirm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from "vue";
import idCardFrontImg from "@/assets/image/account/idcard-front.png";
import idCardBackImg from "@/assets/image/account/idcard-back.png";
import { ElMessage } from "element-plus";
import { Plus, Close } from "@element-plus/icons-vue";
import {
  uploadIdCardFront,
  uploadIdCardBack,
  addUserAuth
} from "@/api/userAuth";
import CropDialog from "./cropDialog.vue";
import type { FormRules } from "element-plus";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "auth-success"]);

const modelValue = ref(props.modelValue);
watch(
  () => props.modelValue,
  val => (modelValue.value = val)
);
watch(modelValue, val => emit("update:modelValue", val));

const authForm = reactive({
  realName: "",
  idNumber: "",
  frontImage: "",
  backImage: ""
});
const imagePreview = reactive({
  front: "",
  back: ""
});

const rules = reactive<FormRules>({
  realName: [
    { required: true, message: "请上传身份证照片进行认证", trigger: "blur" }
  ],
  idNumber: [
    { required: true, message: "请上传身份证照片进行认证", trigger: "blur" }
  ],
  frontImage: [
    { required: true, message: "请上传身份证正面照片", trigger: "blur" }
  ],
  backImage: [
    { required: true, message: "请上传身份证背面照片", trigger: "blur" }
  ]
});

/**
 * 处理上传
 * @param type
 * @param event
 */
const uploadLoading = ref<boolean>(false);

// 裁剪相关状态
const showCropDialog = ref(false);
const cropImageSrc = ref("");
const cropType = ref<"front" | "back">("front");

const handleImageUpload = (type: "front" | "back", event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;

      // 设置裁剪弹窗的图片源和类型
      cropImageSrc.value = result;
      cropType.value = type;

      // 打开裁剪弹窗
      showCropDialog.value = true;
    };
    reader.readAsDataURL(file);
  }

  // 清空input的value，允许重复选择同一文件
  target.value = "";
};

const triggerFileSelect = (type: "front" | "back") => {
  const input = document.getElementById(`${type}-upload`) as HTMLInputElement;
  input.click();
};

const removeImage = (type: "front" | "back") => {
  imagePreview[type] = "";
  if (type === "front") {
    authForm.frontImage = "";
  } else {
    authForm.backImage = "";
  }
};

/**
 * 处理裁剪确认
 */
const handleCropConfirm = (croppedImage: string, type: "front" | "back") => {
  // 更新预览图片
  imagePreview[type] = croppedImage;

  // 更新表单数据
  if (type === "front") {
    authForm.frontImage = croppedImage;
  } else {
    authForm.backImage = croppedImage;
  }

  // 调用上传接口
  uploadCroppedImage(croppedImage, type);
};

/**
 * 从身份证号中提取出生日期
 * @param cardNo 身份证号
 * @returns 出生日期，格式：YYYY-MM-DD，如果提取失败返回空字符串
 */
const extractBirthDayFromCardNo = (cardNo: string): string => {
  if (!cardNo || cardNo.trim() === "") {
    return "";
  }
  // 去除空格和特殊字符，只保留数字和X
  const cleanCardNo = cardNo.trim().replace(/[^\dXx]/g, "");

  if (cleanCardNo.length === 18) {
    // 18位身份证：提取第7-14位（索引6-13），格式为 YYYYMMDD
    const year = cleanCardNo.substring(6, 10);
    const month = cleanCardNo.substring(10, 12);
    const day = cleanCardNo.substring(12, 14);

    // 验证日期有效性
    if (
      year &&
      month &&
      day &&
      parseInt(month) >= 1 &&
      parseInt(month) <= 12 &&
      parseInt(day) >= 1 &&
      parseInt(day) <= 31
    ) {
      return `${year}${month}${day}`;
    }
  }
  // 提取失败
  console.warn("无法从身份证号中提取出生日期:", cardNo);
  return "";
};

/**
 * 上传裁剪后的图片
 */
const idResult = ref<{
  sfz_Positive: string;
  sfz_Back: string;
  realName: string;
  cardNo: string;
  sex: string;
  birthDay: string;
}>({
  sfz_Positive: "",
  sfz_Back: "",
  realName: "",
  cardNo: "",
  sex: "",
  birthDay: ""
});
const uploadCroppedImage = async (
  imageData: string,
  type: "front" | "back"
) => {
  try {
    uploadLoading.value = true;

    // 将base64转换为Blob
    const base64Data = imageData.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // 创建FormData
    const formData = new FormData();
    formData.append("file", blob, `${type}_idcard.png`);

    // 调用上传接口
    if (type === "front") {
      const res = await uploadIdCardFront(formData);
      console.log("正面身份证上传成功:", res);
      if (res.code === 200) {
        authForm.frontImage = res.result.url;
        authForm.realName = res.result.realName;
        authForm.idNumber = res.result.cardNo;
        idResult.value.sfz_Positive = res.result.url;
        idResult.value.realName = res.result.realName;
        idResult.value.cardNo = res.result.cardNo;
        idResult.value.sex = res.result.sex;

        // 优先使用接口返回的birthDay，如果没有则从身份证号中提取
        if (res.result.birthDay) {
          idResult.value.birthDay = res.result.birthDay;
        } else {
          // 从身份证号中提取出生日期
          const extractedBirthDay = extractBirthDayFromCardNo(
            res.result.cardNo
          );
          if (extractedBirthDay) {
            idResult.value.birthDay = extractedBirthDay;
            console.log("从身份证号提取出生日期:", extractedBirthDay);
          } else {
            console.warn("无法从身份证号提取出生日期");
          }
        }
      }
    } else {
      const res = await uploadIdCardBack(formData);
      if (res.code === 200) {
        idResult.value.sfz_Back = res.result;
      }
      console.log("背面身份证上传成功:", res);
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败，请重试");
  } finally {
    uploadLoading.value = false;
  }
};

const onCancel = () => {
  modelValue.value = false;
  resetForm();
};

const onSubmit = async () => {
  if (!authForm.frontImage || !authForm.backImage) {
    ElMessage.error("请上传身份证正反面照片");
    return;
  }
  if (!authForm.realName.trim()) {
    ElMessage.error("请输入真实姓名");
    return;
  }
  if (!authForm.idNumber.trim()) {
    ElMessage.error("请输入身份证号");
    return;
  }
  const idRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!idRegex.test(authForm.idNumber)) {
    ElMessage.error("请输入正确的身份证号");
    return;
  }

  // 确保出生日期已提取（如果还没有）
  if (!idResult.value.birthDay && idResult.value.cardNo) {
    const extractedBirthDay = extractBirthDayFromCardNo(idResult.value.cardNo);
    if (extractedBirthDay) {
      idResult.value.birthDay = extractedBirthDay;
      console.log("提交前从身份证号提取出生日期:", extractedBirthDay);
    } else {
      ElMessage.error("无法从身份证号中提取出生日期，请重新上传身份证");
      return;
    }
  }

  // 验证必要字段
  if (!idResult.value.birthDay) {
    ElMessage.error("出生日期信息缺失，请重新上传身份证正面");
    return;
  }

  try {
    const response = await addUserAuth(idResult.value);
    if ((response as any).code === 200) {
      ElMessage.success("个人认证信息已提交，实名认证成功!");
      modelValue.value = false;
      resetForm();
      // 触发成功事件，通知父组件刷新用户信息
      emit("auth-success");
    } else {
      ElMessage.error((response as any).message || "提交失败，请重试");
    }
  } catch (error) {
    console.error("提交用户实名失败:", error);
    ElMessage.error("提交失败，请重试");
  }
};

const resetForm = () => {
  authForm.realName = "";
  authForm.idNumber = "";
  authForm.frontImage = "";
  authForm.backImage = "";
  imagePreview.front = "";
  imagePreview.back = "";
  idResult.value = {
    sfz_Positive: "",
    sfz_Back: "",
    realName: "",
    cardNo: "",
    sex: "",
    birthDay: ""
  };
};
</script>
