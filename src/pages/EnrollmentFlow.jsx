import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts, mockCourses, studioTeachers, instructors } from '../mockData';
import { useBookings } from '../context/BookingsContext';

// ── 根据Product模型决定显示哪种报名流程 ──────────────────────────────────────
function getFlowType(product) {
  if (!product) return 'unknown';
  const { scheduleModel, enrollmentModel, paymentModel, deliveryFormat } = product;
  if (paymentModel === 'invoice_after') return 'invoice';
  if (scheduleModel === 'camp') return 'camp';
  if (deliveryFormat === 'private' || enrollmentModel === 'credits') return 'private';
  if (enrollmentModel === 'seat' && paymentModel === 'monthly') return 'subscription';
  if (scheduleModel === 'semester' && enrollmentModel === 'seat') return 'semester';
  return 'semester'; // default
}

// ── 步骤进度条 ────────────────────────────────────────────────────────────────
function Steps({ steps, current }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1 }}>
          <div style={{
            height: 3, borderRadius: 99,
            background: i < current ? 'var(--amber)' : i === current ? 'rgba(186,117,23,0.35)' : 'var(--line)',
            marginBottom: 5,
          }} />
          <div style={{ fontSize: 11, color: i <= current ? 'var(--amber)' : 'var(--text-muted)', textAlign: 'center' }}>{s}</div>
        </div>
      ))}
    </div>
  );
}

// ── 信息行 ────────────────────────────────────────────────────────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--amber)' : 'var(--ink)' }}>{value}</span>
    </div>
  );
}

