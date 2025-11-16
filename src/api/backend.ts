import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**
 * 获取用户金额
 */
export type UserAmount = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    userBalance: number;
    userPoints: number;
    userMoneyBond: number;
    userTeamMoneyBond: number;
    userTeamNumber: number;
    inTransitOrderAmount: number;
    iceAmount: number;
    dynAmount: number;
  };
};
export const getUserAmount = (id: number) => {
  return http.request<UserAmount>(
    "get",
    baseUrlApi(`userBondRecharge/userAmount/${id}`)
  );
};

/**
 * 支付回调-商户直连
 * 用于查询支付状态，
 */
export const wechatPayCallback = (userRechargeId: number) => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: {
      code: number;
    } | null;
    extras: string;
    time: string;
  }>("get", baseUrlApi("pUserInfo/rechargeVipRoll"), {
    params: { userRechargeId }
  });
};
