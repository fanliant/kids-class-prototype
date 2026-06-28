import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { studioTeachers, mockAttendanceRecords, mockClassOfferings, mockEnrollments, mockPricingPlans, mockLevels, mockCurricula, mockLeaveRequests } from '../mockData';

const MONTHS = [
  { value: '2026-06', label: '2026年6月' },
  { value: '2026-05', label: '2026年5月' },
  { value: '2026-04', label: '2026年4月' },
];

// 根据compensationRule计算这堂课老师应得多少
function calcSessionPay(offering, attendanceRecord, enrollments) {
  const rule = offering?.compensationRule;
  if (!rule) return offering?.teacherRate || 0;

  if (rule.type === 'per_session') {
    return rule.amount || offering?.teacherRate || 0;
  }

  if (rule.type === 'revenue_share') {
    // 该班级已确认的enrollment × 月费 × share%
    const confirmed = enrollments.filter(e => e.offeringId === offering.id && e.status === 'confirmed');
    const pricePlan = mockPricingPlans.find(p => p.id === offering.pricingPlanId);
    const monthlyRevenue = confirmed.length * (pricePlan?.amount || 0);
    // 按session平摊：月收入 / 总sessions × share%
    const totalSessions = offering.totalSessions || 16;
    return Math.round((monthlyRevenue / totalSessions) * (rule.sharePercent / 100));
  }

  return offering?.teacherRate || 0;
}

