# V2.8 市场业态感知（PRD v1.8 产品方向）
基线：a8b30718d92e9aa47c12d222022a58106964fbd3。独立 feature 分支，不改生产 main，不改生成路由、不改 Pages/Worker 绑定或密钥。
## 变更
- / 默认市场态势，按资料截止日近七天挑选三种不同事件类型；角色切换只改变展示排序，并非权限控制。
- /?view=issues 全量领导可见议题，类型、资料性质、关键词筛选；个人关注保存在当前浏览器，公开/业务样例明确区分。持续关注包括已发布专报待核事项，不代表企业已确认或派单。
- /?view=briefs 统一报告目录，/?issue=...、/monthly、/reports 原链接保留；历史证据按原期次过滤。
- 首页综合研判调用已有同源 POST /api/topic-chat，服务端重新检索公开证据；无有效引用或调用失败不展示假答案。专题页面沿用原逻辑。
- 资料截止日期取已收录来源的最大日期。未连接采集服务、真实集团台账或持久业务议题状态，不宣称实时更新；本版不新增抓取任务。下一阶段需接入经授权的数据源与持久化事件/版本库、增量研判和真实刷新调度。
## 验证
- bun install --frozen-lockfile
- bun run test
- bun run build:cloudflare
- bun run build:pages-bridge
- node scripts/verify-worker-pages.mjs（启动 Worker preview 后）
- node scripts/verify-browser-navigation.mjs（需要 Chromium/playwright-core）
- 手工验证 AI：已配置 AI_API_KEY/AI_BASE_URL/AI_MODEL 与限流绑定的预览 Worker；成功必须返回真实模型输出和有效来源，未配置时显示错误，旧 API 配置不变。
## 发布/回退
先用隔离 Worker 预览及预览 Pages binding 验证；生产桥接到既有 Worker，只有 Pages 预览部署不等于新 SSR/AI 已上线。验证后再审阅 PR、合并 main、更新 Worker 和匹配的 Pages assets。可回退原提交对应的 Worker 和 Pages 部署，不 force push。
