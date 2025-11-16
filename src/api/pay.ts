/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-18 09:31:25
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-18 09:31:28
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**首页中心充值获取微信支付二维码 */
type WechatUrlParmas = {
  userType: number;
  money: number;
  integral?: number;
  rechargeTypeId: number;
  typeId?: number;
  terminal: number;
  timeoutExpress?: number;
};
type GetWechatPayUrlResult = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    body: string;
    url: string;
    userRechargeId: number;
  };
};
export const getWechatPayUrl = (data: WechatUrlParmas) => {
  return http.request<GetWechatPayUrlResult>(
    "post",
    baseUrlApi("userBondRecharge/getWeChatUrl"),
    {
      data
    }
  );
};

/**
 * 获取微信绑定的二维码
 */
export const getWechatAuthUrl = (params: { tyep: number }) => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: {
      id: string;
      currUrl: string;
    };
    extras: string;
    time: string;
  }>("get", baseUrlApi("sysWechat/getAuthQRCode"), {
    params
  });
};

/** 首页中心充值获取支付宝支付二维码*/
type AlipayUrlParmas = {
  userType: number;
  money: number;
  integral?: number;
  rechargeTypeId: number;
  typeId?: number;
  terminal: number;
  timeoutExpress?: number;
};
type GetAlipayPayUrlResult = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    body: string;
    url: string;
    userRechargeId: number;
  };
};
export const getAlipayPayUrl = (data: AlipayUrlParmas) => {
  return http.request<GetAlipayPayUrlResult>(
    "post",
    baseUrlApi("userBondRecharge/getAlipayUrl"),
    {
      data
    }
  );
};
