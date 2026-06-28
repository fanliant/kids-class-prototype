import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockEnrollments, mockClassOfferings } from '../mockData';

const EMPTY_CHILD = {
  // 基本资料
  name: '', englishName: '', gender: '', birthday: '',
  // 紧急联络
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  // 授权接送
  authorizedPickup: '',
  // 医疗健康
  allergyFood: '', allergyMedicine: '', allergyOther: '',
  healthNotes: '', doctorName: '', doctorPhone: '', insuranceId: '',
  // 营队常用
  swimLevel: '', photoConsent: true, emergencyMedConsent: true,
  sunscreenConsent: true, bugSprayConsent: false,
  vaccineNotes: '',
  // 其他备注
  notes: '',
};

const SECTIONS = [
  {
    key: 'basic', icon: '👤', title: '基本资料',
    fields: [
      { key:'name',         label:'中文姓名 *',    type:'text',   placeholder:'例：王小明',    required:true },
      { key:'englishName',  label:'英文姓名',       type:'text',   placeholder:'例：Xiao Ming Wang' },
      { key:'gender',       label:'性别',           type:'select', options:[{v:'',l:'请选择'},{v:'male',l:'男'},{v:'female',l:'女'},{v:'other',l:'其他'}] },
      { key:'birthday',     label:'生日 *',         type:'date',   required:true },
    ],
  },
  {
    key: 'emergency', icon: '🆘', title: '紧急联络人',
    fields: [
      { key:'emergencyName',     label:'姓名 *',   type:'text', placeholder:'例：王妈妈',       required:true },
      { key:'emergencyPhone',    label:'电话 *',   type:'tel',  placeholder:'425-xxx-xxxx',    required:true },
      { key:'emergencyRelation', label:'关系',     type:'text', placeholder:'例：妈妈、外婆' },
      { key:'authorizedPickup',  label:'授权接送人（可填多位，逗号分隔）', type:'text', placeholder:'例：王妈妈、王外婆、李叔叔', note:'列出的人才被允许接孩子离开' },
    ],
  },
  {
    key: 'health', icon: '🏥', title: '医疗健康',
    note: '此资讯仅供机构在紧急情况使用，不会公开分享',
    fields: [
      { key:'allergyFood',     label:'食物过敏',     type:'text', placeholder:'例：花生、鸡蛋、无' },
      { key:'allergyMedicine', label:'药物过敏',     type:'text', placeholder:'例：青霉素、无' },
      { key:'allergyOther',    label:'其他过敏/过敏原', type:'text', placeholder:'例：花粉、猫毛、无' },
      { key:'healthNotes',     label:'健康状况/特殊需求', type:'textarea', placeholder:'例：轻微气喘（随身备有吸入器）、ADHD、无' },
      { key:'doctorName',      label:'家庭医生',     type:'text', placeholder:'例：Dr. Smith' },
      { key:'doctorPhone',     label:'医生电话',     type:'tel',  placeholder:'425-xxx-xxxx' },
      { key:'insuranceId',     label:'医疗保险号码', type:'text', placeholder:'选填' },
    ],
  },
  {
    key: 'activities', icon: '🏕️', title: '营队 & 活动常用',
    note: '这些资讯会在报名营队时自动带入，不用每次重填',
    fields: [
      { key:'swimLevel',  label:'游泳程度', type:'select', options:[{v:'',l:'请选择'},{v:'none',l:'不会游泳'},{v:'basic',l:'会游泳（基础）'},{v:'advanced',l:'进阶（可独立游）'}] },
      { key:'vaccineNotes', label:'疫苗记录备注', type:'textarea', placeholder:'例：疫苗均已完成，记录存于儿科医生处。如需正式文件请联络机构。' },
    ],
  },
  {
    key: 'consents', icon: '✅', title: '常用同意书',
    note: '机构可能会要求某些项目为必填，你可以在这里预先设定',
    consents: [
      { key:'photoConsent',        label:'同意拍照并用于机构宣传（社群媒体、网站等）' },
      { key:'emergencyMedConsent', label:'紧急情况下，若无法联络家长，授权机构安排紧急医疗' },
      { key:'sunscreenConsent',    label:'户外活动时，同意机构为孩子涂抹防晒' },
      { key:'bugSprayConsent',     label:'户外活动时，同意机构为孩子喷防蚊液' },
    ],
  },
  {
    key: 'notes', icon: '📝', title: '其他备注',
    fields: [
      { key:'notes', label:'给机构的备注', type:'textarea', placeholder:'例：孩子比较内向需要多鼓励。午休时间需要静音环境。对陌生人会紧张，第一堂课请老师多关照。' },
    ],
  },
];

