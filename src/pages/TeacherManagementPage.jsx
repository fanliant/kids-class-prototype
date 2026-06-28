import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studioTeachers, mockAttendanceRecords, mockClassOfferings, mockPricingPlans, mockEnrollments } from '../mockData';

const MONTHS = [
  { value: '2026-06', label: '2026年6月' },
  { value: '2026-05', label: '2026年5月' },
  { value: '2026-04', label: '2026年4月' },
];

const EMP_LABEL = { owner:'创办人', full_time:'全职', part_time:'兼职', contract:'约课' };
const EMP_COLOR = { owner:'var(--amber)', full_time:'var(--success)', part_time:'#4A6FA5', contract:'var(--text-muted)' };

export default function TeacherManagementPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [teachers, setTeachers] = useState(
    studioTeachers.filter(t => t.studioId === user?.instructorId)
      .map(t => ({ ...t, active: t.active !== false }))
  );
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name:'', email:'', phone:'', title:'', employmentType:'part_time',
    rate:'', rateUnit:'堂', specialties:'', certifications:'', notes:'',
    maxWeeklyHours:'', joinDate: new Date().toISOString().slice(0,10),
  });
  const [confirmedPay, setConfirmedPay] = useState({});
  const [editingField, setEditingField] = useState({});

  const activeTeachers = teachers.filter(t => t.active);
  const allRecords = mockAttendanceRecords;
  const monthRecords = allRecords.filter(r => r.date && r.date.startsWith(selectedMonth));

  const payrollData = activeTeachers.map(teacher => {
    const taught  = monthRecords.filter(r => r.teacherId === teacher.id);
    const regular = taught.filter(r => !r.substitute);
    const subIn   = taught.filter(r => r.substitute);
    const subOut  = monthRecords.filter(r => r.substituteFor === teacher.id);
    const totalPay = taught.reduce((s, r) => {
      const offering = mockClassOfferings.find(o => o.id === r.offeringId);
      const rule = offering?.compensationRule;
      if (rule?.type === 'per_session') return s + (rule.amount || offering?.teacherRate || teacher.rate || 0);
      if (rule?.type === 'revenue_share' || rule?.type === 'hybrid') {
        return s + (offering?.teacherRate || teacher.rate || 0); // simplified
      }
      return s + (offering?.teacherRate || teacher.rate || 0);
    }, 0);
    const isPaid = !!confirmedPay[teacher.id + '-' + selectedMonth];
    return { teacher, taught, regular, subIn, subOut, totalPay, isPaid };
  });
  const totalPayout = payrollData.reduce((s, d) => s + d.totalPay, 0);

  function addTeacher() {
    if (!newTeacher.name || !newTeacher.email) return;
    setTeachers(prev => [...prev, {
      id: `teacher-${Date.now()}`,
      studioId: user?.instructorId,
      ...newTeacher,
      rate: Number(newTeacher.rate) || 0,
      maxWeeklyHours: newTeacher.maxWeeklyHours ? Number(newTeacher.maxWeeklyHours) : null,
      specialties: newTeacher.specialties ? newTeacher.specialties.split('、').map(s => s.trim()) : [],
      certifications: newTeacher.certifications ? newTeacher.certifications.split('、').map(s => s.trim()) : [],
      joinYear: new Date(newTeacher.joinDate).getFullYear(),
      active: true,
    }]);
    setNewTeacher({ name:'', email:'', phone:'', title:'', employmentType:'part_time', rate:'', rateUnit:'堂', specialties:'', certifications:'', notes:'', maxWeeklyHours:'', joinDate: new Date().toISOString().slice(0,10) });
    setShowAddForm(false);
  }

  // 统一tab样式
  function TabBar({ tabs, current, onChange }) {
    return (
      <div style={{ display:'flex', gap:0, marginBottom:28, borderBottom:'2px solid var(--line)' }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => onChange(key)} style={{
            padding:'10px 24px', fontSize:14, border:'none', background:'none', cursor:'pointer',
            borderBottom: current === key ? '2px solid var(--amber)' : '2px solid transparent',
            marginBottom:-2,
            fontWeight: current === key ? 700 : 400,
            color: current === key ? 'var(--ink)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ paddingTop:12, marginBottom:20 }}>
        <h1 style={{ fontSize:26, marginBottom:4 }}>老师管理</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13.5 }}>工作室老师档案与薪资管理</p>
      </div>

      <TabBar
        tabs={[{ key:'overview', label:'老师总览' }, { key:'stats', label:'📊 绩效统计' }]}
        current={tab} onChange={setTab}
      />

      {/* ── 老师总览 ── */}
      {tab === 'overview' && (
        <div>
          {/* 统计 */}
          <div className="dash-grid" style={{ marginBottom:24 }}>
            <div className="dash-stat"><div className="num">{activeTeachers.length}</div><div className="label">在职老师</div></div>
            <div className="dash-stat"><div className="num">{activeTeachers.filter(t => t.employmentType === 'full_time' || t.employmentType === 'owner').length}</div><div className="label">全职/创办人</div></div>
            <div className="dash-stat"><div className="num">{activeTeachers.filter(t => t.employmentType === 'part_time' || t.employmentType === 'contract').length}</div><div className="label">兼职/约课</div></div>
            <div className="dash-stat"><div className="num">{teachers.filter(t => !t.active).length}</div><div className="label">已离职</div></div>
          </div>

          {/* 新增老师 */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>在职老师（{activeTeachers.length}）</h2>
            {isOwner && <button onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize:13 }}>{showAddForm ? '取消' : '+ 新增老师'}</button>}
          </div>

          {showAddForm && (
            <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>新增老师</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                {[
                  { label:'姓名 *', key:'name', placeholder:'例：Amy Zhang' },
                  { label:'Email *', key:'email', placeholder:'amy@example.com' },
                  { label:'电话', key:'phone', placeholder:'425-555-xxxx' },
                  { label:'职称', key:'title', placeholder:'例：钢琴教师' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>{f.label}</div>
                    <input placeholder={f.placeholder} value={newTeacher[f.key]} onChange={e => setNewTeacher(p => ({...p, [f.key]: e.target.value}))}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>聘用类型</div>
                  <select value={newTeacher.employmentType} onChange={e => setNewTeacher(p => ({...p, employmentType: e.target.value}))}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14 }}>
                    <option value="full_time">全职</option>
                    <option value="part_time">兼职</option>
                    <option value="contract">约课</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>入职日期</div>
                  <input type="date" value={newTeacher.joinDate} onChange={e => setNewTeacher(p => ({...p, joinDate: e.target.value}))}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>每周最多堂数</div>
                  <input type="number" placeholder="空白=无上限" value={newTeacher.maxWeeklyHours} onChange={e => setNewTeacher(p => ({...p, maxWeeklyHours: e.target.value}))}
                    style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                </div>
              </div>
              {isOwner && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>🔒 默认rate（$）</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <input type="number" placeholder="例：30" value={newTeacher.rate} onChange={e => setNewTeacher(p => ({...p, rate: e.target.value}))}
                        style={{ flex:1, padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                      <select value={newTeacher.rateUnit} onChange={e => setNewTeacher(p => ({...p, rateUnit: e.target.value}))}
                        style={{ padding:'8px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13 }}>
                        <option value="堂">/堂</option>
                        <option value="小时">/小时</option>
                        <option value="月">/月</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>证照/认证（以、分隔）</div>
                    <input placeholder="例：RCM Associate、Yamaha JMC" value={newTeacher.certifications} onChange={e => setNewTeacher(p => ({...p, certifications: e.target.value}))}
                      style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
                  </div>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>专长（以、分隔）</div>
                <input placeholder="例：幼儿钢琴启蒙、基础乐理" value={newTeacher.specialties} onChange={e => setNewTeacher(p => ({...p, specialties: e.target.value}))}
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>内部备注</div>
                <textarea placeholder="例：每周三不可排课..." value={newTeacher.notes} onChange={e => setNewTeacher(p => ({...p, notes: e.target.value}))} rows={2}
                  style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid var(--line)', fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="secondary" onClick={() => setShowAddForm(false)}>取消</button>
                <button onClick={addTeacher} disabled={!newTeacher.name || !newTeacher.email}>新增老师</button>
              </div>
            </div>
          )}

          {/* 老师卡片 */}
          {activeTeachers.map(teacher => {
            const isExp = expandedTeacher === teacher.id;
            const stats = (() => {
              const taught = allRecords.filter(r => r.teacherId === teacher.id);
              return { taught: taught.length, subIn: taught.filter(r => r.substitute).length };
            })();
            const yearsIn = new Date().getFullYear() - (teacher.joinYear || 2022);
            return (
              <div key={teacher.id} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, marginBottom:14, overflow:'hidden' }}>
                {/* 标题行 */}
                <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
                  onClick={() => setExpandedTeacher(isExp ? null : teacher.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:50, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18, flexShrink:0 }}>
                      {teacher.name[0]}
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:700, fontSize:15 }}>{teacher.name}</span>
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background: EMP_COLOR[teacher.employmentType] + '20', color: EMP_COLOR[teacher.employmentType], fontWeight:700 }}>
                          {EMP_LABEL[teacher.employmentType] || teacher.employmentType}
                        </span>
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                        {teacher.title} · 入职{yearsIn > 0 ? yearsIn + '年' : '不足1年'} · {teacher.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:16, alignItems:'center', fontSize:12, color:'var(--text-muted)' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>{stats.taught}</div>
                      <div>累计堂数</div>
                    </div>
                    {isOwner && <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>${teacher.rate}/{teacher.rateUnit}</div>
                      <div>默认rate</div>
                    </div>}
                    {teacher.maxWeeklyHours && <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--ink)' }}>{teacher.maxWeeklyHours}</div>
                      <div>每周上限</div>
                    </div>}
                    <span style={{ color:'var(--text-muted)', fontSize:14 }}>{isExp ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 展开：完整档案 */}
                {isExp && (
                  <div style={{ borderTop:'1px solid var(--line)', padding:'16px 20px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                      {/* 左栏 */}
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10 }}>联络资讯</div>
                        {[
                          { label:'Email', value: teacher.email },
                          { label:'电话', value: teacher.phone || '—' },
                          { label:'入职日期', value: teacher.joinDate || teacher.joinYear + '年' },
                          { label:'聘用类型', value: EMP_LABEL[teacher.employmentType] || '—' },
                          { label:'每周上限', value: teacher.maxWeeklyHours ? teacher.maxWeeklyHours + '堂' : '无上限' },
                        ].map(f => (
                          <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
                            <span style={{ color:'var(--text-muted)' }}>{f.label}</span>
                            <span style={{ fontWeight:500 }}>{f.value}</span>
                          </div>
                        ))}
                        {isOwner && teacher.emergencyContact && (
                          <div style={{ marginTop:10, padding:'8px 12px', background:'var(--bg)', borderRadius:8, fontSize:12, color:'var(--text-muted)' }}>
                            🚨 紧急联络：{teacher.emergencyContact.name}（{teacher.emergencyContact.relation}）{teacher.emergencyContact.phone}
                          </div>
                        )}
                      </div>
                      {/* 右栏 */}
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10 }}>专业资讯</div>
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>个人简介</div>
                          <div style={{ fontSize:13 }}>{teacher.bio || '—'}</div>
                        </div>
                        {teacher.specialties?.length > 0 && (
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>专长</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                              {teacher.specialties.map(s => <span key={s} style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'var(--success-bg)', color:'var(--success)', fontWeight:600 }}>{s}</span>)}
                            </div>
                          </div>
                        )}
                        {teacher.certifications?.length > 0 && (
                          <div style={{ marginBottom:10 }}>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>证照/认证</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                              {teacher.certifications.map(c => <span key={c} style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'#EEF2F7', color:'#4A6FA5', fontWeight:600 }}>{c}</span>)}
                            </div>
                          </div>
                        )}
                        {isOwner && teacher.notes && (
                          <div style={{ padding:'8px 12px', background:'var(--warn-bg)', borderRadius:8, fontSize:12, color:'var(--ink)' }}>
                            📝 {teacher.notes}
                          </div>
                        )}
                        {isOwner && (
                          <div style={{ marginTop:10, padding:'8px 12px', background:'var(--bg)', borderRadius:8, fontSize:12 }}>
                            🔒 默认rate：<strong>${teacher.rate}/{teacher.rateUnit}</strong>（可被各班级覆盖）
                          </div>
                        )}
                      </div>
                    </div>
                    {isOwner && (
                      <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'flex-end' }}>
                        <button className="secondary" style={{ fontSize:12 }} onClick={() => setTeachers(prev => prev.map(t => t.id === teacher.id ? {...t, active: false} : t))}>标记离职</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* ── 绩效统计 ── */}
      {tab === 'stats' && (
        <TeacherStatsTab teachers={teachers} studioId={user?.instructorId || 'mira-piano'} isOwner={isOwner} />
      )}

    </div>
  );
}

