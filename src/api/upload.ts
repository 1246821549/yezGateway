/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-13 10:44:54
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-14 11:25:34
 */
import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

/**文件上传至阿里云oss */
export const uploadFileToOss = (formData: FormData) => {
  return http.request<UploadFileToOssResponse>(
    "post",
    baseUrlApi("ossFile/uploadFile"),
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};
export type UploadFileToOssResponse = {
  code: number;
  type: string;
  message: string;
  result: {
    id: number;
    provider: string;
    name: string;
    url: string;
    sizeKb: string;
    suffix: string;
    filePath: string;
    fileName: string;
  };
  extras: string;
  time: string;
};
