# 小程序 - 职位发布（带二维码上传）

- 管理员可选择二维码图片并上传到你的 Vercel 接口，接口再转存至腾讯云 COS，返回 `qrUrl`。
- 职位详情展示 `qrUrl`（长按识别），或复制微信号联系。

## 本地运行
1. 用微信开发者工具打开 `weapp/` 目录。
2. 编辑 `weapp/config.js` 把 `API_BASE` 改成你的 Vercel 域名（https）。
3. 微信公众平台 → 开发管理 → 开发设置：
   - **request 合法域名**：`https://你的-vercel域名`
   - **uploadFile 合法域名**：`https://你的-vercel域名`
   - **downloadFile 合法域名**：`https://你的COS域名`（例：`https://<bucket>.cos.<region>.myqcloud.com`）
