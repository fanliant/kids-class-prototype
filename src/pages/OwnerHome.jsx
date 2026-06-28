import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessions } from '../context/SessionsContext';
import { instructors, studioTeachers, mockClassOfferings, mockEnrollments, mockPricingPlans, mockAttendanceRecords } from '../mockData';

const priorityBorder = { red:'#B3463E', yellow:'#B5701E', green:'#4C7A5C', orange:'#C96820', blue:'#4A6FA5' };
const priorityBg    = { red:'#FBEAE8', yellow:'#FBF1E1', green:'#E9F2EB', orange:'#FEF0E6', blue:'#EEF2F7' };

export default function OwnerHome() {
  const { user } = useAuth();
  const { pendingSubRequests, approveSubstitute } = useSessions();
  const navigate = useNavigate();
  const [feedFilter, setFeedFilter] = useState('all');

  const instructor = instructors.find((i) => i.id === user?.instructorId);
  const studioId = user?.instructorId || '';

  // ── 直接从 mockClassOfferings 读取（与课程设定完全一致）────────────────────
  const myOfferings   = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);
  const confirmed     = myEnrollments.filter(e => e.status === 'confirmed');
  const pending       = myEnrollments.filter(e => e.status === 'pending_payment');
  const waitlisted    = myEnrollments.filter(e => e.status === 'waitlisted');

  // ── Live stats ──────────────────────────────────────────────────────────────
  const pendingPaymentCount = pending.length;
  const totalEnrolled = confirmed.length + pending.length;
  const totalCapacity = myOfferings.reduce((s, o) => s + o.capacity, 0);
  const totalRevenue  = myOfferings.reduce((s, o) => {
    const pp = mockPricingPlans.find(p => p.id === o.pricingPlanId);
    const enrolledCount = confirmed.filter(e => e.offeringId === o.id).length;
    return s + enrolledCount * (pp?.amount || 0);
  }, 0);
  // ── 薪资&利润计算 ─────────────────────────────────────────────────────────
  const currentMonth = '2026-06';
  const monthRecords = mockAttendanceRecords.filter(r => r.date && r.date.startsWith(currentMonth));
  const myTeachers   = studioTeachers.filter(t => t.studioId === studioId);
  const totalPayout  = myTeachers.reduce((sum, teacher) => {
    const records = monthRecords.filter(r => r.teacherId === teacher.id);
    return sum + records.reduce((s, r) => {
      const offering = mockClassOfferings.find(o => o.id === r.offeringId);
      const rule = offering?.compensationRule;
      if (rule?.type === 'revenue_share') {
        const confirmedEnrolled = myEnrollments.filter(e => e.offeringId === r.offeringId && e.status === 'confirmed');
        const pp = mockPricingPlans.find(p => p.id === offering?.pricingPlanId);
        const monthlyRev = confirmedEnrolled.length * (pp?.amount || 0);
        return s + Math.round((monthlyRev / (offering?.totalSessions || 16)) * ((rule.sharePercent || 65) / 100));
      }
      return s + (rule?.amount || offering?.teacherRate || teacher.rate || 0);
    }, 0);
  }, 0);
  const studioProfit = totalRevenue - totalPayout;
  const margin = totalRevenue > 0 ? Math.round(studioProfit / totalRevenue * 100) : 0;

  // legacy compat：计算每个班的已报名数
  const classes = myOfferings.map(o => {
    const enrolledCount = confirmed.filter(e => e.offeringId === o.id).length;
    const pp = mockPricingPlans.find(p => p.id === o.pricingPlanId);
    return { ...o, booked: enrolledCount, price: pp?.amount || 0, title: o.name };
  });

  // ── Dynamic action items ─────────────────────────────────────────────────────
  const actionItems = [
    pendingPaymentCount > 0 && {
      id: 'pay', priority: 'red', icon: '🔴',
      text: `${pendingPaymentCount} 位家长付款待确认`,
      action: '查看付款', onClick: () => navigate('/operations?tab=payments'),
    },
    pendingSubRequests.length > 0 && {
      id: 'sub', priority: 'orange', icon: '🟠',
      text: `${pendingSubRequests.length} 位老师代课申请待处理`,
      action: '查看申请', onClick: () => {},
    },
    classes.some((c) => c.booked < c.capacity * 0.5) && {
      id: 'enroll', priority: 'yellow', icon: '🟡',
      text: `${classes.filter((c) => c.booked < c.capacity * 0.5).length} 门课招生未满半`,
      action: '查看课程', onClick: () => navigate('/dashboard?tab=classops'),
    },
    classes.some((c) => c.booked >= c.capacity) && {
      id: 'full', priority: 'green', icon: '🟢',
      text: `${classes.filter((c) => c.booked >= c.capacity).length} 门课已额满`,
      action: '查看候补', onClick: () => {
        const fullCourse = classes.find((c) => c.booked >= c.capacity);
        if (fullCourse) navigate(`/enrollment/${fullCourse.id}`);
      },
    },
    { id: 'trial', priority: 'blue', icon: '🔵', text: '3 位试课学生尚未跟进', action: '联系学生', onClick: () => navigate('/operations') },
    // 月结课程：月底提醒结算
    (() => {
      const monthlyClasses = classes.filter((c) => c.billingTiming === 'monthly' || c.billingTiming === 'post_term');
      const today = new Date();
      const isNearMonthEnd = today.getDate() >= 25;
      if (monthlyClasses.length > 0 && isNearMonthEnd) {
        return {
          id: 'billing', priority: 'orange', icon: '🟠',
          text: `${monthlyClasses.length} 门月结课程待开账单（本月底）`,
          action: '立即结算',
          onClick: () => navigate('/operations?tab=payments&action=billing'),
        };
      }
      return null;
    })(),
  ].filter(Boolean);

  // ── Dynamic activity feed from real enrollments ──────────────────────────────
  const feedEntries = myEnrollments.slice(0, 5)
    .filter((b) => classes.some((c) => c.id === b.offeringId))
    .map((b) => {
      const cls = classes.find((c) => c.id === b.offeringId);
      return {
        id: b.id, type: 'enrollment', icon: '📝',
        text: `${b.childName} 已报名 ${cls?.name || b.offeringId}`,
        time: b.createdAt ? new Date(b.createdAt).toLocaleDateString('zh-TW') : '最近',
      };
    });

  // Add pending sub requests to feed
  pendingSubRequests.forEach((s) => {
    feedEntries.unshift({
      id: `sub-${s.id}`, type: 'leave', icon: '📋',
      text: `老师提出代课申请：${s.courseTitle}（${s.date}）`,
      time: s.substituteRequest?.requestedAt
        ? new Date(s.substituteRequest.requestedAt).toLocaleDateString('zh-TW') : '最近',
    });
  });

  const filteredFeed = feedFilter === 'all' ? feedEntries : feedEntries.filter((f) => f.type === feedFilter);
  const today = new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <div style={{ paddingTop: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>早安,{user?.name} 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{today} · {instructor?.name || '工作室'}</p>
      </div>

      <div className="dash-grid" style={{ marginBottom: 28 }}>
        <div className="dash-stat">
          <div className="num">${totalRevenue.toLocaleString()}</div>
          <div className="label">本月应收学费</div>
        </div>
        <div className="dash-stat">
          <div className="num" style={{ color: pendingPaymentCount > 0 ? 'var(--error)' : undefined }}>
            {pendingPaymentCount}
          </div>
          <div className="label">待确认付款</div>
        </div>
        <div className="dash-stat">
          <div className="num">{totalEnrolled}/{totalCapacity}</div>
          <div className="label">学生 / 总名额</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Action Center */}
          <div className="dash-section">
            <div className="dash-section-head">
              <h2>今日待办</h2>
              {actionItems.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--success)' }}>✅ 今天没有待处理事项</span>}
            </div>
            {actionItems.length === 0 ? (
              <div className="banner banner-success">一切顺利！</div>
            ) : (
              <div className="stack gap-sm">
                {actionItems.map((item) => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:10, border:`1.5px solid ${priorityBorder[item.priority]}`, background:priorityBg[item.priority] }}>
                    <span style={{ fontSize:18 }}>{item.icon}</span>
                    <span style={{ flex:1, fontSize:14 }}>{item.text}</span>
                    <button onClick={item.onClick} style={{ background:priorityBorder[item.priority], padding:'6px 14px', fontSize:12.5, borderRadius:6 }}>{item.action}</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending sub requests inline approval */}
          {pendingSubRequests.length > 0 && (
            <div className="dash-section">
              <h2 style={{ marginBottom: 14 }}>代课申请待审批</h2>
              <table className="dash-table">
                <thead><tr><th>课程</th><th>日期</th><th>原因</th><th></th></tr></thead>
                <tbody>
                  {pendingSubRequests.map((s) => (
                    <tr key={s.id}>
                      <td>{s.courseTitle}</td>
                      <td>{s.date}</td>
                      <td>{s.substituteRequest?.reason || '—'}</td>
                      <td>
                        <button onClick={() => approveSubstitute(s.id)} style={{ fontSize: 12.5, padding: '5px 12px' }}>批准</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Activity Feed */}
          <div className="dash-section">
            <div className="dash-section-head">
              <h2>最近动态</h2>
              <div style={{ display:'flex', gap:6 }}>
                {['all','enrollment','leave'].map((t) => (
                  <button key={t} className="secondary" onClick={() => setFeedFilter(t)}
                    style={{ padding:'4px 10px', fontSize:11.5, background: feedFilter===t ? 'var(--ink)':undefined, color: feedFilter===t ? 'white':undefined, border: feedFilter===t ? 'none':undefined }}>
                    {t==='all'?'全部':t==='enrollment'?'报名':'代课'}
                  </button>
                ))}
              </div>
            </div>
            {filteredFeed.length === 0 ? (
              <div className="banner banner-info">暂无动态。</div>
            ) : (
              <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
                {filteredFeed.map((item, i) => (
                  <div key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 16px', borderBottom: i < filteredFeed.length-1 ? '1px solid var(--line)' : 'none' }}>
                    <span style={{ fontSize:17, marginTop:1 }}>{item.icon}</span>
                    <div style={{ flex:1, fontSize:14 }}>{item.text}</div>
                    <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="sticky-side" style={{ top:90, marginBottom:20 }}>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)', marginBottom:12 }}>快速操作</div>
            <div className="stack gap-sm">
              {[
                { label:'新增课程',     icon:'➕', route:'/dashboard?tab=courses' },
                { label:'查看所有付款', icon:'💰', route:'/operations?tab=payments' },
                { label:'班级总览',     icon:'📊', route:'/dashboard?tab=classops' },
              ].map((a) => (
                <button key={a.label} className="secondary full" onClick={() => navigate(a.route)}
                  style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-start', padding:'10px 14px', fontSize:13.5 }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--line)', fontWeight:700, fontSize:13.5, color:'var(--ink)' }}>课程状态</div>
            {classes.length === 0 ? (
              <div style={{ padding:16, fontSize:13.5, color:'var(--text-muted)' }}>还没有课程,去「课程管理」建立。</div>
            ) : (
              classes.map((c) => (
                <button key={c.id} onClick={() => navigate(`/enrollment/${c.id}`)}
                  style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 16px', borderBottom:'1px solid var(--line)', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--ink)', marginBottom:2, fontSize:13.5 }}>{c.title}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-muted)' }}>{c.booked}/{c.capacity} 学生</div>
                  </div>
                  <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 8px', borderRadius:999, background: c.booked>=c.capacity ? 'var(--success-bg)':'var(--warn-bg)', color: c.booked>=c.capacity ? 'var(--success)':'var(--warn)' }}>
                    {c.booked>=c.capacity ? '已满' : `剩 ${c.capacity-c.booked} 位`}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
