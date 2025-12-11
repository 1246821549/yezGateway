<!--
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-07-25 10:29:52
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-15 10:48:24
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import TransparentNavbar from "@/components/TransparentNavbar/index.vue";
import AppFooter from "@/components/AppFooter/index.vue";
import { User, Lock, Iphone } from "@element-plus/icons-vue";
import { setToken, setUserInfo } from "@/utils/auth";
import { addPathMatch, getTopMenu } from "@/router/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { debounce } from "@pureadmin/utils";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import {
  getRegsiteCode,
  verifyRegsiteCode,
  isExisReferrer
} from "@/api/register";
import { getDictList } from "@/api/sysDictType";
import {
  loginWithPassword,
  loginWithSms,
  getLoginCode,
  type LogResult
} from "@/api/login";
import { getCurrentUserInfo } from "@/api/user";
import CryptoJS from "crypto-js";

defineOptions({
  name: "Login"
});

// 页面模式切换：login 登录, register 注册
const pageMode = ref("login");

// 登录方式切换
const loginType = ref("password"); // sms: 短信登录, password: 密码登录

// 表单数据
const loginForm = ref({
  phone: "",
  password: "",
  smsCode: ""
});

// 表单验证规则
const registerRules = reactive({
  phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  smsCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  confirmPassword: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请确认密码"));
        }
        if (value !== registerForm.value.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      }
    }
  ],
  referrerId: [
    {
      required: false,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback();
          return;
        }
        const params = {
          suggestUserId: value,
          userTypeId: 2
        };
        // 检查推荐人ID是否存在
        isExisReferrer(params)
          .then((res: any) => {
            if (res.code === 200) {
              callback();
            } else {
              callback(new Error("推荐人ID不存在，请检查"));
            }
          })
          .catch(() => {
            callback(new Error("推荐人ID验证失败，请稍后再试"));
          });
      }
    }
  ]
});
const loginRules = reactive({
  phone: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入手机号"));
        } else {
          const regex =
            /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
          if (!regex.test(value)) {
            callback(new Error("请输入正确的手机号"));
          } else {
            callback();
          }
        }
      }
    }
  ],
  password: [
    {
      required: true,
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (loginType.value !== "password") {
          callback();
          return;
        }
        if (!value) {
          callback(new Error("请输入密码"));
        } else {
          callback();
        }
      }
    }
  ],
  smsCode: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (loginType.value !== "sms") {
          callback();
          return;
        }
        if (!value) {
          callback(new Error("请输入短信验证码"));
        } else {
          callback();
        }
      }
    }
  ]
});

const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);
const disabled = ref(false);
// 注册表单数据
const registerForm = ref({
  phone: "",
  smsCode: "",
  password: "",
  confirmPassword: "",
  source: "",
  referrerId: null
});

// 平台来源选项
const sourceOptions = ref<Array<{ label: string; value: string }> | null>([]);

// 处理导航栏注册按钮点击
const handleRegister = () => {
  pageMode.value = "register";
};

// 处理导航栏登录按钮点击
const handleNavLogin = () => {
  pageMode.value = "login";
};

/**
 * 处理登录提交
 */
const onLogin = async () => {
  console.log("提交登录", loginForm.value);
  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;
    loading.value = true;
    let res: LogResult;
    if (loginType.value === "sms") {
      const data = {
        userName: loginForm.value.phone,
        code: loginForm.value.smsCode
      };
      res = await loginWithSms(data);
    } else {
      const data = {
        userName: loginForm.value.phone,
        password: loginForm.value.password
      };
      res = await loginWithPassword(data);
    }
    if (res.code === 200) {
      setToken({
        accessToken: res.result.accessToken,
        refreshToken: res.result.refreshToken
      } as any);
      // 全部采取静态路由模式
      usePermissionStoreHook().handleWholeMenus([]);
      addPathMatch();
      const userInfo = await getCurrentUserInfo();
      setUserInfo(userInfo.result);
      // 清除服务能力弹窗标记，确保每次登录都会弹出
      sessionStorage.removeItem("hasShownServiceAbilityDialog");

      // 登录成功后跳转：优先跳转到 redirect 参数指定的页面，否则跳转到后台首页
      const redirectPath = route.query.redirect as string;
      if (redirectPath && redirectPath !== "/login") {
        router.push(redirectPath);
      } else {
        router.push("/backend");
      }

      message("登录成功", { type: "success" });
      loading.value = false;
    } else {
      loading.value = false;
      message(res.message || "登录失败，请稍后再试", { type: "error" });
    }
  } catch (error) {
    loading.value = false;
    console.error(error);
    message("登录失败，请稍后再试", { type: "error" });
  }
};

