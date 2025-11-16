import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**
 * 订单项类型定义
 */
export type OrderItem = {
  id: number;
  distributionId: number;
  distributionCreateTime: string | null;
  orderNumber: string;
  demandIllustrate: string | null;
  orderTypeId: number | null;
  orderTypeName: string;
  platTypeId: number | null;
  platTypeName: string | null;
  orderAddTime: string;
  documentaryCustomerName: string;
  wangWang: string;
  orderAmount: number;
  brokerDividendRatio: number | null;
  brokerDividendAmount: number | null;
  dividendRatio: number;
  dividendAmount: number;
  designState: number;
  designStateName: string | null;
  settlementState: number;
  orderCompleteState: number;
  orderCompleteTime: string | null;
  isReassignment: number;
  cg_YQ: string;
  cg_Wc_Time: string | null;
  firstDraftTime: string;
  zg_YQ: string;
  zg_Wc_Time: string | null;
  finalTime: string;
  abnormalState: number;
  tradeState: number;
  tradeStateName: string | null;
  qx_fh: number;
  firstDraftUploadState: number;
  finalUploadState: number;
  completeNeedApprove: number;
  js_time: number;
  isSqGp: number;
  isTdMz: number | null;
  isCgMz: number | null;
  isZgMz: number | null;
  isJzZgMz: number;
  isGpMz: number | null;
  repeatFirstDraft: number;
  repeatFinalDraft: number;
  isDraftDetial: number;
  isDemand: number;
  isBroker: number;
  brokerUserId: number | null;
  brokerAutoincrementUserId: number | null;
  brokerRealName: string | null;
  finalDisclaimer: number;
  isEmergent: number;
};

/**
 * 订单列表分页数据
 */
export type OrderPageData = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: OrderItem[];
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

/**
 * 获取订单列表响应类型
 */
export type OrderListResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    Data: OrderPageData;
    zt_num: number; // 在途订单数
    yc_num: number; // 异常订单数
  };
};
// designState 1-待派发 2-派发大厅 3-派发群 4-已派发 5-已接单 6-初稿中 7-改稿中 8-已退单 9-已退款 10-已完成
export const getOrderList = (data: {
  isZG_YQ?: number; // 是否终稿逾期
  isCG_YQ?: number; // 是否初稿逾期
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  page: number; // 页码
  pageSize: number; // 每页条数
  orderNumber?: string; // 订单编号
  keyword?: string; // 关键词
  designState?: number; //设计状态 不传或者null 则查询全部  6-在途 7-已完成 8-已退单
  settlementState?: number; //结算状态   1-已结算 0-未结算
  isReassignment?: number; //是否改派   1-是 0-否
  abnormalState?: number; //异常状态   1-是 0-否
}) => {
  return http.request<OrderListResponse>(
    "post",
    baseUrlApi("userOrder/myOderPage"),
    {
      data
    }
  );
};

/**
 * 获取订单详情
 */
