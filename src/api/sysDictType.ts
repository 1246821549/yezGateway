/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-11 17:10:05
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-14 10:39:26
 */
/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-11 17:10:05
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-11 17:10:08
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type TdicTList = {
  code: string;
};
/**获取字典值 */
type DictResult = {
  dictTypeId: number;
  label: string;
  value: string;
  code: string;
  name: string | null;
  tagType: string | null;
  styleSetting: string | null;
  classSetting: string | null;
  orderNo: number;
  remark: string | null;
  extData: string | null;
  status: number;
  createTime: string;

  updateTime: string | null;
  createUserId: number;
  createUserName: string | null;
  updateUserId: number | null;
  updateUserName: string | null;
  id: number;
};

type DictListResult = {
  code: number;
  type: string;
  message: string;
  result: DictResult[];
};

export const getDictList = (params?: TdicTList) => {
  return http.request<DictListResult>(
    "get",
    baseUrlApi("sysDictType/dataList"),
    { params }
  );
};

/**获取所有设计师类型 */
export const getDesignerType = () => {
  return http.request<DictListResult>(
    "get",
    baseUrlApi("pcUser/getDesignTypeList")
  );
};

/**获取擅长软件列表 */
export const getSkillSoftList = () => {
  return http.request<DictListResult>("get", baseUrlApi("pcUser/softList"));
};

/**获取擅长平台列表 */
export const getSkillPlatformList = () => {
  return http.request<DictListResult>(
    "get",
    baseUrlApi("pcUser/platformTypeList")
  );
};

/**获取所有产品列表 */
export const getProductList = () => {
  return http.request<DictListResult>(
    "get",
    baseUrlApi("pcUser/getProductTypeList")
  );
};

/**获取所有订单分类 */
export const getOrderTypeList = (type: string | number) => {
  return http.request<DictListResult>(
    "get",
    baseUrlApi("pcUser/designTypeList"),
    {
      params: { type }
    }
  );
};