const immediateDebounce: any = debounce(onLogin, 1000, true);

/**
 * 获取注册验证码
 */
const getRegCode = async () => {
  registerFormRef.value.validateField("phone", async (valid: boolean) => {
    if (valid) {
      const data = {
        phoneNumber: registerForm.value.phone,
        userTypeId: 2
      };
      const res = await getRegsiteCode(data);
      if (res.code === 200) {
        message("验证码已发送，请注意查收", { type: "success" });
        startRegisterCountdown();
      } else {
        message(res.message || "获取验证码失败", { type: "error" });
      }
    } else {
      message("请输入正确的手机号", { type: "warning" });
    }
  });
};

/**
 * 处理注册提交
 */
const handleRegisterSubmit = () => {
  registerFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      message("请填写完整的注册信息", { type: "warning" });
      return;
    } else {
      const params = {
        userName: registerForm.value.phone,
        code: registerForm.value.smsCode,
        passWord: CryptoJS.MD5(registerForm.value.password).toString(),
        rePassWord: CryptoJS.MD5(registerForm.value.confirmPassword).toString(),
        suggest_UserId: registerForm.value.referrerId,
        source: registerForm.value.source,
        userTypeId: 2
      };
      const res = await verifyRegsiteCode(params);
      if (res.code === 200) {
        const tempInfo = {
          userName: registerForm.value.phone,
          suggest_UserId: registerForm.value.referrerId,
          passWord: CryptoJS.MD5(registerForm.value.password).toString(),
          source: registerForm.value.source
        };
        sessionStorage.setItem("registerinfo", JSON.stringify(tempInfo));
        // 跳转到完善信息页面
        router.push({
          path: "/login/complete-info"
        });
      } else {
        sessionStorage.removeItem("registerPhone");
        message(res.message || "注册失败，请稍后再试", { type: "error" });
      }
    }
  });
};

// 切换到注册模式
const goToRegister = () => {
  pageMode.value = "register";
};

// 切换到登录模式
const goToLogin = () => {
  pageMode.value = "login";
};

const route = useRoute();
const router = useRouter();

// 组件挂载时检查登录模式
onMounted(() => {
  // 检查sessionStorage中是否有模式设置
  const savedMode = sessionStorage.getItem("loginMode");
  if (savedMode === "register") {
    pageMode.value = "register";
    // 使用后立即清除，避免影响后续访问
    sessionStorage.removeItem("loginMode");
  } else {
    pageMode.value = "login";
  }
  getSoureceDict();
});

/**
 * 获取推荐来源
 */
const getSoureceDict = async () => {
  try {
    const res = await getDictList({ code: "employment_source" });
    if (res.code === 200) {
      sourceOptions.value = res.result.map((item: any) => ({
        label: item.label,
        value: item.value
      }));
    } else {
      message("获取平台来源失败，请稍后再试", { type: "error" });
    }
  } catch (error) {
    message("获取平台来源失败，请稍后再试", { type: "error" });
  }
};

/**
 * 短信验证码倒计时
 */
const loginCountdown = ref(0);
const registerCountdown = ref(0);
let loginInterval: ReturnType<typeof setInterval> | null = null;
let registerInterval: ReturnType<typeof setInterval> | null = null;

const startLoginCountdown = () => {
  if (loginCountdown.value > 0) return;
  loginCountdown.value = 60;
  if (loginInterval) clearInterval(loginInterval);
  loginInterval = setInterval(() => {
    if (loginCountdown.value <= 1) {
      clearInterval(loginInterval!);
      loginInterval = null;
      loginCountdown.value = 0;
    } else {
      loginCountdown.value -= 1;
    }
  }, 1000);
};

const startRegisterCountdown = () => {
  if (registerCountdown.value > 0) return;
  registerCountdown.value = 60;
  if (registerInterval) clearInterval(registerInterval);
  registerInterval = setInterval(() => {
    if (registerCountdown.value <= 1) {
      clearInterval(registerInterval!);
      registerInterval = null;
      registerCountdown.value = 0;
    } else {
      registerCountdown.value -= 1;
    }
  }, 1000);
};