export type OrderDetailResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: OrderDetail;
};
export type OrderDetail = {
  id: number;
  distributionId: number;
  distributionCreateTime: string;
  orderNumber: string;
  demandIllustrate: string;
  referWebsite: string;
  orderAmount: number;
  referPicture: string;
  orderDownloadTime: string;
  orderTypeID: number;
  orderTypeName: string;
  platTypeId: number;
  platTypeName: string;
  orderAddTime: string;
  qx_fh: number;
  isReassignment: number;
  tradeState: number;
  tradeStateName: string;
  storeName: string;
  wangWang: string;
  documentaryCustomerName: string;
  dispatchCustomerName: string;
  abnormalState: number;
  productTypeID: number;
  productType: string;
  industryTypeId: number;
  industryTypeName: string;
  platformName: string;
  taskAmount: number;
  userId: number;
  dividendAmount: number;
  dividendRatio: number;
  brokerDividendAmount: number;
  brokerDividendRatio: number;
  firstPunish: number;
  finalPunish: number;
  settlementState: number;
  firstDraftTime: string;
  finalTime: string;
  cg_YQ: string;
  cg_Wc_Time: string;
  zg_YQ: string;
  zg_Wc_Time: string;
  designState: number;
  designStateName: string;
  firstDraftUploadState: number;
  finalUploadState: number;
  orderCompleteState: number;
  orderCompleteTime: string;
  completeNeedApprove: number;
  js_time: number;
  isSqGp: number;
  isTdMz: number;
  isCgMz: number;
  isZgMz: number;
  isJzZgMz: number;
  isGpMz: number;
  repeatFirstDraft: number;
  repeatFinalDraft: number;
  isDraftDetial: number;
  finalDisclaimer: number;
  nextAnnotateTime: string;
  isDemand: number;
  isBroker: number;
  brokerUserId: number;
  brokerAutoincrementUserId: number;
  brokerRealName: string;
  isEmergent: number;
};
export const getOrderDetail = (data: { orderId: number }) => {
  return http.request<OrderDetailResponse>(
    "post",
    baseUrlApi("userOrder/orderDetail"),
    {
      data
    }
  );
};

/**
 * 获取订单详情页批注列表
 */
export type OrderAnnotateListResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: OrderAnnotateList;
};
export type OrderAnnotateList = {
  items: OrderAnnotateItem[];
  total: number;
  page: number;
  pageSize: number;
};
export type OrderAnnotateItem = {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  adminUserName: string;
  annotationsType: string;
  annotationsReason: string;
  imagePath: string;
  isPlat: number;
  avatar: string;
  createTime: string;
  isMe: number;
};

export const getOrderAnnotateList = (data: {
  orderId: number;
  page: number;
  pageSize: number;
}) => {
  return http.request<OrderAnnotateListResponse>(
    "post",
    baseUrlApi("userOrder/getOrderAnnotations"),
    {
      data
    }
  );
};

/**
 * 添加订单批注
 */
export type AddOrderAnnotationResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: any;
};
export const addOrderAnnotation = (data: {
  userId: number;
  orderId: number;
  annotationsType: string;
  annotationsReason: string;
  imagePath: string;
  isPlat: number;
}) => {
  return http.request<AddOrderAnnotationResponse>(
    "post",
    baseUrlApi("userOrder/addAnnotations"),
    {
      data
    }
  );
};

/**
 * 获取初稿上传历史列表
 */
export type HistoryDraftListResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: HistoryDraftItem[];
};

export type HistoryDraftItem = {
  id: number;
  createTime: string;
  updateTime: string;
  createUserId: number;
  createUserName: string;
  updateUserId: number;
  updateUserName: string;
  isDelete: boolean;
  orderId: number;
  distributionId: number;
  reassignmentId: number;
  firstDraftImagePath: string; // 初稿图片
  firstDraftFilePath: string; // 初稿文件
  finalImagePath?: string; // 终稿主图
  finalDetialPath?: string; // 终稿详情图
  finalDetialsPath?: string; // 终稿详情切片图
  finalFilePath?: string; // 终稿源文件
  isHead: number;
  isResponsible: number;
  isDisclaimer: number;
  fineMoney: number;
  rewardMoney: number;
};
export const getFirstDraftHistoryList = (data: { id: number }) => {
  return http.request<HistoryDraftListResponse>(
    "post",
    baseUrlApi("userOrder/firstHistoryList"),
    {
      data
    }
  );
};

/**
 * 获取终稿上传历史列表
 */
export const getFinalDraftHistoryList = (data: { id: number }) => {
  return http.request<HistoryDraftListResponse>(
    "post",
    baseUrlApi("userOrder/finalHistoryList"),
    {
      data
    }
  );
};

/**
 * 初稿上传
 */
