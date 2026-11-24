/*
  修改车手、赛程、公告和新闻时，主要编辑这个文件即可。
  注意：保留引号、逗号和中括号等符号。
*/

const drivers = [

  { "name": "33Chen #334", "number": "334", "team": "Team PunkSta", "car": "", "tag": "" },
  { "name": "7Xin #313", "number": "313", "team": "Team VALIANT", "car": "", "tag": "" },
  { "name": "Akarui #002", "number": "002", "team": "", "car": "", "tag": "" },
  { "name": "Ambr0se #91", "number": "91", "team": "", "car": "", "tag": "" },
  { "name": "Artoo #963", "number": "963", "team": "", "car": "", "tag": "" },
  { "name": "Aston #66", "number": "66", "team": "", "car": "", "tag": "" },
  { "name": "BK-KL #87", "number": "87", "team": "", "car": "", "tag": "" },
  { "name": "BryancLLLLL #1087", "number": "1087", "team": "", "car": "", "tag": "" },
  { "name": "C.HongYu (陳紅羽) #97", "number": "97", "team": "Team HCR", "car": "", "tag": "" },
  { "name": "Carman36 董晟豪 #36", "number": "36", "team": "", "car": "", "tag": "" },
  { "name": "Ceberus #234", "number": "234", "team": "", "car": "", "tag": "" },
  { "name": "Chatea #388", "number": "388", "team": "", "car": "", "tag": "" },
  { "name": "Code67 #67", "number": "67", "team": "", "car": "", "tag": "" },
  { "name": "diao1047 #352", "number": "352", "team": "", "car": "", "tag": "" },
  { "name": "DK #119", "number": "119", "team": "", "car": "", "tag": "" },
  { "name": "DMGdrift #224", "number": "224", "team": "", "car": "", "tag": "" },
  { "name": "E-SPEC John #113", "number": "113", "team": "", "car": "", "tag": "" },
  { "name": "EVIL #909", "number": "909", "team": "", "car": "", "tag": "" },
  { "name": "fdvs #18", "number": "18", "team": "", "car": "", "tag": "" },
  { "name": "Gray #128", "number": "128", "team": "Team Punksta", "car": "", "tag": "" },
  { "name": "Hayate #16", "number": "16", "team": "", "car": "", "tag": "" },
  { "name": "HCR-Harold chu #13", "number": "13", "team": "Team HCR", "car": "", "tag": "" },
  { "name": "HCR-Sougetsu #915", "number": "915", "team": "Team HCR", "car": "", "tag": "" },
  { "name": "HCR-Yui #316", "number": "316", "team": "Team HCR", "car": "", "tag": "" },
  { "name": "Heasly #223", "number": "223", "team": "Team Punksta", "car": "", "tag": "" },
  { "name": "HenTaiMU #112", "number": "112", "team": "", "car": "", "tag": "" },
  { "name": "HHW #502", "number": "502", "team": "Team ABN", "car": "", "tag": "" },
  { "name": "HPF #53", "number": "53", "team": "Team VALIANT", "car": "", "tag": "" },
  { "name": "Huan #115", "number": "115", "team": "", "car": "", "tag": "" },
  { "name": "itz4Card #122", "number": "122", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "JerryZhu #187", "number": "187", "team": "", "car": "", "tag": "" },
  { "name": "JimmyRacing #911", "number": "911", "team": "", "car": "", "tag": "" },
  { "name": "KALU #124", "number": "124", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "KEMIM #23", "number": "23", "team": "", "car": "", "tag": "" },
  { "name": "KIM.J #111", "number": "111", "team": "", "car": "", "tag": "" },
  { "name": "KJZ #009", "number": "009", "team": "Team VALIANT", "car": "", "tag": "" },
  { "name": "KT #815", "number": "815", "team": "Team SMG", "car": "", "tag": "" },
  { "name": "Leo_W #727", "number": "727", "team": "", "car": "", "tag": "" },
  { "name": "Mako #126", "number": "126", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "Masatonomura #90", "number": "90", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "Mask11 #765", "number": "765", "team": "", "car": "", "tag": "" },
  { "name": "McLaren #154", "number": "154", "team": "Team SMG&Anx Club", "car": "", "tag": "" },
  { "name": "MORAN #79", "number": "79", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "Mr.Spin #70", "number": "70", "team": "", "car": "", "tag": "" },
  { "name": "MRD #608", "number": "608", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "NicoOoOo #339", "number": "339", "team": "", "car": "", "tag": "" },
  { "name": "ORANGE #918", "number": "918", "team": "", "car": "", "tag": "" },
  { "name": "Panda #8", "number": "8", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "Peach #12", "number": "12", "team": "", "car": "", "tag": "" },
  { "name": "PETERL #418", "number": "418", "team": "", "car": "", "tag": "" },
  { "name": "QPY #88", "number": "88", "team": "", "car": "", "tag": "" },
  { "name": "sawatari #486", "number": "486", "team": "", "car": "", "tag": "" },
  { "name": "shlke #217", "number": "217", "team": "Team VALIANT", "car": "", "tag": "" },
  { "name": "Sor #121", "number": "121", "team": "", "car": "", "tag": "" },
  { "name": "TAKAHASHI #46", "number": "46", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "Takumi #56", "number": "56", "team": "", "car": "", "tag": "" },
  { "name": "teacheryu #11", "number": "11", "team": "Team SMG", "car": "", "tag": "" },
  { "name": "Timmy许天齐 #985", "number": "985", "team": "", "car": "", "tag": "" },
  { "name": "Tk #37", "number": "37", "team": "", "car": "", "tag": "" },
  { "name": "Turbo J #86", "number": "86", "team": "", "car": "", "tag": "" },
  { "name": "Turbo 聪 #192", "number": "192", "team": "", "car": "", "tag": "" },
  { "name": "Puding #526", "number": "526", "team": "", "car": "", "tag": "" },
  { "name": "Vincent #395", "number": "395", "team": "", "car": "", "tag": "" },
  { "name": "VIVI #919", "number": "919", "team": "", "car": "", "tag": "" },
  { "name": "WEYE #327", "number": "327", "team": "Team SMG", "car": "", "tag": "" },
  { "name": "XpeizzZ #33", "number": "33", "team": "", "car": "", "tag": "" },
  { "name": "YRA #073", "number": "073", "team": "", "car": "", "tag": "" },
  { "name": "YukinoHiKi #603", "number": "603", "team": "", "car": "", "tag": "" },
  { "name": "YYC-大连飘移 #444", "number": "444", "team": "", "car": "", "tag": "" },
  { "name": "Z #930", "number": "930", "team": "", "car": "", "tag": "" },
  { "name": "范子豪 #716", "number": "716", "team": "ZDC Drift Club", "car": "", "tag": "" },
  { "name": "果然 #130", "number": "130", "team": "ZDC Drift Club", "car": "", "tag": "" },
  { "name": "秋山延彦 #480", "number": "480", "team": "ZDC Drift CLub", "car": "", "tag": "" },
  { "name": "ZHAI #252", "number": "252", "team": "", "car": "", "tag": "" },
  { "name": "ZIPPERHUNTER #63", "number": "63", "team": "", "car": "", "tag": "" },
  { "name": "ZZC721drift #721", "number": "721", "team": "", "car": "", "tag": "" },
  { "name": "阿彬 #81", "number": "81", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "呆弟 #666", "number": "666", "team": "Team SMG", "car": "", "tag": "" },
  { "name": "沪上詹老师 #888", "number": "888", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "姐夫哥 #777", "number": "777", "team": "", "car": "", "tag": "" },
  { "name": "李由 #808", "number": "808", "team": "", "car": "", "tag": "" },
  { "name": "林仕鹏 #2", "number": "2", "team": "", "car": "", "tag": "" },
  { "name": "刘帅 #116", "number": "116", "team": "飞驰十三赛车", "car": "", "tag": "" },
  { "name": "裴凡 #117", "number": "117", "team": "Revolution革", "car": "", "tag": "" },
  { "name": "秦明 #95", "number": "95", "team": "", "car": "", "tag": "" },
  { "name": "熱狗 #340", "number": "340", "team": "Team ABN", "car": "", "tag": "" },
  { "name": "童令 #92", "number": "92", "team": "上海车镇", "car": "", "tag": "" },
  { "name": "王志龙 #65", "number": "65", "team": "", "car": "", "tag": "" },
  { "name": "小漂 #929", "number": "929", "team": "AnX Club", "car": "", "tag": "" },
  { "name": "远门 #3", "number": "3", "team": "上海车镇&AnX Club", "car": "", "tag": "" },
  { "name": "kings007 #007", "number": "007", "team": "", "car": "", "tag": "" },
 
  /*
  drivers格式如下
  { "name": "？ #？", "number": "？", "team": "？", "car": "？", "tag": "？" },
*/
];

