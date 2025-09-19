# 职位发布版（v3）· 订阅消息一对一提醒（不走邮箱）

- 管理端“通知设置（发布员）”并订阅 → 系统获取 OpenID；发布职位时自动带入。
- 候选人职位详情页投递：上传 **简历（PDF/DOC/DOCX/Excel）**，可选 **作品集（PDF/PPT/PPTX/链接）**。
- 后端：保存到 **KV**（默认 24h）→ 发送 **订阅消息** → 点击直达“投递查看”页下载。

## 需要配置
- `config.js`：`API_BASE`、`APP_TOKEN`、`ADMIN_BIND_CODE`
- Vercel 环境变量：`APP_TOKEN`、`APPID`、`APPSECRET`、`TEMPLATE_ID`、（可选）`UPSTASH_*`、`TTL_SECONDS`

更新时间：2025-09-17 01:49:27
