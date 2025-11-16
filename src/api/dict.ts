import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**
 * 获取字典类型-值列表
 */
type DictDetailResult = {
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
    dictTypeId: number;
    label: string;
    value: string;
    code: string;
    name: string;
    tagType: string;
    styleSetting: string;
    classSetting: string;
    orderNo: number;
    remark: string;
    extData: string;
    status: number;
  }[];
};
export const getDictDetail = (params: { code: string }) => {
  return http.request<DictDetailResult>(
    "get",
    baseUrlApi("sysdicttype/datalist"),
    { params }
  );
};