/*
 * CSDC 公开赛程统一配置（仅控制赛程安排页，不影响 Supabase 后台赛季和赛事报名）
 * currentSeason: 当前官方赛季年份，由管理员手动切换；不随自然年份自动变化。
 * seasons: 各年份的公开展示状态。即使没有任何分站赛程，也会出现该年的选项。
 * status 只使用："筹备中"、"进行中"、"已结束"。
 * notice: 本赛季没有公布分站时，展示在空白状态中的文字。
 *
 * 后续维护：只需在这里创建新年份/修改赛季状态，并在下方 schedule 追加正式公布的比赛。
 */
const scheduleConfig = {
  currentSeason: 2026,
  seasons: {
    2026: { status: "进行中", notice: "请查看已公布的2026赛季分站安排。" },
    2027: { status: "筹备中", notice: "2027赛季正在筹备中，具体分站、日期及地点将在确认后公布。" }
  }
};

const schedule = [
  { round: "2026 ROUND 1", title: "河北涿州飞驰赛车公园站排位赛", date: "2026.6.20", track: "赛道链接：https://pan.baidu.com/s/1CLtKF3mcDXbIRMRWNVK_7g?pwd=tbuu 提取码: tbuu", format: "排位赛",status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 1", title: "河北涿州飞驰赛车公园站追走赛", date: "2026.6.21", track: "赛道链接：https://pan.baidu.com/s/1CLtKF3mcDXbIRMRWNVK_7g?pwd=tbuu 提取码: tbuu", format: "追走赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 2", title: "英国英格兰东米德兰兹北安普顿郡银石站排位赛", date: "2026.8.8", track: "赛道链接: https://pan.baidu.com/s/1nCdM33x-fRKfhPhcqxdYiA?pwd=g56p 提取码: g56p", format: "排位赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 2", title: "英国英格兰东米德兰兹北安普顿郡银石站追走赛", date: "2026.8.9", track: "赛道链接: https://pan.baidu.com/s/1nCdM33x-fRKfhPhcqxdYiA?pwd=g56p 提取码: g56p", format: "追走赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 3", title: "浙江宁波四明山站排位赛", date: "2026.10.18", track: "赛道链接: https://pan.baidu.com/s/1R0P0pfTqyIeAH8QOBCxqaA?pwd=s8p4 提取码: s8p4", format: "排位赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 3", title: "浙江宁波四明山站追走赛", date: "2026.10.18", track: "赛道链接: https://pan.baidu.com/s/1R0P0pfTqyIeAH8QOBCxqaA?pwd=s8p4 提取码: s8p4", format: "追走赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 4", title: "海南三亚站排位赛", date: "2026.11.14", track: "赛道链接：https://pan.baidu.com/s/1Whr9xoZao6PjOzj0d1HvDg?pwd=teka", format: "排位赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 4", title: "海南三亚站追走赛", date: "2026.11.15", track: "赛道链接：https://pan.baidu.com/s/1Whr9xoZao6PjOzj0d1HvDg?pwd=teka", format: "追走赛", status: "已结束", statusType: "finished" },
  { round: "2026 ROUND 5", title: "？", date: "2026.12.11", track: "赛道链接：？", format: "排位赛", status: "即将开始", statusType: "upcoming" },
  { round: "2026 ROUND 5", title: "？", date: "2026.12.12", track: "赛道链接：？", format: "追走赛", status: "即将开始", statusType: "upcoming" },
  /*
  格式：{ round: "？？？？ ROUND ？", title: "？", date: "？.？.？", track: "？", format: "？？赛", status: "？", statusType: "？" },
  常用状态对照表
  比赛状态	 status	  statusType
  尚未公布	"待公布"	  "upcoming"
  即将开始	"即将开始"	"upcoming"
  正在进行	"进行中"	  "ongoing"
  已经结束	"已结束"	  "finished"
*/
  ];

const news = [
  { type: "公告", date: "2026-10-16", title: "CSDC 官网内测中", summary: "欢迎来到CSDC模拟漂移赛的官网。赛事规则、参赛车手与赛程信息将陆续更新，请关注后续公告。网站当前仅在安心俱乐部内部群进行内测，请勿外传网址。", pinned: true },
  { type: "赞助相关", date: "2026-10-18", title: "赞助我们", summary: "CSDC诚招各路赞助商，同时也欢迎为爱发电的人士！有意向请联系V：L001AX（安心）", pinned: false },
  { type: "车手信息", date: "2026-10-18", title: "车手阵容持续更新中", summary: "车手名单持续更新中，有更新或修改需求请联系V：itz4Card（itz4Card）。", pinned: false },
  { type: "赛事动态", date: "2026-10-18", title: "赛事信息发布中", summary: "赛事举办时间、赛道安排等信息确认后，将在赛程安排页面统一发布。", pinned: false }
  /*
  格式：{ type: "？", date: "？", title: "？", summary: "？", pinned: true/false }
  true为置顶，false为不置顶，可同时置顶多个公告
  */
  ];
  
const sponsors = [
  { name: "SIMAGIC", level: "SIMAGIC速魔赛车模拟", logo: "assets/sponsors/SIMAGIC.png", url: "https://simagic.com/", description: "" },
  { name: "涿州飞驰赛车公园", level: "涿州市名驰赛扬体育发展有限公司", logo: "assets/sponsors/FEICHI.png", url: "", description: "" },
  { name: "Mori", level: "末日赛车模拟器", logo: "assets/sponsors/Mori.png", url: "", description: "" },
  { name: "KEEP RACING", level: "KEEP RACING持续赛车模拟体验馆", logo: "assets/sponsors/KEEP RACING.png", url: "", description: "" },
  { name: "XD RACING", level: "小杜赛车模拟器", logo: "assets/sponsors/XD LODO.png", url: "", description: "" },
  { name: "GT-Rally", level: "金盏赛车学校", logo: "assets/sponsors/GT Rally.png", url: "", description: "" },
  { name: "ESDA", level: "Esports Drift Association", logo: "assets/sponsors/ESDA.png", url: "", description: "" },
  /*
  示例格式：{ name: "赞助商名称", level: "冠名赞助商", logo: "assets/sponsors/name.png", url: "https://example.com", description: "品牌简介" }
  Logo 建议放进 assets/sponsors/ 文件夹，并填写相对路径，例如："assets/sponsors/brand-name.png"。
*/
];

const standingsSeason = "2026 赛季";
const standings = [
  // 示例格式：{ rank: 1, name: "车手姓名", number: "07", team: "车队名称", rounds: [25, 18, 0], total: 43 }
];
const standingsRounds = ["第一站", "第二站", "第三站"];