export const uploadFirstDraft = (data: { id: number; imgPaths: string[] }) => {
  return http.request("post", baseUrlApi("userOrder/firstDraftUpload"), {
    data
  });
};

/**
 * 终稿上传
 */
export const uploadFinalDraft = (data: {
  id: number;
  imgPaths: string[]; // 图片地址
  detialPaths: string[]; // 终稿详情图
  detialsPaths: string[]; // 终稿详情切片图
  zipPath: string; // 源文件地址
}) => {
  return http.request("post", baseUrlApi("userOrder/finalDraftUpload"), {
    data
  });
};

/**
 * 初稿免责申请
 */
export const applyFirstDraftDisclaimer = (data: {
  orderId: number;
  disclaimerReason: string;
  disclaimerDescription: string;
  proofImages: string; // 逗号分隔的图片URL字符串
}) => {
  return http.request(
    "post",
    baseUrlApi("userOrder/applyFirstDraftDisclaimer"),
    {
      data
    }
  );
};

/**
 * 终稿免责申请
 */
export const applyFinalDraftDisclaimer = (data: {
  orderId: number;
  disclaimerReason: string;
  disclaimerDescription: string;
  proofImages: string; // 逗号分隔的图片URL字符串
}) => {
  return http.request(
    "post",
    baseUrlApi("userOrder/applyFinalDraftDisclaimer"),
    {
      data
    }
  );
};

/**
 * 申请免责
 */
export const applyExemption = (data: {
  orderId: number;
  distributionId: number; // 派单id
  userId: number; // 用户id
  disclaimerType: string; // 免责类型 直接传文字 "初稿免责" "终稿免责" "改派免责" "退单免责"
  disclaimerReason: string; // 免责原因
  disclaimerRmark: string; // 备注
  imagePath: string; // 免责凭证图片路径
  explainReason: string; // 免责理由
}) => {
  return http.request("post", baseUrlApi("userOrder/disclaimer"), {
    data
  });
};

/**
 * 分页获取免责记录历史
 */
export type ExemptionHistoryListResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    items: ExemptionHistoryItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type ExemptionHistoryItem = {
  id: number;
  orderNumber: string;
  createTime: string;
  isVip: number;
  disclaimerType: string;
  disclaimerReason: string;
  disclaimerRmark: string;
  replyContent: string;
  reviewedName: string;
  isStateName: string;
  isExplain: number;
  isCanExplain: number;
};
export const getExemptionHistoryList = (data: {
  page: number;
  pageSize: number;
  isState: number; // 状态 0-未处理 1-已处理 2-已拒绝
  orderNumber: string; // 订单编号
  beginTime: string; // 开始时间
  endTime: string; // 结束时间
  disclaimerType: string; // 免责类型
}) => {
  return http.request<ExemptionHistoryListResponse>(
    "post",
    baseUrlApi("userOrder/orderDisclaimerPage"),
    {
      data
    }
  );
};

/**
 * 获取门户首页订单类型列表
 */