function calcAge(birthday) {
  if (!birthday) return null;
  const d = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

export default function ChildProfilePage() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { parent, addChild, updateChild } = useAuth();

  const isNew = childId === 'new';
  const existingChild = isNew ? null : parent?.children?.find(c => c.id === childId);

  const [form, setForm] = useState(existingChild ? {
    ...EMPTY_CHILD,
    ...existingChild,
  } : EMPTY_CHILD);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});

  const age = calcAge(form.birthday);

  // 这个孩子报名的课程
  const childEnrollments = isNew ? [] : mockEnrollments.filter(e =>
    (e.childId === childId || e.parentEmail === parent?.email) &&
    e.status !== 'cancelled'
  );

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())         errs.name = '必填';
    if (!form.birthday)            errs.birthday = '必填';
    if (!form.emergencyName.trim())errs.emergencyName = '必填';
    if (!form.emergencyPhone.trim())errs.emergencyPhone = '必填';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setActiveSection('basic');
      return;
    }
    if (isNew) {
      addChild({ ...form, id: 'c-' + Date.now(), age });
    } else if (updateChild) {
      updateChild(childId, { ...form, age });
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/home'); }, 1500);
  }

  const completionFields = ['name','birthday','emergencyName','emergencyPhone','allergyFood','healthNotes'];
  const completed = completionFields.filter(k => form[k]?.trim?.() || form[k] === true || form[k] === false).length;
  const completionPct = Math.round(completed / completionFields.length * 100);

  return (
    <div className="page">
      {/* 顶部 */}
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:12, marginBottom:20 }}>
        <button className="secondary" onClick={() => navigate('/home')} style={{ fontSize:13, padding:'5px 12px' }}>← 返回</button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>
            {isNew ? '新增孩子档案' : (form.name || '孩子档案')}
          </h1>
          {!isNew && age !== null && (
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{age} 岁</div>
          )}
        </div>
        <button onClick={handleSave}
          style={{ padding:'8px 20px', fontWeight:700, fontSize:14, background: saved ? 'var(--success)' : 'var(--amber)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer' }}>
          {saved ? '✅ 已储存！' : '储存'}
        </button>
      </div>

      {/* 完整度进度条 */}
      {!isNew && (
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'12px 16px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>档案完整度</span>
            <span style={{ fontSize:13, fontWeight:700, color: completionPct === 100 ? 'var(--success)' : 'var(--amber)' }}>{completionPct}%</span>
          </div>
          <div style={{ height:6, background:'var(--line)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${completionPct}%`, background: completionPct === 100 ? 'var(--success)' : 'var(--amber)', borderRadius:99, transition:'width 0.3s' }} />
          </div>
          {completionPct < 100 && (
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:5 }}>
              填写完整档案可减少每次报名时重复填表的时间
            </div>
          )}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:20, alignItems:'start' }}>
        {/* 左侧导航 */}
        <div style={{ position:'sticky', top:80 }}>
          {SECTIONS.map(sec => {
            const hasError = sec.fields?.some(f => errors[f.key]);
            return (
              <button key={sec.key} onClick={() => setActiveSection(sec.key)}
                style={{ width:'100%', padding:'9px 12px', marginBottom:4, borderRadius:10, border:`1.5px solid ${activeSection === sec.key ? 'var(--amber)' : 'var(--line)'}`, background: activeSection === sec.key ? 'var(--amber)' : 'var(--card)', cursor:'pointer', display:'flex', alignItems:'center', gap:8, textAlign:'left', fontSize:13, fontWeight: activeSection === sec.key ? 700 : 400, color: activeSection === sec.key ? '#fff' : 'var(--ink)' }}>
                <span>{sec.icon}</span>
                <span style={{ flex:1 }}>{sec.title}</span>
                {hasError && <span style={{ color:'var(--error)', fontSize:14 }}>!</span>}
              </button>
            );
          })}

          {/* 已报名课程 */}
          {!isNew && childEnrollments.length > 0 && (
            <div style={{ marginTop:16, padding:'12px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>目前报名的课</div>
              {childEnrollments.slice(0,3).map(e => {
                const o = mockClassOfferings.find(x => x.id === e.offeringId);
                return (
                  <div key={e.id} style={{ fontSize:12, padding:'4px 0', borderBottom:'1px solid var(--line)', color:'var(--ink)' }}>
                    {o?.name || e.offeringId}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div>
          {SECTIONS.map(sec => sec.key !== activeSection ? null : (
            <div key={sec.key} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: sec.note ? 6 : 18 }}>
                <span style={{ fontSize:22 }}>{sec.icon}</span>
                <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>{sec.title}</h2>
              </div>
              {sec.note && (
                <div style={{ fontSize:12, color:'var(--text-muted)', padding:'6px 10px', background:'var(--bg)', borderRadius:6, marginBottom:18, lineHeight:1.6 }}>
                  ℹ️ {sec.note}
                </div>
              )}

              {/* 一般字段 */}
              {sec.fields && (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {sec.fields.map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize:12, fontWeight:600, color: errors[f.key] ? 'var(--error)' : 'var(--text-muted)', display:'block', marginBottom:5 }}>
                        {f.label}
                        {errors[f.key] && <span style={{ marginLeft:6, color:'var(--error)' }}>({errors[f.key]})</span>}
                      </label>
                      {f.type === 'select' ? (
                        <select value={form[f.key]} onChange={e => setField(f.key, e.target.value)}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${errors[f.key] ? 'var(--error)' : 'var(--line)'}`, fontSize:14, background:'var(--bg)', boxSizing:'border-box' }}>
                          {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea value={form[f.key]} onChange={e => setField(f.key, e.target.value)}
                          placeholder={f.placeholder} rows={3}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${errors[f.key] ? 'var(--error)' : 'var(--line)'}`, fontSize:14, resize:'vertical', boxSizing:'border-box', lineHeight:1.7 }} />
                      ) : (
                        <input type={f.type} value={form[f.key]} onChange={e => setField(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${errors[f.key] ? 'var(--error)' : 'var(--line)'}`, fontSize:14, boxSizing:'border-box' }} />
                      )}
                      {f.note && <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:4 }}>{f.note}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* 同意书 */}
              {sec.consents && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {sec.consents.map(con => (
                    <div key={con.key} onClick={() => setField(con.key, !form[con.key])}
                      style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', border:`1.5px solid ${form[con.key] ? 'var(--success)' : 'var(--line)'}`, borderRadius:10, background: form[con.key] ? 'var(--success-bg)' : 'var(--bg)', cursor:'pointer' }}>
                      <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form[con.key] ? 'var(--success)' : 'var(--line)'}`, background: form[con.key] ? 'var(--success)' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                        {form[con.key] && <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:13.5, lineHeight:1.6, color: form[con.key] ? 'var(--ink)' : 'var(--text-muted)' }}>{con.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 底部储存 */}
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--line)' }}>
                <button onClick={handleSave}
                  style={{ padding:'9px 24px', fontWeight:700, fontSize:14, background: saved ? 'var(--success)' : 'var(--amber)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer' }}>
                  {saved ? '✅ 已储存！' : '储存档案'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
