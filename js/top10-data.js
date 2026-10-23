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
 * - equipment：可选的车手设备档案，写在对应车手对象中；不填则显示“尚未提供”提示。
 *   可包含 wheel（基座/方向盘）、pedals（踏板）、shifterHandbrake（排挡/手刹）、
 *   pc（电脑/显示设备）、software（游戏/CM/CSP 设置）、otherSettings（其他说明）、updatedAt。
 *   各分类支持 brand、model、type 等对应字段，以及 description 和 images。
 *   图片格式示例：images: [{ src: "assets/equipment/车手ID/base.jpg", alt: "基座照片", caption: "基座" }]
 */
window.CSDCTop10Data = [
  { year: 2024,
    status: "final",
    drivers: [
      { rank: 1, name: "Akarui", points: 490 },
      { rank: 2, name: "小漂", points: 310 },
      { rank: 3, name: "WEYE", points: 267 },
      { rank: 4, name: "kings007", points: 264 },
      { rank: 5, name: "郁老师", points: 215 },
      { rank: 6, name: "Vincent", points: 183 },
      { rank: 7, name: "Anders.Q", points: 177 },
      { rank: 8, name: "PETERL", points: 151 },
      { rank: 9, name: "Panda", points: 148 },
      { rank: 10, name: "远门dsb", points: 145 },
    ] },
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
      
{
        rank: 10,
        name: "Masatonomura",
        points: 183,
        equipment: {
          wheel: {
            baseType: "直驱基座",
            brand: "品牌名称",
            model: "基座型号",
            torque: "峰值扭矩",
            wheelModel: "方向盘型号",
            description: "基座及方向盘的补充说明",
            images: [
              {
                src: "assets/equipment/masatonomura/base.jpg",
                alt: "方向盘基座照片",
                caption: "基座实物"
              }
            ]
          },
          pedals: {
            brand: "踏板品牌",
            model: "踏板型号",
            type: "负载传感器踏板",
            loadCell: "支持",
            clutch: "带离合器",
            description: "踏板及刹车设置说明",
            images: [
              {
                src: "assets/equipment/masatonomura/pedals.jpg",
                alt: "踏板照片",
                caption: "踏板实物"
              }
            ]
          },
          shifterHandbrake: {
            shifterBrand: "排挡品牌",
            shifterModel: "排挡型号",
            shifterType: "序列式",
            handbrakeBrand: "手刹品牌",
            handbrakeModel: "手刹型号",
            handbrakeType: "模拟手刹"
          },
          pc: {
            gpu: "显卡型号",
            cpu: "处理器型号",
            memory: "内存容量",
            monitor: "显示器型号",
            displaySetup: "单屏 / 三屏 / VR"
          },
          software: {
            game: "Assetto Corsa",
            cmVersion: "CM 版本",
            cspVersion: "CSP 版本",
            wheelSoftware: "基座驱动软件",
            rotation: "转向角度",
            forceFeedback: "力反馈设置",
            description: "补充游戏内调校说明",
            images: [
              {
                src: "assets/equipment/masatonomura/cm-settings.jpg",
                alt: "CM 设置截图",
                caption: "CM 设置"
              },
              {
                src: "assets/equipment/masatonomura/ffb-settings.jpg",
                alt: "力反馈设置截图",
                caption: "力反馈设置"
              }
            ]
          },
          otherSettings: "其他游戏设置或调校心得。",
          updatedAt: "2026-10-24"
          }
      }
    ]
  }
];

