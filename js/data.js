/*
  CSDC 网站资料文件
  修改车手、赛程、公告和新闻时，主要编辑这个文件即可。
  注意：保留引号、逗号和中括号等符号。
*/

const drivers = [
  { name: "Driver A", number: "07", team: "CSDC Racing", car: "Nissan Silvia S15", tag: "ROOKIE" },
  { name: "Driver B", number: "21", team: "Independent", car: "Toyota AE86", tag: "DRIVER" },
  { name: "Driver C", number: "36", team: "Night Shift", car: "BMW E36", tag: "DRIVER" },
  { name: "Driver D", number: "88", team: "CSDC Racing", car: "Nissan 180SX", tag: "DRIVER" }
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
