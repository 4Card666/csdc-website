/* TOP10 equipment form: editable subset of the existing public profile categories.
   Legacy extra keys and image paths must survive read/edit/submit unchanged.
   Only published equipment information belongs here; never collect private fields. */
(() => {
  'use strict';
  const group = (key, title, fields) => ({key, title, fields: fields.map(([key,title,multiline=false])=>({key,title,multiline}))});
  // 以现有 TOP10 公开设备档案的精简展示项目为准。
  // 保留原始 JSON 中未展示的历史字段和 images，以免修改旧档案时意外丢失资料。
  const groups = [
    group('wheel','基座与方向盘',[
      ['baseType','基座类型'],['model','基座型号'],['torque','峰值扭矩'],
      ['wheelModel','方向盘型号'],['description','基座 / 方向盘说明',true]
    ]),
    group('pedals','踏板',[
      ['model','踏板型号']
    ]),
    group('shifterHandbrake','排挡与手刹',[
      ['shifterModel','排挡型号'],['handbrakeModel','手刹型号']
    ]),
    group('pc','电脑与显示设备',[
      ['gpu','显卡'],['cpu','处理器'],['memory','内存'],
      ['monitor','显示器'],['displaySetup','显示方案']
    ]),
    group('software','游戏与软件设置',[
      ['cspVersion','CSP 版本'],['rotation','转向角度'],
      ['description','游戏 / 调校说明',true]
    ])
  ];
  const cleanObject = value => value && typeof value==='object' && !Array.isArray(value) ? value : {};
  const stamp = value => {if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('zh-CN',{hour12:false});};
  function pickValue(value){
    if(value === null || value === undefined || value === '')return '—';
    if(typeof value === 'string')return value;
    if(typeof value === 'number' || typeof value === 'boolean')return String(value);
    return JSON.stringify(value);
  }
  function sections(equipment){
    const obj=cleanObject(equipment);
    return groups.map(item=>({
      ...item,
      data:cleanObject(obj[item.key]),
      imageCount:Array.isArray(cleanObject(obj[item.key]).images)?obj[item.key].images.length:0
    }));
  }
  function prepareSubmission(previous, fieldsRoot) {
    const result=structuredClone(cleanObject(previous));
    for(const item of groups){
      const current=cleanObject(result[item.key]);
      const dest={...current};
      for(const field of item.fields){
        const input=fieldsRoot.querySelector(`[data-group="${item.key}"][data-field="${field.key}"]`);
        if(!input)continue;
        const value=input.value.trim();
        if(value)dest[field.key]=value;
        else delete dest[field.key];
      }
      if(Object.keys(dest).length)result[item.key]=dest;
      else delete result[item.key];
    }
    const other=fieldsRoot.querySelector('[data-field="otherSettings"]');
    if(other){
      const value=other.value.trim();
      if(value)result.otherSettings=value;
      else delete result.otherSettings;
    }
    // Public profile dates always come from DB approval timestamp, never client input.
    delete result.updatedAt;
    return result;
  }
  window.CSDCTop10ProfileFields={groups,cleanObject,stamp,pickValue,sections,prepareSubmission};
})();
