import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockClassOfferings, mockEnrollments, mockPricingPlans, mockTeachingTypes, mockLevels, mockPipeline as mockPipelineData, mockTrialRequests, mockOpenHouseRegistrations, mockOpenHouses } from '../mockData';

const TYPE_LABEL = { group_class: '团体课', private_lesson: '一对一私教', workshop: '工作坊/营队' };

const STAGE_CONFIG = {
  interested: { label:'有兴趣', color:'#4A6FA5', bg:'#EEF2F7', emoji:'🔵', next:'contacted', nextBtn:'✉️ 发试听邀请' },
  contacted:  { label:'已联络', color:'#E0922F', bg:'#FFF7ED', emoji:'🟡', next:'trial',     nextBtn:'✅ 已试听' },
  trial:      { label:'已试听', color:'#9B59B6', bg:'#F3E8FD', emoji:'🟣', next:'enrolled',  nextBtn:'📋 邀请报名' },
  enrolled:   { label:'已报名', color:'#22C55E', bg:'#F0FDF4', emoji:'🟢', next:null,        nextBtn:null },
  lost:       { label:'失联',   color:'#9CA3AF', bg:'#F9FAFB', emoji:'⚫', next:'contacted', nextBtn:'🔄 重新联络' },
};

const SOURCES = ['小红书','Facebook','Instagram','朋友推荐','学校海报','Open House','工作室官网','其他'];

function buildEmail(lead, offering, type) {
  const pp = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
  const slot = offering?.slots?.[0];
  if (type === 'trial') {
    return {
      to: lead.parentEmail,
      subject: `[WYLO] 邀请您预约「${offering?.name}」免费试听`,
      body: `您好 ${lead.parentName || lead.childName}家长，\n\n感谢您对我们工作室的关注！\n\n诚挚邀请您带${lead.childName}来体验「${offering?.name}」：\n\n📅 上课时间：${slot?.day} ${slot?.time}\n⏱ 时长：${offering?.durationMin}分钟\n💰 学费：$${pp?.amount}/${pp?.unit}\n\n请回复此封email预约，或拨打 425-555-0201。\n\n期待见到${lead.childName}！\nWYLO 音乐工作室`,
    };
  }
  return {
    to: lead.parentEmail,
    subject: `[WYLO] 「${offering?.name}」正式报名邀请`,
    body: `您好 ${lead.parentName || lead.childName}家长，\n\n很高兴${lead.childName}在试听中表现很好！\n\n「${offering?.name}」目前还有名额，欢迎正式报名：\n\n📅 ${slot?.day} ${slot?.time}（每周上课）\n💰 $${pp?.amount}/${pp?.unit}\n\n请回复此email确认报名。\n\nWYLO 音乐工作室`,
  };
}

