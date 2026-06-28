import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockInvoices, mockClassOfferings, mockPricingPlans, mockEnrollments,
         mockClassOfferings as offerings } from '../mockData';

// ── 损益数据（mock，实际从invoice+payroll计算）─────────────────────────────
const MONTHLY_DATA = [
  { month:'1月', revenue:1980, payroll:880, other:120 },
  { month:'2月', revenue:2200, payroll:960, other:100 },
  { month:'3月', revenue:2420, payroll:1040, other:130 },
  { month:'4月', revenue:2640, payroll:1120, other:110 },
  { month:'5月', revenue:2860, payroll:1200, other:140 },
  { month:'6月', revenue:3080, payroll:1280, other:120 },
  { month:'7月', revenue:3520, payroll:1440, other:160 }, // 含暑期营
];

const CURRENT_MONTH = MONTHLY_DATA[MONTHLY_DATA.length - 1];


// ── 财务数据 ─────────────────────────────────────────────────────────────────
const TIMELINE_EVENTS = [
  { month:'7月',  net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'8月',  net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'9月',  net: 8320,  bigIn: 8800,  items:[{t:'big',d:'🎉 秋季班学期费（22人）',a:8800},{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'10月', net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'11月', net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'12月', net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480},{t:'warn',d:'⚠️ 春季招生开始',a:0}] },
  { month:'1月',  net: -960,  bigIn: 0,     items:[{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
  { month:'2月',  net: 9040,  bigIn: 10000, items:[{t:'big',d:'🎉 春季班学期费（预估25人）',a:10000},{t:'out',d:'老师薪资',a:-1440},{t:'in',d:'私教月结',a:480}] },
];

const PNL_DATA = {
  revenue: [
    { label:'JMC 团体课', amount:1980, pct:56, color:'#22C55E' },
    { label:'一对一私教', amount:960,  pct:27, color:'#4A6FA5' },
    { label:'暑期夏令营', amount:580,  pct:17, color:'#E91E8C' },
  ],
  expenses: [
    { label:'Mira Chen 薪资',  amount:840,  pct:52, color:'#EF4444' },
    { label:'Sarah Lin 薪资',  amount:560,  pct:35, color:'#F97316' },
    { label:'场地/水电',        amount:100,  pct:6,  color:'#9CA3AF' },
    { label:'教材/耗材',        amount:60,   pct:4,  color:'#9CA3AF' },
    { label:'WYLO 平台服务费',  amount:null, pct:3,  color:'#CBD5E1' },
  ],
};

// ── 折线图 SVG ──────────────────────────────────────────────────────────────
function RunwayChart({ balances, months, dangerLine }) {
  const W = 600, H = 200, PAD = { t:20, r:20, b:30, l:55 };
  const maxB = Math.max(...balances, dangerLine * 2);
  const minB = Math.min(...balances, 0);
  const range = maxB - minB || 1;
  const gW = W - PAD.l - PAD.r;
  const gH = H - PAD.t - PAD.b;
  const n = balances.length;

  function x(i) { return PAD.l + (i / (n-1)) * gW; }
  function y(v) { return PAD.t + gH - ((v - minB) / range * gH); }

  // 折线路径
  const path = balances.map((b,i) => `${i===0?'M':'L'}${x(i).toFixed(1)},${y(b).toFixed(1)}`).join(' ');
  // 填充区域
  const area = `${path} L${x(n-1).toFixed(1)},${(PAD.t+gH).toFixed(1)} L${x(0).toFixed(1)},${(PAD.t+gH).toFixed(1)} Z`;
  // danger线Y坐标
  const dangerY = y(dangerLine);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      {/* 危险区背景 */}
      <rect x={PAD.l} y={dangerY} width={gW} height={PAD.t+gH-dangerY} fill="#FEF2F2" />
      {/* 危险线 */}
      <line x1={PAD.l} y1={dangerY} x2={PAD.l+gW} y2={dangerY} stroke="#EF4444" strokeWidth={1} strokeDasharray="4,3" />
      <text x={PAD.l+4} y={dangerY-4} fontSize={9} fill="#EF4444">危险线 ${dangerLine.toLocaleString()}</text>

      {/* Y轴刻度 */}
      {[0, 5000, 10000, 15000].filter(v => v >= minB && v <= maxB).map(v => (
        <g key={v}>
          <line x1={PAD.l-4} y1={y(v)} x2={PAD.l} y2={y(v)} stroke="#CBD5E1" strokeWidth={1} />
          <text x={PAD.l-6} y={y(v)+4} fontSize={9} fill="#9CA3AF" textAnchor="end">${(v/1000).toFixed(0)}k</text>
        </g>
      ))}

      {/* 网格线 */}
      {[5000,10000].filter(v => v >= minB && v <= maxB).map(v => (
        <line key={v} x1={PAD.l} y1={y(v)} x2={PAD.l+gW} y2={y(v)} stroke="#F1F5F9" strokeWidth={1} />
      ))}

      {/* 填充区域 */}
      <path d={area} fill="url(#cashGrad)" opacity={0.3} />
      <defs>
        <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* 折线 */}
      <path d={path} fill="none" stroke="#22C55E" strokeWidth={2.5} strokeLinejoin="round" />

      {/* 数据点 */}
      {balances.map((b, i) => {
        const isBig = TIMELINE_EVENTS[i]?.bigIn > 0;
        const isDanger = b < dangerLine;
        const color = isDanger ? '#EF4444' : isBig ? '#22C55E' : '#4A6FA5';
        return (
          <g key={i}>
            <circle cx={x(i)} cy={y(b)} r={isBig ? 7 : 5}
              fill={color} stroke="#fff" strokeWidth={2} />
            {isBig && (
              <text x={x(i)} y={y(b)-12} fontSize={10} fill="#22C55E" textAnchor="middle" fontWeight="bold">
                +${(TIMELINE_EVENTS[i].bigIn/1000).toFixed(0)}k
              </text>
            )}
          </g>
        );
      })}

      {/* X轴月份 */}
      {months.map((m, i) => (
        <text key={i} x={x(i)} y={H-6} fontSize={9.5} fill="#9CA3AF" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

// ── Cash Runway Tab ──────────────────────────────────────────────────────────
function CashRunwayTab() {
  const [cashBalance, setCashBalance] = React.useState(4200);
  const [editing, setEditing]         = React.useState(false);
  const [temp, setTemp]               = React.useState('4200');
  const [expanded, setExpanded]       = React.useState(null);
  const DANGER_LINE = 1000;

  // 计算每月余额
  let running = cashBalance;
  const timeline = TIMELINE_EVENTS.map(ev => {
    const open  = running;
    running    += ev.net;
    return { ...ev, open, close: running };
  });

  const balances  = [cashBalance, ...timeline.map(t => t.close)];
  const months    = ['现在', ...timeline.map(t => t.month)];
  const lowest    = Math.min(...timeline.map(t => t.close));
  const lowestEv  = timeline.find(t => t.close === lowest);
  const nextBig   = timeline.find(t => t.bigIn > 0);

  return (
    <div>
      {/* 三格摘要 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
        <div style={{ background:'var(--card)', border:'1.5px solid var(--amber)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>💰 目前余额</div>
          {editing ? (
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              <span style={{ fontWeight:700 }}>$</span>
              <input type="number" value={temp} onChange={e=>setTemp(e.target.value)}
                style={{ width:90, padding:'3px 6px', fontSize:17, fontWeight:700, border:'1.5px solid var(--amber)', borderRadius:6 }} />
              <button onClick={()=>{setCashBalance(Number(temp));setEditing(false);}}
                style={{ fontSize:12, padding:'3px 8px', background:'var(--amber)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer' }}>✓</button>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontWeight:800, fontSize:24, color:'var(--amber)' }}>${cashBalance.toLocaleString()}</span>
              <button onClick={()=>{setTemp(String(cashBalance));setEditing(true);}} className="secondary" style={{ fontSize:10, padding:'2px 6px' }}>✏️</button>
            </div>
          )}
          <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>点✏️输入实际银行余额</div>
        </div>

        <div style={{ background:'var(--card)', border:`1.5px solid ${lowest<DANGER_LINE?'var(--error)':lowest<3000?'var(--warn)':'var(--line)'}`, borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>
            {lowest < DANGER_LINE ? '🚨 预警最低点' : lowest < 3000 ? '⚠️ 注意最低点' : '✓ 最低点'}
          </div>
          <div style={{ fontWeight:800, fontSize:24, color:lowest<DANGER_LINE?'var(--error)':lowest<3000?'var(--warn)':'var(--success)' }}>
            ${lowest.toLocaleString()}
          </div>
          <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{lowestEv?.month} · {lowest>=0?'现金流安全':'⚠️ 现金不足！'}</div>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:4 }}>🎉 下次大笔进账</div>
          <div style={{ fontWeight:800, fontSize:24, color:'var(--success)' }}>${nextBig?.bigIn.toLocaleString()}</div>
          <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{nextBig?.month}</div>
        </div>
      </div>

      {/* 折线图 */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'16px 18px', marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📈 现金余额走势（预测）</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12 }}>红色虚线以下为危险区 · 绿色大点为大笔进账</div>
        <RunwayChart balances={balances} months={months} dangerLine={DANGER_LINE} />
      </div>

      {/* 逐月明细（可展开） */}
      <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
        <div style={{ padding:'12px 18px', fontWeight:700, fontSize:14, borderBottom:'1px solid var(--line)' }}>逐月收支明细</div>
        {timeline.map((ev, i) => (
          <div key={i} style={{ borderBottom: i < timeline.length-1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background: ev.close < DANGER_LINE ? '#FEF2F2' : 'transparent' }}
              onClick={() => setExpanded(expanded===i ? null : i)}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontWeight:700, fontSize:13, width:40 }}>{ev.month}</span>
                <span style={{ fontSize:12, color: ev.net>=0?'var(--success)':'var(--error)', fontWeight:600 }}>
                  {ev.net>=0?`+$${ev.net.toLocaleString()}`:`-$${Math.abs(ev.net).toLocaleString()}`}
                </span>
                {ev.bigIn > 0 && <span style={{ fontSize:10, padding:'1px 7px', background:'var(--success-bg)', color:'var(--success)', borderRadius:999, fontWeight:700 }}>大笔进账</span>}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontWeight:700, fontSize:14, color: ev.close<DANGER_LINE?'var(--error)':ev.close<3000?'var(--warn)':'var(--success)' }}>
                  ${ev.close.toLocaleString()}
                </span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{expanded===i?'▲':'▼'}</span>
              </div>
            </div>
            {expanded === i && (
              <div style={{ padding:'8px 18px 12px 58px', background:'var(--bg)', borderTop:'1px solid var(--line)' }}>
                {ev.items.filter(it=>it.a!==0).map((it,j) => (
                  <div key={j} style={{ display:'flex', justifyContent:'space-between', fontSize:12.5, padding:'3px 0', color: it.t==='big'?'var(--success)':it.t==='out'?'var(--error)':'var(--text-muted)' }}>
                    <span>{it.d}</span>
                    <span style={{ fontWeight:600 }}>{it.a>0?`+$${it.a.toLocaleString()}`:`-$${Math.abs(it.a).toLocaleString()}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize:11.5, color:'var(--text-muted)', padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:8 }}>
        ⚠️ Prototype 示范数据。实际产品从报名记录、发票缴费状态、薪资设定自动汇算，无需手动输入收支。
      </div>
    </div>
  );
}

// ── P&L 损益表 Tab ────────────────────────────────────────────────────────────
function PnLTab() {
  const totalRevenue = PNL_DATA.revenue.reduce((s,i) => s+i.amount, 0);
  const totalExpense = PNL_DATA.expenses.reduce((s,i) => s+(i.amount||0), 0);
  const netProfit    = totalRevenue - totalExpense;
  const margin       = Math.round(netProfit / totalRevenue * 100);

  return (
    <div>
      {/* 本月总结 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'总收入',   value:`$${totalRevenue.toLocaleString()}`, color:'var(--success)' },
          { label:'总支出',   value:`$${totalExpense.toLocaleString()}`, color:'var(--error)' },
          { label:'净利润',   value:`$${netProfit.toLocaleString()}`,    color:netProfit>0?'var(--success)':'var(--error)' },
          { label:'利润率',   value:`${margin}%`,                        color:margin>30?'var(--success)':'var(--warn)' },
        ].map(s => (
          <div key={s.label} className="dash-stat">
            <div className="label">{s.label}</div>
            <div className="num" style={{ color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {/* 收入来源 */}
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'16px 18px' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--success)' }}>💰 收入来源</div>
          {PNL_DATA.revenue.map((item,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span>{item.label}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{item.pct}%</span>
                  <span style={{ fontWeight:700 }}>${item.amount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ height:6, background:'var(--line)', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:99 }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--line)', paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:14 }}>
            <span>合计</span><span style={{ color:'var(--success)' }}>${totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* 支出明细 */}
        <div style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, padding:'16px 18px' }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:'var(--error)' }}>📤 支出明细</div>
          {PNL_DATA.expenses.map((item,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span>{item.label}</span>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--text-muted)' }}>{item.pct}%</span>
                  <span style={{ fontWeight:700, color:item.amount?'var(--ink)':'var(--text-muted)' }}>
                    {item.amount ? `$${item.amount.toLocaleString()}` : '依方案'}
                  </span>
                </div>
              </div>
              <div style={{ height:6, background:'var(--line)', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:99 }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--line)', paddingTop:10, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:14 }}>
            <span>合计</span><span style={{ color:'var(--error)' }}>${totalExpense.toLocaleString()}+</span>
          </div>
        </div>
      </div>

      {/* 净利润总结 */}
      <div style={{ background: netProfit>0 ? 'var(--success-bg)' : '#FEF2F2', border:`1.5px solid ${netProfit>0?'var(--success)':'var(--error)'}`, borderRadius:12, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15 }}>本月净利润</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>总收入 ${totalRevenue} − 总支出 ${totalExpense}+</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:800, fontSize:28, color:netProfit>0?'var(--success)':'var(--error)' }}>${netProfit.toLocaleString()}</div>
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>利润率 {margin}%</div>
        </div>
      </div>

      <div style={{ fontSize:11.5, color:'var(--text-muted)', padding:'8px 12px', background:'var(--bg)', border:'1px solid var(--line)', borderRadius:8, marginTop:14 }}>
        ⚠️ Prototype 示范数据。「WYLO 平台服务费」依实际方案收取，此处仅示意占比。
      </div>
    </div>
  );
}

// ── Invoice 卡片（独立组件，避免hooks in map）─────────────────────────────
function InvoiceCard({ inv, onConfirm, onMarkPaid, onSendReminder, onAdjust }) {
  const [expanded, setExpanded] = useState(false);
  const [showAdj, setShowAdj]   = useState(false);
  const [adjNote, setAdjNote]   = useState('');
  const [adjAmt,  setAdjAmt]    = useState('');

  const isOverdue = inv.status === 'sent' && inv.dueDate < new Date().toISOString().slice(0,10);
  const display   = isOverdue ? 'overdue' : inv.status;
  const STATUS_CFG = {
    draft:   { label:'草稿待确认', color:'var(--amber)',   bg:'var(--warn-bg)',    emoji:'📝' },
    sent:    { label:'已发出',     color:'#4A6FA5',        bg:'#EEF2F7',          emoji:'📨' },
    paid:    { label:'已缴费',     color:'var(--success)',  bg:'var(--success-bg)', emoji:'✅' },
    overdue: { label:'逾期未缴',   color:'var(--error)',    bg:'#FEF2F2',          emoji:'⚠️' },
  };
  const cfg = STATUS_CFG[display];

  return (
    <div style={{ background:'var(--card)', border:`1.5px solid ${isOverdue?'var(--error)':inv.status==='draft'?'var(--amber)':'var(--line)'}`, borderRadius:14, marginBottom:10, overflow:'hidden' }}>
      <div style={{ padding:'12px 18px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, cursor:'pointer' }}
        onClick={() => setExpanded(e=>!e)}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:cfg.bg, color:cfg.color, fontWeight:700 }}>{cfg.emoji} {cfg.label}</span>
            {inv.earlyBird && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'#FDF0F8', color:'#E91E8C', fontWeight:700 }}>🏷️ 早鸟</span>}
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{inv.billingMonth}</span>
          </div>
          <div style={{ fontWeight:700, fontSize:14 }}>{inv.childName} · {inv.offeringName}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
            {inv.parentEmail} · 截止 {inv.dueDate}
            {inv.overdueNote && <span style={{ color:'var(--error)', marginLeft:8 }}>{inv.overdueNote}</span>}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:800, fontSize:20, color:display==='overdue'?'var(--error)':display==='paid'?'var(--success)':'var(--amber)' }}>
            ${inv.total}
          </div>
          {inv.subtotal !== inv.total && <div style={{ fontSize:11, color:'var(--text-muted)', textDecoration:'line-through' }}>${inv.subtotal}</div>}
          <span style={{ fontSize:11, color:'var(--text-muted)' }}>{expanded?'▲':'▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop:'1px solid var(--line)' }}>
          <div style={{ padding:'10px 18px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:6 }}>帐单明细</div>
            {inv.lineItems.map((item,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--line)', fontSize:13 }}>
                <span style={{ color: item.type==='leave'?'var(--text-muted)':item.type==='discount'?'var(--success)':item.type==='adjustment'?'var(--error)':'var(--ink)' }}>
                  {item.date && <span style={{ color:'var(--text-muted)', marginRight:6, fontSize:11 }}>{item.date}</span>}
                  {item.desc}
                </span>
                <span style={{ fontWeight:600, color:item.amount<0?'var(--success)':item.type==='leave'?'var(--text-muted)':'var(--ink)' }}>
                  {item.amount===0?'—':item.amount<0?`-$${Math.abs(item.amount)}`:`$${item.amount}`}
                </span>
              </div>
            ))}
            {(inv.adjustments||[]).map((adj,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--line)', fontSize:13, background:'#FFF3CD' }}>
                <span style={{ color:'#92610A' }}>✏️ {adj.reason}</span>
                <span style={{ fontWeight:600, color:adj.amount<0?'var(--success)':'var(--error)' }}>{adj.amount<0?`-$${Math.abs(adj.amount)}`:`+$${adj.amount}`}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:15, fontWeight:700 }}>
              <span>合计</span><span style={{ color:'var(--amber)' }}>${inv.total}</span>
            </div>
          </div>

          {showAdj && (
            <div style={{ padding:'10px 18px', background:'#FFF3CD', borderTop:'1px solid var(--line)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>✏️ 手动调整</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 100px', gap:6, marginBottom:6 }}>
                <input value={adjNote} onChange={e=>setAdjNote(e.target.value)} placeholder="调整原因"
                  style={{ padding:'6px 10px', borderRadius:7, border:'1px solid var(--line)', fontSize:13 }} />
                <input type="number" value={adjAmt} onChange={e=>setAdjAmt(e.target.value)} placeholder="-60 或 +20"
                  style={{ padding:'6px 10px', borderRadius:7, border:'1px solid var(--line)', fontSize:13 }} />
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="secondary" onClick={()=>setShowAdj(false)} style={{ fontSize:12 }}>取消</button>
                <button onClick={()=>{onAdjust(inv.id,{reason:adjNote,amount:Number(adjAmt)});setShowAdj(false);setAdjNote('');setAdjAmt('');}}
                  disabled={!adjNote||!adjAmt} style={{ fontSize:12, opacity:(!adjNote||!adjAmt)?0.5:1 }}>加入调整</button>
              </div>
            </div>
          )}

          <div style={{ padding:'10px 18px', borderTop:'1px solid var(--line)', display:'flex', gap:6, flexWrap:'wrap' }}>
            {inv.status==='draft' && <>
              <button className="secondary" onClick={()=>setShowAdj(true)} style={{ fontSize:12 }}>✏️ 调整</button>
              <button onClick={()=>onConfirm(inv.id)} style={{ fontSize:12, background:'var(--amber)', color:'#fff', border:'none', borderRadius:8, padding:'5px 16px', fontWeight:700, cursor:'pointer' }}>✅ 确认发给家长</button>
            </>}
            {(inv.status==='sent'||display==='overdue') && <>
              <button className="secondary" onClick={()=>setShowAdj(true)} style={{ fontSize:12 }}>✏️ 调整</button>
              {inv.reminderCount < 2
                ? <button className="secondary" onClick={()=>onSendReminder(inv.id)} style={{ fontSize:12 }}>📧 催缴（第{inv.reminderCount+1}次）</button>
                : <span style={{ fontSize:12, color:'var(--text-muted)' }}>已发2次提醒，请直接联络</span>
              }
              <button onClick={()=>onMarkPaid(inv.id)} style={{ fontSize:12, background:'var(--success)', color:'#fff', border:'none', borderRadius:8, padding:'5px 14px', fontWeight:700, cursor:'pointer' }}>💰 标记已收款</button>
            </>}
            {inv.status==='paid' && <span style={{ fontSize:13, color:'var(--success)', fontWeight:600 }}>✅ 已于 {inv.paidAt} 收款</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 简易Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:120, padding:'0 4px' }}>
      {data.map((d, i) => {
        const profit = d.revenue - d.payroll - d.other;
        const rPct   = (d.revenue / maxVal) * 100;
        const pPct   = ((d.payroll + d.other) / maxVal) * 100;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{ width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', height:100, gap:1 }}>
              <div title={`支出 $${d.payroll+d.other}`} style={{ width:'100%', height:`${pPct}%`, background:'#FDA4AF', borderRadius:'3px 3px 0 0', minHeight:2 }} />
              <div title={`收入 $${d.revenue}`} style={{ width:'100%', height:`${rPct-pPct}%`, background: profit>0?'var(--success)':'var(--error)', borderRadius:'3px 3px 0 0', minHeight:2 }} />
            </div>
            <div style={{ fontSize:9.5, color:'var(--text-muted)', textAlign:'center' }}>{d.month}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── 主页面 ─────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { user } = useAuth();
  const studioId = user?.instructorId || 'mira-piano';
  const [tab, setTab] = useState('runway');
  const [invoices, setInvoices] = useState(mockInvoices.filter(i=>i.studioId===studioId));
  const [invFilter, setInvFilter] = useState('all');

  // Invoice actions
  function confirmInvoice(id) { setInvoices(p=>p.map(i=>i.id===id?{...i,status:'sent',sentAt:new Date().toISOString().slice(0,10)}:i)); }
  function markPaid(id)       { setInvoices(p=>p.map(i=>i.id===id?{...i,status:'paid',paidAt:new Date().toISOString().slice(0,10)}:i)); }
  function sendReminder(id)   { setInvoices(p=>p.map(i=>i.id===id?{...i,reminderCount:i.reminderCount+1,lastReminderAt:new Date().toISOString().slice(0,10)}:i)); }
  function addAdjustment(id,adj) {
    setInvoices(p=>p.map(i=>{
      if(i.id!==id) return i;
      const adjs=[...(i.adjustments||[]),adj];
      return {...i,adjustments:adjs,total:i.subtotal+adjs.reduce((s,a)=>s+a.amount,0)};
    }));
  }

  // Derived stats
  const draftCount   = invoices.filter(i=>i.status==='draft').length;
  const overdueCount = invoices.filter(i=>i.status==='sent'&&i.dueDate<new Date().toISOString().slice(0,10)).length;
  const paidTotal    = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0);
  const pendingTotal = invoices.filter(i=>i.status!=='paid').reduce((s,i)=>s+i.total,0);

  const currentProfit = CURRENT_MONTH.revenue - CURRENT_MONTH.payroll - CURRENT_MONTH.other;
  const profitMargin  = Math.round(currentProfit / CURRENT_MONTH.revenue * 100);
  const prevMonth     = MONTHLY_DATA[MONTHLY_DATA.length-2];
  const prevProfit    = prevMonth.revenue - prevMonth.payroll - prevMonth.other;
  const profitChange  = currentProfit - prevProfit;

  const filteredInvoices = invoices.filter(i => {
    if (invFilter === 'all') return true;
    const isOverdue = i.status==='sent' && i.dueDate<new Date().toISOString().slice(0,10);
    return (isOverdue ? 'overdue' : i.status) === invFilter;
  });

  const TABS = [
    { key:'runway',   label:'📈 现金跑道' },
    { key:'pnl',      label:'📊 损益表' },
    { key:'invoices', label:`💰 收款/发票${draftCount>0?` (${draftCount})`:overdueCount>0?` ⚠️`:''}` },
    { key:'payroll',  label:'👩‍🏫 老师薪资' },
  ];

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">财务管理</h1></div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:24, borderBottom:'2px solid var(--line)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            padding:'10px 20px', fontSize:14, border:'none', background:'none', cursor:'pointer',
            borderBottom:`2px solid ${tab===t.key?'var(--amber)':'transparent'}`,
            marginBottom:-2, fontWeight:tab===t.key?700:400,
            color:tab===t.key?'var(--ink)':'var(--text-muted)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── 现金跑道 ── */}
      {tab === 'runway' && <CashRunwayTab />}
      {tab === 'pnl'    && <PnLTab />}
      {/* ── 收款/发票 ── */}
      {tab === 'invoices' && (
        <div>
          <div className="dash-grid" style={{ marginBottom:16 }}>
            <div className="dash-stat" style={{ border:draftCount>0?'1.5px solid var(--amber)':undefined }}>
              <div className="label">草稿待确认</div>
              <div className="num" style={{ color:'var(--amber)' }}>{draftCount}</div>
            </div>
            <div className="dash-stat" style={{ border:overdueCount>0?'1.5px solid var(--error)':undefined }}>
              <div className="label">逾期未缴</div>
              <div className="num" style={{ color:overdueCount>0?'var(--error)':'var(--text-muted)' }}>{overdueCount}</div>
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

          {draftCount > 0 && (
            <div style={{ padding:'10px 16px', background:'var(--warn-bg)', border:'1.5px solid var(--amber)', borderRadius:12, marginBottom:16, fontSize:13 }}>
              📝 有 <strong>{draftCount}</strong> 张草稿待确认后才会发给家长
            </div>
          )}

          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {[{k:'all',l:'全部'},{k:'draft',l:`草稿(${draftCount})`},{k:'sent',l:'已发出'},{k:'overdue',l:`逾期(${overdueCount})`},{k:'paid',l:'已缴'}].map(f => (
              <button key={f.k} onClick={()=>setInvFilter(f.k)} className={invFilter===f.k?'':'secondary'} style={{ fontSize:12, padding:'4px 12px' }}>{f.l}</button>
            ))}
          </div>

          <div style={{ fontSize:12, color:'var(--text-muted)', padding:'8px 12px', background:'var(--bg)', borderRadius:8, marginBottom:14, lineHeight:1.7 }}>
            💡 <strong>计算逻辑：</strong>月缴→固定金额（老师取消可减免）· 按堂→实际出席堂数 · 营期→报名时产生（含早鸟折扣）· 草稿需老师确认后才发给家长
          </div>

          {filteredInvoices.map(inv => (
            <InvoiceCard key={inv.id} inv={inv}
              onConfirm={confirmInvoice} onMarkPaid={markPaid}
              onSendReminder={sendReminder} onAdjust={addAdjustment} />
          ))}
        </div>
      )}

      {/* ── 老师薪资 ── */}
      {tab === 'payroll' && (
        <div>
          <div style={{ padding:'12px 16px', background:'#EEF2F7', border:'1px solid #4A6FA5', borderRadius:12, marginBottom:20, fontSize:13, color:'#4A6FA5' }}>
            💡 薪资规则在「老师管理」里为每位老师单独设定（按堂/收入分成/混合），这里显示本月计算结果。
          </div>
          <div className="dash-grid" style={{ marginBottom:20 }}>
            <div className="dash-stat"><div className="label">本月薪资总额</div><div className="num" style={{ color:'var(--error)' }}>${CURRENT_MONTH.payroll.toLocaleString()}</div></div>
            <div className="dash-stat"><div className="label">老师人数</div><div className="num">2</div></div>
            <div className="dash-stat"><div className="label">占总收入比</div><div className="num" style={{ color:'var(--warn)' }}>{Math.round(CURRENT_MONTH.payroll/CURRENT_MONTH.revenue*100)}%</div></div>
            <div className="dash-stat"><div className="label">已发薪</div><div className="num" style={{ color:'var(--success)' }}>0</div></div>
          </div>

          {[
            { name:'Mira Chen', title:'创办人/首席教师', type:'按堂计薪', sessions:24, rate:35, subtotal:840, bonus:0, total:840, paid:false },
            { name:'Sarah Lin', title:'钢琴教师', type:'收入分成 65%', sessions:16, rate:null, subtotal:560, bonus:0, total:560, paid:false },
          ].map((t,i) => (
            <div key={i} style={{ background:'var(--card)', border:'1px solid var(--line)', borderRadius:14, marginBottom:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{t.name}</div>
                  <div style={{ fontSize:12.5, color:'var(--text-muted)', marginTop:2 }}>{t.title} · {t.type}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, fontSize:20, color:'var(--ink)' }}>${t.total}</div>
                  {t.paid
                    ? <span style={{ fontSize:11, color:'var(--success)', fontWeight:600 }}>✅ 已发薪</span>
                    : <span style={{ fontSize:11, color:'var(--warn)', fontWeight:600 }}>⏳ 待发薪</span>
                  }
                </div>
              </div>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--line)' }}>
                <div style={{ display:'flex', gap:20, fontSize:13, color:'var(--text-muted)' }}>
                  <span>本月上课 {t.sessions} 堂</span>
                  {t.rate && <span>每堂 ${t.rate}</span>}
                  <span>小计 ${t.subtotal}</span>
                </div>
              </div>
              <div style={{ padding:'10px 20px', display:'flex', gap:8, alignItems:'center' }}>
                <button style={{ fontSize:12, padding:'5px 16px', background:'var(--success)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                  💸 确认发薪 ${t.total}
                </button>
                <button className="secondary" style={{ fontSize:12 }}>📋 查看明细</button>
                <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:'auto' }}>实际产品支援银行转账记录</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