// ── 老师绩效统计 Tab ──────────────────────────────────────────────────────────
const MOCK_STATS = {
  'teacher-mira': {
    plannedSessions: 28, actualSessions: 28, cancelledSessions: 0,
    substituteGiven: 0, substituteReceived: 1,
    avgStudentAttendance: 94,
    studentCount: 18, returnStudents: 16, returnRate: 89,
    totalRevenue: 5040, salary: 980, revenuePerSession: 180,
    monthlyTrend: [22, 24, 24, 26, 28, 28],
  },
  'teacher-sarah': {
    plannedSessions: 16, actualSessions: 15, cancelledSessions: 1,
    substituteGiven: 0, substituteReceived: 0,
    avgStudentAttendance: 88,
    studentCount: 12, returnStudents: 10, returnRate: 83,
    totalRevenue: 2640, salary: 560, revenuePerSession: 165,
    monthlyTrend: [12, 14, 14, 16, 16, 15],
  },
  'teacher-grace': {
    plannedSessions: 8, actualSessions: 8, cancelledSessions: 0,
    substituteGiven: 1, substituteReceived: 0,
    avgStudentAttendance: 91,
    studentCount: 6, returnStudents: 6, returnRate: 100,
    totalRevenue: 960, salary: 240, revenuePerSession: 120,
    monthlyTrend: [0, 0, 6, 8, 8, 8],
  },
};

