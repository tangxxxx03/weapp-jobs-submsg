# 职位小程序 + Vercel(COS) 上传完整包

- `weapp/`：微信小程序源码（管理员上传二维码 → 详情页展示）
- `vercel_api/`：Vercel 无服务器接口（接收上传 → 写入 COS）

## 快速开始
1. 在腾讯云 COS 创建存储桶（公有读私有写），记下 **桶名/地域/公开域名**，并在 CAM 获取 **SecretId/SecretKey**。
2. 部署 `vercel_api/` 到 Vercel，配置环境变量（COS_* 与 PUBLIC_BASE）。
3. 小程序导入 `weapp/`，把 `weapp/config.js` 的 `API_BASE` 改为你的 Vercel 域名（https）。
4. 小程序后台配置合法域名：
   - request/uploadFile：你的 Vercel 域名
   - downloadFile：你的 COS 公网域名（或自定义 CDN 域名）
5. 管理员页选择二维码 → 上传成功后发布职位 → 详情页即可长按识别二维码。
