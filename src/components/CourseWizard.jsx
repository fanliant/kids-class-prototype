import React, { useState } from 'react';
import { studioTeachers } from '../mockData';

const STEPS = ['duration', 'format', 'schedule', 'payment', 'details', 'review'];

const STEP_TITLES = {
  duration: '这门课的上课时间是？',
  format:   '教学形式是？',
  schedule: '课程如何安排时间？',
  payment:  '收款方式是？',
  details:  '填写课程详情',
  review:   '确认并发布',
};

const defaultState = {
  durationType: null,
  format: null,
  scheduleType: null,
  paymentModel: null,
  title: '',
  description: '',
  ageRange: '',
  startDate: '',
  endDate: '',
  totalSessions: '',
  capacity: '',
  enrollmentMode: 'cohort',
  price: '',
  primaryTeacherId: '',
  status: 'published',
  days: [],
  startTime: '',
  endTime: '',
  allowsMakeup: true,
};

function ChoiceCard({ icon, title, desc, examples, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? '#FEF0E6' : 'var(--card)',
      border: `${selected ? '2px' : '1px'} solid ${selected ? 'var(--amber)' : 'var(--line)'}`,
      borderRadius: 14, padding: '18px 20px', cursor: 'pointer', textAlign: 'left',
      width: '100%', transition: 'border-color 0.15s',
    }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 5 }}>{title}</div>
      {desc && <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>}
      {examples && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {examples.map((e) => (
            <span key={e} style={{ fontSize: 11.5, background: 'var(--bg)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--line)' }}>{e}</span>
          ))}
        </div>
      )}
    </button>
  );
}

function InlineChoice({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13.5, cursor: 'pointer',
            background: value === o.value ? 'var(--amber)' : 'var(--card)',
            color: value === o.value ? 'white' : 'var(--ink)',
            border: `1px solid ${value === o.value ? 'var(--amber)' : 'var(--line)'}`,
            fontWeight: value === o.value ? 700 : 400,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, sub, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: sub ? 2 : 0 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function StepDuration({ data, set }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <ChoiceCard
        icon="📅" title="固定期限"
        desc="有开始日和结束日，学生一起入学。"
        examples={['学期课', '暑期营', '工作坊', '冬令营']}
        selected={data.durationType === 'fixed'}
        onClick={() => set('durationType', 'fixed')}
      />
      <ChoiceCard
        icon="♾️" title="持续进行"
        desc="没有结束日，学生可随时加入、持续上课。"
        examples={['钢琴私教', '游泳课', '补习', '舞蹈课']}
        selected={data.durationType === 'ongoing'}
        onClick={() => set('durationType', 'ongoing')}
      />
    </div>
  );
}

function StepFormat({ data, set }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <ChoiceCard
        icon="👥" title="团体课"
        desc="多位学生一起上课，有固定时段。"
        selected={data.format === 'group'}
        onClick={() => set('format', 'group')}
      />
      <ChoiceCard
        icon="🎯" title="一对一私教"
        desc="每堂课只有一位学生，时间灵活。"
        selected={data.format === 'private'}
        onClick={() => set('format', 'private')}
      />
    </div>
  );
}

const DAYS = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
const DAY_SHORT = ['一','二','三','四','五','六','日'];

