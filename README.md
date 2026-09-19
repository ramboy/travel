# Travel

个人旅行攻略与路书。

## 甘南自驾

- [完整旅行计划 HTML](gannan/gannan-guide.html)
- [完整旅行计划 Markdown](gannan/gannan-guide.md)
- [高德 JSAPI 路书](gannan/gannan-roadbook.html)
- [路线图 PNG](gannan/甘南自驾路书地图_7月18-26.png)

## 西藏阿里自驾

- [方案 A 图文攻略 HTML](tibet/tibet-guide.html)
- [方案 A 图文攻略 Markdown](tibet/tibet-guide.md)
- [新攻略维护与数据说明](tibet/GUIDE-README.md)

新攻略包含每日行程、实景图片、天气与温度曲线、酒店信息表和海拔曲线；不含交互路书。以下原有页面保留：

- [原两方案路线图](tibet/index.html)
- [A · 阿里中北线](tibet/index.html?route=classic)
- [B · 阿里北线](tibet/index.html?route=south)

西藏页面默认显示不依赖密钥的离线路线示意图。高德交互底图为可选功能，Web Key 和 securityJsCode 由访问者在浏览器本地填写，不写入仓库。

甘南高德路书页面会从 `gannan/amap-config.js` 加载 Web 端 Key 和 securityJsCode。该仓库为公开站点时，请在高德开放平台控制台为 Web Key 配置 HTTP Referer 白名单，至少限制为 `ramboy.github.io`，避免被其他域名滥用。
