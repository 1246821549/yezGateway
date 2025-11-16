/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-13 11:07:23
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-18 09:31:40
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**添加用户实名 */
export const addUserAuth = (data: {
  sfz_Positive: string; // 身份证正面
  sfz_Back: string; // 身份证背面
  realName: string; // 真实姓名
  cardNo: string; // 身份证号
  sex: string; // 性别
  birthDay: string; // 出生日期
}) => {
  return http.request("post", baseUrlApi("userAuthentication/add"), {
    data
  });
};

/**删除用户实名 */
export const delUserAuth = (id: string) => {
  return http.request("post", baseUrlApi(`userAuthentication/delete/${id}`));
};

/**修改用户实名 */
export const updateUserAuth = (data: any) => {
  return http.request("post", baseUrlApi("userAuthentication/update"), {
    data
  });
};

/**查询用户实名 */
export const getUserAuth = (id: string) => {
  return http.request("get", baseUrlApi(`userAuthentication/authInfo/${id}`));
};

type FrontCard = {
  code: number;
  type: string;
  message: string;
  result: {
    realName: string;
    cardNo: string;
    url: string;
    sex: string;
    birthDay: string;
  };
  extras: string;
  time: string;
};
/**上传身份证正面到阿里云 */
export const uploadIdCardFront = (data: FormData) => {
  return http.request<FrontCard>(
    "post",
    baseUrlApi("userAuthentication/uploadFileToOssUp"),
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

type BackCard = {
  code: number;
  type: string;
  message: string;
  result: string;
  extras: string;
  time: string;
};
/**上传身份证反面到阿里云 */
export const uploadIdCardBack = (data: FormData) => {
  return http.request<BackCard>(
    "post",
    baseUrlApi("userAuthentication/uploadFileToOssDown"),
    {
      data,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 获取支付宝绑定链接
 */
export type AlipayBindUrlResult = {
  code: number;
  type: string;
  message: string;
  result: {
    id: number;
    currUrl: string;
  };
  extras: string;
  time: string;
};
export const getAlipayBindUrl = () => {
  return http.request<AlipayBindUrlResult>(
    "get",
    baseUrlApi("userBondRecharge/alipayBindUrl")
  );
};

/**
 * 用户注销
 */
export type UserCancelResult = {
  code: number;
  type: string;
  message: string;
  result: 0;
  extras: string;
  time: string;
};
export const userCancel = () => {
  return http.request<UserCancelResult>(
    "post",
    baseUrlApi("tLG_User_Logoff/add")
  );
};
