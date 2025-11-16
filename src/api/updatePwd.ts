import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**
 * 发送验证码-修改密码
 */
type SendCodeResult = {
  code: number;
  message: string;
};
export const sendCode = () => {
  return http.request<SendCodeResult>("get", baseUrlApi("updatePwd/captcha"));
};

/**
 * 修改密码-已登录
 */
type UpdatePwdResult = {
  code: number;
  message: string;
};
export const updatePwd = (data: {
  userType: 1;
  userName: string;
  passWord: string;
  code: string;
}) => {
  return http.request<UpdatePwdResult>("post", baseUrlApi("updatePwd/update"), {
    data
  });
};

/**
 * 修改支付密码-发送验证码
 */
type SendCodePayResult = {
  code: number;
  message: string;
};
export const sendCodePay = () => {
  return http.request<SendCodePayResult>(
    "get",
    baseUrlApi("updatePwd/codeByupdatepayPwd")
  );
};

/**
 * 修改支付密码
 */
type UpdatePwdPayResult = {
  code: number;
  message: string;
};
export const updatePwdPay = (data: {
  pwd_tx: string; //新支付密码
  code: string; //验证码
}) => {
  return http.request<UpdatePwdPayResult>(
    "post",
    baseUrlApi("updatePwd/updatepay"),
    {
      data
    }
  );
};

/**
 * 修改手机号-发送验证码
 */
type SendCodePhoneResult = {
  code: number;
  message: string;
};
export const sendCodePhone = (phone: string) => {
  return http.request<SendCodePhoneResult>(
    "get",
    baseUrlApi(`updatePwd/codeByupdatePhone/${phone}`)
  );
};

/**
 * 修改手机号
 * userName就是新手机号字段
 */
type UpdatePwdPhoneResult = {
  code: number;
  message: string;
};
export const updatePwdPhone = (data: { userName: string; code: string }) => {
  return http.request<UpdatePwdPhoneResult>(
    "post",
    baseUrlApi("updatePwd/updatePhone"),
    {
      data
    }
  );
};
