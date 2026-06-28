import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockEnrollments, mockClassOfferings, mockPricingPlans, mockLevels, mockCurricula, instructors, mockInvoices } from '../mockData';

// Mock课后笔记（实际产品从API读取）
const MOCK_LESSON_NOTES = [
  { enrollmentId:'en1', date:'2026-06-17', teacherName:'Sarah Lin', parentNote:'今天练习了《小星星》前两页，右手旋律非常稳定！下周请在家每天练习第3页10分钟，特别注意第5小节的节奏。', hasNote:true },
  { enrollmentId:'en1', date:'2026-06-10', teacherName:'Sarah Lin', parentNote:'第一堂课！林小美适应得很快，认识了5个白键音名（C D E F G），可以弹简单的5指音阶。很棒的开始！', hasNote:true },
  { enrollmentId:'en2', date:'2026-06-17', teacherName:'Mira Chen', parentNote:'今天复习了第2章，双手配合越来越顺。建议王大宝每天练15分钟，专注于左手伴奏的稳定性。', hasNote:true },
];

import WeekCalendar from '../components/WeekCalendar';

const WEEKDAYS_ZH = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    days.push({ date: d, currentMonth: d.getMonth() === month });
  }
  return days;
}

// 地点异动通知组件（实际产品从API读取 + push通知）
const MOCK_LOCATION_CHANGES = [
  {
    id: 'lc1',
    offeringName: 'JMC1 入门钢琴 秋季班 A',
    date: '2026-06-28',
    originalLocation: 'A教室',
    newLocation: 'C教室（临时调换）',
    changedAt: '2026-06-27 18:30',
    read: false,
  },
];

function LocationChangeAlert() {
  const [dismissed, setDismissed] = React.useState([]);
  const active = MOCK_LOCATION_CHANGES.filter(c => !dismissed.includes(c.id));
  if (active.length === 0) return null;
  return (
    <div style={{ marginBottom:20 }}>
      {active.map(c => (
        <div key={c.id} style={{ padding:'12px 16px', background:'#FFF3CD', border:'1.5px solid #E0922F', borderRadius:12, display:'flex', gap:12, alignItems:'flex-start' }}>
          <span style={{ fontSize:22, flexShrink:0 }}>📍</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'#92610A', marginBottom:3 }}>
              上课地点临时变动通知
            </div>
            <div style={{ fontSize:13, color:'#7A5200', lineHeight:1.7 }}>
              <strong>{c.offeringName}</strong> {c.date} 的上课地点已由 <strong>{c.originalLocation}</strong> 改为 <strong style={{ color:'#E0922F' }}>{c.newLocation}</strong>
            </div>
            <div style={{ fontSize:11, color:'#B07A30', marginTop:4 }}>
              老师于 {c.changedAt} 更新 · 实际产品会同步发送Email和App推播通知
            </div>
          </div>
          <button onClick={() => setDismissed(d => [...d, c.id])}
            style={{ fontSize:12, padding:'4px 10px', background:'transparent', border:'1px solid #E0922F', borderRadius:6, cursor:'pointer', color:'#92610A', flexShrink:0 }}>
            已知悉 ✓
          </button>
        </div>
      ))}
    </div>
  );
}

