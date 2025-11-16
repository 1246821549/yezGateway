/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-11 17:35:09
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-11 17:35:12
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
/**密码登录 */
type LoginDatta = {
  userName: string;
  password?: string;
  codeId?: number;
  code?: string;
};

export type LogResult = {
  code: number;
  type: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    isTeam: number;
  };
  extras: string;
  time: string;
};
export const loginWithPassword = (data: LoginDatta) => {
  return http.request<LogResult>("post", baseUrlApi("pcUser/login"), {
    data
  });
};

/**短信登录 */
type LoginWithSms = {
  userName: string;
  code: string;
};
export const loginWithSms = (data: LoginWithSms) => {
  return http.request<LogResult>("post", baseUrlApi("pcUser/loginExis"), {
    data
  });
};

/**登录验证码 */
type GetLoginCode = {
  phoneNumber: string;
  userTypeId: number;
};
export const getLoginCode = (params: GetLoginCode) => {
  return http.request<LogResult>("post", baseUrlApi("pcUser/dLCaptcha"), {
    params
  });
};

/**退出登录 */
export const logout = () => {
  return http.request<LogResult>("post", baseUrlApi("pcUser/logout"));
};
