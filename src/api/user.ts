/**
 * @Author: 程前
 * @Date: 2025-07-14 17:06:00
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-18 10:03:41
 */

import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

// export type UserResult = {
//   success: boolean;
//   data: {
//     /** 头像 */
//     avatar: string;
//     /** 用户名 */
//     username: string;
//     /** 昵称 */
//     nickname: string;
//     /** 当前登录用户的角色 */
//     roles: Array<string>;
//     /** 按钮级别权限 */
//     permissions: Array<string>;
//     /** `token` */
//     accessToken: string;
//     /** 用于调用刷新`accessToken`的接口时所需的`token` */
//     refreshToken: string;
//     /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
//     expires: Date;
//   };
// };

// export type RefreshTokenResult = {
//   success: boolean;
//   data: {
//     /** `token` */
//     accessToken: string;
//     /** 用于调用刷新`accessToken`的接口时所需的`token` */
//     refreshToken: string;
//     /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
//     expires: Date;
//   };
// };

// /** 登录 */
// export const getLogin = (data?: object) => {
//   return http.request<UserResult>("post", "/login", { data });
// };

// /** 刷新`token` */
// export const refreshTokenApi = (data?: object) => {
//   return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
// };
export type UserInfo = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    address: string;
    aliPayState: string;
    authState: string;
    autoincrementUserId: number;
    bond_fs: number;
    endVipTime: string | null;
    firstComplate: number;
    firstLogin: number;
    firstOverdue: number;
    firstReassignment: number;
    firstRefund: number;
    id: number;
    infoNum: string;
    isBroker: number;
    isDisclaimer: number;
    isManager: number;
    isRechargeVip: number;
    isState: number;
    isTeam: number;
    isVip: number;
    isdeletewx: number;
    jobPosts: any[];
    liyou: string | null;
    needTryDraft: number;
    phone: string;
    pjNum: number;
    salaryRat: string | null;
    servicePoints: number;
    sex: string;
    startVipTime: string | null;
    state_xx: number; // 接单状态
    tryDraftPath: string | null;
    tryDraftSize: string | null;
    tximg: string | null;
    userGradeName: string | null;
    userGrades: any[];
    userName: string;
    userType: number;
    userTypeId: number;
    userTypeName: string | null;
    vipTypeId: number | null;
    wechatState: string;
    wjNum: number | null;
    work_ExpName: string;
    wxOpenId: string | null;
  };
};
/**获取当前用户信息-主页*/
export const getCurrentUserInfo = () => {
  return http.request<UserInfo>(
    "get",
    baseUrlApi("userBondRecharge/userBasicInfo")
  );
};

export type PageUserInfo = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    nickName: string;
    realName: string;
    education: number;
    sex: string;
    workState: number;
    dateBirth: string;
    work_Exp: number;
    urgent_Phone: string;
    qq: string;
    wechat: string;
    alipay: string;
    school: string;
    email: string;
    isBaoma: number;
    province: string;
    city: string;
    area: string;
    address: string;
    gzimg: string;
    isAuth: number; // 是否实名认证 0-否 1-是
    specialty_des: string;
    specialty_soft: string;
    specialty_plat: string;
    specialty_shop: string;
    user_TypeName: string;
    autoincrementUserId: number;
    isShowNick: number;
    msg_xt: number; // 系统消息（其它）
    msg_yy: number; // 邀请接单（邀约通知）
    msg_pf: number; // 派发消息（订单派发）
    msg_gp: number; // 改派消息（订单改派）
    msg_td: number; // 退单消息（订单退款）
    msg_wj: number; // 完结消息（订单完成）
    msg_js: number; // 结算消息（确认结算）
    msg_tx: number; // 提现消息（提现）
    msg_yq: number; // 逾期消息（初稿、终稿）
    msg_cf: number; // 处罚消息（差评、行政扣款）
    msg_tz: number; // 通知消息（通知、公告）
    msg_jl: number; // 奖励通知（任务奖励、推荐奖励）
    msg_cw: number; // 账务消息（奖罚扣补）
  };
};

/**获取个人资料-修改页 */
export const getUserInfo = () => {
  return http.request<PageUserInfo>(
    "post",
    baseUrlApi("pUserInfo/GetBaseInfo")
  );
};

type UpdateUserInfoResult = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: any;
};
/**修改个人资料 */
export const updateUserInfo = (data: Partial<PageUserInfo["result"]>) => {
  return http.request<UpdateUserInfoResult>(
    "post",
    baseUrlApi("pUserInfo/updateBase"),
    {
      data
    }
  );
};

/**
 * 获取用户服务能力
 */
