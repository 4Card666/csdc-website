/*
 * CSDC 年度车手 TOP 10 数据
 *
 * 后续拿到官方历史成绩后，只需要修改本文件：
 * - year：赛季年份
 * - status： "final"（已核实最终榜）或 "pending"（待整理）
 * - drivers：按官方最终名次填写，最多 10 人
 * - rank：官方名次
 * - name：官方车手姓名
 * - points：年度总积分（数字）
 */
window.CSDCTop10Data = [
  { year: 2024, status: "pending", drivers: [] },
  {
    year: 2025,
    status: "final",
    drivers: [
      { rank: 1, name: "郁老师", points: 390 },
      { rank: 2, name: "小漂", points: 360 },
      { rank: 3, name: "abinya", points: 287 },
      { rank: 4, name: "远门dsb", points: 283 },
      { rank: 5, name: "WEYE", points: 282 },
      { rank: 6, name: "McLaren", points: 278 },
      { rank: 7, name: "Akarui", points: 228 },
      { rank: 8, name: "QPY", points: 192 },
      { rank: 9, name: "kings007", points: 185 },
      { rank: 10, name: "Masatonomura", points: 183 },
    ]
  },
  { year: 2026, status: "pending", drivers: [] }
];