export default function PayrollPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [confirmedPay, setConfirmedPay] = useState({});

  const studioId = user?.instructorId || 'mira-piano';
  const isOwner  = user?.role === 'owner';
  const allTeachers = studioTeachers.filter(t => t.studioId === studioId);
  const teachers = isOwner
    ? allTeachers
    : allTeachers.filter(t => t.email === user?.email);

  const monthRecords  = mockAttendanceRecords.filter(r => r.date && r.date.startsWith(selectedMonth));
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);

  function buildPayroll(teacher) {
    const records = monthRecords.filter(r => r.teacherId === teacher.id);
    const subIn   = records.filter(r => r.substitute === true);
    const subOut  = monthRecords.filter(r => r.substituteFor === teacher.id);

    // 按班级分组
    const grouped = {};
    records.forEach(r => {
      if (!grouped[r.offeringId]) grouped[r.offeringId] = [];
      grouped[r.offeringId].push(r);
    });

    const details = Object.keys(grouped).map(offeringId => {
      const recs       = grouped[offeringId] || [];
      const offering   = mockClassOfferings.find(o => o.id === offeringId) || null;
      const level      = offering?.levelId ? mockLevels.find(l => l.id === offering.levelId) : null;
      const curriculum = offering?.curriculumId ? mockCurricula.find(c => c.id === offering.curriculumId) : null;
      const isSub      = recs.length > 0 && recs[0].substitute === true;
      const sessions   = recs.length;
      const rule       = offering?.compensationRule;
      const ruleType   = rule?.type || 'per_session';

      // 计算每堂薪资
      const perSessionPay = calcSessionPay(offering, recs[0], myEnrollments);
      const subtotal = sessions * perSessionPay;

      // revenue_share / hybrid 额外信息
      let shareInfo = null;
      if (ruleType === 'revenue_share' || ruleType === 'hybrid') {
        const confirmed = myEnrollments.filter(e => e.offeringId === offeringId && e.status === 'confirmed');
        const pricePlan = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
        const monthlyRevenue = confirmed.length * (pricePlan?.amount || 0);
        const sp = rule?.sharePercent || 0;
        const fixedTotal = ruleType === 'hybrid' ? (rule?.fixedAmount || 0) * sessions : 0;
        const shareTotal = Math.round(monthlyRevenue * sp / 100);
        shareInfo = {
          students: confirmed.length,
          monthlyRevenue,
          sharePercent: sp,
          teacherGets: ruleType === 'hybrid' ? fixedTotal + shareTotal : Math.round(monthlyRevenue * sp / 100),
          studioGets:  monthlyRevenue - (ruleType === 'hybrid' ? fixedTotal + shareTotal : Math.round(monthlyRevenue * sp / 100)),
        };
      }

      return {
        offeringId, offering, level, curriculum, recs, isSub,
        sessions, perSessionPay, subtotal, ruleType, shareInfo,
        name: offering?.name || offeringId,
      };
    });

    const totalPay = details.reduce((s, d) => s + d.subtotal, 0);
    const isPaid   = !!confirmedPay[teacher.id + '-' + selectedMonth];
    return { teacher, details, totalSessions: records.length, totalPay, isPaid, subIn, subOut };
  }

  const payrollData  = teachers.map(buildPayroll);
  const totalPayout  = payrollData.reduce((s, d) => s + d.totalPay, 0);
  const paidCount    = payrollData.filter(d => d.isPaid).length;

  // Owner专用：利润摘要
  const totalRevenue = isOwner ? (() => {
    const confirmed = myEnrollments.filter(e => e.status === 'confirmed');
    return confirmed.reduce((s, e) => {
      const offering = mockClassOfferings.find(o => o.id === e.offeringId);
      const pp = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
      return s + (pp?.amount || 0);
    }, 0);
  })() : 0;
  const studioProfit = totalRevenue - totalPayout;
  const margin = totalRevenue > 0 ? Math.round(studioProfit / totalRevenue * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">薪资管理</h1>
      </div>

      {/* 月份 */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {MONTHS.map(m => (
          <button key={m.value} onClick={() => setSelectedMonth(m.value)}
            className={selectedMonth === m.value ? '' : 'secondary'} style={{ fontSize:13 }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Owner利润摘要 */}
      {isOwner && (
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'18px 24px', marginBottom:24 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--text-muted)' }}>
            {MONTHS.find(m => m.value === selectedMonth)?.label} · 财务摘要
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0 }}>
            <div style={{ padding:'0 20px 0 0', borderRight:'1px solid var(--line)' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>学生总收款</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)' }}>${totalRevenue.toLocaleString()}</div>
            </div>
            <div style={{ padding:'0 20px', borderRight:'1px solid var(--line)' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>老师总薪资</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--amber)' }}>−${totalPayout.toLocaleString()}</div>
            </div>
            <div style={{ padding:'0 20px', borderRight:'1px solid var(--line)' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>工作室利润</div>
              <div style={{ fontSize:22, fontWeight:800, color: studioProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                ${studioProfit.toLocaleString()}
              </div>
            </div>
            <div style={{ padding:'0 0 0 20px' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>利润率</div>
              <div style={{ fontSize:22, fontWeight:800, color: margin >= 40 ? 'var(--success)' : margin >= 20 ? 'var(--amber)' : 'var(--error)' }}>
                {margin}%
              </div>
            </div>
          </div>
          {/* 薪资类型分布 */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--line)', display:'flex', gap:16, fontSize:12, color:'var(--text-muted)' }}>
            {(() => {
              const perSession = payrollData.flatMap(d => d.details).filter(d => d.ruleType === 'per_session');
              const revShare   = payrollData.flatMap(d => d.details).filter(d => d.ruleType === 'revenue_share');
              return (
                <>
                  <span>按堂计薪班级：<strong>{perSession.length}班</strong>，合计 ${perSession.reduce((s,d) => s+d.subtotal, 0)}</span>
                  <span>·</span>
                  <span>收入分成班级：<strong>{revShare.length}班</strong>（老师{revShare[0]?.shareInfo?.sharePercent || 65}%），合计 ${revShare.reduce((s,d) => s+d.subtotal, 0)}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 统计 */}
      <div className="dash-grid" style={{ marginBottom:28 }}>
        <div className="dash-stat">
          <div className="label">{isOwner ? '应付总薪资' : '本月薪资'}</div>
          <div className="num" style={{ color:'var(--amber)' }}>${totalPayout}</div>
        </div>
        <div className="dash-stat">
          <div className="label">总上课堂数</div>
          <div className="num">{payrollData.reduce((s,d) => s + d.totalSessions, 0)}</div>
        </div>
        {isOwner && (
          <div className="dash-stat">
            <div className="label">老师人数</div>
            <div className="num">{teachers.length}</div>
          </div>
        )}
        <div className="dash-stat">
          <div className="label">已结算</div>
          <div className="num" style={{ color:'var(--success)' }}>{paidCount}/{teachers.length}</div>
        </div>
      </div>

      <div style={{ background:'var(--bg)', border:'1px solid var(--line)', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:12.5, color:'var(--text-muted)' }}>
        💡 薪资规则：出席 / 缺席未请假 / 请假不补课 → 原班老师正常计薪。请假已安排补课 → 补课费用计入补课老师薪资。
      </div>

      {/* 老师卡片 */}
      {payrollData.map(({ teacher, details, totalSessions, totalPay, isPaid, subIn, subOut }) => {
        const isExpanded = expandedTeacher === teacher.id;
        return (
          <div key={teacher.id} style={{ background:'var(--card)', border:'1px solid ' + (isPaid ? 'var(--success)' : 'var(--line)'), borderRadius:14, marginBottom:16, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
              onClick={() => setExpandedTeacher(isExpanded ? null : teacher.id)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:50, background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>
                  {teacher.name ? teacher.name[0] : '?'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{teacher.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                    {teacher.title} · 共{totalSessions}堂
                    {subIn.length > 0 && <span style={{ marginLeft:6, color:'var(--amber)' }}>（含代课{subIn.length}堂）</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:700, fontSize:20, color: isPaid ? 'var(--success)' : 'var(--ink)' }}>${totalPay}</div>
                  {isPaid && <div style={{ fontSize:11, color:'var(--success)', fontWeight:600 }}>✓ 已结算</div>}
                </div>
                {isOwner && (!isPaid ? (
                  <button style={{ fontSize:12, padding:'6px 14px', background:'var(--success)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}
                    onClick={e => { e.stopPropagation(); setConfirmedPay(p => ({ ...p, [teacher.id + '-' + selectedMonth]: true })); }}>
                    确认发薪
                  </button>
                ) : (
                  <button className="secondary" style={{ fontSize:12, padding:'6px 12px' }}
                    onClick={e => { e.stopPropagation(); setConfirmedPay(p => ({ ...p, [teacher.id + '-' + selectedMonth]: false })); }}>
                    取消
                  </button>
                ))}
                <span style={{ color:'var(--text-muted)', fontSize:14, minWidth:12 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop:'1px solid var(--line)', padding:'16px 20px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:10 }}>课堂明细</div>

                {details.length === 0 && (
                  <div style={{ fontSize:13, color:'var(--text-muted)', fontStyle:'italic', marginBottom:12 }}>本月无上课记录</div>
                )}

                {details.map(d => {
                  const bgColor = d.curriculum?.color || '#888';
                  return (
                    <div key={d.offeringId} style={{ background:'var(--bg)', borderRadius:10, marginBottom:8, overflow:'hidden', border:'1px solid var(--line)' }}>
                      {/* 班级行 */}
                      <div style={{ padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {d.level
                            ? <span style={{ fontSize:11, padding:'1px 7px', borderRadius:999, background:bgColor, color:'#fff', fontWeight:700 }}>{d.level.shortName}</span>
                            : <span style={{ fontSize:11, padding:'1px 7px', borderRadius:999, background:'#4A6FA5', color:'#fff', fontWeight:700 }}>{d.ruleType === 'revenue_share' ? '私教' : '营队'}</span>
                          }
                          {d.isSub && <span style={{ fontSize:10, background:'var(--warn-bg)', color:'var(--warn)', padding:'1px 6px', borderRadius:999 }}>🔄代课</span>}
                          <span style={{ fontSize:13, fontWeight:600 }}>{d.name}</span>
                        </div>
                        <div style={{ display:'flex', gap:16, alignItems:'center', fontSize:13 }}>
                          {d.ruleType === 'per_session' && (
                            <span style={{ color:'var(--text-muted)' }}>{d.sessions}堂 × ${d.perSessionPay}</span>
                          )}
                          {d.ruleType === 'revenue_share' && (
                            <span style={{ color:'var(--text-muted)' }}>收入分成 {d.shareInfo?.sharePercent}%</span>
                          )}
                          {d.ruleType === 'hybrid' && (
                            <span style={{ color:'var(--text-muted)' }}>固定+分成 × {d.sessions}堂</span>
                          )}
                          <span style={{ fontWeight:700, color:'var(--ink)' }}>${d.subtotal}</span>
                        </div>
                      </div>

                      {/* hybrid 展开说明 */}
                      {d.ruleType === 'hybrid' && d.shareInfo && (
                        <div style={{ padding:'8px 12px', background:'#F0F4FF', borderTop:'1px solid var(--line)', fontSize:12 }}>
                          <div style={{ display:'flex', gap:16, color:'var(--text-muted)', flexWrap:'wrap' }}>
                            <span>固定 ${d.offering?.compensationRule?.fixedAmount || 0}/堂 × {d.sessions}堂 = <strong>${(d.offering?.compensationRule?.fixedAmount || 0) * d.sessions}</strong></span>
                            <span>+ 收款${d.shareInfo.monthlyRevenue} × {d.shareInfo.sharePercent}% ÷ {d.offering?.totalSessions || 16}堂 = <strong>${d.shareInfo.teacherGets}</strong></span>
                          </div>
                        </div>
                      )}
                      {/* revenue_share 展开说明 */}
                      {d.ruleType === 'revenue_share' && d.shareInfo && (
                        <div style={{ padding:'8px 12px', background:'#EEF2F7', borderTop:'1px solid var(--line)', fontSize:12 }}>
                          <div style={{ display:'flex', gap:16, color:'var(--text-muted)' }}>
                            <span>学生 {d.shareInfo.students} 人 × ${mockPricingPlans.find(p => p.id === d.offering?.pricingPlanId)?.amount || 0}/月 = 总收入 <strong style={{ color:'var(--ink)' }}>${d.shareInfo.monthlyRevenue}</strong></span>
                            <span>·</span>
                            <span>老师得 {d.shareInfo.sharePercent}% = <strong style={{ color:'#4A6FA5' }}>${d.shareInfo.teacherGets}</strong></span>
                            {isOwner && <><span>·</span><span>工作室留 <strong style={{ color:'var(--success)' }}>${d.shareInfo.studioGets}</strong></span></>}
                          </div>
                          <div style={{ marginTop:4, color:'var(--text-muted)' }}>
                            按{d.offering?.totalSessions || 16}堂平摊 → 本月{d.sessions}堂 = ${d.subtotal}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 合计 */}
                <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 12px', borderTop:'2px solid var(--line)', marginTop:4 }}>
                  <span style={{ fontWeight:700, fontSize:16 }}>合计：</span>
                  <span style={{ fontWeight:700, fontSize:18, color:'var(--amber)', marginLeft:8 }}>${totalPay}</span>
                </div>

                {/* 上课日期 */}
                {details.length > 0 && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>上课日期</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {details.flatMap(d => d.recs).sort((a,b) => (a.date||'').localeCompare(b.date||'')).map((r, i) => (
                        <span key={r.id || i} style={{ fontSize:11.5, padding:'3px 10px', borderRadius:999, background: r.substitute ? 'var(--warn-bg)' : 'var(--success-bg)', color: r.substitute ? 'var(--warn)' : 'var(--success)', fontWeight:600 }}>
                          {r.date} {r.day}{r.substitute ? ' 🔄' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {subOut.length > 0 && (
                  <div style={{ marginTop:12, padding:'10px 14px', background:'#FFF3F3', borderRadius:8, fontSize:12, color:'var(--error)' }}>
                    ⚠️ 本月有 {subOut.length} 堂被代课（不计入薪资）
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