// 帐单卡片（必须是独立组件，不能在map里用useState）
function InvoiceCard({ inv }) {
  const [expanded, setExpanded] = React.useState(false);
  const offering = mockClassOfferings.find(o => o.id === inv.offeringId);
  const pp = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
  return (
    <div style={{ background:'var(--card)', border:`1.5px solid ${inv.status==='pending' ? 'var(--error)' : 'var(--line)'}`, borderRadius:12, marginBottom:12, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>{inv.month} · {offering?.name}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
            {inv.sessions.length}堂课 · ${inv.amount}/{pp?.unit || '月'}
            {inv.status==='pending' && <span style={{ marginLeft:8, color:'var(--error)' }}>截止日：{inv.dueDate}</span>}
            {inv.status==='paid' && <span style={{ marginLeft:8, color:'var(--success)' }}>✓ 已缴 {inv.paidDate}</span>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontWeight:800, fontSize:18, color: inv.status==='pending' ? 'var(--error)' : 'var(--success)' }}>
            ${inv.amount}
          </span>
          {inv.status==='pending' && <span style={{ fontSize:11, padding:'3px 10px', background:'#FBEAE8', color:'var(--error)', borderRadius:999, fontWeight:700 }}>待缴</span>}
          {inv.status==='paid'    && <span style={{ fontSize:11, padding:'3px 10px', background:'var(--success-bg)', color:'var(--success)', borderRadius:999, fontWeight:700 }}>已缴</span>}
          <span style={{ color:'var(--text-muted)', fontSize:13 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop:'1px solid var(--line)', padding:'10px 16px' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:8 }}>课堂明细</div>
          {inv.sessions.map((s, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
              <span style={{ color:'var(--text-muted)' }}>{s.date}</span>
              <span>{s.name}</span>
              <span style={{ color:'var(--text-muted)' }}>{s.duration}分钟</span>
            </div>
          ))}
          {inv.status === 'pending' && (
            <div style={{ marginTop:12, padding:'10px 14px', background:'#FBEAE8', borderRadius:8, fontSize:13 }}>
              <div style={{ fontWeight:600, color:'var(--error)', marginBottom:4 }}>待缴 ${inv.amount}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>实际产品将支援线上刷卡缴费（Stripe / PayPal）</div>
              <button style={{ marginTop:8, fontSize:12, padding:'5px 16px', background:'var(--error)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                💳 线上缴费（示意）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 请假面板
function LeavePanel({ enrollment, offering, onClose }) {
  const [mode, setMode] = useState(enrollment.leaveStatus || null);
  const [submitted, setSubmitted] = useState(false);
  const pp = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
  const slot = offering?.slots?.find(s => s.id === enrollment.slotId) || offering?.slots?.[0];

  if (submitted) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:200 }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={onClose} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'var(--card)', borderRadius:16, padding:28, width:380, maxWidth:'90vw', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
          <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>请假申请已送出</div>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
            {mode === 'makeup_scheduled' ? '老师收到后会安排补课时段' : '已登记请假，不安排补课'}
          </div>
          <button onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  if (enrollment.leaveStatus) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:200 }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={onClose} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'var(--card)', borderRadius:16, padding:28, width:380, maxWidth:'90vw' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:16 }}>{offering?.name}</div>
            <button className="secondary" onClick={onClose} style={{ fontSize:12, padding:'3px 8px' }}>✕</button>
          </div>
          <div style={{ padding:'12px 14px', background:'var(--warn-bg)', borderRadius:10, marginBottom:16, fontSize:13 }}>
            {enrollment.leaveStatus === 'no_makeup'
              ? '⚠️ 已登记请假（不补课）'
              : `🔄 已登记请假，补课日期：${enrollment.makeupDate || '待安排'}`}
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button className="secondary" onClick={onClose}>关闭</button>
            <button onClick={() => { setSubmitted(true); }}>取消请假</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200 }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'var(--card)', borderRadius:16, padding:28, width:400, maxWidth:'90vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{offering?.name}</div>
          <button className="secondary" onClick={onClose} style={{ fontSize:12, padding:'3px 8px' }}>✕</button>
        </div>
        <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
          {slot?.day} {slot?.time} · {offering?.durationMin}分钟
          {pp && ` · $${pp.amount}/${pp.unit}`}
        </div>

        <div style={{ fontWeight:600, fontSize:14, marginBottom:12 }}>申请请假</div>

        {/* 选择方式 */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          <div onClick={() => setMode('no_makeup')}
            style={{ padding:'12px 16px', borderRadius:10, border:`2px solid ${mode === 'no_makeup' ? 'var(--amber)' : 'var(--line)'}`, background: mode === 'no_makeup' ? 'var(--warn-bg)' : 'var(--bg)', cursor:'pointer' }}>
            <div style={{ fontWeight:600, fontSize:14 }}>请假，不需要补课</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>这次课程直接跳过，学费照常，不安排补课</div>
          </div>
          <div onClick={() => setMode('makeup_scheduled')}
            style={{ padding:'12px 16px', borderRadius:10, border:`2px solid ${mode === 'makeup_scheduled' ? '#4A6FA5' : 'var(--line)'}`, background: mode === 'makeup_scheduled' ? '#EEF2F7' : 'var(--bg)', cursor:'pointer' }}>
            <div style={{ fontWeight:600, fontSize:14 }}>请假，希望安排补课</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>老师收到后会联络安排补课时段</div>
          </div>
        </div>

        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16, padding:'8px 12px', background:'var(--bg)', borderRadius:8 }}>
          💡 不管哪种请假方式，这堂课的学费都不退（学期制课程按月计费）
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button className="secondary" onClick={onClose}>取消</button>
          <button onClick={() => { if (mode) setSubmitted(true); }} disabled={!mode}
            style={{ opacity: mode ? 1 : 0.5 }}>
            确认请假
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyCalendarPage() {
  var authData = useAuth();
  var user = authData.user;
  var parent = authData.parent;
  var today = new Date();
  var stateActiveChildId = useState(null);
  var activeChildId = stateActiveChildId[0];
  var setActiveChildId = stateActiveChildId[1];
  var stateLeavePanelEnrollId = useState(null);
  var leavePanelEnrollId = stateLeavePanelEnrollId[0];
  var setLeavePanelEnrollId = stateLeavePanelEnrollId[1];
  var stateCalView = useState('week');
  var calView = stateCalView[0];
  var setCalView = stateCalView[1];
  var stateShowIcal = useState(false);
  var showIcal = stateShowIcal[0];
  var setShowIcal = stateShowIcal[1];
  var stateViewYear = useState(today.getFullYear());
  var viewYear = stateViewYear[0];
  var setViewYear = stateViewYear[1];
  var stateViewMonth = useState(today.getMonth());
  var viewMonth = stateViewMonth[0];
  var setViewMonth = stateViewMonth[1];

  // 所有 hooks 必须在这里以上 ── 以下才能有条件 return

  if (!parent) {
    return (
      <div className="page">
        <div className="flow-card">
          <h2 style={{ marginBottom:8 }}>请先登入</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>登入家长帐号后，即可查看孩子本周的上课时间表。</p>
        </div>
      </div>
    );
  }

  var children = parent.children || [];
  if (children.length === 0) {
    return (
      <div className="page">
        <div className="flow-card">
          <h2 style={{ marginBottom:8 }}>还没有孩子档案</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>先去帮孩子报名一门课，这里就会自动出现课表。</p>
          <Link to="/"><button className="full">去搜寻课程</button></Link>
        </div>
      </div>
    );
  }

  var activeChild = null;
  for (var ci = 0; ci < children.length; ci++) {
    if (children[ci].id === activeChildId) { activeChild = children[ci]; break; }
  }
  if (!activeChild) activeChild = children[0];

  // 读取报名记录
  var parentEmail = (user && user.email) || (parent && parent.email) || '';
  var MOCK_INVOICES = mockInvoices.filter(function(i) {
    return i.parentEmail === parentEmail;
  });
  var childEnrollments = mockEnrollments.filter(function(e) {
    return (e.parentEmail === parentEmail || e.childId === activeChild.id) &&
           e.status !== 'cancelled' && e.status !== 'waitlisted';
  });

  // 建立日历事件
  const calendarEvents = [];
  childEnrollments.forEach(e => {
    const offering = mockClassOfferings.find(o => o.id === e.offeringId);
    if (!offering) return;
    const instructor = instructors.find(i => i.id === offering.studioId || offering.studioId?.startsWith(i.id));
    const level = mockLevels.find(l => l.id === offering.levelId);
    const cur = mockCurricula.find(c => c.id === offering.curriculumId);
    const colorMap = { 'mira-piano':'cat-piano', 'david-swim':'cat-swim', 'lily-chinese':'cat-chinese' };
    const colorClass = colorMap[offering.studioId] || 'cat-piano';

    let tag = null;
    if (e.paymentStatus === 'pending') tag = '待确认付款';
    if (e.leaveStatus === 'no_makeup') tag = '已请假（不补课）';
    if (e.leaveStatus === 'makeup_scheduled') tag = '已请假，待补课';

    offering.slots?.forEach(slot => {
      calendarEvents.push({
        day: slot.day,
        time: slot.time,
        title: level ? `${level.shortName} ${offering.name.split('（')[0]}` : offering.name,
        sub: instructor?.name || offering.name,
        location: offering.locationFixed || offering.locationDefault || null,
        colorClass,
        tag,
        onClick: () => setLeavePanelEnrollId(e.id),
      });
    });
  });

  const monthGrid = buildMonthGrid(viewYear, viewMonth);
  function eventsForDate(date) {
    const dayZh = WEEKDAYS_ZH[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return calendarEvents.filter(e => e.day === dayZh);
  }

  const leavePanelEnroll = childEnrollments.find(e => e.id === leavePanelEnrollId);
  const leavePanelOffering = leavePanelEnroll ? mockClassOfferings.find(o => o.id === leavePanelEnroll.offeringId) : null;

  const icalUrl = `webcal://wyloapp.example.com/calendar/${activeChild?.id}.ics`;

  return (
    <div className="page">
      <div style={{ paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26 }}>我的孩子课表</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13.5, marginTop:6 }}>
            只显示您孩子自己的课程。点击任何一堂课，可以申请请假。
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {children.length > 1 && (
            <select value={activeChild?.id} onChange={e => setActiveChildId(e.target.value)} style={{ width:120 }}>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div style={{ display:'inline-flex', border:'1.5px solid var(--line)', borderRadius:8, overflow:'hidden' }}>
            <button onClick={() => setCalView('week')} style={{ padding:'7px 14px', fontSize:13, borderRadius:0, background: calView==='week' ? 'var(--ink)' : 'transparent', color: calView==='week' ? '#fff' : 'var(--text-muted)' }}>周</button>
            <button onClick={() => setCalView('month')} style={{ padding:'7px 14px', fontSize:13, borderRadius:0, background: calView==='month' ? 'var(--ink)' : 'transparent', color: calView==='month' ? '#fff' : 'var(--text-muted)' }}>月</button>
          </div>
          <button className="secondary" onClick={() => setShowIcal(v => !v)} style={{ fontSize:13, padding:'7px 14px' }}>
            📅 同步到 Google Calendar
          </button>
        </div>
      </div>

      {showIcal && (
        <div className="level-track-box" style={{ margin:'16px 0' }}>
          <div className="level-track-title">订阅到 Google Calendar</div>
          <p style={{ color:'var(--text-muted)', fontSize:13, margin:'6px 0 12px' }}>
            复制下方连结，贴到 Google Calendar 的「订阅其他日历」功能，之后课程会自动同步。
          </p>
          <div style={{ background:'var(--bg)', border:'1.5px solid var(--line)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:13, wordBreak:'break-all', marginBottom:12 }}>
            {icalUrl}
          </div>
          <div className="banner banner-warn" style={{ marginBottom:0 }}>
            ⚠️ 这是 Prototype 示范用的模拟连结，实际产品上线后才会是真实可用的订阅连结。
          </div>
        </div>
      )}

      <div className="dash-section" style={{ marginTop:16 }}>
        {calView === 'week' && (
          <WeekCalendar events={calendarEvents} emptyText={`${activeChild?.name || '孩子'}本周尚无排课`} />
        )}
        {calView === 'month' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <button className="secondary" onClick={() => { const d = new Date(viewYear, viewMonth-1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }} style={{ padding:'6px 14px', fontSize:13 }}>←</button>
              <span style={{ fontWeight:700, fontSize:15 }}>{viewYear}年 {MONTHS[viewMonth]}</span>
              <button className="secondary" onClick={() => { const d = new Date(viewYear, viewMonth+1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }} style={{ padding:'6px 14px', fontSize:13 }}>→</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:1, background:'var(--line)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
              {WEEKDAYS_ZH.map(d => (
                <div key={d} style={{ background:'var(--card)', textAlign:'center', padding:'8px 4px', fontSize:11.5, fontWeight:700 }}>{d}</div>
              ))}
              {monthGrid.map((cell, i) => {
                const dayEvents = eventsForDate(cell.date);
                const isToday = cell.date.toDateString() === today.toDateString();
                return (
                  <div key={i} style={{ background:'var(--card)', minHeight:64, padding:'6px 6px 4px', opacity: cell.currentMonth ? 1 : 0.35 }}>
                    <div style={{ fontSize:12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--amber)' : 'var(--text-muted)', marginBottom:3 }}>{cell.date.getDate()}</div>
                    {dayEvents.map((ev, j) => (
                      <div key={j} onClick={ev.onClick} style={{ fontSize:10, padding:'2px 5px', borderRadius:4, background:'var(--amber)', color:'#fff', marginBottom:2, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:600 }}>
                        {ev.time?.split('–')[0]} {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 待缴费提示 */}
      {childEnrollments.filter(e => e.paymentStatus === 'pending').length > 0 && (
        <div className="banner banner-warn" style={{ marginTop:16 }}>
          {activeChild?.name} 有课程显示在课表上，但付款尚待老师确认，确认后状态会更新。
        </div>
      )}

      {/* 课程清单 */}
      <div style={{ marginTop:28 }}>
        {/* ── 地点异动通知（mock示范） ── */}
        <LocationChangeAlert />

        <h2 style={{ fontSize:17, fontWeight:700, marginBottom:14 }}>课程清单</h2>
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', padding:'10px 16px', background:'var(--bg)', fontSize:12, fontWeight:700, color:'var(--text-muted)', borderBottom:'1px solid var(--line)' }}>
            <span>课程</span><span>机构</span><span>时间</span><span>状态</span><span></span>
          </div>
          {childEnrollments.length === 0 && (
            <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
              还没有报名课程 · <Link to="/" style={{ color:'var(--amber)' }}>去搜寻课程</Link>
            </div>
          )}
          {childEnrollments.map(e => {
            const offering = mockClassOfferings.find(o => o.id === e.offeringId);
            const slot = offering?.slots?.find(s => s.id === e.slotId) || offering?.slots?.[0];
            const instructor = instructors.find(i => offering?.studioId?.startsWith(i.id));
            return (
              <div key={e.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto', padding:'12px 16px', borderBottom:'1px solid var(--line)', alignItems:'center', fontSize:13 }}>
                <span style={{ fontWeight:600 }}>{offering?.name || e.offeringId}</span>
                <span style={{ color:'var(--text-muted)' }}>{instructor?.name || '—'}</span>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>
                  <div>{slot?.day} {slot?.time}</div>
                  {(offering?.locationFixed || offering?.locationDefault) && (
                    <div style={{ fontSize:12, color:'#4A6FA5', marginTop:2 }}>
                      📍 {offering.locationFixed || offering.locationDefault}
                    </div>
                  )}
                </div>
                <span>
                  {e.leaveStatus === 'no_makeup' ? (
                    <span style={{ fontSize:11, background:'var(--warn-bg)', color:'var(--warn)', padding:'2px 8px', borderRadius:999 }}>已请假</span>
                  ) : e.leaveStatus === 'makeup_scheduled' ? (
                    <span style={{ fontSize:11, background:'#EEF2F7', color:'#4A6FA5', padding:'2px 8px', borderRadius:999 }}>🔄 补课中</span>
                  ) : e.paymentStatus === 'pending' ? (
                    <span style={{ fontSize:11, background:'var(--warn-bg)', color:'var(--warn)', padding:'2px 8px', borderRadius:999 }}>待确认付款</span>
                  ) : (
                    <span style={{ fontSize:11, background:'var(--success-bg)', color:'var(--success)', padding:'2px 8px', borderRadius:999 }}>已确认</span>
                  )}
                </span>
                <button className="secondary" onClick={() => setLeavePanelEnrollId(e.id)} style={{ fontSize:12, padding:'4px 12px', whiteSpace:'nowrap' }}>
                  请假/管理
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 课堂笔记 ── */}
      <div style={{ marginTop:32 }}>
        <h2 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>📝 课堂笔记</h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
          老师上完课后留下的内容摘要与练习提示
        </p>
        {MOCK_LESSON_NOTES.length === 0 ? (
          <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:14, background:'var(--card)', border:'1px solid var(--line)', borderRadius:12 }}>
            还没有课堂笔记
          </div>
        ) : MOCK_LESSON_NOTES.map((note, i) => {
          const offering = mockClassOfferings.find(o =>
            mockEnrollments.find(e => e.id === note.enrollmentId)?.offeringId === o.id
          );
          return (
            <div key={i} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, marginBottom:12, overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', background:'var(--bg)', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>{note.date}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{offering?.name}</span>
                </div>
                <span style={{ fontSize:12, color:'var(--text-muted)' }}>老师：{note.teacherName}</span>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:13, lineHeight:1.8, color:'var(--ink)' }}>{note.parentNote}</div>
              </div>
            </div>
          );
        })}
        <div style={{ fontSize:11, color:'var(--text-muted)', padding:'6px 10px', background:'var(--bg)', borderRadius:6, marginTop:4 }}>
          📧 实际产品会在老师储存笔记后自动Email通知您
        </div>
      </div>

      {/* ── 我的帐单 ── */}
      <div style={{ marginTop:32, marginBottom:32 }}>
        <h2 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>💰 我的帐单</h2>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
          各课程的缴费记录与明细
        </p>

        {/* 摘要 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'待缴金额', value:`$${MOCK_INVOICES.filter(i=>i.status==='pending').reduce((s,i)=>s+i.amount,0)}`, color:'var(--error)' },
            { label:'本月已缴', value:`$${MOCK_INVOICES.filter(i=>i.status==='paid' && i.month.includes('5月')).reduce((s,i)=>s+i.amount,0)}`, color:'var(--success)' },
            { label:'历史总缴', value:`$${MOCK_INVOICES.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0)}`, color:'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 帐单列表 */}
        {MOCK_INVOICES.map(inv => (
          <InvoiceCard key={inv.id} inv={inv} />
        ))}
      </div>

      {/* 请假面板 */}
      {leavePanelEnroll && leavePanelOffering && (
        <LeavePanel
          enrollment={leavePanelEnroll}
          offering={leavePanelOffering}
          onClose={() => setLeavePanelEnrollId(null)}
        />
      )}
    </div>
  );
}