export type UserServiceAbility = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    userId: number;
    servicePoints: number; // 服务分
    jd_Cg_Rate: number; // 接单成功率
    gp_Rate: number; // 改派率
    td_Rate: number; // 退单率
    cg_Zs_Rate: number; // 初稿准时率
    zg_Zs_Rate: number; // 终稿准时率
    avgPrice: number; // 客单价
    goodCommentScore: number; // 好评度
    activeScore: number; // 活跃度
    wj_Number: number; // 完结订单数
    jd_Number: number; // 接单总数
    qd_Number: number; // 抢单总数
    zt_Number: number; // 在途订单数
    td_Number: number; // 退单数
    yc_Number: number; //  异常订单数
    gp_Number: number; // 改派数
    js_Number: number; // 结算数
    jd_Cg_Rate_Point: number; // 接单成功率得分
    gp_Rate_Point: number; // 改派率得分
    td_Rate_Point: number; // 退单率得分
    cg_Zs_Rate_Point: number; // 初稿准时率得分
    zg_Zs_Rate_Point: number; // 终稿准时率得分
    avgPrice_Point: number; // 客单价得分
    activeScore_Point: number; //活跃度得分
    goodCommentScore_Point: number; //好评度得分
  };
};
export const getUserServiceAbility = () => {
  return http.request<UserServiceAbility>(
    "post",
    baseUrlApi("pUserInfo/getServicePointsInfo")
  );
};

/**
 * 修改登录密码
 */
export const updateLoginPassword = (data: {
  passwordOld: string;
  passwordNew: string;
}) => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: 0;
    extras: string;
    time: string;
  }>("post", baseUrlApi("pUserInfo/UpdateLoginPassword"), { data });
};
/**
 * 获取设计师接单时间
 * @param data
 * @returns
 */
/**
 * 接口返回的原始接单时间数据
 */
export type UserGrabTimeRaw = {
  id: number;
  createTime: string;
  updateTime: string | null;
  createUserId: number | null;
  createUserName: string | null;
  updateUserId: number | null;
  updateUserName: string | null;
  isDelete: boolean;
  userId: number;
  week: string;
  time: string;
};

export const getDesignerGrabTime = () => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: UserGrabTimeRaw[];
    extras: string;
    time: string;
  }>("post", baseUrlApi("pUserInfo/userQueryTimes"));
};

/**
 * 接单时间段
 */
export type TimeSlot = {
  time: string;
  isCheck: boolean;
};

/**
 * 用户接单时间项（用于前端展示）
 */
export type UserGrabTimeItem = {
  id: number;
  week: string;
  active: TimeSlot[];
  time: string;
};

/**
 * 旧的类型定义，保留以防其他地方使用
 */
export type UserGrabTime = {
  id: number;
  createTime: string;
  updateTime: string;
  createUserId: number;
  createUserName: string;
  updateUserId: number;
  updateUserName: string;
  isDelete: boolean;
  userId: number;
  week: string;
  time: string;
};
/**
 * 更新设计师接单时间参数类型
 */
export type UpdateGrabTimeItem = {
  id?: number;
  week: string;
  time: string;
};

/**
 * 更新设计师接单时间
 * @param data
 * @returns
 */
export const updateDesignerGrabTime = (data: {
  times: UpdateGrabTimeItem[];
}) => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: 0;
    extras: string;
    time: string;
  }>("post", baseUrlApi("pUserInfo/setUserTimes"), { data });
};

/**
 * 修改接单状态  0-开启 1-关闭
 * @param data
 * @returns
 */
export const updateGrabState = (data: { state_xx: 0 | 1 }) => {
  return http.request<{
    code: number;
    type: string;
    message: string;
    result: 0;
    extras: string;
    time: string;
  }>("post", baseUrlApi("pUserInfo/updateStatexx"), { data });
};

/**
 * 用户服务能力情况报表
 */
export type UserServiceAbilityReport = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    isVip: number; // 是否vip 0-否 1-是
    startVipTime: string; // 会员起始时间
    endVipTime: string; // 会员结束时间
    isRechargeVip: number; // 是否可充值VIP 0-否 1-是
    commonSalaryRate: number; // 非VIP分佣比例
    jd_Cg_Rate: number; // 接单成功率
    td_Rate: number; // 订单退单率
    gp_Rate: number; // 订单改派率
    cg_Zs_Rate: number; // 初稿准时率
    zg_Zs_Rate: number; // 终稿准时率
    avgPrice: number; // 客单价
    activeScore: number; // 最近30天活跃度
    goodCommentScore: number; // 最近30天好评度
    badScore: number; // 最近30天差评度
    servicePoints: number; // 服务分
    jd_Cg_Rate_Point: number; // 接单成功率得分
    td_Rate_Point: number; // 订单退单率得分
    gp_Rate_Point: number; // 订单改派率
    cg_Zs_Rate_Point: number; // 初稿准时率得分
    zg_Zs_Rate_Point: number; // 终稿准时率得分
    avgPrice_Point: number; // 客单价得分
    userGradeInfo: {
      userGradeName: string; // 灵工等级名称
      salaryRat: number; // 分佣比例
      userTypeId: number; // 灵工类型ID
    };
    userGrades: {
      userTypeId: number; // 灵工类型ID
      userGradeName: string; // 灵工类型名称
    }[];
  };
};
export const getUserServiceAbilityReport = () => {
  return http.request<UserServiceAbilityReport>(
    "get",
    baseUrlApi("pUserInfo/serviceCapability")
  );
};
