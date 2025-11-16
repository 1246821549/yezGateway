/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-11 15:07:31
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-11 15:07:34
 */
export const baseUrlApi = (url: string) =>
  process.env.NODE_ENV === "development"
    ? `/api/${url}`
    : `${import.meta.env.VITE_BASE_URL}/api/${url}`;
