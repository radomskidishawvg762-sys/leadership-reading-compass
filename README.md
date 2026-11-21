# Leadership Reading Compass

面向管理层的市场业态感知演示站，包含周度速览、月度简报、事件专报和专题查询。

此仓库存放 GitHub 独立版本，原始界面项目由 Lovable 生成。

## Cloudflare Pages

下载 [Cloudflare Pages 上传包](deploy/cloudflare-pages.zip)。在 Pages 控制台使用 Direct Upload 上传 ZIP，压缩包根目录为 `index.html`。此包是静态演示版，打开即进入事件专报。

启动、测试和构建源码的命令见下方。

## Development

克隆仓库后，在项目目录运行以下命令，再打开终端显示的本地地址。

```sh
npm install
npm run dev
```

运行 `npm test` 执行测试，运行 `npm run build` 生成生产构建。

从「月度简报」可以切换月份，按当期证据下钻和追问。追问按已有材料匹配问题，缺少依据时会提示。公开资料与虚构业务样例在页面中分别标注。测试发布流程可直接访问本地 `/workbench`，样例发布状态保存在当前浏览器，支持重置。
