import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockClassOfferings, mockEnrollments, mockPricingPlans, mockTeachingTypes } from '../mockData';

const TYPE_LABEL = { group_class: '团体课', private_lesson: '私教', workshop: '营队/工作坊' };

export default function PaymentsPage() {
  const { user } = useAuth();
  const [confirmedIds, setConfirmedIds] = useState(new Set());
  const studioId = user?.instructorId || 'mira-piano';
  const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);

  const payData = myOfferings.map(o => {
    const all = myEnrollments.filter(e => e.offeringId === o.id && e.status !== 'waitlisted');
    const paid = all.filter(e => e.paymentStatus === 'paid' || confirmedIds.has(e.id));
    const unpaid = all.filter(e => e.paymentStatus !== 'paid' && !confirmedIds.has(e.id));
    const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
    const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId);
    return { o, all, paid, unpaid, pricePlan, tt };
  }).filter(d => d.all.length > 0);

  const totalPaid = payData.reduce((s, d) => s + d.paid.length * (d.pricePlan?.amount || 0), 0);
  const totalUnpaid = payData.reduce((s, d) => s + d.unpaid.length * (d.pricePlan?.amount || 0), 0);
  const totalStudents = payData.reduce((s, d) => s + d.all.length, 0);
  const totalPaidCount = payData.reduce((s, d) => s + d.paid.length, 0);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">收款管理</h1></div>
      <div className="dash-grid" style={{ marginBottom: 28 }}>
        <div className="dash-stat"><div className="label">本月已收款</div><div className="num" style={{ color: 'var(--success)' }}>${totalPaid.toLocaleString()}</div></div>
        <div className="dash-stat"><div className="label">待收款</div><div className="num" style={{ color: totalUnpaid > 0 ? 'var(--error)' : 'var(--text-muted)' }}>${totalUnpaid.toLocaleString()}</div></div>
        <div className="dash-stat"><div className="label">付款学生</div><div className="num">{totalPaidCount}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{totalStudents}</span></div></div>
        <div className="dash-stat"><div className="label">收款率</div><div className="num" style={{ color: 'var(--success)' }}>{totalStudents > 0 ? Math.round(totalPaidCount / totalStudents * 100) : 0}%</div></div>
      </div>
      {payData.map(({ o, paid, unpaid, pricePlan, tt }) => (
        <div key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{o.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{tt ? TYPE_LABEL[tt.type] : ''} · ${pricePlan?.amount}/{pricePlan?.unit}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>已收 ${(paid.length * (pricePlan?.amount || 0)).toLocaleString()}</div>
              {unpaid.length > 0 && <div style={{ fontSize: 12, color: 'var(--error)' }}>待收 ${(unpaid.length * (pricePlan?.amount || 0)).toLocaleString()}</div>}
            </div>
          </div>
          {unpaid.length > 0 && (
            <div style={{ padding: '10px 20px', borderBottom: paid.length > 0 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>⏳ 待付款（{unpaid.length}人）</div>
              {unpaid.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{e.childName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{e.parentEmail}</span>
                  </div>
                  <button style={{ fontSize: 12, padding: '4px 14px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => setConfirmedIds(prev => new Set([...prev, e.id]))}>
                    确认收款 ${pricePlan?.amount}
                  </button>
                </div>
              ))}
            </div>
          )}
          {paid.length > 0 && (
            <div style={{ padding: '10px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>✓ 已付款（{paid.length}人）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {paid.map(e => <span key={e.id} style={{ fontSize: 12, background: 'var(--success-bg)', color: 'var(--success)', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>{e.childName}</span>)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