// ── 流程1：学期班 ─────────────────────────────────────────────────────────────
function SemesterFlow({ product, course, instructor, onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(product.slots?.[0]?.id || '');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const steps = ['课程详情', '选择班次', '孩子资料', '确认报名'];

  const slot = product.slots?.find(s => s.id === selectedSlot);
  const teacher = studioTeachers.find(t => t.id === product.primaryTeacherId);

  return (
    <div>
      <Steps steps={steps} current={step} />

      {step === 0 && (
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>{course?.description}</div>
            <InfoRow label="开课日期" value={product.termStartDate} />
            <InfoRow label="结课日期" value={product.termEndDate} />
            <InfoRow label="总堂数" value={`${product.termTotalSessions} 堂`} />
            <InfoRow label="适合年龄" value={`${course?.ageMin}-${course?.ageMax} 岁`} />
            <InfoRow label="主教老师" value={teacher?.name || '—'} />
            <InfoRow label="剩余名额" value={`${product.capacity - product.booked} / ${product.capacity} 位`} />
            <InfoRow label="学费" value={`$${product.price} / ${product.priceUnit}`} highlight />
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 10, fontSize: 13, color: 'var(--success)', marginBottom: 20 }}>
            ✓ 付款方式：报名时一次付清，课程期间不退款。
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>选择上课班次</div>
          {product.slots?.map(s => (
            <button key={s.id} onClick={() => setSelectedSlot(s.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '16px 18px', marginBottom: 10,
                background: selectedSlot === s.id ? '#FEF0E6' : 'var(--card)',
                border: `${selectedSlot === s.id ? '2px' : '1px'} solid ${selectedSlot === s.id ? 'var(--amber)' : 'var(--line)'}`,
                borderRadius: 12, cursor: s.seatsLeft === 0 ? 'not-allowed' : 'pointer',
                opacity: s.seatsLeft === 0 ? 0.5 : 1,
              }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.day} · {s.time}</div>
              <div style={{ fontSize: 13, color: s.seatsLeft === 0 ? 'var(--error)' : 'var(--success)' }}>
                {s.seatsLeft === 0 ? '已额满，可候补' : `剩余 ${s.seatsLeft} 个名额`}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 18 }}>孩子资料</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>孩子姓名 <span style={{ color: 'var(--error)' }}>*</span></div>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="例如：林小美" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>孩子年龄</div>
            <input type="number" value={childAge} onChange={e => setChildAge(e.target.value)} placeholder="例如：6" style={{ width: 100 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>家长 Email <span style={{ color: 'var(--error)' }}>*</span></div>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="your@email.com" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>确认报名</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <InfoRow label="课程" value={product.name} />
            <InfoRow label="班次" value={slot ? `${slot.day} · ${slot.time}` : '—'} />
            <InfoRow label="孩子" value={childName} />
            <InfoRow label="联络 Email" value={parentEmail} />
            <InfoRow label="应付金额" value={`$${product.price} / ${product.priceUnit}`} highlight />
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--warn-bg)', borderRadius: 10, fontSize: 13, color: 'var(--warn)', marginBottom: 16 }}>
            ⚠ Prototype 模式：点击「完成报名」会模拟完成报名，不会真正扣款。
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 12 }}>
        <button className="secondary" onClick={() => step > 0 ? setStep(s => s-1) : null}
          style={{ visibility: step === 0 ? 'hidden' : 'visible', padding: '9px 20px', fontSize: 14 }}>
          ← 上一步
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s+1)}
            disabled={step === 1 && !selectedSlot || step === 2 && (!childName || !parentEmail)}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            下一步 →
          </button>
        ) : (
          <button onClick={() => onComplete({ productId: product.id, slotId: selectedSlot, childName, parentEmail, status: 'pending_payment', paymentStatus: 'pending', studioId: product.studioId })}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            完成报名 ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ── 流程2：营队 ───────────────────────────────────────────────────────────────
function CampFlow({ product, course, onComplete }) {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [notes, setNotes] = useState('');
  const steps = ['营队详情', '孩子资料', '确认报名'];
  const teacher = studioTeachers.find(t => t.id === product.primaryTeacherId);
  const daysLeft = product.enrollmentDeadline
    ? Math.max(0, Math.ceil((new Date(product.enrollmentDeadline) - new Date()) / 86400000))
    : null;

  return (
    <div>
      <Steps steps={steps} current={step} />

      {step === 0 && (
        <div>
          {daysLeft !== null && daysLeft <= 7 && (
            <div style={{ padding: '10px 14px', background: 'var(--error-bg,#FCEBEB)', border: '1px solid var(--error)', borderRadius: 8, fontSize: 13, color: 'var(--error)', marginBottom: 14, fontWeight: 600 }}>
              ⏰ 报名截止还有 {daysLeft} 天（{product.enrollmentDeadline}）
            </div>
          )}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16 }}>{course?.description}</div>
            <InfoRow label="日期" value={`${product.termStartDate} – ${product.termEndDate}`} />
            <InfoRow label="每日时段" value={product.slots?.[0]?.time || '—'} />
            <InfoRow label="总天数" value={`${product.termTotalSessions} 天`} />
            <InfoRow label="适合年龄" value={`${course?.ageMin}-${course?.ageMax} 岁`} />
            <InfoRow label="授课老师" value={teacher?.name || '—'} />
            <InfoRow label="剩余名额" value={`${product.capacity - product.booked} / ${product.capacity} 位`} />
            <InfoRow label="费用" value={`$${product.price} / 整期`} highlight />
          </div>
          <div style={{ background: '#FEF0E6', border: '1px solid var(--amber)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#633806' }}>
            🏕 营队期间每天都有课，建议先确认孩子整个期间都有空。
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>孩子资料</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>孩子姓名 *</div>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="例如：林小美" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>家长 Email *</div>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>特殊需求或备注（选填）</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="例如：花生过敏、需要早接送..."
              style={{ width: '100%', fontFamily: 'inherit', fontSize: 14, padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--line)', resize: 'vertical', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>确认报名</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
            <InfoRow label="营队" value={product.name} />
            <InfoRow label="日期" value={`${product.termStartDate} – ${product.termEndDate}`} />
            <InfoRow label="孩子" value={childName} />
            <InfoRow label="联络 Email" value={parentEmail} />
            {notes && <InfoRow label="备注" value={notes} />}
            <InfoRow label="总费用" value={`$${product.price}`} highlight />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 12 }}>
        <button className="secondary" onClick={() => setStep(s => Math.max(0, s-1))}
          style={{ visibility: step === 0 ? 'hidden' : 'visible', padding: '9px 20px', fontSize: 14 }}>
          ← 上一步
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s+1)}
            disabled={step === 1 && (!childName || !parentEmail)}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            下一步 →
          </button>
        ) : (
          <button onClick={() => onComplete({ productId: product.id, childName, parentEmail, status: 'pending_payment', paymentStatus: 'pending', studioId: product.studioId })}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            完成报名 ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ── 流程3：私教预约 ───────────────────────────────────────────────────────────
function PrivateFlow({ product, course, onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [childName, setChildName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [level, setLevel] = useState('');
  const steps = ['老师 & 时段', '孩子程度', '确认预约'];
  const teacher = studioTeachers.find(t => t.id === product.primaryTeacherId);

  return (
    <div>
      <Steps steps={steps} current={step} />

      {step === 0 && (
        <div>
          {teacher && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 18px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 50, background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 20, flexShrink: 0 }}>
                {teacher.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{teacher.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{teacher.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>${product.price}/{product.priceUnit} · {product.paymentModel === 'monthly' ? '月结' : '按堂计费'}</div>
              </div>
            </div>
          )}
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>可用时段（选择固定每周时段）</div>
          {product.slots?.map(s => (
            <button key={s.id} onClick={() => s.seatsLeft > 0 && setSelectedSlot(s.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 8,
                background: selectedSlot === s.id ? '#FEF0E6' : 'var(--card)',
                border: `${selectedSlot === s.id ? '2px' : '1px'} solid ${selectedSlot === s.id ? 'var(--amber)' : 'var(--line)'}`,
                borderRadius: 10, cursor: s.seatsLeft === 0 ? 'not-allowed' : 'pointer',
                opacity: s.seatsLeft === 0 ? 0.4 : 1,
              }}>
              <span style={{ fontWeight: 600 }}>{s.day} · {s.time}</span>
              <span style={{ fontSize: 13, color: s.seatsLeft === 0 ? 'var(--error)' : 'var(--success)', marginLeft: 10 }}>
                {s.seatsLeft === 0 ? '已被预约' : '可预约'}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>孩子资料与程度</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>孩子姓名 *</div>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="例如：林小美" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>家长 Email *</div>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>目前程度（选填，帮助老师准备）</div>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="">请选择</option>
              <option value="beginner">完全初学，没有基础</option>
              <option value="some">有一点基础</option>
              <option value="intermediate">中级，学过一段时间</option>
              <option value="advanced">进阶，有考级经验</option>
            </select>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
            ℹ 提交后老师会在 1-2 个工作日内回复确认，时段正式确认后才开始计费。
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>确认预约</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <InfoRow label="老师" value={teacher?.name || '—'} />
            <InfoRow label="固定时段" value={product.slots?.find(s=>s.id===selectedSlot) ? `${product.slots.find(s=>s.id===selectedSlot).day} · ${product.slots.find(s=>s.id===selectedSlot).time}` : '—'} />
            <InfoRow label="孩子" value={childName} />
            <InfoRow label="收费" value={`$${product.price}/${product.priceUnit} · ${product.paymentModel === 'monthly' ? '月结' : '按堂'}`} highlight />
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--warn-bg)', borderRadius: 8, fontSize: 13, color: 'var(--warn)' }}>
            ⚠ 老师确认后才正式成立，确认前不会收费。
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 12 }}>
        <button className="secondary" onClick={() => setStep(s => Math.max(0, s-1))}
          style={{ visibility: step === 0 ? 'hidden' : 'visible', padding: '9px 20px', fontSize: 14 }}>
          ← 上一步
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s+1)}
            disabled={(step === 0 && !selectedSlot) || (step === 1 && (!childName || !parentEmail))}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            下一步 →
          </button>
        ) : (
          <button onClick={() => onComplete({ productId: product.id, slotId: selectedSlot, childName, parentEmail, status: 'pending_payment', paymentStatus: 'pending', studioId: product.studioId })}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            送出预约申请 ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ── 流程5：月付订阅 ───────────────────────────────────────────────────────────
function SubscriptionFlow({ product, course, onComplete }) {
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(product.slots?.[0]?.id || '');
  const [childName, setChildName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [agreed, setAgreed] = useState(false);
  const steps = ['方案详情', '孩子 & 时段', '付款确认'];

  return (
    <div>
      <Steps steps={steps} current={step} />

      {step === 0 && (
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16 }}>{course?.description}</div>
            <InfoRow label="每月费用" value={`$${product.price}/月`} highlight />
            <InfoRow label="付款日" value="每月1日自动扣款" />
            <InfoRow label="取消政策" value="提前30天通知即可取消" />
            <InfoRow label="暂停" value="每学期最多暂停1次" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '✓', label: '随时加入', sub: '无需等下学期' },
              { icon: '✓', label: '弹性取消', sub: '提前30天通知' },
              { icon: '✓', label: '固定时段', sub: '每周相同老师' },
              { icon: '✓', label: '月底对帐', sub: '自动发收据' },
            ].map(b => (
              <div key={b.label} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{b.icon} {b.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>孩子姓名 *</div>
            <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="例如：林小美" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>家长 Email *</div>
            <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>选择时段</div>
            {product.slots?.map(s => (
              <button key={s.id} onClick={() => setSelectedSlot(s.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', marginBottom: 8,
                  background: selectedSlot === s.id ? '#FEF0E6' : 'var(--card)',
                  border: `${selectedSlot === s.id ? '2px' : '1px'} solid ${selectedSlot === s.id ? 'var(--amber)' : 'var(--line)'}`,
                  borderRadius: 10, cursor: 'pointer',
                }}>
                <span style={{ fontWeight: 600 }}>{s.day} · {s.time}</span>
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>开始日期</div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <InfoRow label="方案" value={product.name} />
            <InfoRow label="孩子" value={childName} />
            <InfoRow label="时段" value={product.slots?.find(s=>s.id===selectedSlot)?.day || '—'} />
            <InfoRow label="开始日期" value={startDate || '—'} />
            <InfoRow label="每月费用" value={`$${product.price}`} highlight />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
            我了解每月自动扣款，且取消需提前30天通知。
          </label>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--line)', marginTop: 12 }}>
        <button className="secondary" onClick={() => setStep(s => Math.max(0, s-1))}
          style={{ visibility: step === 0 ? 'hidden' : 'visible', padding: '9px 20px', fontSize: 14 }}>← 上一步</button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(s => s+1)}
            disabled={step === 1 && (!childName || !parentEmail)}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            下一步 →
          </button>
        ) : (
          <button onClick={() => onComplete({ productId: product.id, childName, parentEmail, status: 'confirmed', paymentStatus: 'paid', studioId: product.studioId })}
            disabled={!agreed}
            style={{ padding: '9px 24px', fontSize: 14, fontWeight: 700, background: agreed ? 'var(--success)' : 'var(--line)', color: 'white', border: 'none', borderRadius: 10, cursor: agreed ? 'pointer' : 'not-allowed' }}>
            确认订阅 ✓
          </button>
        )}
      </div>
    </div>
  );
}

// ── 完成页面 ──────────────────────────────────────────────────────────────────
function SuccessPage({ product, flowType, navigate }) {
  const messages = {
    semester: { title: '报名成功！', body: '我们已收到您的报名，将在 1 个工作日内发送确认邮件及付款方式。' },
    camp:     { title: '营队报名成功！', body: '名额已为您保留，请在 3 天内完成付款以确保名额。' },
    private:  { title: '预约申请已送出！', body: '老师将在 1-2 个工作日内确认时段，请留意 Email 通知。' },
    subscription: { title: '订阅成功！', body: '您的月付方案已生效，首次扣款将于下月 1 日进行。' },
    invoice:  { title: '报名成功！', body: '课程完成后我们将发送账单，感谢您的信任。' },
  };
  const msg = messages[flowType] || messages.semester;

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <div style={{ fontWeight: 800, fontSize: 24, color: 'var(--ink)', marginBottom: 10 }}>{msg.title}</div>
      <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>{msg.body}</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/home')} style={{ padding: '10px 24px', fontSize: 14 }}>
          返回首页
        </button>
        <button onClick={() => navigate('/my-calendar')} style={{ padding: '10px 24px', fontSize: 14, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
          查看孩子课表
        </button>
      </div>
    </div>
  );
}

// ── 主组件：路由到对应流程 ────────────────────────────────────────────────────
export default function EnrollmentFlow() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addEnrollment } = useBookings();
  const [done, setDone] = useState(false);

  const product = mockProducts.find(p => p.id === productId);
  const course  = mockCourses.find(c => c.id === product?.courseId);
  const studio  = instructors.find(i => i.id === product?.studioId);

  const flowType = getFlowType(product);

  function handleComplete(enrollmentData) {
    addEnrollment({
      ...enrollmentData,
      id: `en-${Date.now()}`,
      childId: `c-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    setDone(true);
  }

  if (!product) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>😅</div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>找不到这个课程</div>
        <button onClick={() => navigate('/')} style={{ marginTop: 20 }}>返回搜寻</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page">
        <SuccessPage product={product} flowType={flowType} navigate={navigate} />
      </div>
    );
  }

  const flowTitles = {
    semester:     '报名课程',
    camp:         '报名营队',
    private:      '预约私教',
    credits:      '购买点数',
    subscription: '订阅课程',
    invoice:      '报名课程',
  };

  return (
    <div className="page">
      {/* 面包屑 */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <button onClick={() => navigate(`/school/${product.studioId}`)}
          style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', padding: 0, fontSize: 13 }}>
          {studio?.name}
        </button>
        <span style={{ margin: '0 6px' }}>›</span>
        <span>{flowTitles[flowType]}</span>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{flowTitles[flowType]}</h1>

        {flowType === 'semester'     && <SemesterFlow product={product} course={course} instructor={studio} onComplete={handleComplete} />}
        {flowType === 'camp'         && <CampFlow product={product} course={course} onComplete={handleComplete} />}
        {flowType === 'private'      && <PrivateFlow product={product} course={course} onComplete={handleComplete} />}
        {flowType === 'subscription' && <SubscriptionFlow product={product} course={course} onComplete={handleComplete} />}
        {(flowType === 'invoice' || flowType === 'credits') && <SemesterFlow product={product} course={course} instructor={studio} onComplete={handleComplete} />}
      </div>
    </div>
  );
}
