import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
/**
 * 获取vip类型
 */
type VipTypeResult = {
  code: number;
  message: string;
  result: {
    id: number;
    createTime: string;
    updateTime: string;
    createUserId: number;
    createUserName: string;
    updateUserId: number;
    updateUserName: string;
    isDelete: boolean;
    userTypeId: number;
    month: number;
    amount: number;
    discountAmount: number;
    explain: string;
    firstDiscount: number;
    firstDiscountAmount: number;
    aheadDay: number;
    renewDiscount: number;
    renewDiscountAmount: number;
  };
};
export const getVipType = (params?: object) => {
  return http.request<VipTypeResult>(
    "get",
    baseUrlApi("pUserInfo/getUserVipType"),
    {
      params
    }
  );
};

/**
 * 获取用户vip记录
 */
type VipRecordResult = {
  code: number;
  message: string;
  result: {
    itmes: VipLog[];
  };
};
type VipLog = {
  realName: string;
  tximg: string;
  createTime: string;
  userVipTypeName: string;
};

export const getVipRecord = (data?: object) => {
  return http.request<VipRecordResult>(
    "post",
    baseUrlApi("pUserInfo/getUserVipLog"),
    {
      data
    }
  );
};

/**
 * 充值vip
 */
export const rechargeVip = (data: object) => {
  return http.request<{
    userId: number;
    userVipTypeId: number;
    userRechargeId: number;
    amount: number;
    integral: number;
    paymentMethod: number;
    paymentPassword: string;
  }>("post", baseUrlApi("pUserInfo/updateuservip"), { data });
};
