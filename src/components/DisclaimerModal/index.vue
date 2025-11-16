<!--
 * @Description: 免责申请弹框组件
 * @Author: AI Assistant
 * @Date: 2025-01-27
-->
<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Delete } from "@element-plus/icons-vue";
import { uploadFileToOss, type UploadFileToOssResponse } from "@/api/upload";
import { getDictDetail } from "@/api/dict";
import { applyExemption } from "@/api/order";

interface Props {
  visible: boolean;
  orderId: number;
  disclaimerType: "first" | "final"; // 初稿或终稿免责
  orderDetail: any; // 订单详情
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
  (e: "success"): void; // 申请成功回调
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 弹框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: value => emit("update:visible", value)
});

// 表单数据
const form = reactive({
  disclaimerReason: "",
  disclaimerDescription: "",
  proofImages: [] as string[]
});

// 状态管理
const loading = ref(false);
const submitting = ref(false);
const disclaimerReasons = ref<any[]>([]);
const fileList = ref<File[]>([]);

// 计算属性
const isFirstDraft = computed(() => props.disclaimerType === "first");
const modalTitle = computed(() =>
  isFirstDraft.value ? "初稿免责" : "终稿免责"
);

// 表单验证规则
const rules = {
  disclaimerReason: [
    { required: true, message: "请选择免责理由", trigger: "change" }
  ],
  disclaimerDescription: [
    { required: true, message: "请填写免责说明", trigger: "blur" }
  ],
  proofImages: [{ required: true, message: "请上传凭证", trigger: "change" }]
};

// 获取免责理由选项
const fetchDisclaimerReasons = async () => {
  try {
    const response = await getDictDetail({ code: "disclaimer" });
    if (response.code === 200) {
      disclaimerReasons.value = response.result;
    } else {
      ElMessage.error(response.message || "获取免责理由失败");
    }
  } catch (error) {
    console.error("获取免责理由失败:", error);
    ElMessage.error("获取免责理由失败");
  }
};

// 文件上传处理
const handleFileUpload = (file: File) => {
  // 检查文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("只支持 JPG、PNG、GIF 格式的图片");
    return false;
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error("图片大小不能超过 5MB");
    return false;
  }

  fileList.value.push(file);
  return false; // 阻止自动上传
};

// 删除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
  form.proofImages.splice(index, 1);
};

// 上传文件到OSS
const uploadToOss = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await uploadFileToOss(formData);
    if (response.code === 200) {
      return response.result.url;
    } else {
      throw new Error(response.message || "上传失败");
    }
  } catch (error) {
    console.error("上传到OSS失败:", error);
    throw error;
  }
};

// 提交申请
const handleSubmit = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning("请上传凭证");
    return;
  }

  try {
    submitting.value = true;
    const urls: string[] = [];

    // 逐个上传文件
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i];
      try {
        const url = await uploadToOss(file);
        urls.push(url);
      } catch (error) {
        ElMessage.error(`第${i + 1}张图片上传失败`);
        return;
      }
    }

    // 调用免责申请接口
    const applyData = {
      orderId: props.orderId,
      distributionId: props.orderDetail?.distributionId || 0, // 派单id
      userId: props.orderDetail?.userId || 0, // 用户id
      disclaimerType: isFirstDraft.value ? "初稿免责" : "终稿免责", // 免责类型
      disclaimerReason: form.disclaimerReason, // 免责原因
      disclaimerRmark: form.disclaimerDescription, // 备注
      imagePath: urls.join(","), // 免责凭证图片路径（逗号分隔）
      explainReason: form.disclaimerDescription // 免责理由
    };

    await applyExemption(applyData);

    ElMessage.success("免责申请提交成功");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("提交免责申请失败:", error);
    ElMessage.error("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
};

// 关闭弹框
const handleClose = () => {
  emit("close");
  // 重置表单
  form.disclaimerReason = "";
  form.disclaimerDescription = "";
  form.proofImages = [];
  fileList.value = [];
};