// 登录页获取验证码
const onLoginCode = async () => {
  if (!loginForm.value.phone) {
    message("请输入手机号", { type: "warning" });
    return;
  } else {
    const data = {
      phoneNumber: loginForm.value.phone,
      userTypeId: 2
    };
    const res = await getLoginCode(data);
    if (res.code === 200) {
      message("验证码已发送，请注意查收", { type: "success" });
      startLoginCountdown();
    }
  }
};

onUnmounted(() => {
  if (loginInterval) clearInterval(loginInterval);
  if (registerInterval) clearInterval(registerInterval);
});
</script>

<template>
  <div class="login-page min-h-screen relative bg-gray-50">
    <!-- 顶部区域 -->
    <div class="h-20 bg-white shadow-sm">
      <!-- 导航栏 -->
      <TransparentNavbar
        theme="light"
        @register="handleRegister"
        @login="handleNavLogin"
      />
    </div>

    <!-- 中间背景图片区域 -->
    <div
      class="main-content flex justify-end items-center pr-20"
      :style="{ minHeight: 'calc(100vh - 240px)' }"
    >
      <div
        class="login-box bg-white rounded-3xl shadow-2xl p-16 pb-8 w-[520px] max-w-[90vw]"
      >
        <!-- 登录模式 -->
        <div v-if="pageMode === 'login'">
          <!-- 登录方式切换 -->
          <div class="mb-10">
            <el-tabs v-model="loginType" class="login-tabs">
              <el-tab-pane label="短信登录" name="sms" />
              <el-tab-pane label="密码登录" name="password" />
            </el-tabs>
          </div>

          <!-- 表单内容 -->
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <!-- 手机号输入 -->
            <el-form-item class="mb-8" prop="phone">
              <el-input
                v-model="loginForm.phone"
                placeholder="手机号"
                size="large"
                :prefix-icon="Iphone"
              />
            </el-form-item>

            <!-- 密码登录 -->
            <el-form-item
              v-if="loginType === 'password'"
              class="mb-10"
              prop="password"
            >
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <!-- 短信验证码登录 -->
            <el-form-item
              v-if="loginType === 'sms'"
              class="mb-10"
              prop="smsCode"
            >
              <div class="flex space-x-3 w-full">
                <el-input
                  v-model="loginForm.smsCode"
                  placeholder="请输入验证码"
                  size="large"
                  class="flex-1"
                />
                <el-button
                  size="large"
                  class="px-8 whitespace-nowrap"
                  :disabled="loginCountdown > 0"
                  @click="onLoginCode"
                >
                  {{
                    loginCountdown > 0
                      ? `${loginCountdown}s后重发`
                      : "获取验证码"
                  }}
                </el-button>
              </div>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-form-item class="mb-8 mt-8">
              <el-button
                type="primary"
                size="large"
                class="w-full login-btn"
                :loading="loading"
                :disabled="disabled"
                @click="immediateDebounce()"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 注册链接 -->
          <div class="text-center mb-6 mt-8">
            <span class="text-gray-500">还没有账号? </span>
            <el-link
              type="primary"
              :underline="false"
              class="ml-1"
              @click="goToRegister"
            >
              前往注册
            </el-link>
          </div>

          <!-- 协议条款 -->
          <div class="text-center text-xs text-gray-400 leading-relaxed">
            <div class="space-x-2 flex justify-center">
              <p class="mb-2">登录即同意并接受</p>
              <el-link
                href="#"
                type="primary"
                :underline="false"
                class="text-xs font-bold ml-0.5 mr-0.5"
                >用户协议</el-link
              >
              <span class="m-0">和</span>
              <el-link
                href="#"
                type="primary"
                :underline="false"
                class="text-xs font-bold ml-0.5"
                >隐私政策</el-link
              >
            </div>
            <p class="mt-6 pt-2">24小时客服热线：19866068760</p>
          </div>
        </div>

        <!-- 注册模式 -->
        <div v-else-if="pageMode === 'register'">
          <!-- 注册标题 -->
          <div class="mb-10">
            <h2 class="text-2xl font-bold text-blue-600 mb-2">灵工注册</h2>
            <div class="text-right text-sm flex items-center justify-end">
              <span class="text-gray-500 mr-1">已有账号? </span>
              <el-link type="primary" :underline="false" @click="goToLogin">
                前往登录
              </el-link>
            </div>
          </div>

          <!-- 注册表单 -->
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            @submit.prevent="handleRegisterSubmit"
          >
            <!-- 手机号输入 -->
            <el-form-item class="mb-6" prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                size="large"
                :prefix-icon="Iphone"
              />
            </el-form-item>

            <!-- 短信验证码 -->
            <el-form-item class="mb-6" prop="smsCode">
              <div class="flex space-x-3 w-full">
                <el-input
                  v-model="registerForm.smsCode"
                  placeholder="短信验证码"
                  size="large"
                  class="flex-1"
                />
                <el-button
                  size="large"
                  class="px-6 whitespace-nowrap register-code-btn"
                  :disabled="registerCountdown > 0"
                  @click="getRegCode"
                >
                  {{
                    registerCountdown > 0
                      ? `${registerCountdown}s后重发`
                      : "获取验证码"
                  }}
                </el-button>
              </div>
            </el-form-item>

            <!-- 设置密码 -->
            <el-form-item class="mb-6" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <!-- 确认密码 -->
            <el-form-item class="mb-6" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确定密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <!-- 平台来源 -->
            <el-form-item class="mb-6">
              <el-select
                v-model="registerForm.source"
                placeholder="您从哪儿知道我们的平台?"
                size="large"
                class="w-full"
              >
                <el-option
                  v-for="item in sourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <!-- 推荐人ID -->
            <el-form-item class="mb-8" prop="referrerId">
              <el-input
                v-model="registerForm.referrerId"
                placeholder="推荐人ID（选填，如果没有就不填）"
                size="large"
              />
            </el-form-item>

            <!-- 注册按钮 -->
            <el-form-item class="mb-8">
              <el-button
                type="primary"
                size="large"
                class="w-full login-btn"
                @click="handleRegisterSubmit"
              >
                下一步
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 协议条款 -->
          <div class="text-center text-xs text-gray-400 leading-relaxed">
            <div class="space-x-1 flex justify-center items-center">
              <span>登录或完成注册即代表您同意</span>
              <el-link
                href="#"
                type="primary"
                :underline="false"
                class="text-xs font-bold"
                >用户协议</el-link
              >
              <span>和</span>
              <el-link
                href="#"
                type="primary"
                :underline="false"
                class="text-xs font-bold"
                >隐私政策</el-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色功能区域 -->
    <div class="features-section bg-white py-12">
      <div class="container mx-auto px-6">
        <div class="flex justify-center items-center space-x-16">
          <!-- 不竞标 -->
          <div class="flex items-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 text-xl font-bold">竞</span>
            </div>
            <div>
              <h4 class="text-gray-800 font-semibold mb-1">不竞标</h4>
              <p class="text-gray-500 text-sm">无需复杂的标流程</p>
            </div>
          </div>

          <!-- 不比稿 -->
          <div class="flex items-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 text-xl font-bold">比</span>
            </div>
            <div>
              <h4 class="text-gray-800 font-semibold mb-1">不比稿</h4>
              <p class="text-gray-500 text-sm">无需付出排干活</p>
            </div>
          </div>

          <!-- 远程工作 -->
          <div class="flex items-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 text-xl font-bold">远</span>
            </div>
            <div>
              <h4 class="text-gray-800 font-semibold mb-1">远程工作</h4>
              <p class="text-gray-500 text-sm">无需到线上办公</p>
            </div>
          </div>

          <!-- 灵活接单 -->
          <div class="flex items-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 text-xl font-bold">活</span>
            </div>
            <div>
              <h4 class="text-gray-800 font-semibold mb-1">灵活接单</h4>
              <p class="text-gray-500 text-sm">按需接单竞优质高</p>
            </div>
          </div>

          <!-- 自由提现 -->
          <div class="flex items-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4"
            >
              <span class="text-blue-600 text-xl font-bold">钱</span>
            </div>
            <div>
              <h4 class="text-gray-800 font-semibold mb-1">自由提现</h4>
              <p class="text-gray-500 text-sm">按时结有自由提现</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <AppFooter />
  </div>
