import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeekCalendar from '../components/WeekCalendar';
import { instructors, studioTeachers, mockSubjects, mockTeachingTypes, mockCurricula, mockLevels, mockPricingPlans, mockClassOfferings, mockEnrollments, mockLeaveRequests } from '../mockData';

const TYPE_LABEL = { group_class: '团体课', private_lesson: '一对一私教', workshop: '工作坊/营队' };
const TYPE_COLOR = { group_class: 'var(--success)', private_lesson: '#4A6FA5', workshop: 'var(--amber)' };
const TYPE_BG = { group_class: 'var(--success-bg)', private_lesson: '#EEF2F7', workshop: 'var(--warn-bg)' };

export default function TeacherDashboard() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialTab = location.state?.tab || searchParams.get('tab') || 'overview';
  const [view, setView] = useState(initialTab);
  const [expandedOffering, setExpandedOffering] = useState(null);
  const [showNewOffering, setShowNewOffering] = useState(false);
  // 老师默认看自己的课；Owner默认看全部
  const selfTeacher = studioTeachers.find(t => t.email === user?.email);
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    user?.role === 'owner' ? 'all' : (selfTeacher?.id || 'all')
  );
  const [showIcal, setShowIcal] = useState(false);
  const [calView, setCalView] = useState('week');
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [editingOffering, setEditingOffering] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({});

  const studioId = user?.instructorId || 'mira-piano';
  const instructor = instructors.find(i => i.id === studioId);

  // Data for this studio
  const mySubjects = mockSubjects.filter(s => s.studioId === studioId);
  const myTeachingTypes = mockTeachingTypes.filter(t => t.studioId === studioId);
  const myCurricula = mockCurricula.filter(c => c.studioId === studioId);
  const myLevels = mockLevels.filter(l => l.studioId === studioId);
  const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);

  // Overview stats
  const totalStudents = myOfferings.reduce((s, o) => {
    const enrolled = myEnrollments.filter(e => e.offeringId === o.id && (e.status === 'confirmed' || e.status === 'pending_payment'));
    return s + enrolled.length;
  }, 0);
  const totalCapacity = myOfferings.reduce((s, o) => s + o.capacity, 0);
  const weeklyHours = (myOfferings.reduce((s, o) => s + (o.durationMin || 45) * (o.slots?.length || 1), 0) / 60).toFixed(1);
  const pendingPayments = myEnrollments.filter(e => e.paymentStatus === 'pending' && e.status !== 'waitlisted').length;

  const tabs = [
    { key: 'overview', label: '总览' },
    { key: 'classops', label: '班级总览' },
    { key: 'courses', label: '课程设定' },
  ];

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">{instructor?.name || '课程管理'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>课程管理 Dashboard</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:28, borderBottom:'2px solid var(--line)' }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setView(key)} style={{
            padding:'10px 24px', fontSize:14, border:'none', background:'none', cursor:'pointer',
            borderBottom: view === key ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom:-2,
            fontWeight: view === key ? 700 : 400,
            color: view === key ? 'var(--ink)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {/* ── 总览 ── */}
      {view === 'overview' && (
        <div>
          {/* 统计数字 */}
          <div className="dash-grid" style={{ marginBottom: 28 }}>
            <div className="dash-stat">
              <div className="label">报名学生 / 总名额</div>
              <div className="num">{totalStudents}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/{totalCapacity}</span></div>
            </div>
            <div className="dash-stat">
              <div className="label">本周排课时数</div>
              <div className="num">{weeklyHours} <span style={{ fontSize: 16 }}>小时</span></div>
            </div>
            <div className="dash-stat">
              <div className="label">待确认付款</div>
              <div className="num" style={{ color: pendingPayments > 0 ? 'var(--error)' : 'var(--text-muted)' }}>{pendingPayments}</div>
            </div>
            <div className="dash-stat">
              <div className="label">开设班级数</div>
              <div className="num">{myOfferings.length}</div>
            </div>
          </div>

          {/* 本周课表 */}
          {(() => {
            const isOwner = user?.role === 'owner';
            const myTeachersList = studioTeachers.filter(t => t.studioId === studioId);
            const DAYS = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];

            const filteredOfferings = selectedTeacherId === 'all'
              ? myOfferings
              : myOfferings.filter(o => o.primaryTeacherId === selectedTeacherId);

            // 按时间排序的所有slot
            const allSlots = [];
            filteredOfferings.forEach(o => {
              (o.slots || []).forEach(s => {
                allSlots.push({ offering: o, slot: s, day: s.day });
              });
            });

            return (
              <div>
                {/* Google Calendar 同步展开 */}
                {showIcal && (
                  <div style={{ background:'var(--bg)', border:'1.5px solid var(--amber)', borderRadius:12, padding:'14px 18px', marginBottom:16 }}>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>订阅到 Google Calendar</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', margin:'0 0 10px' }}>
                      复制下方连结，贴到 Google Calendar 的「其他日历 → 通过网址订阅」，课表变动会自动同步。
                    </p>
                    <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:12.5, wordBreak:'break-all', marginBottom:10 }}>
                      {`webcal://wyloapp.example.com/teacher/${studioId}.ics`}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.8, marginBottom:10 }}>
                      <strong>操作步骤：</strong><br/>
                      1. 打开 Google Calendar → 左侧「其他日历」旁的 <strong>+</strong> → 「通过网址」<br/>
                      2. 贴上上方连结 → 点「添加日历」<br/>
                      3. 完成！你的课表会出现在 Google Calendar 中
                    </div>
                    <div style={{ fontSize:12, padding:'6px 10px', background:'var(--warn-bg)', borderRadius:6, color:'var(--warn)' }}>
                      ⚠️ Prototype 示范用模拟连结，实际产品上线后才会是真实可订阅的 iCal 连结。
                    </div>
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>{calView === 'week' ? '本周课表' : '月课表'}</h3>
                    <div style={{ display:'inline-flex', border:'1.5px solid var(--line)', borderRadius:8, overflow:'hidden' }}>
                      <button onClick={() => setCalView('week')} style={{ padding:'4px 12px', fontSize:12, border:'none', background: calView==='week' ? 'var(--ink)' : 'transparent', color: calView==='week' ? '#fff' : 'var(--text-muted)', cursor:'pointer', fontWeight: calView==='week' ? 700 : 400 }}>周</button>
                      <button onClick={() => setCalView('month')} style={{ padding:'4px 12px', fontSize:12, border:'none', background: calView==='month' ? 'var(--ink)' : 'transparent', color: calView==='month' ? '#fff' : 'var(--text-muted)', cursor:'pointer', fontWeight: calView==='month' ? 700 : 400 }}>月</button>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {isOwner ? (
                      <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}
                        style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, background:'var(--card)' }}>
                        <option value="all">全部老师</option>
                        {myTeachersList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize:13, color:'var(--text-muted)', padding:'6px 12px', background:'var(--bg)', borderRadius:8, border:'1px solid var(--line)' }}>
                        👤 我的课表
                      </span>
                    )}
                    <button className="secondary" onClick={() => setShowIcal(v => !v)}
                      style={{ fontSize:12, padding:'6px 12px', display:'flex', alignItems:'center', gap:5 }}>
                      📅 {showIcal ? '收起' : '同步到 Google Calendar'}
                    </button>
                  </div>
                </div>

                {/* 格子日历 — 用WeekCalendar组件，与家长课表一致的格式 */}
                {(() => {
                  // 构建 calendarEvents 供 WeekCalendar 使用
                  const calEvents = [];
                  filteredOfferings.forEach(o => {
                    const cur = myCurricula.find(c => c.id === o.curriculumId);
                    const level = myLevels.find(l => l.id === o.levelId);
                    const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                    const enrolled = myEnrollments.filter(e => e.offeringId === o.id && (e.status === 'confirmed' || e.status === 'pending_payment'));
                    const unpaid = enrolled.filter(e => e.paymentStatus === 'pending').length;
                    const colorClass = cur ? '' : '';

                    (o.slots || []).forEach(s => {
                      // tag 显示学生人数 + 请假 + 未缴费
                      const onLeave = mockLeaveRequests.filter(lr =>
                        lr.offeringId === o.id && (lr.status === 'no_makeup' || lr.status === 'makeup_scheduled')
                      ).length;
                      let tag = `${enrolled.length}/${o.capacity}人`;
                      if (onLeave > 0) tag += ` · 请假${onLeave}`;
                      if (unpaid > 0) tag += ` · ⚠未缴${unpaid}`;

                      calEvents.push({
                        day: s.day,
                        time: s.time,
                        title: level ? `${level.shortName} ${o.name.split('（')[0]}` : o.name,
                        sub: (isOwner ? teacher?.name + ' · ' : '') + (o.durationMin + '分钟'),
                        location: o.locationFixed || o.locationDefault || null,
                        tag,
                        colorClass: unpaid > 0 ? 'cat-warn' : '',
                        onClick: () => setExpandedOffering(
                          expandedOffering === o.id + '-' + s.id ? null : o.id + '-' + s.id
                        ),
                        offeringId: o.id,
                        slotId: s.id,
                        offering: o,
                        enrolled,
                        unpaid,
                        cur,
                      });
                    });
                  });

                  return (
                    <div>
                      {calView === 'week' && (
                    <WeekCalendar events={calEvents} emptyText="本周没有排课" />
                  )}
                  {calView === 'month' && (() => {
                    const DAYS = ['一','二','三','四','五','六','日'];
                    const WEEKDAYS_ZH = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
                    const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
                    const first = new Date(viewYear, viewMonth, 1);
                    const startOffset = (first.getDay() + 6) % 7;
                    const grid = [];
                    for (let i = 0; i < 42; i++) {
                      const d = new Date(viewYear, viewMonth, 1 - startOffset + i);
                      grid.push({ date: d, cur: d.getMonth() === viewMonth });
                    }
                    const today = new Date();
                    return (
                      <div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                          <button className="secondary" onClick={() => { const d = new Date(viewYear, viewMonth-1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }} style={{ padding:'5px 12px', fontSize:13 }}>←</button>
                          <span style={{ fontWeight:700, fontSize:14 }}>{viewYear}年 {MONTHS[viewMonth]}</span>
                          <button className="secondary" onClick={() => { const d = new Date(viewYear, viewMonth+1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }} style={{ padding:'5px 12px', fontSize:13 }}>→</button>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, background:'var(--line)', border:'1px solid var(--line)', borderRadius:10, overflow:'hidden' }}>
                          {DAYS.map(d => (
                            <div key={d} style={{ background:'var(--bg)', textAlign:'center', padding:'6px 2px', fontSize:11.5, fontWeight:700, color:'var(--text-muted)' }}>
                              {d}
                            </div>
                          ))}
                          {grid.map((cell, i) => {
                            const dayZh = WEEKDAYS_ZH[cell.date.getDay() === 0 ? 6 : cell.date.getDay()-1];
                            const dayEvents = calEvents.filter(ev => ev.day === dayZh);
                            const isToday = cell.date.toDateString() === today.toDateString();
                            return (
                              <div key={i} style={{ background:'var(--card)', minHeight:60, padding:'4px', opacity: cell.cur ? 1 : 0.3 }}>
                                <div style={{ fontSize:11, fontWeight: isToday ? 800 : 400, color: isToday ? 'var(--amber)' : 'var(--text-muted)', marginBottom:2 }}>{cell.date.getDate()}</div>
                                {dayEvents.slice(0,2).map((ev, j) => (
                                  <div key={j} onClick={ev.onClick}
                                    style={{ fontSize:9.5, padding:'2px 4px', borderRadius:4, background:'var(--amber)', color:'#fff', marginBottom:1, cursor: ev.onClick ? 'pointer' : 'default', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:600 }}>
                                    {ev.time?.split('–')[0]} {ev.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div style={{ fontSize:9, color:'var(--text-muted)', paddingLeft:2 }}>+{dayEvents.length-2}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                      {/* 点击某格后弹出详情 */}
                      {expandedOffering && (() => {
                        const ev = calEvents.find(e => expandedOffering === e.offeringId + '-' + e.slotId);
                        if (!ev) return null;
                        const o = ev.offering;
                        const pp = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                        const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                        const cur = ev.cur;
                        return (
                          <>
                            {/* 遮罩 */}
                            <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.3)' }}
                              onClick={() => setExpandedOffering(null)} />
                            {/* 详情卡 */}
                            <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:101, background:'var(--card)', borderRadius:16, padding:24, width:360, maxWidth:'90vw', boxShadow:'0 8px 32px rgba(0,0,0,0.2)', border:`2px solid ${cur?.color || 'var(--amber)'}` }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:16 }}>{o.name}</div>
                                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                                    {ev.day} · {ev.time} · {o.durationMin}分钟
                                    {(o.locationFixed || o.locationDefault) && (
                                      <span style={{ marginLeft:8, color:'#4A6FA5', fontWeight:600 }}>
                                        📍 {o.locationFixed || o.locationDefault}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                                    老师：{teacher?.name}
                                    {isOwner && pp && ` · $${pp.amount}/${pp.unit}`}
                                  </div>
                                </div>
                                <button className="secondary" onClick={() => setExpandedOffering(null)} style={{ fontSize:12, padding:'3px 8px' }}>✕</button>
                              </div>
                              {/* 出席统计 */}
                              {(() => {
                                const leaveList = mockLeaveRequests.filter(lr => lr.offeringId === o.id);
                                const makeupIn = mockLeaveRequests.filter(lr => lr.makeupOfferingId === o.id && lr.status === 'makeup_scheduled');
                                return (
                                  <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:12, marginBottom:12, padding:'8px 12px', background:'var(--bg)', borderRadius:8 }}>
                                    <span style={{ color:'var(--ink)', fontWeight:600 }}>共 {ev.enrolled.length}/{o.capacity} 人</span>
                                    <span style={{ color:'var(--success)' }}>✓ 已缴费 {ev.enrolled.filter(e => e.paymentStatus==='paid').length}</span>
                                    {ev.unpaid > 0 && <span style={{ color:'var(--error)', fontWeight:700 }}>⚠ 未缴 {ev.unpaid}</span>}
                                    {leaveList.filter(lr=>lr.status==='no_makeup').length > 0 && (
                                      <span style={{ color:'var(--warn)' }}>假(不补) {leaveList.filter(lr=>lr.status==='no_makeup').length}</span>
                                    )}
                                    {leaveList.filter(lr=>lr.status==='makeup_scheduled').length > 0 && (
                                      <span style={{ color:'#4A6FA5' }}>🔄补课 {leaveList.filter(lr=>lr.status==='makeup_scheduled').length}</span>
                                    )}
                                    {makeupIn.length > 0 && (
                                      <span style={{ color:'#4A6FA5' }}>📥补入 {makeupIn.length}</span>
                                    )}
                                  </div>
                                );
                              })()}
                              {/* 学生名单 */}
                              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                                {ev.enrolled.map(e => {
                                  const lr = mockLeaveRequests.find(l => l.enrollmentId === e.id);
                                  const isOnLeave = lr && (lr.status === 'no_makeup' || lr.status === 'makeup_scheduled');
                                  return (
                                    <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, fontWeight:600,
                                      background: isOnLeave ? (lr.status==='makeup_scheduled' ? '#EEF2F7' : 'var(--warn-bg)') : (e.paymentStatus==='paid' ? 'var(--success-bg)' : '#FCEBEB'),
                                      color: isOnLeave ? (lr.status==='makeup_scheduled' ? '#4A6FA5' : 'var(--warn)') : (e.paymentStatus==='paid' ? 'var(--success)' : 'var(--error)'),
                                      textDecoration: isOnLeave ? 'line-through' : 'none',
                                      opacity: isOnLeave ? 0.8 : 1,
                                    }}>
                                      {e.childName}{isOnLeave ? (lr.status==='makeup_scheduled' ? '🔄' : '假') : ''}
                                    </span>
                                  );
                                })}
                                {ev.enrolled.length === 0 && <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>尚无学生报名</span>}
                              </div>
                              {/* 点名按钮 */}
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                <button
                                  onClick={() => { setExpandedOffering(null); navigate(`/attendance/${o.id}/${new Date().toISOString().slice(0,10)}`); }}
                                  style={{ padding:'8px 0', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                                  ✏️ 开始点名
                                </button>
                                <button
                                  onClick={() => { setExpandedOffering(null); navigate(`/notes/${o.id}/${new Date().toISOString().slice(0,10)}`); }}
                                  style={{ padding:'8px 0', background:'var(--card)', color:'var(--ink)', border:'1.5px solid var(--line)', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}>
                                  📝 写笔记
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

            {/* ── 班级总览 ── */}
      {view === 'classops' && (
        <div>
          <div className="dash-grid" style={{ marginBottom: 24 }}>
            {['group_class', 'private_lesson', 'workshop'].map(type => {
              const typeOfferings = myOfferings.filter(o => {
                const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId);
                return tt?.type === type;
              });
              const typeStudents = typeOfferings.reduce((s, o) => s + myEnrollments.filter(e => e.offeringId === o.id && e.status === 'confirmed').length, 0);
              return (
                <div key={type} className="dash-stat">
                  <div className="label">{TYPE_LABEL[type]}</div>
                  <div className="num" style={{ color: TYPE_COLOR[type] }}>{typeStudents} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>人</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{typeOfferings.length} 个班级</div>
                </div>
              );
            })}
          </div>

          {/* Group by teaching type */}
          {['group_class', 'private_lesson', 'workshop'].map(type => {
            const typeOfferings = myOfferings.filter(o => {
              const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId);
              return tt?.type === type;
            });
            if (typeOfferings.length === 0) return null;
            return (
              <div key={type} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 50, background: TYPE_COLOR[type] }} />
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{TYPE_LABEL[type]}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{typeOfferings.length} 个班级</span>
                </div>
                {typeOfferings.map(o => {
                  const enrolled = myEnrollments.filter(e => e.offeringId === o.id && (e.status === 'confirmed' || e.status === 'pending_payment'));
                  const confirmed = enrolled.filter(e => e.status === 'confirmed');
                  const pending = enrolled.filter(e => e.status === 'pending_payment');
                  const waitlisted = myEnrollments.filter(e => e.offeringId === o.id && e.status === 'waitlisted');
                  const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                  const level = myLevels.find(l => l.id === o.levelId);
                  const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                  const pct = o.capacity > 0 ? Math.round(enrolled.length / o.capacity * 100) : 0;
                  const isFull = enrolled.length >= o.capacity;
                  const isExpanded = expandedOffering === o.id;

                  return (
                    <div key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--line)' : 'none' }}
                        onClick={() => setExpandedOffering(isExpanded ? null : o.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{o.name}</span>
                          {level && <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 999 }}>{level.name}</span>}
                          {isFull && <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>✓ 已额满</span>}
                          {waitlisted.length > 0 && <span style={{ fontSize: 11, background: '#EEF2F7', color: '#4A6FA5', padding: '2px 8px', borderRadius: 999 }}>候补 {waitlisted.length}</span>}
                          {pending.length > 0 && <span style={{ fontSize: 11, background: 'var(--warn-bg)', color: 'var(--warn)', padding: '2px 8px', borderRadius: 999 }}>⚠ 待付款 {pending.length}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{teacher?.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{enrolled.length}/{o.capacity} 人</span>
                          {o.totalSessions && <span style={{ fontSize: 12, color:'var(--text-muted)' }}>·  {o.totalSessions}堂/期</span>}
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
                          <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ padding: '8px 20px', borderBottom: isExpanded ? '1px solid var(--line)' : 'none' }}>
                        <div style={{ height: 5, background: 'var(--line)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isFull ? 'var(--success)' : pct > 70 ? 'var(--amber)' : 'var(--success)', borderRadius: 99 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                          {o.slots?.map(s => <span key={s.id}>{s.day} {s.time}</span>)}
                        </div>
                      </div>

                      {/* Expanded: student roster */}
                      {isExpanded && (
                        <div style={{ padding: '12px 20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>报名学生</div>
                          <table className="dash-table" style={{ margin: 0 }}>
                            <thead>
                              <tr><th>学生</th><th>班次</th><th>状态</th><th>付款</th></tr>
                            </thead>
                            <tbody>
                              {[...enrolled, ...waitlisted].map(en => (
                                <tr key={en.id}>
                                  <td style={{ fontWeight: 600 }}>{en.childName}</td>
                                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{o.slots?.find(s => s.id === en.slotId)?.day || '—'}</td>
                                  <td>
                                    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: en.status === 'confirmed' ? 'var(--success-bg)' : en.status === 'waitlisted' ? '#EEF2F7' : 'var(--warn-bg)', color: en.status === 'confirmed' ? 'var(--success)' : en.status === 'waitlisted' ? '#4A6FA5' : 'var(--warn)' }}>
                                      {en.status === 'confirmed' ? '已确认' : en.status === 'waitlisted' ? '候补' : '待确认'}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: en.paymentStatus === 'paid' ? 'var(--success-bg)' : '#FCEBEB', color: en.paymentStatus === 'paid' ? 'var(--success)' : 'var(--error)' }}>
                                      {en.paymentStatus === 'paid' ? '已付' : '未付'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 课程设定 ── */}
      {view === 'courses' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <p style={{ color:'var(--text-muted)', fontSize:13, margin:0 }}>
              科目 → 教学类型 → 课纲路径 → 开班
            </p>
            <button style={{ fontSize:13, padding:'7px 16px' }} onClick={() => setShowNewOffering(true)}>+ 新增开班</button>
          </div>

          {/* ── 团体课：完整Yamaha课纲结构 ── */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingBottom:10, borderBottom:'2px solid var(--line)' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16 }}>钢</div>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>钢琴</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>RCM系统化钢琴教学</div>
              </div>
            </div>

            {/* 团体课标签 */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, marginLeft:8 }}>
              <span style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'var(--success-bg)', color:'var(--success)', fontWeight:700 }}>团体课</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>Yamaha课纲体系 · 6条学习路径</span>
            </div>

            {/* 所有课纲卡片 */}
            <div style={{ marginLeft:8 }}>
              {myCurricula.map(cur => {
                const curLevels = myLevels.filter(l => l.curriculumId === cur.id).sort((a,b) => a.levelIndex - b.levelIndex);
                const curOfferings = myOfferings.filter(o => o.curriculumId === cur.id);
                const byYear = {};
                curLevels.forEach(l => { if (!byYear[l.year]) byYear[l.year] = []; byYear[l.year].push(l); });
                const nextCur = myCurricula.find(c => c.id === cur.nextCurriculumId);
                return (
                  <div key={cur.id} style={{ marginBottom:20, border:`1.5px solid ${cur.color}`, borderRadius:14, overflow:'hidden' }}>
                    {/* 课纲标题 */}
                    <div style={{ padding:'10px 16px', background:cur.color, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{cur.name}</span>
                        <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)' }}>{cur.nameEn}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <span style={{ fontSize:11, background:'rgba(255,255,255,0.25)', color:'#fff', padding:'2px 8px', borderRadius:999 }}>{cur.ageRange}</span>
                        <span style={{ fontSize:11, background:'rgba(255,255,255,0.25)', color:'#fff', padding:'2px 8px', borderRadius:999 }}>{cur.totalYears}年</span>
                        {cur.requiresPrivateLesson && <span style={{ fontSize:11, background:'#fff', color:cur.color, padding:'2px 8px', borderRadius:999, fontWeight:700 }}>须私教</span>}
                      </div>
                    </div>
                    {/* 说明 */}
                    <div style={{ padding:'6px 16px', background:'var(--bg)', fontSize:12, color:'var(--text-muted)', borderBottom:'1px solid var(--line)' }}>
                      {cur.description}
                    </div>
                    {/* 级别结构 */}
                    <div style={{ padding:'12px 16px', background:'var(--card)' }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>级别结构</div>
                      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom: curOfferings.length > 0 ? 14 : 0 }}>
                        {Object.entries(byYear).map(([year, levels]) => (
                          <div key={year} style={{ display:'flex', flexDirection:'column', gap:4, minWidth:80 }}>
                            <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textAlign:'center' }}>第{year}年</div>
                            {levels.map(lv => {
                              const hasOffering = curOfferings.some(o => o.levelId === lv.id);
                              return (
                                <div key={lv.id} style={{ padding:'4px 10px', borderRadius:6, fontSize:12, fontWeight:700, textAlign:'center', background: hasOffering ? cur.color : 'var(--bg)', color: hasOffering ? '#fff' : 'var(--text-muted)', border:`1.5px solid ${hasOffering ? cur.color : 'var(--line)'}` }}>
                                  {lv.shortName}
                                  {hasOffering && <span style={{ fontSize:9, display:'block', fontWeight:400 }}>✓ 已开班</span>}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                        {nextCur && (
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:18, color:'var(--text-muted)' }}>→</span>
                            <div style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:700, background:nextCur.color, color:'#fff' }}>{nextCur.name}</div>
                          </div>
                        )}
                      </div>

                      {/* 目前开班 */}
                      {curOfferings.length > 0 && (
                        <div style={{ borderTop:'1px solid var(--line)', paddingTop:12 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>目前开班</div>
                          {curOfferings.map(o => {
                            const enrolled = myEnrollments.filter(e => e.offeringId === o.id && e.status === 'confirmed').length;
                            const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                            const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                            const lv = myLevels.find(l => l.id === o.levelId);
                            const es = o.enrollmentSettings || {};
                            return (
                              <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', background:'var(--bg)', borderRadius:8, marginBottom:6, border:'1px solid var(--line)' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  {lv && <span style={{ fontSize:11, padding:'1px 7px', borderRadius:999, background:cur.color, color:'#fff', fontWeight:700 }}>{lv.shortName}</span>}
                                  <span style={{ fontWeight:600, fontSize:13 }}>{o.name}</span>
                                  {es.allowTrial && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background:'#EEF2F7', color:'#4A6FA5' }}>可试课</span>}
                                  {es.allowWaitlist && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background:'var(--warn-bg)', color:'var(--warn)' }}>可候补</span>}
                                </div>
                                <div style={{ display:'flex', gap:10, fontSize:12, alignItems:'center' }}>
                                  <span style={{ color:'var(--text-muted)' }}>{teacher?.name}</span>
                                  <span style={{ fontWeight:600 }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
                                  <span style={{ fontWeight:700, color: enrolled >= o.capacity ? 'var(--error)' : 'var(--ink)' }}>{enrolled}/{o.capacity}人</span>
                                  <button className="secondary" style={{ fontSize:11, padding:'2px 10px' }} onClick={() => setEditingOffering(o)}>编辑</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {curOfferings.length === 0 && (
                        <div style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', marginTop:4 }}>还没有开班 — 点「+ 新增开班」</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 一对一私教 ── */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:8, borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'#EEF2F7', color:'#4A6FA5', fontWeight:700 }}>一对一私教</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>弹性排课，无固定课纲，需咨询</span>
            </div>
            <div style={{ marginLeft:8 }}>
              {myOfferings.filter(o => {
                const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId);
                return tt?.type === 'private_lesson';
              }).map(o => {
                const enrolled = myEnrollments.filter(e => e.offeringId === o.id && e.status === 'confirmed').length;
                const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                const es = o.enrollmentSettings || {};
                return (
                  <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--card)', border:'1px solid var(--line)', borderRadius:10, marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{o.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3, display:'flex', gap:10 }}>
                        <span>⏱ {o.durationMin}分钟</span>
                        {o.slots?.map(s => <span key={s.id}>{s.day} {s.time}</span>)}
                        {es.requireConsultation && <span>📋 需咨询</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:12 }}>
                      <span style={{ color:'var(--text-muted)' }}>{teacher?.name}</span>
                      <span style={{ fontWeight:600 }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
                      <span style={{ fontWeight:700 }}>{enrolled}/{o.capacity}人</span>
                      <button className="secondary" style={{ fontSize:11, padding:'2px 10px' }} onClick={() => setEditingOffering(o)}>编辑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 工作坊/营队 ── */}
          <div style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:8, borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'var(--warn-bg)', color:'var(--warn)', fontWeight:700 }}>工作坊/营队</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>单次或多天活动，独立定价</span>
            </div>
            <div style={{ marginLeft:8 }}>
              {myOfferings.filter(o => {
                const tt = myTeachingTypes.find(t => t.id === o.teachingTypeId);
                return tt?.type === 'workshop';
              }).map(o => {
                const enrolled = myEnrollments.filter(e => e.offeringId === o.id && e.status === 'confirmed').length;
                const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
                const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
                return (
                  <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--card)', border:'1px solid var(--line)', borderRadius:10, marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{o.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3, display:'flex', gap:10 }}>
                        {o.startDate && <span>📅 {o.startDate} — {o.endDate}</span>}
                        <span>⏱ {o.durationMin}分钟/天 · 共{o.totalSessions}天</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:12 }}>
                      <span style={{ color:'var(--text-muted)' }}>{teacher?.name}</span>
                      <span style={{ fontWeight:600 }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
                      <span style={{ fontWeight:700 }}>{enrolled}/{o.capacity}人</span>
                      <button className="secondary" style={{ fontSize:11, padding:'2px 10px' }} onClick={() => setEditingOffering(o)}>编辑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

            {/* ── 新增开班 Wizard ── */}
      {showNewOffering && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => { setShowNewOffering(false); setWizardStep(1); setWizardData({}); }}>
          <div style={{ background:'var(--card)', borderRadius:18, padding:28, width:520, maxWidth:'90vw', boxShadow:'0 8px 32px rgba(0,0,0,0.18)', maxHeight:'85vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, margin:0 }}>新增开班</h2>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>步骤 {wizardStep} / 4</div>
              </div>
              <button className="secondary" onClick={() => { setShowNewOffering(false); setWizardStep(1); setWizardData({}); }}>关闭</button>
            </div>

            {/* Progress */}
            <div style={{ display:'flex', gap:4, marginBottom:24 }}>
              {['教学类型','级别','老师','时间定价'].map((s, i) => (
                <div key={i} style={{ flex:1, height:4, borderRadius:99, background: wizardStep > i ? 'var(--amber)' : 'var(--line)' }} />
              ))}
            </div>

            {/* Step 1: 教学类型 */}
            {wizardStep === 1 && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>选择教学类型</div>
                {[
                  { type:'group_class', label:'团体课', desc:'有固定课纲和级别，多名学生同班', color:'var(--success)', bg:'var(--success-bg)' },
                  { type:'private_lesson', label:'一对一私教', desc:'弹性排课，按堂或月计费', color:'#4A6FA5', bg:'#EEF2F7' },
                  { type:'workshop', label:'工作坊/营队', desc:'单次或多天活动，独立定价', color:'var(--amber)', bg:'var(--warn-bg)' },
                ].map(opt => (
                  <div key={opt.type}
                    onClick={() => setWizardData(d => ({ ...d, teachingType: opt.type }))}
                    style={{ padding:'14px 18px', border:`2px solid ${wizardData.teachingType === opt.type ? opt.color : 'var(--line)'}`, borderRadius:12, marginBottom:10, cursor:'pointer', background: wizardData.teachingType === opt.type ? opt.bg : 'var(--card)', transition:'all 0.15s' }}>
                    <div style={{ fontWeight:700, fontSize:14, color: wizardData.teachingType === opt.type ? opt.color : 'var(--ink)' }}>{opt.label}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{opt.desc}</div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
                  <button disabled={!wizardData.teachingType} onClick={() => setWizardStep(2)} style={{ opacity: wizardData.teachingType ? 1 : 0.4 }}>下一步 →</button>
                </div>
              </div>
            )}

            {/* Step 2: 课纲/级别（团体课）或说明（私教/工作坊） */}
            {wizardStep === 2 && (
              <div>
                {wizardData.teachingType === 'group_class' ? (
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>选择课纲与级别</div>
                    {myCurricula.map(cur => {
                      const curLevels = myLevels.filter(l => l.curriculumId === cur.id).sort((a,b) => a.levelIndex - b.levelIndex);
                      return (
                        <div key={cur.id} style={{ marginBottom:16 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#fff', background:cur.color, padding:'6px 12px', borderRadius:'8px 8px 0 0' }}>{cur.name} <span style={{ fontSize:11, fontWeight:400 }}>{cur.ageRange}</span></div>
                          <div style={{ border:`1.5px solid ${cur.color}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'8px 10px', display:'flex', gap:6, flexWrap:'wrap' }}>
                            {curLevels.map(lv => (
                              <div key={lv.id}
                                onClick={() => setWizardData(d => ({ ...d, curriculumId: cur.id, levelId: lv.id, levelName: lv.name }))}
                                style={{ padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', background: wizardData.levelId === lv.id ? cur.color : 'var(--bg)', color: wizardData.levelId === lv.id ? '#fff' : 'var(--text-muted)', border:`1.5px solid ${wizardData.levelId === lv.id ? cur.color : 'var(--line)'}` }}>
                                {lv.shortName}<span style={{ fontWeight:400, fontSize:11 }}> {lv.ageMin}-{lv.ageMax}岁</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : wizardData.teachingType === 'private_lesson' ? (
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>私教设定</div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>班级名称</div>
                      <input style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                        placeholder="例：钢琴一对一私教（Sarah Lin）"
                        onChange={e => setWizardData(d => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>每堂时长（分钟）</div>
                      <input type="number" defaultValue={45} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                        onChange={e => setWizardData(d => ({ ...d, durationMin: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>活动基本资讯</div>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>活动名称</div>
                      <input style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                        placeholder="例：2026 暑期钢琴夏令营"
                        onChange={e => setWizardData(d => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>开始日期</div>
                        <input type="date" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                          onChange={e => setWizardData(d => ({ ...d, startDate: e.target.value }))} />
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>结束日期</div>
                        <input type="date" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                          onChange={e => setWizardData(d => ({ ...d, endDate: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
                  <button className="secondary" onClick={() => setWizardStep(1)}>← 上一步</button>
                  <button onClick={() => setWizardStep(3)}>下一步 →</button>
                </div>
              </div>
            )}

            {/* Step 3: 主教老师 */}
            {wizardStep === 3 && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>选择主教老师</div>
                {studioTeachers.filter(t => t.studioId === studioId).map(t => (
                  <div key={t.id}
                    onClick={() => setWizardData(d => ({ ...d, teacherId: t.id, teacherName: t.name }))}
                    style={{ padding:'12px 16px', border:`2px solid ${wizardData.teacherId === t.id ? 'var(--amber)' : 'var(--line)'}`, borderRadius:12, marginBottom:10, cursor:'pointer', background: wizardData.teacherId === t.id ? 'var(--warn-bg)' : 'var(--card)' }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{t.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{t.specialties?.join(' · ')}</div>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                  <button className="secondary" onClick={() => setWizardStep(2)}>← 上一步</button>
                  <button disabled={!wizardData.teacherId} onClick={() => setWizardStep(4)} style={{ opacity: wizardData.teacherId ? 1 : 0.4 }}>下一步 →</button>
                </div>
              </div>
            )}

            {/* Step 4: 时间 & 定价 */}
            {wizardStep === 4 && (
              <div>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>时间与定价</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>上课星期</div>
                    <select style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14 }}
                      onChange={e => setWizardData(d => ({ ...d, day: e.target.value }))}>
                      <option value="">选择</option>
                      {['星期一','星期二','星期三','星期四','星期五','星期六','星期日'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>上课时间</div>
                    <input type="time" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                      onChange={e => setWizardData(d => ({ ...d, time: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>名额上限</div>
                    <input type="number" defaultValue={8} style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                      onChange={e => setWizardData(d => ({ ...d, capacity: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>学生收费（$）</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14, color:'var(--text-muted)' }}>$</span>
                      <input type="number" defaultValue={220} style={{ width:90, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                        onChange={e => setWizardData(d => ({ ...d, price: e.target.value }))} />
                      <span style={{ fontSize:13, color:'var(--text-muted)' }}>/</span>
                      <select style={{ flex:1, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, background:'var(--bg)' }}
                        onChange={e => setWizardData(d => ({ ...d, priceUnit: e.target.value }))}>
                        <option value="月">月</option>
                        <option value="堂">堂</option>
                        <option value="营期">营期</option>
                        <option value="学期">学期</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* ── 地点设定 ── */}
                <div style={{ marginBottom:16, padding:'14px 16px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>📍 上课地点</div>

                  {/* 地点类型选择 */}
                  <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                    {[
                      { type:'fixed',    label:'固定地点', desc:'每堂都在同一个教室' },
                      { type:'multi',    label:'多教室轮换', desc:'工作室内多间教室' },
                      { type:'flexible', label:'弹性地点', desc:'私教/每堂可不同' },
                    ].map(opt => (
                      <div key={opt.type}
                        onClick={() => setWizardData(d => ({ ...d, locationType: opt.type, locationRooms: opt.type === 'multi' ? (d.locationRooms || ['A教室','B教室']) : d.locationRooms }))}
                        style={{ flex:1, padding:'9px 10px', border:`2px solid ${(wizardData.locationType || 'fixed') === opt.type ? 'var(--amber)' : 'var(--line)'}`, borderRadius:10, cursor:'pointer', background:(wizardData.locationType || 'fixed') === opt.type ? 'var(--warn-bg)' : 'var(--card)', textAlign:'center' }}>
                        <div style={{ fontWeight:700, fontSize:12, color:(wizardData.locationType || 'fixed') === opt.type ? 'var(--amber)' : 'var(--ink)' }}>{opt.label}</div>
                        <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:2 }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>

                  {/* 固定地点：填一个地址 */}
                  {(!wizardData.locationType || wizardData.locationType === 'fixed') && (
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>地址/房间</div>
                      <input
                        value={wizardData.locationFixed || ''}
                        onChange={e => setWizardData(d => ({ ...d, locationFixed: e.target.value }))}
                        placeholder="例：3楼 A教室 / 1234 Main St Suite 201"
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }} />
                    </div>
                  )}

                  {/* 多教室：设定多间教室名称 */}
                  {wizardData.locationType === 'multi' && (
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>教室名称（每行一间）</div>
                      {(wizardData.locationRooms || ['A教室','B教室']).map((room, i) => (
                        <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                          <input
                            value={room}
                            onChange={e => {
                              const rooms = [...(wizardData.locationRooms || [])];
                              rooms[i] = e.target.value;
                              setWizardData(d => ({ ...d, locationRooms: rooms }));
                            }}
                            placeholder={`例：${String.fromCharCode(65+i)}教室`}
                            style={{ flex:1, padding:'7px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13 }} />
                          <button className="secondary" onClick={() => {
                            const rooms = (wizardData.locationRooms||[]).filter((_,j)=>j!==i);
                            setWizardData(d => ({ ...d, locationRooms: rooms }));
                          }} style={{ fontSize:12, padding:'4px 8px', color:'var(--error)' }}>✕</button>
                        </div>
                      ))}
                      <button className="secondary" onClick={() => setWizardData(d => ({ ...d, locationRooms: [...(d.locationRooms||[]), ''] }))}
                        style={{ fontSize:12, padding:'4px 12px' }}>+ 新增教室</button>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>每次点名时可指定今天用哪间教室</div>
                    </div>
                  )}

                  {/* 弹性：填默认地点，每堂可覆盖 */}
                  {wizardData.locationType === 'flexible' && (
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>默认地点（可留空）</div>
                      <input
                        value={wizardData.locationDefault || ''}
                        onChange={e => setWizardData(d => ({ ...d, locationDefault: e.target.value }))}
                        placeholder="例：老师工作室 / 视学生地点而定"
                        style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box', marginBottom:4 }} />
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>每次点名前可修改当天的上课地点</div>
                    </div>
                  )}
                </div>

                {/* 老师薪资设定 - 只有owner可见 */}
                {user?.role === 'owner' && (
                  <div style={{ marginBottom:14, padding:'14px 16px', background:'var(--warn-bg)', border:'1px solid var(--amber)', borderRadius:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--ink)', marginBottom:12 }}>🔒 老师薪资设定（仅管理员可见）</div>
                    {/* 薪资类型 */}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>薪资方式</div>
                      <div style={{ display:'flex', gap:8 }}>
                        {[
                          { type:'per_session', label:'按堂计薪', desc:'固定rate × 堂数' },
                          { type:'revenue_share', label:'收入分成', desc:'学生收款 × %' },
                        ].map(opt => (
                          <div key={opt.type}
                            onClick={() => setWizardData(d => ({ ...d, compensationType: opt.type }))}
                            style={{ flex:1, padding:'10px 12px', border:`2px solid ${(wizardData.compensationType || 'per_session') === opt.type ? 'var(--amber)' : 'var(--line)'}`, borderRadius:10, cursor:'pointer', background: (wizardData.compensationType || 'per_session') === opt.type ? '#fff' : 'var(--card)' }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{opt.label}</div>
                            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{opt.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* 按堂计薪 */}
                    {(!wizardData.compensationType || wizardData.compensationType === 'per_session') && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>老师每堂rate（$）</div>
                          <input type="number" placeholder="例如：35"
                            style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                            onChange={e => setWizardData(d => ({ ...d, teacherRate: e.target.value }))} />
                        </div>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.8 }}>
                            学生付 <strong>${wizardData.price || '—'}</strong>/月<br/>
                            老师得 <strong>${wizardData.teacherRate || '—'}</strong>/堂<br/>
                            <span style={{ color:'var(--success)', fontWeight:600 }}>
                              工作室留 ${wizardData.price && wizardData.teacherRate ? Math.round(wizardData.price - wizardData.teacherRate * 4) : '—'}/月
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 收入分成 */}
                    {wizardData.compensationType === 'revenue_share' && (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>老师分成比例（%）</div>
                          <input type="number" placeholder="例如：65" min={0} max={100}
                            style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                            onChange={e => setWizardData(d => ({ ...d, sharePercent: e.target.value }))} />
                        </div>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.8 }}>
                            学生付 <strong>${wizardData.price || '—'}</strong>/月<br/>
                            老师得 <strong>{wizardData.sharePercent || '—'}%</strong> = ${wizardData.price && wizardData.sharePercent ? Math.round(wizardData.price * wizardData.sharePercent / 100) : '—'}<br/>
                            <span style={{ color:'var(--success)', fontWeight:600 }}>
                              工作室留 {wizardData.sharePercent ? 100 - wizardData.sharePercent : '—'}% = ${wizardData.price && wizardData.sharePercent ? Math.round(wizardData.price * (100 - wizardData.sharePercent) / 100) : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>报名设定</div>
                  <div style={{ display:'flex', gap:16 }}>
                    {[['allowTrial','可试课'],['allowWaitlist','可候补'],['requireConsultation','需咨询']].map(([key, label]) => (
                      <label key={key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                        <input type="checkbox" onChange={e => setWizardData(d => ({ ...d, [key]: e.target.checked }))} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 预览 */}
                <div style={{ background:'var(--bg)', border:'1px solid var(--line)', borderRadius:10, padding:14, marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>预览</div>
                  <div style={{ fontSize:13, fontWeight:700 }}>{wizardData.name || wizardData.levelName || '新班级'}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
                    {wizardData.teacherName} · {wizardData.day} {wizardData.time} · 上限{wizardData.capacity || 8}人 · ${wizardData.price || 220}/月
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <button className="secondary" onClick={() => setWizardStep(3)}>← 上一步</button>
                  <button style={{ background:'var(--success)', color:'#fff', border:'none' }}
                    onClick={() => { alert('班级已建立！（prototype模式，不会真的写入数据库）'); setShowNewOffering(false); setWizardStep(1); setWizardData({}); }}>
                    ✓ 建立班级
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 编辑班级弹窗 ── */}
      {editingOffering && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setEditingOffering(null)}>
          <div style={{ background:'var(--card)', borderRadius:18, padding:28, width:480, maxWidth:'90vw', boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:17, fontWeight:700, margin:0 }}>编辑班级</h2>
              <button className="secondary" onClick={() => setEditingOffering(null)} style={{ fontSize:13 }}>关闭</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, maxHeight:'70vh', overflowY:'auto', paddingRight:4 }}>
              {/* 班级名称 */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>班级名称</div>
                <input style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                  defaultValue={editingOffering.name} />
              </div>
              {/* 老师 + 时长 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>主教老师</div>
                  <select style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14 }}
                    defaultValue={editingOffering.primaryTeacherId}>
                    {studioTeachers.filter(t => t.studioId === studioId).map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>每堂时长（分钟）</div>
                  <input type="number" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                    defaultValue={editingOffering.durationMin} />
                </div>
              </div>
              {/* 名额 + 学生收费 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>名额上限</div>
                  <input type="number" style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                    defaultValue={editingOffering.capacity} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>学生收费</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:14, color:'var(--text-muted)' }}>$</span>
                    <input type="number" style={{ width:90, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                      defaultValue={mockPricingPlans.find(p => p.id === editingOffering.pricingPlanId)?.amount} />
                    <span style={{ fontSize:13, color:'var(--text-muted)' }}>/</span>
                    <select style={{ flex:1, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, background:'var(--bg)' }}
                      defaultValue={mockPricingPlans.find(p => p.id === editingOffering.pricingPlanId)?.unit || '月'}>
                      <option value="月">月</option>
                      <option value="堂">堂</option>
                      <option value="营期">营期</option>
                      <option value="学期">学期</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* 日期 + 总堂数 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>开始日期</div>
                  <input type="date" style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }}
                    defaultValue={editingOffering.startDate} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>结束日期</div>
                  <input type="date" style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }}
                    defaultValue={editingOffering.endDate} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>总堂数</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <input type="number" min={1} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13, boxSizing:'border-box' }}
                      defaultValue={editingOffering.totalSessions || ''} placeholder="例：16" />
                    <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>堂</span>
                  </div>
                </div>
              </div>
              {/* 报名设定 */}
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>报名设定</div>
                <div style={{ display:'flex', gap:16 }}>
                  {[['allowTrial','可试课'],['allowWaitlist','可候补'],['requireConsultation','需咨询']].map(([key, label]) => (
                    <label key={key} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" defaultChecked={editingOffering.enrollmentSettings?.[key]} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {/* 🔒 老师薪资设定（Owner only） */}
              {user?.role === 'owner' && (
                <div style={{ padding:'14px 16px', background:'var(--warn-bg)', border:'1px solid var(--amber)', borderRadius:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:12 }}>🔒 老师薪资设定（仅管理员可见）</div>
                  {/* 薪资方式 - 3种 */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>薪资方式</div>
                    <div style={{ display:'flex', gap:6 }}>
                      {[
                        { type:'per_session',   label:'固定按堂',   desc:'$固定 × 堂数' },
                        { type:'revenue_share', label:'收入分成',   desc:'收款 × %' },
                        { type:'hybrid',        label:'固定 + 抽成', desc:'$固定 + %分成' },
                      ].map(opt => {
                        const current = editingOffering.compensationRule?.type || 'per_session';
                        const active = current === opt.type;
                        return (
                          <div key={opt.type} style={{ flex:1, padding:'8px 10px', border:`2px solid ${active ? 'var(--amber)' : 'var(--line)'}`, borderRadius:8, cursor:'default', background: active ? 'rgba(255,255,255,0.8)' : 'var(--card)', textAlign:'center' }}>
                            {active && <div style={{ fontSize:9, color:'var(--amber)', fontWeight:700, marginBottom:2 }}>✓ 目前</div>}
                            <div style={{ fontWeight:700, fontSize:12 }}>{opt.label}</div>
                            <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{opt.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>💡 Prototype中薪资方式已从班级设定读取，未来可点击切换</div>
                  </div>
                  {/* 固定按堂 */}
                  {(!editingOffering.compensationRule?.type || editingOffering.compensationRule?.type === 'per_session') && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>每堂固定rate（$）</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:14, color:'var(--text-muted)' }}>$</span>
                          <input type="number" style={{ flex:1, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                            defaultValue={editingOffering.teacherRate || editingOffering.compensationRule?.amount || ''} />
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>/堂</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.9 }}>
                          学生付 <strong>${mockPricingPlans.find(p => p.id === editingOffering.pricingPlanId)?.amount || '—'}</strong><br/>
                          老师得 <strong>${editingOffering.teacherRate || editingOffering.compensationRule?.amount || '—'}</strong>/堂
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 收入分成 */}
                  {editingOffering.compensationRule?.type === 'revenue_share' && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>老师分成比例</div>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <input type="number" min={0} max={100} style={{ width:72, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                            defaultValue={editingOffering.compensationRule?.sharePercent || 65} />
                          <span style={{ fontSize:14, color:'var(--text-muted)' }}>%</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.9 }}>
                          老师得 <strong>{editingOffering.compensationRule?.sharePercent || 65}%</strong><br/>
                          工作室留 <strong>{100 - (editingOffering.compensationRule?.sharePercent || 65)}%</strong>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 固定 + 抽成混合 */}
                  {editingOffering.compensationRule?.type === 'hybrid' && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>固定每堂（$）</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:14, color:'var(--text-muted)' }}>$</span>
                            <input type="number" style={{ width:72, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                              defaultValue={editingOffering.compensationRule?.fixedAmount || ''} />
                            <span style={{ fontSize:12, color:'var(--text-muted)' }}>/堂</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>加：收入抽成（%）</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <input type="number" min={0} max={100} style={{ width:72, padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }}
                              defaultValue={editingOffering.compensationRule?.sharePercent || ''} />
                            <span style={{ fontSize:14, color:'var(--text-muted)' }}>%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:2 }}>
                          老师得：<br/>
                          <strong>${editingOffering.compensationRule?.fixedAmount || '—'}</strong>/堂<br/>
                          + 收款 × <strong>{editingOffering.compensationRule?.sharePercent || '—'}%</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                <button className="secondary" onClick={() => setEditingOffering(null)} style={{ fontSize:13 }}>取消</button>
                <button style={{ fontSize:13 }} onClick={() => { alert('已储存（prototype模式）'); setEditingOffering(null); }}>储存变更</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
