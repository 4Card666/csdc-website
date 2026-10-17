# CSDC 网站（第一版）

这是一个不需要安装框架的静态网站，适合初学者。

## 如何打开
1. 解压 `CSDC-Website.zip`。
2. 打开文件夹。
3. 双击 `index.html`，即可在浏览器中查看首页。
4. 通过顶部导航查看车手列表、赛事公示、公告与新闻。

## 如何修改内容
打开 `js/data.js`，可以编辑：
- `drivers`：车手列表
- `schedule`：赛程
- `news`：公告与新闻

建议使用 Visual Studio Code 编辑。修改后保存，再刷新浏览器即可看到变化。

## 注意
- 目前车手、赛程与公告均为演示内容，不代表真实 CSDC 赛事信息。
- 第一版没有网页管理后台；内容通过编辑 `js/data.js` 修改。
- 网站字体会尝试从 Google Fonts 加载；如果无法联网，仍可使用系统字体显示。
- 目前未添加真实赛车照片，视觉部分使用 CSS 图形占位，避免使用未经授权的图片。

## 文件结构
- `index.html`：首页
- `drivers.html`：车手列表
- `schedule.html`：赛事公示
- `news.html`：公告与新闻
- `css/style.css`：页面样式
- `js/data.js`：赛事数据
- `js/app.js`：读取数据并生成页面内容
