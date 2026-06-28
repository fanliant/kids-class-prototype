import React from 'react';
import { mockInvoices } from '../mockData';

var TAG_CONFIG = {
  important: { label: '重要通知', color: '#EF4444', bg: '#FEF2F2' },
  course:    { label: '课程消息', color: '#4A6FA5', bg: '#EEF2F7' },
  promo:     { label: '促销活动', color: '#E91E8C', bg: '#FDF0F8' },
};

function classifyAnn(a) {
  if (a.pinned) return 'important';
  var t = (a.title + ' ' + a.body).toLowerCase();
  if (t.indexOf('优惠') >= 0 || t.indexOf('折扣') >= 0 || t.indexOf('促销') >= 0) return 'promo';
  return 'course';
}

export default function AllMessagesFeed(props) {
  var allAnnouncements = props.allAnnouncements || [];
  var myEnrollments = props.myEnrollments || [];
  var instructors = props.instructors || [];
  var mockClassOfferings = props.mockClassOfferings || [];

  var feedTab = props.feedTab || 'announcements';
  var setFeedTab = props.setFeedTab || function(){};
  var filter = props.filter || 'all';
  var setFilter = props.setFilter || function(){};

  var announcements = allAnnouncements
    .map(function(a) {
      var studio = null;
      for (var i = 0; i < instructors.length; i++) {
        if (instructors[i].id === a.studioId) { studio = instructors[i]; break; }
      }
      return Object.assign({}, a, {
        studioName: studio ? studio.name : '工作室',
        type: classifyAnn(a),
      });
    })
    .filter(function(a) { return filter === 'all' || a.type === filter; });

  // 付款提醒：用 mockInvoices（与课表页同一数据源，保持一致）
  var pEmail = props.parentEmail || '';
  if (!pEmail && myEnrollments.length > 0) {
    pEmail = myEnrollments[0].parentEmail || '';
  }
  var pendingInvoices = mockInvoices.filter(function(inv) {
    return inv.status === 'pending' && inv.parentEmail === pEmail;
  });

  var payments = pendingInvoices.map(function(inv) {
    var studio = null;
    for (var k = 0; k < instructors.length; k++) {
      if (instructors[k].id === inv.studioId || (inv.studioId && inv.studioId.indexOf(instructors[k].id) === 0)) {
        studio = instructors[k]; break;
      }
    }
    return {
      id: inv.id,
      studioName: studio ? studio.name : '工作室',
      title: inv.month + ' 学费 $' + inv.amount,
      body: '截止日期：' + (inv.dueDate || '') + '，请尽快完成缴费。',
      amount: inv.amount,
    };
  });

  var paymentCount = payments.length;
  var isAnn = feedTab === 'announcements';
  var isPay = feedTab === 'payments';

  var filterButtons = [
    { key: 'all',       label: '全部' },
    { key: 'important', label: '重要通知' },
    { key: 'course',    label: '课程消息' },
    { key: 'promo',     label: '促销活动' },
  ];

  var annTabStyle = {
    padding: '5px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
    background: isAnn ? 'var(--ink)' : 'transparent',
    color: isAnn ? '#fff' : 'var(--text-muted)',
    fontWeight: isAnn ? 700 : 400,
  };

  var payTabStyle = {
    padding: '5px 14px', fontSize: 13, border: 'none', cursor: 'pointer',
    background: isPay ? 'var(--ink)' : 'transparent',
    color: isPay ? '#fff' : 'var(--text-muted)',
    fontWeight: isPay ? 700 : 400,
    position: 'relative',
  };

  return (
    <div className="dash-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>全部消息</h2>
        <div style={{ display: 'flex', border: '1.5px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setFeedTab('announcements')} style={annTabStyle}>公告</button>
          <button onClick={() => setFeedTab('payments')} style={payTabStyle}>
            {'付款提醒'}
            {paymentCount > 0 ? (
              <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--error)', color: '#fff', borderRadius: 99, padding: '1px 5px', fontWeight: 700, display: 'inline-block' }}>
                {paymentCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {isAnn ? (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {filterButtons.map(function(f) {
              var active = filter === f.key;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  fontSize: 12, padding: '3px 12px', borderRadius: 99, cursor: 'pointer',
                  border: active ? '1.5px solid var(--amber)' : '1.5px solid var(--line)',
                  background: active ? 'var(--warn-bg)' : 'var(--card)',
                  color: active ? 'var(--amber)' : 'var(--text-muted)',
                  fontWeight: active ? 700 : 400,
                }}>{f.label}</button>
              );
            })}
          </div>
          {announcements.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12 }}>
              没有消息
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              {announcements.map(function(a, idx) {
                var cfg = TAG_CONFIG[a.type] || TAG_CONFIG.course;
                var isLast = idx === announcements.length - 1;
                return (
                  <div key={idx} style={{ display: 'flex', gap: 12, padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
                    <div style={{ width: 3, borderRadius: 99, background: cfg.color, flexShrink: 0, alignSelf: 'stretch', minHeight: 36 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '1px 7px', borderRadius: 999 }}>{cfg.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.studioName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.date}</span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{a.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{a.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {isPay ? (
        <div>
          {payments.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--success)', fontSize: 14, background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 12 }}>
              目前没有待缴费项目
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {payments.map(function(p) {
                return (
                  <div key={p.id} style={{ background: 'var(--card)', border: '1.5px solid var(--error)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', background: '#FEF2F2', padding: '1px 7px', borderRadius: 999, display: 'inline-block', marginBottom: 5 }}>待缴</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{p.studioName}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{p.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{p.body}</div>
                      </div>
                      <button style={{ fontSize: 12, padding: '6px 14px', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
                        前往缴费
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