// 监听弹框显示状态
watch(
  () => props.visible,
  visible => {
    if (visible) {
      fetchDisclaimerReasons();
      // 重置表单
      form.disclaimerReason = "";
      form.disclaimerDescription = "";
      form.proofImages = [];
      fileList.value = [];
    }
  }
);

// 获取文件预览URL
const getFilePreviewUrl = (file: File) => {
  return URL.createObjectURL(file);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="disclaimer-modal">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="disclaimer-form"
      >
        <!-- 免责理由 -->
        <el-form-item label="免责理由" prop="disclaimerReason" required>
          <el-select
            v-model="form.disclaimerReason"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in disclaimerReasons"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 免责说明 -->
        <el-form-item label="免责说明" prop="disclaimerDescription" required>
          <el-input
            v-model="form.disclaimerDescription"
            type="textarea"
            :rows="4"
            placeholder="请填写免责说明"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 上传凭证 -->
        <el-form-item label="上传凭证" prop="proofImages" required>
          <div class="upload-section">
            <!-- 已选择的文件列表 -->
            <div v-if="fileList.length > 0" class="file-list">
              <div
                v-for="(file, index) in fileList"
                :key="index"
                class="file-item"
              >
                <div class="image-preview">
                  <img
                    :src="getFilePreviewUrl(file)"
                    alt="凭证图片"
                    class="file-thumbnail"
                  />
                  <div class="image-overlay">
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      class="delete-btn"
                      @click="removeFile(index)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加更多图片按钮 -->
            <el-upload
              :show-file-list="false"
              :before-upload="handleFileUpload"
              accept="image/*"
              multiple
              class="add-image-upload"
            >
              <div class="add-image-btn">
                <el-icon size="24" class="add-icon">
                  <Plus />
                </el-icon>
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div class="tips-section">
        <h4 class="tips-title">提示</h4>
        <ol class="tips-list">
          <li>
            平台规定不予免责的情形请勿提交(包含但不限于:不熟悉流程、忘记操作、水印不妥、自身原因等)。
          </li>
          <li>
            初稿或终稿未逾期、未出图,不能提前申请免责(且必须在逾期后72小时内申请)。
          </li>
          <li>
            请一次性提供真实、有效、有依据的证明理由或截图,否则直接拒绝审核,胡乱提交将按差评扣分处罚。
          </li>
          <li>
            每笔订单每种免责类型仅有一次申请机会,审核后不支持任何理由申诉,切记仔细认真填写申请表单。
          </li>
          <li>
            提交审核后系统一般在3个工作日内处理完毕,审核通过后系统将通过补款方式返款至佣金余额账户。
          </li>
          <li>关于更多有关免责规则或常见问题,请查阅《设计师绩效免责条款》。</li>
        </ol>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交免责申请
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.disclaimer-modal {
  .disclaimer-form {
    .upload-section {
      .file-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;

        .file-item {
          width: 120px;
          height: 80px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #fff;
          overflow: hidden;

          .image-preview {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;

            .file-thumbnail {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;

              .delete-btn {
                background: rgba(255, 255, 255, 0.9);
                border: none;
                color: #f56c6c;
              }
            }

            &:hover .image-overlay {
              opacity: 1;
            }
          }
        }
      }

      .add-image-upload {
        .add-image-btn {
          width: 120px;
          height: 80px;
          border: 2px dashed #d9d9d9;
          border-radius: 6px;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
            background: #f0f9ff;
          }

          .add-icon {
            color: #c0c4cc;
          }
        }
      }
    }
  }

  .tips-section {
    margin-top: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #409eff;

    .tips-title {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
      font-weight: 600;
    }

    .tips-list {
      margin: 0;
      padding-left: 20px;
      color: #666;
      font-size: 12px;
      line-height: 1.6;

      li {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: center;
}

// 响应式适配
@media (max-width: 768px) {
  .disclaimer-modal {
    .disclaimer-form {
      .upload-section {
        .file-list {
          .file-item {
            width: 100px;
          }
        }

        .add-image-upload {
          .add-image-btn {
            width: 100px;
          }
        }
      }
    }
  }
}
</style>
