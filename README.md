# Vercel 无服务器接口（COS 上传）

## 目录
- `api/uploadImage.js`：接收小程序 `wx.uploadFile` 的文件，转存到腾讯云 COS，返回公开 URL。
- `package.json`：依赖 `cos-nodejs-sdk-v5` 与 `formidable`。

## 部署
1. 新建 Vercel 项目，把 `vercel_api/` 作为项目根目录上传或连接仓库。
2. 在 **Project → Settings → Environment Variables** 配置：
   - `COS_SECRET_ID`：腾讯云 CAM 密钥 ID
   - `COS_SECRET_KEY`：腾讯云 CAM 密钥 Key
   - `COS_BUCKET`：COS 存储桶名称（如 `weapp-qrcode-xxx`）
   - `COS_REGION`：地域（如 `ap-beijing`）
   - `PUBLIC_BASE`：COS 公开访问域名（如 `https://<bucket>.cos.<region>.myqcloud.com`）
3. 部署完成后，得到域名 `https://your-app.vercel.app`，小程序中将 `API_BASE` 设为该域名。
4. 微信后台把此域名加到 **request / uploadFile 合法域名**；把 `PUBLIC_BASE` 域名加到 **downloadFile 合法域名**。

## 注意
- 不要把密钥写进仓库代码，务必使用 Vercel 的环境变量。
- `maxFileSize` 设为 3MB，二维码足够；若有需要可调整。
