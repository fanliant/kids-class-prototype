import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockClassOfferings, mockEnrollments, studioTeachers, mockPricingPlans, mockLevels, mockCurricula } from '../mockData';

const DAYS = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
const TODAY = new Date();
const WEEK_DATES = DAYS.map((_, i) => {
  const d = new Date(TODAY);
  const day = TODAY.getDay() || 7;
  d.setDate(TODAY.getDate() - day + 1 + i);
  return d;
});

function fmt(d) { return `${d.getMonth()+1}/${d.getDate()}`; }
function ymd(d) { return d.toISOString().slice(0,10); }

export default function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.role === 'owner';
  const studioId = user?.instructorId || 'mira-piano';

  const allOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  // 老师只看自己的班
  const myEmail = user?.email;
  const me = studioTeachers.find(t => t.email === myEmail && t.studioId === studioId);
  const myOfferings = isOwner
    ? allOfferings
    : allOfferings.filter(o => o.primaryTeacherId === me?.id);

  const [selectedDate, setSelectedDate] = useState(ymd(TODAY));

  // 当天的课
  function getClassesForDay(dayStr) {
    return myOfferings.filter(o => o.slots?.some(s => s.day === dayStr));
  }

  // 周视图
  const weekClasses = DAYS.map((day, i) => ({
    day, date: WEEK_DATES[i], dateStr: ymd(WEEK_DATES[i]),
    offerings: getClassesForDay(day),
  }));

  return (
    <div className="page">
      <div style={{ paddingTop:12, marginBottom:20 }}>
        <h1 style={{ fontSize:26, marginBottom:4 }}>课表</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>
          {isOwner ? '工作室全部班级本周排课' : `${me?.name || ''} 本周课程`}
        </p>
      </div>

      {/* 本周总览 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden', marginBottom:24 }}>
        <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:700, fontSize:14 }}>本周课程</span>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{fmt(WEEK_DATES[0])} — {fmt(WEEK_DATES[6])}</span>
        </div>

        {/* 周格 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--line)' }}>
          {weekClasses.map(({ day, date, dateStr, offerings }) => {
            const isToday = dateStr === ymd(TODAY);
            const isSelected = dateStr === selectedDate;
            return (
              <div key={day}
                onClick={() => setSelectedDate(dateStr)}
                style={{ padding:'10px 8px', textAlign:'center', borderRight:'1px solid var(--line)', cursor:'pointer', background: isSelected ? 'var(--warn-bg)' : isToday ? 'var(--success-bg)' : 'var(--card)', transition:'background 0.1s' }}>
                <div style={{ fontSize:11, color: isToday ? 'var(--success)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 400 }}>{day.replace('星期','')}</div>
                <div style={{ fontSize:15, fontWeight:700, color: isSelected ? 'var(--amber)' : isToday ? 'var(--success)' : 'var(--ink)', margin:'4px 0' }}>{fmt(date)}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {offerings.slice(0,3).map(o => {
                    const cur = mockCurricula.find(c => c.id === o.curriculumId);
                    return (
                      <div key={o.id} style={{ fontSize:9, padding:'1px 3px', borderRadius:3, background: cur?.color || '#888', color:'#fff', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {o.slots?.find(s => s.day === day)?.time?.split('–')[0] || ''} {mockLevels.find(l => l.id === o.levelId)?.shortName || '私教'}
                      </div>
                    );
                  })}
                  {offerings.length > 3 && <div style={{ fontSize:9, color:'var(--text-muted)' }}>+{offerings.length-3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 选中日期的课程详情 */}
      {(() => {
        const sel = weekClasses.find(w => w.dateStr === selectedDate);
        if (!sel) return null;
        return (
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>
              {sel.day} {fmt(sel.date)} 的课程
              {sel.offerings.length === 0 && <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:400, marginLeft:8 }}>没有排课</span>}
            </h3>
            {sel.offerings.map(o => {
              const enrolled = mockEnrollments.filter(e => e.offeringId === o.id && e.status === 'confirmed');
              const teacher = studioTeachers.find(t => t.id === o.primaryTeacherId);
              const slot = o.slots?.find(s => s.day === sel.day);
              const cur = mockCurricula.find(c => c.id === o.curriculumId);
              const level = mockLevels.find(l => l.id === o.levelId);
              const pp = mockPricingPlans.find(p => p.id === o.pricingPlanId);
              return (
                <div key={o.id} style={{ background:'var(--card)', border:`1.5px solid ${cur?.color || 'var(--line)'}`, borderRadius:12, marginBottom:12, overflow:'hidden' }}>
                  {/* 班级标题 */}
                  <div style={{ padding:'12px 18px', background: cur?.color ? cur.color + '15' : 'var(--bg)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {level && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background: cur?.color || '#888', color:'#fff', fontWeight:700 }}>{level.shortName}</span>}
                      <span style={{ fontWeight:700, fontSize:15 }}>{o.name}</span>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:13, color:'var(--text-muted)' }}>
                      <span>⏱ {slot?.time}</span>
                      <span>{o.durationMin}分钟</span>
                      {isOwner && pp && <span style={{ fontWeight:600 }}>${pp.amount}/{pp.unit}</span>}
                    </div>
                  </div>
                  {/* 学生名单 + 点名按钮 */}
                  <div style={{ padding:'12px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div style={{ fontSize:13, color:'var(--text-muted)' }}>
                        老师：<strong>{teacher?.name}</strong> · 学生 {enrolled.length}/{o.capacity} 人
                      </div>
                      <button
                        onClick={() => navigate(`/attendance/${o.id}/${selectedDate}`)}
                        style={{ fontSize:12, padding:'5px 14px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                        ✏️ 开始点名
                      </button>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {enrolled.map(e => (
                        <span key={e.id} style={{ fontSize:12, padding:'3px 10px', borderRadius:999, background:'var(--success-bg)', color:'var(--success)', fontWeight:600 }}>
                          {e.childName}
                        </span>
                      ))}
                      {enrolled.length === 0 && <span style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>还没有学生报名</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
