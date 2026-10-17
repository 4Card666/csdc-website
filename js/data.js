/*
  CSDC 网站资料文件
  修改车手、赛程、公告和新闻时，主要编辑这个文件即可。
  注意：保留引号、逗号和中括号等符号。
*/

const drivers = [
  { name: "33Chen", number: "334", team: "Team PunkSta", car: "", tag: "" },
  { name: "7Xin", number: "313", team: "Team VALITANT", car: "", tag: "" },
  { name: "Akarui", number: "002", team: "Team HCR", car: "", tag: "" },
  { name: "Ambr0se", number: "91", team: "No Team", car: "", tag: "" }
];

const schedule = [
  { round: "ROUND 01", title: "揭幕战（待公布）", date: "日期待定", track: "赛道待公布", format: "资格赛 / 正赛", status: "待公布", statusType: "pending" },
  { round: "ROUND 02", title: "第二站（待公布）", date: "日期待定", track: "赛道待公布", format: "资格赛 / 正赛", status: "待公布", statusType: "pending" },
  { round: "ROUND 03", title: "赛季决赛（待公布）", date: "日期待定", track: "赛道待公布", format: "淘汰赛 / 决赛", status: "待公布", statusType: "pending" }
];

const news = [
  { type: "公告", date: "2026-10-16", title: "CSDC 官网试运行", summary: "欢迎来到 CSDC 神力科莎虚拟漂移赛事官网。赛事规则、参赛车手与赛程信息将陆续更新，请关注后续公告。", pinned: true },
  { type: "赛事动态", date: "待更新", title: "新赛季信息即将公布", summary: "赛事举办时间、赛道安排、参赛方式等信息确认后，将在本页面统一发布。", pinned: false },
  { type: "社区", date: "待更新", title: "车手阵容持续更新中", summary: "车手名单目前为页面演示内容，正式阵容请以赛事主办方发布的信息为准。", pinned: false }
];


/*
  以下是本次新增模块的数据。
  请把示例对象替换为主办方确认的真实信息；暂时没有确认的内容可以保留为空数组。
  Logo 建议放进 assets/sponsors/ 文件夹，并填写相对路径，例如："assets/sponsors/brand-name.png"。
*/
const sponsors = [
  // 示例格式：{ name: "赞助商名称", level: "冠名赞助商", logo: "assets/sponsors/name.png", url: "https://example.com", description: "品牌简介" }
];

const standingsSeason = "2026 赛季";
const standings = [
  // 示例格式：{ rank: 1, name: "车手姓名", number: "07", team: "车队名称", rounds: [25, 18, 0], total: 43 }
];
const standingsRounds = ["第一站", "第二站", "第三站"];
