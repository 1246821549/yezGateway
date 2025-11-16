/**
 * @Description: 文件描述
 * @Author: 程前
 * @Date: 2025-08-13 17:06:21
 * @LastEditors: 程前
 * @LastEditTime: 2025-08-13 17:06:25
 */

/**
 * 是否移动端
 * @returns
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