export type OrderTypeListResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: OrderTypeItem[];
};
export type OrderTypeItem = {
  id: number;
  createTime?: string;
  updateTime?: string;
  createUserId?: number;
  createUserName?: string;
  updateUserId?: number;
  updateUserName?: string;
  isDelete?: boolean;
  name: string; // 类型名称
  parentId?: number;
  isCaseShow?: number;
  sort?: number;
  userTypeId?: number;
  platTypeIds?: string;
  productTypeIds?: string;
  industryTypeIds?: string;
  attributeTypeIds?: string;
  otherTypeIds?: string;
  referAmount?: number;
  referMonthAmount?: number;
  referContent?: string;
  referMonthContent?: string;
  isState?: number;
  childrens?: OrderTypeItem[]; // 子类型列表
};
export const getOrderTypeList = (params?: {
  pid?: number;
  isHide?: boolean;
}) => {
  // 构建查询参数
  const queryParams: string[] = [];
  if (params?.pid !== undefined) {
    queryParams.push(`pid=${params.pid}`);
  }
  if (params?.isHide !== undefined) {
    queryParams.push(`isHide=${params.isHide}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  return http.request<OrderTypeListResponse>(
    "post",
    baseUrlApi(`dicData/orderTypes${queryString}`),
    {}
  );
};

/**
 * 根据订单类型获取订单详情分页
 */
export type OrderDetailPageResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    items: OrderDetailPageItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};
export type OrderDetailPageItem = {
  id: number;
  platName: string; // 平台名称
  orderTypeId: number; // 订单类型id
  orderTypeName: string; // 订单类型名称
  isDistribute: number; // 是否派发
  firstDraftTime: string; // 初稿时间
  finalTime: string; // 终稿时间
  demandIllustrate: string; // 需求说明
  referPicture: string; // 参考图片
  referWebsite: string; // 参考网站
  avatar: string; // 客服头像
  realName: string; // 客服名称
  createTime: string; // 发布时间
  taskAmount: number; // 订单金额
  isEmergent: number; // 是否紧急
};
export const getOrderDetailPage = (data: {
  search?: {
    fields?: string[];
    keyword?: string;
  };
  keyword?: string;
  filter?: {
    logic?: number;
    filters?: string[];
    field?: string;
    operator?: number;
    value?: string;
  };
  page: number;
  pageSize: number;
  field?: string;
  order?: string;
  descStr?: string;
  orderTypeId?: number;
  productTypeId?: number;
  sortPrice?: boolean; // 是否排序价格
  sortTime?: boolean; // 是否排序时间
}) => {
  return http.request<OrderDetailPageResponse>(
    "post",
    baseUrlApi("orderDistribution/pageNimble"),
    {
      data
    }
  );
};

/**
 * 根据订单id获取详情
 */
export type HomeOrderDetailResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: OrderDetailInfo;
};
export type OrderDetailInfo = {
  id: number;
  orderId: number; // 订单id
  orderTypeId: number; // 订单类型id
  orderTypeName: string; // 订单类型名称
  platTypeName: string; // 平台类型名称
  productTyepId: number; // 产品类型id
  productTypeName: string; // 产品类型名称
  platformName: string; // 平台名称
  finalTime: string; // 终稿时间
  firstDraftTime: string; // 初稿时间
  demandIllustrate: string; // 需求说明
  distributionState: number; // 派发状态
  designState: number; // 设计状态
  createTime: string; // 发布时间
  adminId: number; // 发布人ID
  adminName: string; // 发布人
  adminTx: string; // 发布人头像
  orderNumber: string; // 订单编号
  isSeize: number; // 是否已抢单
  isSuccess: number; // 是否抢单成功
  isEmergent: number; // 是否紧急
  taskAmount: number; // 订单金额
  referWebsite: string; // 参考网站
  referPicture: string; // 参考图片
};
export const getHomeOrderDetailById = (data: { id: number }) => {
  return http.request<HomeOrderDetailResponse>(
    "post",
    baseUrlApi("orderDistribution/detail"),
    {
      data
    }
  );
};

/**
 * 抢单检查响应
 */
export type SeizeOrderCheckResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: {
    code: number;
    message: string;
  };
};

/**
 * 抢单响应
 */
export type SeizeOrderResponse = {
  code: number;
  extras: any;
  message: string;
  time: string;
  type: string;
  result: string;
};

/**
 * 抢单检查
 */
export const checkSeizeOrder = (data: { id: number }) => {
  return http.request<SeizeOrderCheckResponse>(
    "post",
    baseUrlApi("orderDistribution/seizeOrderCheck"),
    {
      data
    }
  );
};

/**
 * 抢单
 */
export const seizeOrder = (data: { id: number }) => {
  return http.request<SeizeOrderResponse>(
    "post",
    baseUrlApi("orderDistribution/seizeOrder"),
    {
      data
    }
  );
};
