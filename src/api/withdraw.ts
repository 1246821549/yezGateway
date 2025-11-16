import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**
 * 用户提现前校验
 */
export type WithdrawCheckResult = {
  code: number;
  type: string;
  message: string;
  result: number;
  extras: string;
  time: string;
};
export const withdrawCheck = () => {
  return http.request<WithdrawCheckResult>(
    "post",
    baseUrlApi(`tLG_User_Withdrawal/preWithdrawalVerification/1`)
  );
};

/**
 * 用户提现界面显示的数据
 */
export type WithdrawData = {
  code: number;
  type: string;
  message: string;
  result: {
    monthlyFee: number; // 月结超限手续费率
    weeklyFee: number; // 周结超限手续费率
    margin: number; // 转周结需要保证金数值
    userMarginAmount: number; // 当前用户保证金数值
    entryTime: string; // 用户入职时间
    servicePoints: number; // 服务分限制分数
    completequantity: number; // 完成单量限制
    userCq: number; // 当前用户完成单量
    userServicePoint: number; // 当前用户服务分
    balance: number; // 可提现余额
    minMoney: number; // 提现金额最低限制
  };
};
export const withdrawData = () => {
  return http.request<WithdrawData>(
    "post",
    baseUrlApi("withdrawalShow/withdrawlShow")
  );
};

/**
 * 用户提现
 */
export type WithdrawParams = {
  money: number; // 提现金额
  paymentMethod: number; // 支付方式，1：微信，2：支付宝
  type: number; // 提现类型，1：余额提现，2保证金提现
  userId: number; // 用户id
};
export type WithdrawResult = {
  code: number;
  type: string;
  message: string;
  result: {
    advantage: string; // 结算方式
    bondMoneyState: string; // 账户是否已缴纳保证金
    lastTime: string; // 上次提现时间
    timeDifference: number; // 提现间隔时间
    isBondMoney: string; // 是否需要缴纳保证金
    money: number; // 本次提现金额
    realMoney: number; // 实际到账金额
    fee: number; // 手续费
    flv: number; // 手续费扣费率（%）
    bondMoney: number; // 本单产生的保证金数额
    abnormalMoney: number; // 异常金额
    isVip: number; // 是否是vip，0：否，1：是
  };
};

export const withdraw = (data: WithdrawParams) => {
  return http.request<WithdrawResult>(
    "post",
    baseUrlApi("tLG_User_Withdrawal/userWithdrawa"),
    {
      data
    }
  );
};