// 迷你趋势 sparkline
function Sparkline({ data, color }) {
  const W = 80, H = 28;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length-1)) * W;
    const y = H - (v / max * H * 0.85) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={W} height={H} style={{ display:'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      {data.map((v,i) => {
        const x = (i / (data.length-1)) * W;
        const y = H - (v / max * H * 0.85) - 2;
        return i === data.length-1 ? <circle key={i} cx={x} cy={y} r={3} fill={color} /> : null;
      })}
    </svg>
  );
}

function TeacherStatsTab({ teachers, studioId, isOwner }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const MONTHS_LABEL = ['1月','2月','3月','4月','5月','6月'];

  // 比较视图
  if (!selectedTeacher) return (
    <div>
      <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
        点击老师名字查看详细绩效 · 数据周期：本学期（2026年1-6月）
      </div>

      {/* 比较表 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden', marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'140px repeat(5, 1fr)', padding:'10px 16px', background:'var(--bg)', borderBottom:'1px solid var(--line)', fontSize:11.5, fontWeight:700, color:'var(--text-muted)', gap:8 }}>
          <span>老师</span>
          <span style={{ textAlign:'center' }}>上课堂数</span>
          <span style={{ textAlign:'center' }}>学生出席率</span>
          <span style={{ textAlign:'center' }}>负责学生</span>
          <span style={{ textAlign:'center' }}>续课率</span>
          <span style={{ textAlign:'center' }}>趋势（6个月）</span>
        </div>
        {teachers.filter(t => t.active !== false).map(t => {
          const s = MOCK_STATS[t.id] || MOCK_STATS['teacher-sarah'];
          const cancelPct = Math.round(s.cancelledSessions / s.plannedSessions * 100);
          return (
            <div key={t.id} onClick={() => setSelectedTeacher(t)}
              style={{ display:'grid', gridTemplateColumns:'140px repeat(5, 1fr)', padding:'12px 16px', borderBottom:'1px solid var(--line)', gap:8, cursor:'pointer', alignItems:'center' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.title}</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{s.actualSessions}<span style={{ fontSize:11, color:'var(--text-muted)' }}>/{s.plannedSessions}</span></div>
                {s.cancelledSessions > 0 && <div style={{ fontSize:10, color:'var(--error)' }}>取消{s.cancelledSessions}堂</div>}
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:15, color: s.avgStudentAttendance>=90?'var(--success)':s.avgStudentAttendance>=80?'var(--warn)':'var(--error)' }}>
                  {s.avgStudentAttendance}%
                </div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{s.studentCount}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)' }}>人</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:15, color: s.returnRate>=85?'var(--success)':s.returnRate>=70?'var(--warn)':'var(--error)' }}>
                  {s.returnRate}%
                </div>
                <div style={{ fontSize:10, color:'var(--text-muted)' }}>{s.returnStudents}/{s.studentCount}人续读</div>
              </div>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <Sparkline data={s.monthlyTrend} color={s.avgStudentAttendance>=90?'#22C55E':'#E0922F'} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 工作室整体 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'总上课堂数', value: teachers.reduce((s,t)=>(MOCK_STATS[t.id]?.actualSessions||0)+s, 0)+'堂', color:'var(--ink)' },
          { label:'平均出席率', value: Math.round(teachers.reduce((s,t)=>(MOCK_STATS[t.id]?.avgStudentAttendance||0)+s,0)/teachers.length)+'%', color:'var(--success)' },
          { label:'整体续课率', value: Math.round(Object.values(MOCK_STATS).reduce((s,v)=>s+v.returnRate,0)/Object.keys(MOCK_STATS).length)+'%', color:'var(--success)' },
          { label:'老师取消课', value: Object.values(MOCK_STATS).reduce((s,v)=>s+v.cancelledSessions,0)+'堂', color:'var(--warn)' },
        ].map(s => (
          <div key={s.label} className="dash-stat">
            <div className="label">{s.label}</div>
            <div className="num" style={{ color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // 单一老师详细视图
  const s = MOCK_STATS[selectedTeacher.id] || MOCK_STATS['teacher-sarah'];
  const completionRate = Math.round(s.actualSessions / s.plannedSessions * 100);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <button className="secondary" onClick={() => setSelectedTeacher(null)} style={{ fontSize:12, padding:'5px 12px' }}>← 全部老师</button>
        <div style={{ fontWeight:700, fontSize:17 }}>{selectedTeacher.name}</div>
        <div style={{ fontSize:13, color:'var(--text-muted)' }}>{selectedTeacher.title}</div>
      </div>

      {/* 本学期4格 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        <div className="dash-stat" style={{ border:`1.5px solid ${completionRate===100?'var(--success)':'var(--warn)'}` }}>
          <div className="label">完课率</div>
          <div className="num" style={{ color:completionRate===100?'var(--success)':'var(--warn)' }}>{completionRate}%</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{s.actualSessions}/{s.plannedSessions}堂</div>
        </div>
        <div className="dash-stat">
          <div className="label">学生出席率</div>
          <div className="num" style={{ color:s.avgStudentAttendance>=90?'var(--success)':s.avgStudentAttendance>=80?'var(--warn)':'var(--error)' }}>{s.avgStudentAttendance}%</div>
        </div>
        <div className="dash-stat">
          <div className="label">续课率</div>
          <div className="num" style={{ color:s.returnRate>=85?'var(--success)':'var(--warn)' }}>{s.returnRate}%</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{s.returnStudents}/{s.studentCount}人续读</div>
        </div>
        {isOwner && (
          <div className="dash-stat">
            <div className="label">收入贡献</div>
            <div className="num">${s.totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>薪资 ${s.salary} · 利润 ${s.totalRevenue-s.salary}</div>
          </div>
        )}
      </div>

      {/* 月度趋势图 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'16px 18px', marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>本学期上课堂数趋势</div>
        <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:80 }}>
          {s.monthlyTrend.map((v, i) => {
            const maxV = Math.max(...s.monthlyTrend, 1);
            const h = Math.round((v / maxV) * 64);
            return (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600 }}>{v}</div>
                <div style={{ width:'100%', height:`${h}px`, background:i===s.monthlyTrend.length-1?'var(--amber)':'#CBD5E1', borderRadius:'4px 4px 0 0', minHeight: v>0?8:0, transition:'height 0.3s' }} />
                <div style={{ fontSize:10, color:'var(--text-muted)' }}>{MONTHS_LABEL[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 出席/代课记录 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>🗓 课堂记录</div>
          {[
            { label:'计划上课', value:`${s.plannedSessions} 堂`, color:'var(--ink)' },
            { label:'实际完成', value:`${s.actualSessions} 堂`, color:'var(--success)' },
            { label:'取消课程', value:`${s.cancelledSessions} 堂`, color: s.cancelledSessions>0?'var(--error)':'var(--text-muted)' },
            { label:'代课他人', value:`${s.substituteGiven} 次`, color:'#4A6FA5' },
            { label:'被他人代课', value:`${s.substituteReceived} 次`, color:'#4A6FA5' },
          ].map(item => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
              <span style={{ color:'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontWeight:700, color:item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>👩‍🎓 学生状况</div>
          {[
            { label:'负责学生数', value:`${s.studentCount} 人`, color:'var(--ink)' },
            { label:'续读学生', value:`${s.returnStudents} 人`, color:'var(--success)' },
            { label:'续课率', value:`${s.returnRate}%`, color:s.returnRate>=85?'var(--success)':'var(--warn)' },
            { label:'平均出席率', value:`${s.avgStudentAttendance}%`, color:s.avgStudentAttendance>=90?'var(--success)':'var(--warn)' },
            ...(isOwner ? [{ label:'每堂课平均贡献', value:`$${s.revenuePerSession}`, color:'var(--amber)' }] : []),
          ].map(item => (
            <div key={item.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
              <span style={{ color:'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontWeight:700, color:item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 取消课记录 */}
      {s.cancelledSessions > 0 && (
        <div style={{ background:'#FEF2F2', border:'1px solid var(--error)', borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'var(--error)', marginBottom:10 }}>⚠️ 取消课记录</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid #FCA5A5' }}>
            <span>2026-06-15 JMC1 秋季班 A · 下午4:00</span>
            <span style={{ color:'var(--error)' }}>临时请假（通知代课）</span>
          </div>
        </div>
      )}

      <div style={{ padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:8, fontSize:11.5, color:'var(--text-muted)' }}>
        ⚠️ Prototype 示范数据。实际产品从点名记录、请假记录自动汇算。
      </div>
    </div>
  );
}

