/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-11 14:54:16
 * @LastEditors: 程前
 * @LastEditTime: 2025-09-03 11:27:42
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/** 获取注册验证码 */
type RegisterCodeResult = {
  code: number;
  message: string;
};
export const getRegsiteCode = (params?: object) => {
  return http.request<RegisterCodeResult>(
    "post",
    baseUrlApi("pcUser/zCCaptcha"),
    {
      params
    }
  );
};

/**验证用户信息-收到注册验证码之后 */
type VerifyCodeResult = {
  code: number;
  type: string;
  message: string;
  result: string;
  extras: string;
  time: string;
};
export const verifyRegsiteCode = (data?: object) => {
  return http.request<VerifyCodeResult>(
    "post",
    baseUrlApi("pcUser/isExistUser"),
    { data }
  );
};

/**是否存在推荐人 */
export const isExisReferrer = (params?: object) => {
  return http.request("get", baseUrlApi("pcUser/isExistSuggestUser"), {
    params
  });
};

/**注册新用户 */
type AddUserResult = {
  code: number;
  type: string;
  message: string;
  result: string;
  extras: string;
  time: string;
};

type AddUserData = {
  userName: string;
  passWord: string;
  education: number;
  urgent_Phone: string;
  sex: string;
  realName: string;
  workState: number;
  work_Exp: number;
  dateBirth: string;
  school: string;
  // jobType: number;
  user_TypeId: number;
  // email: string;
  // qq: string;
  province: string;
  city: string;
  area: string;
  isBaoma: number;
  // address: string;
  specialty_des: string;
  specialty_soft: string;
  specialty_plat: string;
  specialty_shop: string;
  source?: number;
  suggest_UserId?: number;
  position: string;
  halfDaySalary: number;
  fullDaySalary: number;
};

export const registerNewUser = (data: AddUserData) => {
  return http.request<AddUserResult>("post", baseUrlApi("pcUser/add"), {
    data
  });
};
