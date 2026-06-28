import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useSessions } from '../context/SessionsContext';
import { instructors } from '../mockData';
import { todayStr } from '../utils/storage';

export default function TeacherHome() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { getSessionsForDate, markAttendance, requestSubstitute } = useSessions();
  const navigate = useNavigate();
  const [subModal, setSubModal] = useState(null); // session or null
  const [subReason, setSubReason] = useState('');

  const instructor = instructors.find((i) => i.id === user?.instructorId);
  const today = todayStr();
  const todaySessions = getSessionsForDate(user?.instructorId, today);

  // Get enrolled students for a session from bookings
  function getStudents(session) {
    return bookings.filter(
      (b) => b.classId === session.courseId && b.slotId === session.slotId && b.status !== 'cancelled'
    );
  }

  function sessionAttendanceLabel(session) {
    const students = getStudents(session);
    if (students.length === 0) return { label: '—', color: 'var(--text-muted)' };
    const marked = Object.keys(session.attendance || {}).length;
    if (marked === 0) return { label: '未点名', color: 'var(--text-muted)' };
    if (marked < students.length) return { label: `${marked}/${students.length} 已点名`, color: 'var(--warn)' };
    return { label: '✅ 点名完成', color: 'var(--success)' };
  }

  function submitSubRequest() {
    if (!subModal || !subReason.trim()) return;
    requestSubstitute(subModal.id, subReason.trim());
    setSubModal(null);
    setSubReason('');
  }

  const todayDate = new Date().toLocaleDateString('zh-TW', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <div style={{ paddingTop: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>
          {todayDate}
          {todaySessions.length > 0 && (
            <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--amber)', marginLeft: 10 }}>
              今天有 {todaySessions.length} 堂课
            </span>
          )}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>{user?.name} · {instructor?.name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="dash-section">
            <h2 style={{ marginBottom: 16 }}>今日课程</h2>
            {todaySessions.length === 0 ? (
              <div className="banner banner-info">今天没有排课,好好休息！</div>
            ) : (
              <div className="stack gap-md">
                {todaySessions.map((session) => {
                  const students = getStudents(session);
                  const attStatus = sessionAttendanceLabel(session);
                  const hasSub = session.substituteRequest?.status === 'pending';
                  const approved = session.substituteRequest?.status === 'approved';
                  return (
                    <div key={session.id} className="class-option">
                      <div className="class-option-head">
                        <span className="class-option-title">{session.courseTitle}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{session.time}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12.5, color: attStatus.color, fontWeight: 600 }}>{attStatus.label}</span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>· {students.length} 位学生</span>
                        {hasSub && <span style={{ fontSize: 11.5, background: 'var(--warn-bg)', color: 'var(--warn)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>代课申请审批中</span>}
                        {approved && <span style={{ fontSize: 11.5, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>代课已批准</span>}
                      </div>

                      {/* Attendance per student */}
                      {students.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>尚无学生报名这个时段。</p>
                      ) : (
                        <div className="stack gap-sm">
                          {students.map((b) => {
                            const status = session.attendance?.[b.childName];
                            return (
                              <div key={b.id} className="attendance-row" style={{ padding: '8px 0', borderBottom: 'none' }}>
                                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                                  {b.childName}
                                  {b.leaveStatus === 'no_makeup' && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--warn)' }}>请假</span>}
                                </span>
                                <div className="attendance-actions">
                                  <button className={`outline-present${status === 'present' ? ' marked' : ''}`} onClick={() => markAttendance(session.id, b.childName, 'present')}>出席</button>
                                  <button className={`outline-absent${status === 'absent' ? ' marked' : ''}`} onClick={() => markAttendance(session.id, b.childName, 'absent')}>缺席</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Request substitute button */}
                      {!hasSub && !approved && (
                        <button className="secondary" onClick={() => setSubModal(session)} style={{ marginTop: 12, fontSize: 12.5, padding: '6px 14px' }}>
                          申请代课
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="sticky-side" style={{ top: 90 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>快速操作</div>
            <div className="stack gap-sm">
              {[
                { label: '查看完整课表', icon: '📅', onClick: () => navigate('/dashboard', { state: { tab: 'overview' } }) },
                { label: '我的课程',     icon: '📚', onClick: () => navigate('/dashboard', { state: { tab: 'classops' } }) },
                { label: '课程设定',     icon: '⚙️', onClick: () => navigate('/dashboard', { state: { tab: 'courses' } }) },
              ].map((a) => (
                <button key={a.label} className="secondary full" onClick={a.onClick}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', padding: '10px 14px', fontSize: 13.5 }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Substitute request modal */}
      {subModal && (
        <div className="modal-overlay" onClick={() => setSubModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 6 }}>申请代课</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
              {subModal.courseTitle} · {subModal.date} {subModal.time}
            </p>
            <div className="banner banner-info" style={{ marginBottom: 12 }}>
              代课申请只影响这一次 Session,不会修改整个课程的设定。
            </div>
            <label>
              请假原因
              <textarea
                value={subReason}
                onChange={(e) => setSubReason(e.target.value)}
                rows={3}
                style={{ fontFamily: 'inherit', fontSize: 14, padding: 10, borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }}
                placeholder="请填写请假原因..."
              />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="secondary" onClick={() => setSubModal(null)}>取消</button>
              <button className="full" disabled={!subReason.trim()} onClick={submitSubRequest}>送出申请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
