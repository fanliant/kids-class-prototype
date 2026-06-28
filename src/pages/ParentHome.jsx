import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { instructors, mockEnrollments, mockClassOfferings, mockStudioAnnouncements } from '../mockData';
import AllMessagesFeed from '../components/AllMessagesFeed';

var DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function ParentHome() {
  var auth = useAuth();
  var parent = auth.parent;
  var bCtx = useBookings();
  var bookings = bCtx.bookings;
  var navigate = useNavigate();

  var feedTabState = React.useState('announcements');
  var feedTab = feedTabState[0];
  var setFeedTab = feedTabState[1];

  var filterState = React.useState('all');
  var msgFilter = filterState[0];
  var setMsgFilter = filterState[1];

  if (!parent) return null;

  var parentEmail = parent.email;
  var now = new Date();
  var todayZh = DAYS[now.getDay()];

  // 今天有课的班级
  var myEnrollments = mockEnrollments.filter(function(e) {
    return e.parentEmail === parentEmail && e.status !== 'cancelled';
  });

  var todayClasses = [];
  for (var ei = 0; ei < myEnrollments.length; ei++) {
    var enr = myEnrollments[ei];
    var off = null;
    for (var oi = 0; oi < mockClassOfferings.length; oi++) {
      if (mockClassOfferings[oi].id === enr.offeringId) { off = mockClassOfferings[oi]; break; }
    }
    if (!off) continue;
    var slots = off.slots || [];
    var todaySlot = null;
    for (var si = 0; si < slots.length; si++) {
      if (slots[si].day === todayZh) { todaySlot = slots[si]; break; }
    }
    if (!todaySlot) continue;
    var instr = null;
    for (var ii = 0; ii < instructors.length; ii++) {
      if (off.studioId && off.studioId.indexOf(instructors[ii].id) === 0) { instr = instructors[ii]; break; }
    }
    todayClasses.push({ enr: enr, off: off, slot: todaySlot, instr: instr });
  }

  // 报名的机构 - 优先用 mockEnrollments（含 demo parent）
  var studioIds = {};
  // 先从 mockEnrollments 找
  for (var ei2 = 0; ei2 < mockEnrollments.length; ei2++) {
    var enr2 = mockEnrollments[ei2];
    if (enr2.parentEmail === parentEmail && enr2.status !== 'cancelled') {
      studioIds[enr2.studioId] = true;
    }
  }
  // 再从 bookings context 补充（旧版兼容）
  for (var bi = 0; bi < bookings.length; bi++) {
    var bk = bookings[bi];
    var hasChild = false;
    for (var ci = 0; ci < parent.children.length; ci++) {
      if (parent.children[ci].id === bk.childId) { hasChild = true; break; }
    }
    if (hasChild) studioIds[bk.instructorId] = true;
  }
  var myStudios = instructors.filter(function(i) { return studioIds[i.id]; });

  // 全部公告 - mockStudioAnnouncements 是 { studioId: [...] } 对象格式
  var allAnnouncements = [];
  var announcedStudioIds = Object.keys(studioIds);
  for (var si2 = 0; si2 < announcedStudioIds.length; si2++) {
    var sid = announcedStudioIds[si2];
    var sAnns = mockStudioAnnouncements[sid] || [];
    for (var ai = 0; ai < sAnns.length; ai++) {
      allAnnouncements.push(Object.assign({ studioId: sid }, sAnns[ai]));
    }
  }
  allAnnouncements.sort(function(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });

  var dateStr = now.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="page">
      <div style={{ paddingTop: 12, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 2 }}>Hi, {parent.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{dateStr}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary" onClick={function() { navigate('/my-calendar'); }} style={{ fontSize: 13, padding: '8px 14px' }}>课表</button>
          <button onClick={function() { navigate('/'); }} style={{ fontSize: 13, padding: '8px 14px' }}>+ 报名</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        <div>
          {todayClasses.length > 0 && (
            <div className="dash-section">
              <h2 style={{ marginBottom: 14 }}>今天的课</h2>
              <div className="stack gap-sm">
                {todayClasses.map(function(tc, idx) {
                  return (
                    <div key={idx} style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{tc.off.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tc.slot.time} · {tc.instr ? tc.instr.name : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <AllMessagesFeed
            allAnnouncements={allAnnouncements}
            myEnrollments={myEnrollments}
            instructors={instructors}
            mockClassOfferings={mockClassOfferings}
            parentEmail={parentEmail}
            feedTab={feedTab}
            setFeedTab={setFeedTab}
            filter={msgFilter}
            setFilter={setMsgFilter}
          />
        </div>

        <div>
          <div className="dash-section">
            <h2 style={{ marginBottom: 14 }}>我的机构</h2>
            {myStudios.length === 0 && (
              <div className="banner banner-info">
                还没有报名。<Link to="/" style={{ color: 'var(--blue)', marginLeft: 6 }}>搜寻课程</Link>
              </div>
            )}
            {myStudios.length > 0 && (
              <div className="stack gap-md">
                {myStudios.map(function(ins) {
                  var todayInStudio = todayClasses.filter(function(tc) {
                    return tc.off && tc.off.studioId && tc.off.studioId.indexOf(ins.id) === 0;
                  });
                  var notices = allAnnouncements.filter(function(a) {
                    return a.studioId === ins.id && a.pinned;
                  }).slice(0, 2);

                  return (
                    <div key={ins.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{ins.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ins.category}</div>
                        </div>
                        <Link to={'/school/' + ins.id}>
                          <button className="secondary" style={{ fontSize: 12, padding: '5px 12px' }}>查看</button>
                        </Link>
                      </div>
                      {todayInStudio.length > 0 && (
                        <div style={{ padding: '10px 16px', background: 'var(--success-bg)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontSize: 13, color: 'var(--ink)' }}>
                            今天 {todayInStudio[0].slot.time} 有课
                          </span>
                        </div>
                      )}
                      {notices.length === 0 && todayInStudio.length === 0 && (
                        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无重要通知</div>
                      )}
                      {notices.map(function(a, idx) {
                        return (
                          <div key={idx} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{a.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.body}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dash-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>我的孩子</h2>
              <button onClick={function() { navigate('/child/new'); }}
                style={{ fontSize: 12, padding: '4px 10px', background: 'var(--amber)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                + 新增
              </button>
            </div>
            {parent.children.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>还没有孩子档案</div>
            )}
            {parent.children.map(function(child) {
              return (
                <div key={child.id} onClick={function() { navigate('/child/' + child.id); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 50, background: 'var(--amber)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {child.name ? child.name[0] : '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>{child.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{child.age ? child.age + '岁' : '未填生日'}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>›</span>
                </div>
              );
            })}
            <button className="secondary full" onClick={function() { navigate('/my-calendar'); }}
              style={{ marginTop: 12, fontSize: 13 }}>
              查看孩子课表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