function InterestedPanel({ waitlisted, offering, pricePlan }) {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState(() => new Set(waitlisted.map(e => e.id)));
  const emails = waitlisted.filter(e => selected.has(e.id)).map(e => e.parentEmail).filter(Boolean);

  function handleSend() {
    const subject = encodeURIComponent(`[WYLO] ${offering.name} 有名额开放通知`);
    const body = encodeURIComponent(
      `您好！\n\n您孩子候补的课程「${offering.name}」目前有名额开放。\n\n📅 上课时间：${offering.slots?.map(s => s.day + ' ' + s.time).join('、')}\n💰 学费：$${pricePlan?.amount}/${pricePlan?.unit}\n\n请尽快确认报名，先到先得！\n\nWYLO 课后平台`
    );
    window.open(`mailto:${emails.join(',')}?subject=${subject}&body=${body}`);
    setSent(true); setTimeout(() => setSent(false), 3000);
  }

  return (
    <div style={{ margin:'0 20px 14px', padding:'12px 16px', background:'#EEF2F7', borderRadius:10, border:'1px dashed #4A6FA5' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#4A6FA5' }}>📋 候补名单（{waitlisted.length}人）— 有名额可通知</div>
        <button onClick={handleSend} disabled={selected.size === 0}
          style={{ fontSize:12, padding:'5px 14px', background: sent ? '#22C55E' : '#4A6FA5', color:'#fff', border:'none', borderRadius:8, cursor: selected.size === 0 ? 'not-allowed' : 'pointer', fontWeight:600, opacity: selected.size === 0 ? 0.5 : 1 }}>
          {sent ? '✓ Email已开启！' : `📧 群发通知（${selected.size}人）`}
        </button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {waitlisted.map(e => {
          const sel = selected.has(e.id);
          return (
            <div key={e.id} onClick={() => setSelected(prev => { const s = new Set(prev); sel ? s.delete(e.id) : s.add(e.id); return s; })}
              style={{ fontSize:12, padding:'4px 12px', borderRadius:999, cursor:'pointer', border:`1.5px solid ${sel ? '#4A6FA5' : '#CBD5E1'}`, background: sel ? '#4A6FA5' : '#fff', color: sel ? '#fff' : '#374151', fontWeight: sel ? 600 : 400 }}>
              {e.childName}{sel ? ' ✓' : ''}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:11, color:'#9CA3AF', marginTop:6 }}>点击名字选择·按钮会开启Email程序并自动填入内容</div>
    </div>
  );
}

export default function OperationsPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'pipeline');
  const { user } = useAuth();
  const studioId = user?.instructorId || 'mira-piano';
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const [pipeline, setPipeline] = useState(mockPipelineData);
  const [filterOffering, setFilterOffering] = useState('all');
  const [addingTo, setAddingTo] = useState(null);
  const [newLead, setNewLead] = useState({ childName:'', parentName:'', parentEmail:'', parentPhone:'', source:'', note:'' });
  const [emailPreview, setEmailPreview] = useState(null);
  const [trialRequests, setTrialRequests] = useState(mockTrialRequests.filter(r => r.studioId === studioId));
  const [ohRegistrations, setOhRegistrations] = useState(mockOpenHouseRegistrations);
  const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);

  // ── Pipeline helpers ──────────────────────────────────────────────────────
  function advanceStage(id, toStage) {
    setPipeline(prev => prev.map(p => p.id === id ? { ...p, stage: toStage, updatedAt: new Date().toISOString().slice(0,10) } : p));
  }

  function addLead(offeringId) {
    if (!newLead.childName || !newLead.parentEmail) return;
    setPipeline(prev => [...prev, { id:'pl-'+Date.now(), offeringId, ...newLead, stage:'interested', createdAt:new Date().toISOString().slice(0,10), updatedAt:new Date().toISOString().slice(0,10) }]);
    setNewLead({ childName:'', parentName:'', parentEmail:'', parentPhone:'', source:'', note:'' });
    setAddingTo(null);
  }

  // ── Tab styles ────────────────────────────────────────────────────────────
  const TABS = [
    { key:'pipeline',   label:'🎯 招生漏斗' },
    { key:'enrollment', label:'报名状况' },
    { key:'payments',   label:'收款' },
  ];

  // ── Enrollment data ───────────────────────────────────────────────────────
  const enrollmentData = myOfferings.map(o => {
    const all = myEnrollments.filter(e => e.offeringId === o.id);
    const enrolled = all.filter(e => e.status === 'confirmed' || e.status === 'pending_payment');
    const confirmed = enrolled.filter(e => e.status === 'confirmed');
    const pending = enrolled.filter(e => e.status === 'pending_payment');
    const waitlisted = all.filter(e => e.status === 'waitlisted');
    const pct = o.capacity > 0 ? Math.round(enrolled.length / o.capacity * 100) : 0;
    const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
    const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId);
    const level = mockLevels.find(l => l.id === o.levelId);
    return { o, all, enrolled, confirmed, pending, waitlisted, pct, pricePlan, tt, level };
  });

  const payData = enrollmentData.map(d => {
    const paid   = d.enrolled.filter(e => e.paymentStatus === 'paid' || confirmedIds.has(e.id));
    const unpaid = d.enrolled.filter(e => e.paymentStatus !== 'paid' && !confirmedIds.has(e.id));
    return { ...d, paid, unpaid };
  });

  const totalStudents   = enrollmentData.reduce((s, d) => s + d.enrolled.length, 0);
  const totalCapacity   = myOfferings.reduce((s, o) => s + o.capacity, 0);
  const totalWaitlisted = enrollmentData.reduce((s, d) => s + d.waitlisted.length, 0);
  const fullCourses     = enrollmentData.filter(d => d.enrolled.length >= d.o.capacity).length;
  const totalPaid       = payData.reduce((s, d) => s + d.paid.length * (d.pricePlan?.amount || 0), 0);
  const totalUnpaid     = payData.reduce((s, d) => s + d.unpaid.length * (d.pricePlan?.amount || 0), 0);
  const totalPaidCount  = payData.reduce((s, d) => s + d.paid.length, 0);

  // ── Pipeline stats ────────────────────────────────────────────────────────
  const myPipeline = pipeline.filter(p => myOfferings.some(o => o.id === p.offeringId));
  const stageCount = Object.fromEntries(['interested','contacted','trial','enrolled','lost'].map(s => [s, myPipeline.filter(p => p.stage === s).length]));
  const totalLeads = Object.values(stageCount).reduce((a,b) => a+b, 0);
  const convRate   = totalLeads > 0 ? Math.round(stageCount.enrolled / totalLeads * 100) : 0;
  const filteredOfferings = filterOffering === 'all' ? myOfferings : myOfferings.filter(o => o.id === filterOffering);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">招生管理</h1></div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:28, borderBottom:'2px solid var(--line)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'10px 24px', fontSize:14, border:'none', background:'none', cursor:'pointer',
            borderBottom: tab === t.key ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom:-2, fontWeight: tab === t.key ? 700 : 400,
            color: tab === t.key ? 'var(--ink)' : 'var(--text-muted)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── 招生漏斗 ── */}
      {tab === 'pipeline' && (
        <div>
          {/* ── 待审核旁听申请 ── */}
          {trialRequests.filter(r => r.status === 'pending').length > 0 && (
            <div style={{ marginBottom:20, padding:'14px 18px', background:'#FFF3CD', border:'1.5px solid var(--amber)', borderRadius:14 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>
                ⏳ 待审核旁听申请（{trialRequests.filter(r=>r.status==='pending').length}件）
              </div>
              {trialRequests.filter(r => r.status === 'pending').map(req => {
                const offering = mockClassOfferings.find(o => o.id === req.offeringId);
                return (
                  <div key={req.id} style={{ background:'var(--card)', borderRadius:10, padding:'12px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>{req.childName}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>{req.childAge}岁 · {req.parentName}</span>
                        <span style={{ fontSize:11, padding:'1px 7px', background:'#EEF2F7', borderRadius:999, color:'#4A6FA5' }}>旁听申请</span>
                      </div>
                      <div style={{ fontSize:12.5, color:'var(--text-muted)', marginBottom:3 }}>
                        课程：{offering?.name} · 希望日期：{req.preferredDate}
                      </div>
                      {req.note && <div style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>💬 {req.note}</div>}
                      <div style={{ fontSize:11.5, color:'var(--text-muted)', marginTop:4 }}>
                        ✉️ {req.parentEmail} · 📞 {req.parentPhone} · 申请时间：{req.createdAt}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
                      <button
                        onClick={() => {
                          setTrialRequests(prev => prev.map(r => r.id === req.id ? {...r, status:'approved'} : r));
                          setPipeline(prev => [...prev, {
                            id:'pl-tr-'+req.id, offeringId:req.offeringId,
                            childName:req.childName, parentName:req.parentName,
                            parentEmail:req.parentEmail, parentPhone:req.parentPhone,
                            stage:'trial', source:'旁听申请', note:req.note,
                            createdAt:req.createdAt, updatedAt:new Date().toISOString().slice(0,10),
                          }]);
                        }}
                        style={{ fontSize:12, padding:'5px 12px', background:'var(--success)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
                        ✅ 批准旁听
                      </button>
                      <button
                        onClick={() => setTrialRequests(prev => prev.map(r => r.id === req.id ? {...r, status:'declined'} : r))}
                        style={{ fontSize:12, padding:'5px 12px', background:'var(--card)', color:'var(--error)', border:'1px solid var(--error)', borderRadius:8, cursor:'pointer', whiteSpace:'nowrap' }}>
                        ✕ 婉拒
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Open House 报名状况 ── */}
          {mockOpenHouses.filter(oh => oh.studioId === studioId).length > 0 && (
            <div style={{ marginBottom:20, padding:'14px 18px', background:'#FDF0F8', border:'1.5px solid #E91E8C', borderRadius:14 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:'#E91E8C' }}>🎪 Open House 报名状况</div>
              {mockOpenHouses.filter(oh => oh.studioId === studioId).map(oh => {
                const regs = ohRegistrations.filter(r => r.openHouseId === oh.id);
                return (
                  <div key={oh.id} style={{ background:'var(--card)', borderRadius:10, padding:'12px 16px', marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14 }}>{oh.title}</div>
                        <div style={{ fontSize:12.5, color:'var(--text-muted)' }}>{oh.date} {oh.time} · {oh.location}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontWeight:800, fontSize:20, color:'#E91E8C' }}>{regs.length}<span style={{ fontSize:13, fontWeight:400, color:'var(--text-muted)' }}>/{oh.maxAttendees}</span></div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>已报名</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {regs.map(r => (
                        <span key={r.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'#FDF0F8', color:'#E91E8C', fontWeight:600 }}>
                          {r.parentName} {r.childCount > 1 ? `(${r.childCount}人)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 漏斗仪表板 */}
          <div style={{ display:'flex', gap:0, background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden', marginBottom:20 }}>
            {['interested','contacted','trial','enrolled','lost'].map((s, i) => {
              const cfg = STAGE_CONFIG[s];
              const n   = stageCount[s] || 0;
              const prev = i > 0 ? (stageCount[['interested','contacted','trial','enrolled','lost'][i-1]] || 0) : null;
              const pct  = prev && prev > 0 ? Math.round(n/prev*100) : null;
              return (
                <div key={s} style={{ flex:1, padding:'14px 8px', textAlign:'center', borderRight: i < 4 ? '1px solid var(--line)' : 'none', background: s === 'lost' ? '#F9FAFB' : 'transparent' }}>
                  <div style={{ fontSize:20 }}>{cfg.emoji}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:cfg.color, margin:'3px 0' }}>{n}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)' }}>{cfg.label}</div>
                  {pct !== null && s !== 'lost' && (
                    <div style={{ fontSize:10, color: pct>60 ? '#22C55E' : pct>30 ? '#E0922F' : '#EF4444', marginTop:2 }}>转化{pct}%</div>
                  )}
                </div>
              );
            })}
            <div style={{ flex:1, padding:'14px 8px', textAlign:'center', background:'var(--amber)', borderRadius:'0 14px 14px 0' }}>
              <div style={{ fontSize:20 }}>🏆</div>
              <div style={{ fontSize:22, fontWeight:800, color:'#fff', margin:'3px 0' }}>{convRate}%</div>
              <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>整体转化</div>
            </div>
          </div>

          {/* 班级筛选 */}
          <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>筛选：</span>
            <button onClick={() => setFilterOffering('all')} className={filterOffering === 'all' ? '' : 'secondary'} style={{ fontSize:12, padding:'4px 12px' }}>全部</button>
            {myOfferings.map(o => {
              const cnt = pipeline.filter(p => p.offeringId === o.id && p.stage !== 'lost').length;
              return (
                <button key={o.id} onClick={() => setFilterOffering(o.id)} className={filterOffering === o.id ? '' : 'secondary'} style={{ fontSize:12, padding:'4px 12px' }}>
                  {o.name.slice(0,8)}
                  {cnt > 0 && <span style={{ marginLeft:4, background:'var(--amber)', color:'#fff', borderRadius:999, padding:'0 5px', fontSize:10 }}>{cnt}</span>}
                </button>
              );
            })}
          </div>

          {/* 各班Pipeline */}
          {filteredOfferings.map(o => {
            const leads = pipeline.filter(p => p.offeringId === o.id);
            const isEmpty = leads.length === 0 && addingTo !== o.id;
            return (
              <div key={o.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, marginBottom:16, overflow:'hidden' }}>
                {/* 班级标题 */}
                <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{o.name}</span>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {['interested','contacted','trial','enrolled'].map(s => {
                      const n = leads.filter(p => p.stage === s).length;
                      return n > 0 ? (
                        <span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:999, background:STAGE_CONFIG[s].bg, color:STAGE_CONFIG[s].color, fontWeight:600 }}>
                          {STAGE_CONFIG[s].emoji}{n}
                        </span>
                      ) : null;
                    })}
                    <button onClick={() => setAddingTo(o.id)} style={{ fontSize:12, padding:'3px 10px' }}>+ 新增</button>
                  </div>
                </div>

                {isEmpty && (
                  <div style={{ padding:'16px 20px', fontSize:13, color:'var(--text-muted)', fontStyle:'italic' }}>
                    还没有潜在学生记录 — 点「+ 新增」开始追踪
                  </div>
                )}

                {/* 各阶段 */}
                {['interested','contacted','trial','enrolled','lost'].map(s => {
                  const sLeads = leads.filter(p => p.stage === s);
                  if (sLeads.length === 0) return null;
                  const cfg = STAGE_CONFIG[s];
                  return (
                    <div key={s}>
                      <div style={{ padding:'5px 20px', background:cfg.bg, fontSize:11, fontWeight:700, color:cfg.color, borderBottom:'1px solid var(--line)' }}>
                        {cfg.emoji} {cfg.label}（{sLeads.length}人）
                      </div>
                      {sLeads.map(lead => (
                        <div key={lead.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:2, flexWrap:'wrap' }}>
                              <span style={{ fontWeight:700, fontSize:13 }}>{lead.childName}</span>
                              {lead.parentName && <span style={{ fontSize:12, color:'var(--text-muted)' }}>{lead.parentName}</span>}
                              {lead.source && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background:'var(--bg)', border:'1px solid var(--line)', color:'var(--text-muted)' }}>来源:{lead.source}</span>}
                              <span style={{ fontSize:10, color:'var(--text-muted)' }}>{lead.updatedAt}</span>
                            </div>
                            <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:12, flexWrap:'wrap' }}>
                              {lead.parentEmail && <span>✉️ {lead.parentEmail}</span>}
                              {lead.parentPhone && <span>📞 {lead.parentPhone}</span>}
                            </div>
                            {lead.note && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, fontStyle:'italic' }}>💬 {lead.note}</div>}
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                            {cfg.nextBtn && (
                              <button
                                onClick={() => {
                                  if (s === 'interested' || s === 'contacted') {
                                    const email = buildEmail(lead, o, 'trial');
                                    setEmailPreview({ lead, email, nextStage: cfg.next });
                                  } else if (s === 'trial') {
                                    const email = buildEmail(lead, o, 'enroll');
                                    setEmailPreview({ lead, email, nextStage: cfg.next });
                                  } else {
                                    advanceStage(lead.id, cfg.next);
                                  }
                                }}
                                style={{ fontSize:11, padding:'4px 10px', background:cfg.color, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
                                {cfg.nextBtn}
                              </button>
                            )}
                            {s !== 'lost' && (
                              <button onClick={() => advanceStage(lead.id, 'lost')}
                                className="secondary" style={{ fontSize:10, padding:'2px 8px', whiteSpace:'nowrap' }}>
                                标记失联
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* 新增表单 */}
                {addingTo === o.id && (
                  <div style={{ padding:'14px 20px', background:'var(--bg)', borderTop:'1px solid var(--line)' }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>新增潜在学生</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                      {[
                        { label:'孩子姓名 *', key:'childName', placeholder:'王小明' },
                        { label:'家长姓名',   key:'parentName', placeholder:'王妈妈' },
                        { label:'Email *',   key:'parentEmail', placeholder:'parent@gmail.com' },
                        { label:'电话',       key:'parentPhone', placeholder:'425-xxx-xxxx' },
                      ].map(f => (
                        <div key={f.key}>
                          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:3 }}>{f.label}</div>
                          <input value={newLead[f.key]} onChange={e => setNewLead(p => ({...p, [f.key]: e.target.value}))}
                            placeholder={f.placeholder}
                            style={{ width:'100%', padding:'6px 10px', borderRadius:6, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:3 }}>来源渠道</div>
                        <select value={newLead.source} onChange={e => setNewLead(p => ({...p, source: e.target.value}))}
                          style={{ width:'100%', padding:'6px 10px', borderRadius:6, border:'1px solid var(--line)', fontSize:13 }}>
                          <option value="">选择来源</option>
                          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:3 }}>备注</div>
                        <input value={newLead.note} onChange={e => setNewLead(p => ({...p, note: e.target.value}))}
                          placeholder="任何补充说明"
                          style={{ width:'100%', padding:'6px 10px', borderRadius:6, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="secondary" onClick={() => setAddingTo(null)} style={{ fontSize:12 }}>取消</button>
                      <button onClick={() => addLead(o.id)} disabled={!newLead.childName || !newLead.parentEmail} style={{ fontSize:12 }}>新增</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Email预览弹窗 */}
          {emailPreview && (
            <div style={{ position:'fixed', inset:0, zIndex:200 }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={() => setEmailPreview(null)} />
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'var(--card)', borderRadius:16, padding:24, width:480, maxWidth:'90vw', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>📧 Email 预览</div>
                  <button className="secondary" onClick={() => setEmailPreview(null)} style={{ fontSize:12, padding:'3px 8px' }}>✕</button>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>收件人</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{emailPreview.email.to}</div>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>主旨</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{emailPreview.email.subject}</div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>内文</div>
                  <div style={{ fontSize:12.5, lineHeight:1.8, padding:'10px 12px', background:'var(--bg)', borderRadius:8, whiteSpace:'pre-line', maxHeight:200, overflowY:'auto' }}>
                    {emailPreview.email.body}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button className="secondary" onClick={() => setEmailPreview(null)} style={{ fontSize:13 }}>取消</button>
                  <button style={{ fontSize:13 }} onClick={() => {
                    const { subject, body, to } = emailPreview.email;
                    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    advanceStage(emailPreview.lead.id, emailPreview.nextStage);
                    setEmailPreview(null);
                  }}>
                    📧 开启Email并更新阶段
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 报名状况 ── */}
      {tab === 'enrollment' && (
        <div>
          <div className="dash-grid" style={{ marginBottom:24 }}>
            <div className="dash-stat"><div className="label">已报名</div><div className="num">{totalStudents}<span style={{ fontSize:14, color:'var(--text-muted)' }}>/{totalCapacity}</span></div></div>
            <div className="dash-stat"><div className="label">剩余名额</div><div className="num" style={{ color:'var(--warn)' }}>{totalCapacity - totalStudents}</div></div>
            <div className="dash-stat"><div className="label">候补人数</div><div className="num" style={{ color:'#4A6FA5' }}>{totalWaitlisted}</div></div>
            <div className="dash-stat"><div className="label">已额满班级</div><div className="num" style={{ color:'var(--success)' }}>{fullCourses}</div></div>
          </div>

          {enrollmentData.map(({ o, enrolled, confirmed, pending, waitlisted, pct, pricePlan, tt, level }) => {
            const isFull = enrolled.length >= o.capacity;
            const isLow  = !isFull && pct < 50;
            return (
              <div key={o.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, marginBottom:14, overflow:'hidden' }}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{o.name}</span>
                    {tt && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'var(--bg)', border:'1px solid var(--line)', color:'var(--text-muted)' }}>{TYPE_LABEL[tt.type]}</span>}
                    {isFull && <span style={{ fontSize:11, background:'var(--success-bg)', color:'var(--success)', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>✓ 已额满</span>}
                    {isLow  && <span style={{ fontSize:11, background:'#FBEAE8', color:'var(--error)', padding:'2px 8px', borderRadius:999, fontWeight:700 }}>⚠ 招生不足</span>}
                    {!isFull && !isLow && <span style={{ fontSize:11, background:'var(--warn-bg)', color:'var(--warn)', padding:'2px 8px', borderRadius:999 }}>招生中</span>}
                  </div>
                  {pricePlan && <span style={{ fontSize:13, color:'var(--text-muted)' }}>${pricePlan.amount}/{pricePlan.unit}</span>}
                </div>
                <div style={{ padding:'10px 20px', borderBottom:'1px solid var(--line)' }}>
                  <div style={{ height:6, background:'var(--line)', borderRadius:99, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: isFull ? 'var(--success)' : isLow ? 'var(--error)' : 'var(--amber)', borderRadius:99 }} />
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:13 }}>
                    <span style={{ fontWeight:600 }}>已报名 {enrolled.length}/{o.capacity}</span>
                    {confirmed.length > 0 && <span style={{ color:'var(--success)' }}>✓ 已确认 {confirmed.length}</span>}
                    {pending.length   > 0 && <span style={{ color:'var(--warn)' }}>⏳ 待付款 {pending.length}</span>}
                    {waitlisted.length > 0 && <span style={{ color:'#4A6FA5' }}>📋 候补 {waitlisted.length}</span>}
                  </div>
                </div>
                <div style={{ padding:'10px 20px', display:'flex', flexWrap:'wrap', gap:6 }}>
                  {enrolled.map(e => (
                    <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background: e.paymentStatus === 'paid' ? 'var(--success-bg)' : 'var(--warn-bg)', color: e.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warn)', fontWeight:600 }}>{e.childName}</span>
                  ))}
                  {waitlisted.map(e => (
                    <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'#EEF2F7', color:'#4A6FA5', fontWeight:600 }}>{e.childName}（候补）</span>
                  ))}
                </div>
                {waitlisted.length > 0 && !isFull && (
                  <InterestedPanel waitlisted={waitlisted} offering={o} pricePlan={pricePlan} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 收款 ── */}
      {tab === 'payments' && (
        <div>
          <div style={{ padding:'10px 16px', background:'var(--warn-bg)', border:'1.5px solid var(--amber)', borderRadius:12, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:13 }}>
              <strong>发票管理</strong>在单独页面，可产生草稿、调整金额、确认发出、追踪逾期
            </div>
            <a href="#/invoices">
              <button style={{ fontSize:12, padding:'5px 14px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
                📋 前往发票管理
              </button>
            </a>
          </div>
          <div className="dash-grid" style={{ marginBottom:24 }}>
            <div className="dash-stat"><div className="label">本月已收款</div><div className="num" style={{ color:'var(--success)' }}>${totalPaid.toLocaleString()}</div></div>
            <div className="dash-stat"><div className="label">待收款</div><div className="num" style={{ color: totalUnpaid > 0 ? 'var(--error)' : 'var(--text-muted)' }}>${totalUnpaid.toLocaleString()}</div></div>
            <div className="dash-stat"><div className="label">已付款学生</div><div className="num">{totalPaidCount}<span style={{ fontSize:14, color:'var(--text-muted)' }}>/{totalStudents}</span></div></div>
            <div className="dash-stat"><div className="label">收款率</div><div className="num" style={{ color:'var(--success)' }}>{totalStudents > 0 ? Math.round(totalPaidCount/totalStudents*100) : 0}%</div></div>
          </div>

          {payData.map(({ o, paid, unpaid, pricePlan, tt }) => (
            <div key={o.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, marginBottom:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{o.name}</div>
                  {pricePlan && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>${pricePlan.amount}/{pricePlan.unit}</div>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, color:'var(--success)', fontWeight:700 }}>已收 ${(paid.length * (pricePlan?.amount||0)).toLocaleString()}</div>
                  {unpaid.length > 0 && <div style={{ fontSize:12, color:'var(--error)' }}>待收 ${(unpaid.length * (pricePlan?.amount||0)).toLocaleString()}</div>}
                </div>
              </div>
              {unpaid.length > 0 && (
                <div style={{ padding:'10px 20px', borderBottom: paid.length > 0 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--error)', marginBottom:8 }}>⏳ 待付款（{unpaid.length}人）</div>
                  {unpaid.map(e => (
                    <div key={e.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--line)' }}>
                      <div>
                        <span style={{ fontWeight:600, fontSize:13 }}>{e.childName}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8 }}>{e.parentEmail}</span>
                      </div>
                      <button style={{ fontSize:12, padding:'4px 14px', background:'var(--success)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}
                        onClick={() => setConfirmedIds(prev => new Set([...prev, e.id]))}>
                        确认收款 ${pricePlan?.amount}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {paid.length > 0 && (
                <div style={{ padding:'10px 20px' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--success)', marginBottom:8 }}>✓ 已付款（{paid.length}人）</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {paid.map(e => <span key={e.id} style={{ fontSize:12, background:'var(--success-bg)', color:'var(--success)', padding:'3px 10px', borderRadius:999, fontWeight:600 }}>{e.childName}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
