import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockInvoices, mockClassOfferings, mockPricingPlans } from '../mockData';

const STATUS_CONFIG = {
  draft:   { label:'草稿待确认', color:'#9CA3AF', bg:'#F3F4F6', emoji:'📝' },
  sent:    { label:'已发出',     color:'#4A6FA5', bg:'#EEF2F7', emoji:'📨' },
  paid:    { label:'已缴费',     color:'#22C55E', bg:'#F0FDF4', emoji:'✅' },
  overdue: { label:'逾期未缴',   color:'#EF4444', bg:'#FEF2F2', emoji:'⚠️' },
};

const BILLING_MODE_LABEL = {
  monthly_tuition:  '月缴制',
  drop_in:          '按堂计',
  semester_tuition: '学期/营期制',
};

function InvoiceCard({ inv, onConfirm, onSend, onMarkPaid, onAdjust }) {
  const [expanded, setExpanded]     = useState(false);
  const [adjNote, setAdjNote]       = useState('');
  const [adjAmount, setAdjAmount]   = useState('');
  const [showAdj, setShowAdj]       = useState(false);
  const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.sent;
  const isOverdue = inv.status === 'sent' && inv.dueDate < new Date().toISOString().slice(0,10);
  const displayStatus = isOverdue ? 'overdue' : inv.status;
  const displayCfg = STATUS_CONFIG[displayStatus];

  return (
    <div style={{ background:'var(--card)', border:`1.5px solid ${isOverdue ? '#EF4444' : inv.status === 'draft' ? 'var(--amber)' : 'var(--line)'}`, borderRadius:14, marginBottom:12, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, cursor:'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:displayCfg.bg, color:displayCfg.color, fontWeight:700 }}>
              {displayCfg.emoji} {displayCfg.label}
            </span>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'var(--bg)', border:'1px solid var(--line)', color:'var(--text-muted)' }}>
              {BILLING_MODE_LABEL[inv.billingMode]}
            </span>
            {inv.earlyBird && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'#FDF0F8', color:'#E91E8C', fontWeight:700 }}>🏷️ 早鸟</span>}
          </div>
          <div style={{ fontWeight:700, fontSize:15 }}>{inv.childName} · {inv.offeringName}</div>
          <div style={{ fontSize:12.5, color:'var(--text-muted)', marginTop:2 }}>
            {inv.parentEmail} · {inv.billingMonth} · 截止日 {inv.dueDate}
          </div>
          {inv.overdueNote && <div style={{ fontSize:12, color:'#EF4444', marginTop:3 }}>⚠ {inv.overdueNote}</div>}
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:800, fontSize:22, color: displayStatus === 'overdue' ? '#EF4444' : displayStatus === 'paid' ? '#22C55E' : 'var(--amber)' }}>
            ${inv.total}
          </div>
          {inv.subtotal !== inv.total && (
            <div style={{ fontSize:11, color:'var(--text-muted)', textDecoration:'line-through' }}>${inv.subtotal}</div>
          )}
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* 展开明细 */}
      {expanded && (
        <div style={{ borderTop:'1px solid var(--line)' }}>
          {/* 明细 */}
          <div style={{ padding:'12px 18px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:8 }}>帐单明细</div>
            {inv.lineItems.map((item, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
                <div style={{ color: item.type === 'leave' ? 'var(--text-muted)' : item.type === 'discount' ? '#22C55E' : item.type === 'adjustment' ? '#EF4444' : 'var(--ink)' }}>
                  {item.date && <span style={{ color:'var(--text-muted)', marginRight:8, fontSize:12 }}>{item.date}</span>}
                  {item.desc}
                </div>
                <span style={{ fontWeight:600, color: item.amount < 0 ? '#22C55E' : item.type === 'leave' ? 'var(--text-muted)' : 'var(--ink)' }}>
                  {item.amount === 0 ? '—' : item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
                </span>
              </div>
            ))}

            {/* 手动调整 */}
            {inv.adjustments?.map((adj, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--line)', fontSize:13, background:'#FFF3CD' }}>
                <span style={{ color:'#92610A' }}>✏️ {adj.reason}</span>
                <span style={{ fontWeight:600, color: adj.amount < 0 ? '#22C55E' : '#EF4444' }}>
                  {adj.amount < 0 ? `-$${Math.abs(adj.amount)}` : `+$${adj.amount}`}
                </span>
              </div>
            ))}

            {/* 合计 */}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:15, fontWeight:700 }}>
              <span>合计</span>
              <span style={{ color:'var(--amber)' }}>${inv.total}</span>
            </div>
          </div>

          {/* 手动调整表单 */}
          {showAdj && (
            <div style={{ padding:'12px 18px', background:'#FFF3CD', borderTop:'1px solid var(--line)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>✏️ 新增手动调整</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:8, marginBottom:8 }}>
                <input value={adjNote} onChange={e => setAdjNote(e.target.value)}
                  placeholder="调整原因（例：老师取消一堂）"
                  style={{ padding:'7px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13 }} />
                <input type="number" value={adjAmount} onChange={e => setAdjAmount(e.target.value)}
                  placeholder="-60 或 +20"
                  style={{ padding:'7px 10px', borderRadius:8, border:'1px solid var(--line)', fontSize:13 }} />
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="secondary" onClick={() => setShowAdj(false)} style={{ fontSize:12 }}>取消</button>
                <button onClick={() => { onAdjust(inv.id, { reason: adjNote, amount: Number(adjAmount) }); setShowAdj(false); setAdjNote(''); setAdjAmount(''); }}
                  disabled={!adjNote || !adjAmount}
                  style={{ fontSize:12, opacity: (!adjNote || !adjAmount) ? 0.5 : 1 }}>
                  加入调整
                </button>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ padding:'12px 18px', borderTop:'1px solid var(--line)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            {inv.status === 'draft' && (
              <>
                <button onClick={() => setShowAdj(true)} className="secondary" style={{ fontSize:12, padding:'5px 12px' }}>✏️ 手动调整</button>
                <button onClick={() => onConfirm(inv.id)}
                  style={{ fontSize:12, padding:'5px 16px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>
                  ✅ 确认并发给家长
                </button>
              </>
            )}
            {(inv.status === 'sent' || displayStatus === 'overdue') && (
              <>
                <button onClick={() => setShowAdj(true)} className="secondary" style={{ fontSize:12, padding:'5px 12px' }}>✏️ 调整金额</button>
                {inv.reminderCount < 2 && (
                  <button onClick={() => onSend(inv.id, 'reminder')} className="secondary" style={{ fontSize:12, padding:'5px 12px' }}>
                    📧 发催缴提醒（第{inv.reminderCount + 1}次）
                  </button>
                )}
                {inv.reminderCount >= 2 && (
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>⚠️ 已发2次提醒，请手动联络家长</span>
                )}
                <button onClick={() => onMarkPaid(inv.id)}
                  style={{ fontSize:12, padding:'5px 16px', background:'#22C55E', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>
                  💰 标记已收款
                </button>
              </>
            )}
            {inv.status === 'paid' && (
              <span style={{ fontSize:13, color:'#22C55E', fontWeight:600 }}>✅ 已于 {inv.paidAt} 收款</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicePage() {
  const { user } = useAuth();
  const studioId = user?.instructorId || 'mira-piano';

  const [invoices, setInvoices] = useState(
    mockInvoices.filter(inv => inv.studioId === studioId)
  );
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth,  setFilterMonth]  = useState('all');
  const [showNewDraft, setShowNewDraft] = useState(false);

  // 统计
  const draftCount   = invoices.filter(i => i.status === 'draft').length;
  const sentCount    = invoices.filter(i => i.status === 'sent').length;
  const overdueCount = invoices.filter(i => i.status === 'sent' && i.dueDate < new Date().toISOString().slice(0,10)).length;
  const paidTotal    = invoices.filter(i => i.status === 'paid').reduce((s,i) => s+i.total, 0);
  const pendingTotal = invoices.filter(i => i.status !== 'paid').reduce((s,i) => s+i.total, 0);

  const months = [...new Set(invoices.map(i => i.billingMonth))].sort().reverse();

  // 过滤
  const filtered = invoices.filter(i => {
    const isOverdue = i.status === 'sent' && i.dueDate < new Date().toISOString().slice(0,10);
    const effectiveStatus = isOverdue ? 'overdue' : i.status;
    if (filterStatus !== 'all' && effectiveStatus !== filterStatus) return false;
    if (filterMonth !== 'all' && i.billingMonth !== filterMonth) return false;
    return true;
  });

  function confirmInvoice(id) {
    setInvoices(prev => prev.map(i => i.id === id ? {
      ...i, status:'sent', sentAt: new Date().toISOString().slice(0,10)
    } : i));
  }

  function sendReminder(id) {
    setInvoices(prev => prev.map(i => i.id === id ? {
      ...i, reminderCount: i.reminderCount + 1, lastReminderAt: new Date().toISOString().slice(0,10)
    } : i));
  }

  function markPaid(id) {
    setInvoices(prev => prev.map(i => i.id === id ? {
      ...i, status:'paid', paidAt: new Date().toISOString().slice(0,10)
    } : i));
  }

  function addAdjustment(id, adj) {
    setInvoices(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newAdjs = [...(i.adjustments || []), adj];
      const newTotal = i.subtotal + newAdjs.reduce((s, a) => s + a.amount, 0);
      return { ...i, adjustments: newAdjs, total: newTotal };
    }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">发票管理</h1>
      </div>

      {/* 摘要统计 */}
      <div className="dash-grid" style={{ marginBottom:20 }}>
        <div className="dash-stat" style={{ border: draftCount > 0 ? '1.5px solid var(--amber)' : undefined }}>
          <div className="label">草稿待确认</div>
          <div className="num" style={{ color:'var(--amber)' }}>{draftCount}</div>
          {draftCount > 0 && <div style={{ fontSize:11, color:'var(--amber)', marginTop:4 }}>点击下方确认后发给家长</div>}
        </div>
        <div className="dash-stat" style={{ border: overdueCount > 0 ? '1.5px solid #EF4444' : undefined }}>
          <div className="label">逾期未缴</div>
          <div className="num" style={{ color: overdueCount > 0 ? '#EF4444' : 'var(--text-muted)' }}>{overdueCount}</div>
          {overdueCount > 0 && <div style={{ fontSize:11, color:'#EF4444', marginTop:4 }}>需要发催缴提醒</div>}
        </div>
        <div className="dash-stat">
          <div className="label">待收金额</div>
          <div className="num" style={{ color:'var(--warn)' }}>${pendingTotal.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="label">已收金额</div>
          <div className="num" style={{ color:'var(--success)' }}>${paidTotal.toLocaleString()}</div>
        </div>
      </div>

      {/* 草稿提醒 Banner */}
      {draftCount > 0 && (
        <div style={{ padding:'12px 16px', background:'var(--warn-bg)', border:'1.5px solid var(--amber)', borderRadius:12, marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)' }}>📝 有 {draftCount} 张草稿发票待您确认</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>请检查明细后确认发出，家长才会收到帐单Email</div>
          </div>
          <button onClick={() => setFilterStatus('draft')} style={{ fontSize:12, padding:'5px 14px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
            查看草稿
          </button>
        </div>
      )}

      {/* 说明区块 */}
      <div style={{ padding:'10px 16px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:10, marginBottom:20, fontSize:12.5, color:'var(--text-muted)', lineHeight:1.8 }}>
        💡 <strong>计算逻辑：</strong>月缴制→固定金额（老师取消课可手动减免）· 按堂制→只计实际出席堂数 · 营期/学期→报名时一次产生（含早鸟折扣）· 所有发票均需老师确认后才发给家长
      </div>

      {/* 筛选 */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:4 }}>
          {[
            { key:'all',     label:'全部' },
            { key:'draft',   label:`草稿（${draftCount}）` },
            { key:'sent',    label:`已发出（${sentCount}）` },
            { key:'overdue', label:`逾期（${overdueCount}）` },
            { key:'paid',    label:'已缴' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={filterStatus === f.key ? '' : 'secondary'}
              style={{ fontSize:12, padding:'4px 12px', color: f.key === 'overdue' && overdueCount > 0 ? '#EF4444' : undefined }}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:8, border:'1.5px solid var(--line)', fontSize:13, background:'var(--card)', marginLeft:'auto' }}>
          <option value="all">全部月份</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* 发票列表 */}
      {filtered.length === 0 && (
        <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
          没有符合条件的发票
        </div>
      )}
      {filtered.map(inv => (
        <InvoiceCard key={inv.id} inv={inv}
          onConfirm={confirmInvoice}
          onSend={sendReminder}
          onMarkPaid={markPaid}
          onAdjust={addAdjustment}
        />
      ))}
    </div>
  );
}