</template>

<style scoped>
/* 大屏幕优化 */
@media (width >=1440px) {
  .main-content {
    padding-right: 120px !important;
  }
}

/* 中等屏幕适配 */
@media (width <=1024px) {
  .main-content {
    padding-right: 40px !important;
  }
}

/* 响应式设计 */
@media (width <=1024px) {
  .features-section .space-x-16 {
    gap: 2rem;
  }
}

@media (width <=1200px) {
  .features-section .space-x-16 {
    gap: 2rem;
  }
}

@media (width <=968px) {
  .features-section .flex {
    flex-direction: column;
    gap: 2.5rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .features-section .space-x-16 {
    gap: 0;
  }

  .features-section {
    padding: 3rem 0;
  }
}

@media (width <=480px) {
  .features-section {
    padding: 2rem 0;
  }

  .features-section .flex {
    gap: 2rem !important;
  }

  .features-section .w-16 {
    width: 3rem !important;
    height: 3rem !important;
  }

  .features-section .mr-4 {
    margin-right: 0.75rem !important;
  }
}

@media (width <=1024px) {
  .main-content {
    padding-right: 40px !important;
  }

  .login-box {
    width: 90% !important;
    max-width: 480px !important;
  }
}

@media (width <=768px) {
  .main-content {
    justify-content: center !important;
    height: auto !important;
    min-height: calc(100vh - 240px) !important;
    padding-top: 2rem;
    padding-right: 0 !important;
    padding-bottom: 2rem;
  }

  .login-box {
    width: 90% !important;
    max-width: 420px !important;
    padding: 48px !important;
    padding-bottom: 32px !important;
  }
}

@media (width <=640px) {
  .login-box {
    width: 95% !important;
    max-width: 400px !important;
    padding: 40px !important;
    padding-bottom: 24px !important;
    margin: 0 20px;
  }

  .main-content {
    justify-content: center !important;
    height: auto !important;
    min-height: calc(100vh - 200px) !important;
    padding-top: 1.5rem;
    padding-right: 0 !important;
    padding-bottom: 1.5rem;
  }

  .h-20 {
    height: 60px;
  }
}

@media (width <=480px) {
  .main-content {
    height: auto !important;
    min-height: calc(100vh - 180px) !important;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .login-box {
    width: 95% !important;
    max-width: 350px !important;
    padding: 32px !important;
    padding-bottom: 20px !important;
  }

  .mb-10 {
    margin-bottom: 2rem !important;
  }

  .mb-8 {
    margin-bottom: 1.5rem !important;
  }

  .mb-6 {
    margin-bottom: 1rem !important;
  }

  /* 验证码按钮在小屏幕上的优化 */
  .space-x-3 {
    gap: 0.5rem;
  }

  .px-8 {
    padding-right: 1rem !important;
    padding-left: 1rem !important;
  }

  .px-6 {
    padding-right: 0.75rem !important;
    padding-left: 0.75rem !important;
  }

  /* 注册表单标题在小屏幕优化 */
  h2 {
    font-size: 1.5rem !important;
  }
}

.main-content {
  position: relative;
  padding-top: 2rem;
  padding-bottom: 2rem;
  background: url("@/assets/image/login/banner.png") no-repeat center center;
  background-size: cover;
}

/* 登录框样式 */
.login-box {
  position: relative;
  z-index: 10;
  border: 1px solid rgb(255 255 255 / 30%);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);
  backdrop-filter: blur(20px);
}

/* 自定义登录按钮样式 */
:deep(.login-btn) {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #4da6ff 0%, #2563eb 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(59 130 246 / 30%);
}

:deep(.login-btn:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 24px rgb(59 130 246 / 40%);
  transform: translateY(-1px);
}

/* 输入框样式优化 */
:deep(.el-input__wrapper) {
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0 rgb(59 130 246 / 10%);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgb(59 130 246 / 15%);
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #1e293b;
}

/* 下拉选择框样式优化 */
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

/* 注册页面获取验证码按钮样式 */
:deep(.register-code-btn) {
  font-weight: 500;
  color: #3b82f6 !important;
  background: white !important;
  border-color: #3b82f6 !important;
}

:deep(.register-code-btn:hover) {
  color: white !important;
  background: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

/* 自定义Tab样式 */
:deep(.login-tabs .el-tabs__header) {
  margin: 0;
}

:deep(.login-tabs .el-tabs__nav-wrap) {
  padding: 6px;
  border-radius: 12px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.login-tabs .el-tabs__nav) {
  display: flex;
  width: 100%;
  border: none;
}

:deep(.login-tabs .el-tabs__item) {
  flex: 1;
  padding: 12px 0;
  margin: 0 3px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  text-align: center;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

:deep(.login-tabs .el-tabs__item.is-active) {
  color: #fff;
  background: #3b82f6;
}

:deep(.login-tabs .el-tabs__active-bar) {
  display: none;
}

/* 特色功能区域样式 */
.features-section {
  border-top: 1px solid #e5e7eb;
}

/* 中间内容区域背景 */
</style>
