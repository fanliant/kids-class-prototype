import React, { useState } from 'react';
import { useCourses } from '../context/CoursesContext';
import { studioTeachers } from '../mockData';

const WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

function emptySlot() {
  return { id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, day: '星期二', startTime: '16:00', endTime: '16:30' };
}

export default function CourseForm({ instructorId, existingCourse, otherCourses, onSaved, onCancel }) {
  const { addCourse, updateCourse } = useCourses();
  const isEdit = Boolean(existingCourse);
  const availableTeachers = studioTeachers.filter((t) => t.studioId === instructorId);

  const [title, setTitle] = useState(existingCourse?.title || '');
  const [ageMin, setAgeMin] = useState(existingCourse ? parseAgeRange(existingCourse.ageRange).min : '');
  const [ageMax, setAgeMax] = useState(existingCourse ? parseAgeRange(existingCourse.ageRange).max : '');
  const [classType, setClassType] = useState(existingCourse?.classType || 'group');
  const [capacity, setCapacity] = useState(existingCourse?.capacity ?? 4);
  const [duration, setDuration] = useState(existingCourse?.duration ?? 45);
  const [price, setPrice] = useState(existingCourse?.price ?? '');
  const [priceUnit, setPriceUnit] = useState(existingCourse?.priceUnit || 'monthly_label');
  const [materialsFee, setMaterialsFee] = useState(existingCourse?.materialsFee ?? '');
  const [description, setDescription] = useState(existingCourse?.description || '');
  const [prerequisiteCourseId, setPrerequisiteCourseId] = useState(existingCourse?.prerequisiteCourseId || '');
  const [primaryTeacherId, setPrimaryTeacherId] = useState(existingCourse?.primaryTeacherId || '');
  const [track, setTrack] = useState(existingCourse?.track || '');
  const [sequenceOrder, setSequenceOrder] = useState(existingCourse?.sequenceOrder ?? '');
  const [allowsMakeup, setAllowsMakeup] = useState(existingCourse?.allowsMakeup ?? true);
  const [billingTiming, setBillingTiming] = useState(existingCourse?.billingTiming || 'prepay');
  const [cancellationPolicy, setCancellationPolicy] = useState(existingCourse?.cancellationPolicy || '');
  const [googleClassroomUrl, setGoogleClassroomUrl] = useState(existingCourse?.googleClassroomUrl || '');
  const [status, setStatus] = useState(existingCourse?.status || 'draft');
  const [scheduleMode, setScheduleMode] = useState(existingCourse?.scheduleMode || 'semester');
  const [termStartDate, setTermStartDate] = useState(existingCourse?.termStartDate || '');
  const [termEndDate, setTermEndDate] = useState(existingCourse?.termEndDate || '');
  const [termTotalSessions, setTermTotalSessions] = useState(existingCourse?.termTotalSessions ?? '');
  const [enrollmentDeadline, setEnrollmentDeadline] = useState(existingCourse?.enrollmentDeadline || '');
  const [enrollmentMode, setEnrollmentMode] = useState(existingCourse?.enrollmentMode || 'open');
  const [slots, setSlots] = useState(
    existingCourse?.slots?.map((s) => {
      const [startTime, endTime] = s.time.split('–');
      return { id: s.id, day: s.day, startTime, endTime };
    }) || [emptySlot()]
  );
  const [error, setError] = useState('');

  function updateSlot(index, field, value) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addSlotRow() {
    setSlots((prev) => [...prev, emptySlot()]);
  }

  function removeSlotRow(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title || !ageMin || !ageMax || !duration || !price || slots.length === 0) {
      setError('请完整填写课程名称、年龄范围、时长、价格,并至少保留一个开课时段。');
      return;
    }

    const formattedSlots = slots.map((s) => ({
      id: s.id,
      day: s.day,
      time: `${s.startTime}–${s.endTime}`,
      seatsLeft: isEdit
        ? existingCourse.slots.find((es) => es.id === s.id)?.seatsLeft ?? Number(capacity)
        : Number(capacity),
    }));

    const coursePayload = {
      id: existingCourse?.id || `course-new-${Date.now()}`,
      instructorId,
      title,
      ageRange: `${ageMin}-${ageMax}歲`,
      classType,
      capacity: Number(capacity),
      booked: existingCourse?.booked ?? 0,
      duration: Number(duration),
      price: Number(price),
      priceUnit,
      materialsFee: materialsFee ? Number(materialsFee) : 0,
      description,
      prerequisiteCourseId: prerequisiteCourseId || null,
      primaryTeacherId: primaryTeacherId || null,
      track: track || null,
      sequenceOrder: sequenceOrder ? Number(sequenceOrder) : null,
      allowsMakeup,
      billingTiming,
      cancellationPolicy,
      googleClassroomUrl: googleClassroomUrl || null,
      status,
      scheduleMode,
      enrollmentMode,
      termStartDate: termStartDate || null,
      termEndDate: scheduleMode !== 'ongoing' ? (termEndDate || null) : null,
      termTotalSessions: scheduleMode === 'semester' ? (termTotalSessions ? Number(termTotalSessions) : null) : null,
      enrollmentDeadline: scheduleMode === 'workshop' ? (enrollmentDeadline || null) : null,
      levelIndex: sequenceOrder ? Number(sequenceOrder) : existingCourse?.levelIndex ?? 1,
      slots: formattedSlots,
    };

    if (isEdit) {
      updateCourse(existingCourse.id, coursePayload);
    } else {
      addCourse(coursePayload);
    }
    onSaved(coursePayload);
  }

  return (
    <form onSubmit={handleSubmit} className="flow-card" style={{ maxWidth: 640 }}>
      <h2 style={{ marginBottom: 4 }}>{isEdit ? '编辑课程' : '新增课程'}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 18 }}>
        填写完整资讯后,这门课会出现在搜寻页与您的课程列表中(依下方「上架状态」决定是否公开)。
      </p>

      {error && <div className="banner banner-error">{error}</div>}

      <label>
        课程名称
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如:JMC1 入门钢琴" />
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          适合年龄(最小)
          <input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="4" />
        </label>
        <label style={{ flex: 1 }}>
          适合年龄(最大)
          <input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="6" />
        </label>
      </div>

      <label>
        课程类型
        <select value={classType} onChange={(e) => setClassType(e.target.value)}>
          <option value="group">团体课</option>
          <option value="one_on_one">一对一</option>
          <option value="small_group">一对多(小组课)</option>
        </select>
      </label>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          每个时段容量(人)
          <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </label>
        <label style={{ flex: 1 }}>
          每堂课时长(分钟)
          <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="45" />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          价格
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="220" />
        </label>
        <label style={{ flex: 1 }}>
          计价方式
          <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)}>
            <option value="per_session">每堂</option>
            <option value="monthly">每月</option>
            <option value="per_term">每期</option>
          </select>
        </label>
        <label style={{ flex: 1 }}>
          教材费(选填)
          <input type="number" min="0" value={materialsFee} onChange={(e) => setMaterialsFee(e.target.value)} placeholder="0" />
        </label>
      </div>

      <label>
        课程内容介绍
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ fontFamily: 'inherit', fontSize: 14.5, padding: 10, borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--text)' }}
          placeholder="这门课会教什么、用什么方式教学..."
        />
      </label>

      <div className="level-track-box" style={{ marginBottom: 18 }}>\n        <div className="level-track-title">课程系列与先修关系(选填,用于自动判断学生该上哪一级)</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <label style={{ flex: 1, marginBottom: 0 }}>
            系列名称
            <input value={track} onChange={(e) => setTrack(e.target.value)} placeholder="例如:钢琴主修路径" />
          </label>
          <label style={{ flex: 1, marginBottom: 0 }}>
            在系列中的级别
            <input type="number" min="1" value={sequenceOrder} onChange={(e) => setSequenceOrder(e.target.value)} placeholder="例如:1" />
          </label>
        </div>
        <label style={{ marginBottom: 0 }}>
          先修课程(学生需先完成哪门课才能报这门)
          <select value={prerequisiteCourseId} onChange={(e) => setPrerequisiteCourseId(e.target.value)}>
            <option value="">无,这是入门课程</option>
            {(otherCourses || []).map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
      </div>

      {availableTeachers.length > 0 && (
        <label>
          主授课老师
          <select value={primaryTeacherId} onChange={(e) => setPrimaryTeacherId(e.target.value)}>
            <option value="">请选择主授课老师</option>
            {availableTeachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        是否支援补课
        <select value={allowsMakeup ? 'yes' : 'no'} onChange={(e) => setAllowsMakeup(e.target.value === 'yes')}>
          <option value="yes">支援补课</option>
          <option value="no">不支援补课</option>
        </select>
      </label>

      <label>
        收款时机
        <select value={billingTiming} onChange={(e) => setBillingTiming(e.target.value)}>
          <option value="prepay">预收（报名时立即开账单，适合学期制、暑期营）</option>
          <option value="monthly">月结（每月底系统提醒开账单，适合一对一、持续月付）</option>
          <option value="post_term">学期结束后结算（适合按堂计费的长期课程）</option>
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
          {billingTiming === 'prepay' && '家长报名后立即显示为「待付款」，Owner确认收款后结案。'}
          {billingTiming === 'monthly' && '每月底Owner点「本月结算」，系统才会开账单给该月的课。'}
          {billingTiming === 'post_term' && '学期全部上完后Owner手动结算，适合上完才确认堂数的课。'}
        </span>
      </label>

      <div className="level-track-box" style={{ marginBottom: 18 }}>
        <div className="level-track-title">Google Classroom 连结(选填)</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '4px 0 10px' }}>
          如果您已经在 Google Classroom 建立了这门课的班级,贴上连结后,学生家长可以在课程页面一键进入 Google Classroom 互动(作业、留言、教材等)。平台本身不介入 Google Classroom 的内容管理。
        </p>
        <label style={{ marginBottom: 0 }}>
          Google Classroom 课程连结
          <input
            value={googleClassroomUrl}
            onChange={(e) => setGoogleClassroomUrl(e.target.value)}
            placeholder="https://classroom.google.com/c/..."
          />
        </label>
      </div>

      <label>
        取消/补课政策说明(选填,会显示给家长)
        <textarea
          value={cancellationPolicy}
          onChange={(e) => setCancellationPolicy(e.target.value)}
          rows={2}
          style={{ fontFamily: 'inherit', fontSize: 14.5, padding: 10, borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', color: 'var(--text)' }}
          placeholder="例如:请假需提前24小时告知,当月可补课一次"
        />
      </label>

      <div className="level-track-box" style={{ marginBottom: 18 }}>
        <div className="level-track-title">排课模式与日期设定</div>
        <label style={{ marginBottom: 12 }}>
          排课模式
          <select value={scheduleMode} onChange={(e) => setScheduleMode(e.target.value)}>
            <option value="semester">学期制(固定开始日与结束日,如秋季班、春季班)</option>
            <option value="ongoing">持续月付制(有开始日,无固定结束,如一对一长期课)</option>
            <option value="workshop">工作坊/密集班(短期,有明确开始与结束日)</option>
          </select>
        </label>

        {/* 学期制 */}
        {scheduleMode === 'semester' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              学期开始日
              <input type="date" value={termStartDate} onChange={(e) => setTermStartDate(e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              学期结束日
              <input type="date" value={termEndDate} onChange={(e) => setTermEndDate(e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              本学期总堂数(选填,用于显示进度)
              <input type="number" min="1" value={termTotalSessions} onChange={(e) => setTermTotalSessions(e.target.value)} placeholder="例如:12" />
            </label>
          </div>
        )}

        {/* 持续月付制 */}
        {scheduleMode === 'ongoing' && (
          <div>
            <div className="banner banner-info" style={{ marginBottom: 10 }}>
              持续月付制没有固定结束日——学生每月续费,随时可以停止报名。只需要填最早可开始上课的日期。
            </div>
            <label style={{ marginBottom: 0 }}>
              最早开课日(报名后何时可以开始上课)
              <input type="date" value={termStartDate} onChange={(e) => setTermStartDate(e.target.value)} />
            </label>
          </div>
        )}

        {/* 工作坊/密集班 */}
        {scheduleMode === 'workshop' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              活动开始日
              <input type="date" value={termStartDate} onChange={(e) => setTermStartDate(e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              活动结束日
              <input type="date" value={termEndDate} onChange={(e) => setTermEndDate(e.target.value)} />
            </label>
            <label style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              报名截止日
              <input type="date" value={enrollmentDeadline} onChange={(e) => setEnrollmentDeadline(e.target.value)} />
            </label>
          </div>
        )}
      </div>

      <label>
        名额开放方式
        <select value={enrollmentMode} onChange={(e) => setEnrollmentMode(e.target.value)}>
          <option value="open">开放抢名额(符合条件的家长都可以自行报名)</option>
          <option value="instructor_managed">老师指定学生(由老师决定谁能加入,不对外开放)</option>
        </select>
      </label>

      <label>
        上架状态
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">草稿(暂不公开)</option>
          <option value="published">公开招生</option>
        </select>
      </label>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>开课时段</div>
        {slots.map((slot, i) => (
          <div key={slot.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)} style={{ width: 100 }}>
              {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)} />
            <span style={{ color: 'var(--text-muted)' }}>至</span>
            <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)} />
            {slots.length > 1 && (
              <button type="button" className="secondary" onClick={() => removeSlotRow(i)} style={{ padding: '6px 10px', fontSize: 12 }}>
                移除
              </button>
            )}
          </div>
        ))}
        <button type="button" className="secondary" onClick={addSlotRow} style={{ fontSize: 13 }}>+ 新增时段</button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="secondary" onClick={onCancel}>取消</button>
        <button type="submit" className="full">{isEdit ? '储存变更' : '建立课程'}</button>
      </div>
    </form>
  );
}

function parseAgeRange(ageRange) {
  const match = ageRange.replace('歲', '').replace('歳', '').split('-');
  return { min: match[0] || '', max: match[1] || '' };
}
