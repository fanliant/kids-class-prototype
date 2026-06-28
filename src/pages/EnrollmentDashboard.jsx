import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockClassOfferings, mockEnrollments, mockPricingPlans, mockTeachingTypes, mockLevels } from '../mockData';

export default function EnrollmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studioId = user?.instructorId || 'mira-piano';
  const myOfferings = mockClassOfferings.filter(o => o.studioId === studioId && o.status === 'published');
  const myEnrollments = mockEnrollments.filter(e => e.studioId === studioId);

  const data = myOfferings.map(o => {
    const all = myEnrollments.filter(e => e.offeringId === o.id);
    const enrolled = all.filter(e => e.status === 'confirmed' || e.status === 'pending_payment');
    const waitlisted = all.filter(e => e.status === 'waitlisted');
    const pct = o.capacity > 0 ? Math.round(enrolled.length / o.capacity * 100) : 0;
    const pricePlan = mockPricingPlans.find(p => p.id === o.pricingPlanId);
    const tt = mockTeachingTypes.find(t => t.id === o.teachingTypeId);
    const level = mockLevels.find(l => l.id === o.levelId);
    return { o, enrolled, waitlisted, pct, pricePlan, tt, level };
  });

  const totalEnrolled = data.reduce((s, d) => s + d.enrolled.length, 0);
  const totalCapacity = myOfferings.reduce((s, o) => s + o.capacity, 0);
  const totalWaitlisted = data.reduce((s, d) => s + d.waitlisted.length, 0);
  const fullCourses = data.filter(d => d.enrolled.length >= d.o.capacity).length;

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">招生总览</h1></div>
      <div className="dash-grid" style={{ marginBottom: 24 }}>
        <div className="dash-stat"><div className="label">已报名</div><div className="num">{totalEnrolled}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{totalCapacity}</span></div></div>
        <div className="dash-stat"><div className="label">剩余名额</div><div className="num" style={{ color: 'var(--warn)' }}>{totalCapacity - totalEnrolled}</div></div>
        <div className="dash-stat"><div className="label">候补</div><div className="num" style={{ color: '#4A6FA5' }}>{totalWaitlisted}</div></div>
        <div className="dash-stat"><div className="label">已额满</div><div className="num" style={{ color: 'var(--success)' }}>{fullCourses}</div></div>
      </div>
      {data.map(({ o, enrolled, waitlisted, pct, pricePlan, level }) => (
        <div key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 12, padding: '14px 20px', cursor: 'pointer' }} onClick={() => navigate('/operations')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>{o.name}</span>
              {level && <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 6px', borderRadius: 999 }}>{level.name}</span>}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>${pricePlan?.amount}/{pricePlan?.unit}</span>
          </div>
          <div style={{ height: 6, background: 'var(--line)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--success)' : 'var(--amber)', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12.5 }}>
            <span>{enrolled.length}/{o.capacity} 已报名</span>
            {waitlisted.length > 0 && <span style={{ color: '#4A6FA5' }}>候补 {waitlisted.length}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
