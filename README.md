# CSDC 官网（升级版）

纯 HTML/CSS/JavaScript 静态网站，可继续通过 GitHub Pages + GitHub Actions 发布，不需要安装框架。

## 页面结构
- `index.html`：首页、赛事简介、最新公告、积分榜预览、赞助商预览
- `drivers.html`：车手阵容
- `schedule.html`：赛程安排
- `standings.html`：赛事排名与积分
- `sponsors.html`：赞助商与合作伙伴
- `news.html`：公告与新闻
- `css/style.css`：所有页面样式
- `js/data.js`：赛事内容数据（通常只需编辑这里）
- `js/app.js`：把数据渲染到页面，不熟悉 JavaScript 时尽量不要改这个文件

## 如何更新真实赛事内容

### 1. 修改车手
打开 `js/data.js`，编辑 `drivers` 数组。每个车手示例：
```js
{ name: "车手姓名", number: "07", team: "车队名称", car: "赛车型号", tag: "DRIVER" }
```

### 2. 修改赛程
编辑同一文件中的 `schedule` 数组，每站包含 `round`、`title`、`date`、`track`、`format`、`status` 和 `statusType`。
`statusType` 使用 `pending`、`upcoming` 或 `finished` 之一，分别表示待公布、即将开始、已结束。

### 3. 修改赞助商
编辑 `sponsors` 数组，例如：
```js
{ name: "品牌名称", level: "冠名赞助商", logo: "assets/sponsors/brand.png", url: "https://example.com", description: "品牌或合作介绍" }
```
- 把 Logo 图片放到 `assets/sponsors/` 文件夹；如果没有该文件夹，可以新建。
- `logo` 写网站内相对路径，例如 `assets/sponsors/brand.png`。
- `url` 可以填写品牌官网；没有官网可填写空字符串 `""`。
- 如果还没有确认赞助商，保留空数组即可，网页会显示“合作伙伴即将公布”，不会展示虚构品牌。

### 4. 修改积分榜
编辑 `standingsSeason`、`standingsRounds` 和 `standings`：
```js
const standingsSeason = "2026 赛季";
const standingsRounds = ["第一站", "第二站", "第三站"];
const standings = [
  { rank: 1, name: "车手姓名", number: "07", team: "车队名称", rounds: [25, 18, 0], total: 43 }
];
```
- `standingsRounds` 决定表格的分站列标题。
- `rounds` 数组中的数字按顺序对应每一站；没有成绩可用 `0`，未公布可用 `"—"`。
- `total` 请按主办方确认的积分规则填写。本版不会擅自推断平分时的名次或自动计算积分。
- `rank` 使用主办方最终确认的排名。

### 5. 修改新闻
编辑 `news` 数组，每条包括 `type`、`date`、`title`、`summary` 和 `pinned`。

## 如何本地预览
1. 下载并解压整个文件夹。
2. 双击 `index.html` 在浏览器中查看。
3. 修改 `js/data.js` 并保存，刷新浏览器即可查看。若浏览器没有及时更新，尝试强制刷新。

## 如何发布更新
1. 在 GitHub 仓库上传或替换修改过的文件，确保目录结构不变。
2. 提交到工作流所部署的分支（通常为 `main`）。
3. 打开仓库的 Actions 页面，等最新部署出现绿色勾号。
4. 刷新 GitHub Pages 网站检查结果。

## 注意
- 新增模块不会自动填入真实资料。请将 `js/data.js` 中的示例车手/赛程替换为赛事主办方确认的数据；赞助商和积分数组目前为空，避免误发布虚构资料。
- 本网站没有在线后台。若以后需要主理人直接在网页上维护内容，需要另行接入 CMS 或数据服务。
- Logo 和车手照片请使用主办方提供或已获授权的素材。