function StepSchedule({ data, set }) {
  const scheduleOpts = data.format === 'private'
    ? [
        { value: 'flexible',      icon: '⚙️', title: '弹性排课', desc: '老师手动安排每堂课的时间。' },
        { value: 'parent_booked', icon: '📲', title: '家长自行预约', desc: '家长从你的空档中选择时段。' },
      ]
    : [
        { value: 'fixed_weekly', icon: '🔁', title: '固定每周时段', desc: '每周固定的上课日和时间。' },
        { value: 'flexible',     icon: '⚙️', title: '弹性排课', desc: '老师手动安排每堂课的时间。' },
      ];

  const toggleDay = (day) => {
    const days = data.days.includes(day)
      ? data.days.filter((d) => d !== day)
      : [...data.days, day];
    set('days', days);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {scheduleOpts.map((o) => (
          <ChoiceCard key={o.value}
            icon={o.icon} title={o.title} desc={o.desc}
            selected={data.scheduleType === o.value}
            onClick={() => set('scheduleType', o.value)}
          />
        ))}
      </div>

      {data.scheduleType === 'fixed_weekly' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}>
          <Field label="上课日" sub="可以选多天">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => toggleDay(day)}
                  style={{
                    width: 44, height: 44, borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: data.days.includes(day) ? 'var(--amber)' : 'var(--bg)',
                    color: data.days.includes(day) ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${data.days.includes(day) ? 'var(--amber)' : 'var(--line)'}`,
                  }}>
                  {DAY_SHORT[i]}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="开始时间">
              <input type="time" value={data.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </Field>
            <Field label="结束时间">
              <input type="time" value={data.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function StepPayment({ data, set }) {
  const opts = data.durationType === 'fixed'
    ? [
        { value: 'upfront',       icon: '💳', title: '预收全期学费', desc: '报名时一次付清，适合学期课和营队。', tag: '最常见', unit: '期' },
        { value: 'monthly',       icon: '📅', title: '月结', desc: '每月收一次费用。', unit: '月' },
        { value: 'invoice_after', icon: '🧾', title: '上课后开账单', desc: '上完课后再发账单。', unit: '堂' },
      ]
    : [
        { value: 'monthly',    icon: '📅', title: '月结', desc: '每月初或月末收费。', tag: '最常见', unit: '月' },
        { value: 'per_lesson', icon: '🪙', title: '按堂计费', desc: '每堂课单独收费。', unit: '堂' },
        { value: 'invoice_after', icon: '🧾', title: '上课后开账单', desc: '上完课后再发账单。', unit: '堂' },
      ];

  const selectedOpt = opts.find((o) => o.value === data.paymentModel);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {opts.map((o) => {
          const isSel = data.paymentModel === o.value;
          return (
            <button key={o.value} onClick={() => set('paymentModel', o.value)}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 18px',
                background: isSel ? '#FEF0E6' : 'var(--card)',
                border: `${isSel ? '2px' : '1px'} solid ${isSel ? 'var(--amber)' : 'var(--line)'}`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{ width: 20, height: 20, borderRadius: 50, border: `2px solid ${isSel ? 'var(--amber)' : 'var(--line)'}`, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSel && <div style={{ width: 10, height: 10, borderRadius: 50, background: 'var(--amber)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{o.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{o.title}</span>
                  {o.tag && <span style={{ fontSize: 11.5, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{o.tag}</span>}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{o.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedOpt && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>定价</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="价格（$）">
              <input type="number" min="0" value={data.price} onChange={(e) => set('price', e.target.value)} placeholder="例如：220" />
            </Field>
            <Field label="单位">
              <input type="text" value={`/ ${selectedOpt.unit}`} readOnly style={{ color: 'var(--text-muted)' }} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDetails({ data, set, instructorId }) {
  const myTeachers = studioTeachers.filter((t) => t.studioId === instructorId);
  const isFixed = data.durationType === 'fixed';
  const isGroup = data.format === 'group';

  return (
    <div>
      <Field label="课程名称">
        <input type="text" value={data.title} onChange={(e) => set('title', e.target.value)} placeholder="例如：JMC1 入门钢琴" />
      </Field>

      <Field label="适合年龄" sub="这门课是给哪个年龄层的？">
        <input type="text" value={data.ageRange} onChange={(e) => set('ageRange', e.target.value)} placeholder="例如：4-8 岁" />
      </Field>

      {isFixed && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 14 }}>学期日期</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="开课日期">
              <input type="date" value={data.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </Field>
            <Field label="结课日期">
              <input type="date" value={data.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </Field>
          </div>
          <Field label="总堂数">
            <input type="number" min="1" value={data.totalSessions} onChange={(e) => set('totalSessions', e.target.value)} placeholder="例如：16" style={{ width: 120 }} />
          </Field>
        </div>
      )}

      {isGroup && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 14 }}>招生设定</div>
          <Field label="最大容量" sub="这门课最多几位学生？">
            <input type="number" min="1" value={data.capacity} onChange={(e) => set('capacity', e.target.value)} placeholder="例如：8" style={{ width: 120 }} />
          </Field>
          <Field label="报名方式">
            <InlineChoice
              options={[
                { value: 'cohort', label: '学期制（一起开始）' },
                { value: 'open',   label: '随时报名' },
              ]}
              value={data.enrollmentMode}
              onChange={(v) => set('enrollmentMode', v)}
            />
          </Field>
          <Field label="是否支持补课？">
            <InlineChoice
              options={[
                { value: 'yes', label: '支持补课' },
                { value: 'no',  label: '不支持补课' },
              ]}
              value={data.allowsMakeup ? 'yes' : 'no'}
              onChange={(v) => set('allowsMakeup', v === 'yes')}
            />
          </Field>
        </div>
      )}

      <Field label="主教老师">
        <select value={data.primaryTeacherId} onChange={(e) => set('primaryTeacherId', e.target.value)}>
          <option value="">请选择老师</option>
          {myTeachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Field>

      <Field label="上架状态">
        <InlineChoice
          options={[
            { value: 'published', label: '公开招生' },
            { value: 'draft',     label: '草稿（不公开）' },
          ]}
          value={data.status}
          onChange={(v) => set('status', v)}
        />
      </Field>
    </div>
  );
}

function ReviewRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: color || 'var(--ink)' }}>{value || '—'}</span>
    </div>
  );
}

function StepReview({ data, instructorId }) {
  const teacher = studioTeachers.find((t) => t.id === data.primaryTeacherId);
  const paymentLabel = {
    upfront: '预收全期学费',
    monthly: '月结',
    per_lesson: '按堂计费',
    invoice_after: '上课后开账单',
  }[data.paymentModel];

  const priceUnit = {
    upfront: '期', monthly: '月', per_lesson: '堂', invoice_after: '堂',
  }[data.paymentModel];

  const schedule = data.scheduleType === 'fixed_weekly' && data.days.length
    ? `${data.days.join('、')} ${data.startTime}–${data.endTime}`
    : data.scheduleType === 'flexible' ? '弹性排课' : '家长自行预约';

  const formatLabel = data.format === 'group' ? '团体课' : '一对一私教';
  const durationLabel = data.durationType === 'fixed' ? '固定期限' : '持续进行';

  return (
    <div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--ink)', marginBottom: 18 }}>{data.title || '（未填课程名称）'}</div>
        <ReviewRow label="课程类型" value={durationLabel} />
        <ReviewRow label="教学形式" value={formatLabel} />
        <ReviewRow label="时间安排" value={schedule} />
        <ReviewRow label="收款方式" value={paymentLabel} />
        <ReviewRow label="价格" value={`$${data.price} / ${priceUnit}`} color="var(--success)" />
        {data.durationType === 'fixed' && <ReviewRow label="上课日期" value={`${data.startDate} → ${data.endDate}`} />}
        {data.durationType === 'fixed' && data.totalSessions && <ReviewRow label="总堂数" value={`${data.totalSessions} 堂`} />}
        {data.format === 'group' && <ReviewRow label="最大容量" value={`${data.capacity} 位学生`} />}
        {data.ageRange && <ReviewRow label="适合年龄" value={data.ageRange} />}
        <ReviewRow label="主教老师" value={teacher?.name} />
        <ReviewRow label="上架状态" value={data.status === 'published' ? '公开招生' : '草稿'} color={data.status === 'published' ? 'var(--success)' : 'var(--text-muted)'} />
      </div>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{
          flex: 1, height: 4, borderRadius: 99,
          background: i < step ? 'var(--amber)' : i === step ? 'rgba(210,130,0,0.3)' : 'var(--line)',
          transition: 'background 0.25s',
        }} />
      ))}
    </div>
  );
}

export default function CourseWizard({ instructorId, onSaved, onCancel }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState({ ...defaultState });

  function set(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed() {
    const step = STEPS[stepIdx];
    if (step === 'duration') return !!data.durationType;
    if (step === 'format')   return !!data.format;
    if (step === 'schedule') {
      if (!data.scheduleType) return false;
      if (data.scheduleType === 'fixed_weekly') return data.days.length > 0 && !!data.startTime && !!data.endTime;
      return true;
    }
    if (step === 'payment') return !!data.paymentModel && !!data.price;
    if (step === 'details') return !!data.title && !!data.ageRange;
    return true;
  }

  function buildCourse() {
    const billingTiming = {
      upfront: 'prepay', monthly: 'monthly', per_lesson: 'monthly', invoice_after: 'post_term',
    }[data.paymentModel] || 'prepay';

    const slots = data.scheduleType === 'fixed_weekly'
      ? data.days.map((day, i) => ({
          id: `s-${Date.now()}-${i}`,
          day,
          time: `${data.startTime}–${data.endTime}`,
          seatsLeft: Number(data.capacity) || 1,
        }))
      : [];

    return {
      id: `course-${Date.now()}`,
      instructorId,
      title: data.title,
      description: data.description,
      ageRange: data.ageRange,
      classType: data.format === 'private' ? 'one_on_one' : 'group',
      scheduleMode: data.durationType === 'fixed' ? 'semester' : 'ongoing',
      durationType: data.durationType,
      scheduleType: data.scheduleType,
      primaryTeacherId: data.primaryTeacherId,
      capacity: data.format === 'private' ? 1 : Number(data.capacity) || 0,
      booked: 0,
      price: Number(data.price) || 0,
      priceUnit: data.paymentModel === 'upfront' ? '期' : data.paymentModel === 'monthly' ? '月' : '次',
      billingTiming,
      paymentModel: data.paymentModel,
      termStartDate: data.startDate || null,
      termEndDate: data.endDate || null,
      termTotalSessions: data.totalSessions ? Number(data.totalSessions) : null,
      enrollmentMode: data.enrollmentMode,
      allowsMakeup: data.allowsMakeup,
      status: data.status,
      slots,
      createdAt: new Date().toISOString(),
      levelIndex: 99,
    };
  }

  function handleSave(status) {
    const course = buildCourse();
    course.status = status;
    onSaved(course);
  }

  const currentStep = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>
              第 {stepIdx + 1} 步，共 {STEPS.length} 步
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              {STEP_TITLES[currentStep]}
            </h2>
          </div>
          <button className="secondary" onClick={onCancel} style={{ fontSize: 13, padding: '6px 14px' }}>
            取消
          </button>
        </div>
        <ProgressBar step={stepIdx} />
      </div>

      <div style={{ marginBottom: 32 }}>
        {currentStep === 'duration' && <StepDuration data={data} set={set} />}
        {currentStep === 'format'   && <StepFormat data={data} set={set} />}
        {currentStep === 'schedule' && <StepSchedule data={data} set={set} />}
        {currentStep === 'payment'  && <StepPayment data={data} set={set} />}
        {currentStep === 'details'  && <StepDetails data={data} set={set} instructorId={instructorId} />}
        {currentStep === 'review'   && <StepReview data={data} instructorId={instructorId} />}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
        <button className="secondary" onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          style={{ fontSize: 14, padding: '9px 20px', visibility: stepIdx === 0 ? 'hidden' : 'visible' }}>
          ← 上一步
        </button>

        {isLast ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="secondary" onClick={() => handleSave('draft')}
              style={{ fontSize: 14, padding: '9px 20px' }}>
              存为草稿
            </button>
            <button onClick={() => handleSave('published')}
              style={{ fontSize: 14, padding: '9px 24px', background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
              发布课程 ✓
            </button>
          </div>
        ) : (
          <button onClick={() => setStepIdx((i) => i + 1)} disabled={!canProceed()}
            style={{
              fontSize: 14, padding: '9px 24px', borderRadius: 10, fontWeight: 700,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              background: canProceed() ? 'var(--ink)' : 'var(--line)',
              color: canProceed() ? 'white' : 'var(--text-muted)',
              border: 'none', transition: 'background 0.15s',
            }}>
            下一步 →
          </button>
        )}
      </div>
    </div>
  );
}
