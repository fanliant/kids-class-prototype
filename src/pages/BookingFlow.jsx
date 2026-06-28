import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructors } from '../mockData';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingsContext';
import { useCourses } from '../context/CoursesContext';

const STEP_LABELS = ['选孩子', '确认时段', '课程资讯', '付款方式', '完成'];

export default function BookingFlow() {
  const { instructorId, classId, slotId } = useParams();
  const { parent, addChild, requireAuth } = useAuth();
  const { addBooking } = useBookings();
  const { getCoursesByInstructor } = useCourses();
  const instructor = instructors.find((i) => i.id === instructorId);
  const instructorClasses = instructor ? getCoursesByInstructor(instructor.id) : [];
  const initialClass = instructorClasses.find((c) => c.id === classId);
  const initialSlot = initialClass?.slots.find((s) => s.id === slotId);

  const [step, setStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');

  // 目前選定的課程/時段,可以在Step2換成同一位老師的其他班/其他時段
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);

  const [paymentMethod, setPaymentMethod] = useState('venmo');
  const [referenceNote, setReferenceNote] = useState('');
  const [result, setResult] = useState(null);

  // 直接用網址進這個頁面(例如重新整理)時,如果還沒登入,也要先擋下來要求登入
  useEffect(() => {
    if (!parent) {
      requireAuth(() => {});
    }
  }, [parent]);

  if (!instructor || !initialClass || !initialSlot) {
    return <div className="page">找不到这个时段,可能已被下架。</div>;
  }

  if (!parent) {
    return (
      <div className="page" style={{ maxWidth: 640 }}>
        <div className="flow-card">
          <h2 style={{ marginBottom: 8 }}>请先登入</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            报名课程前,需要先建立或登入家长帐号,才能管理孩子档案与报名纪录。
          </p>
        </div>
      </div>
    );
  }

  function pickChild(child) {
    setSelectedChild(child);
    setReferenceNote(`${child.name} ${selectedClass.title}`);
  }

  function handleAddChild() {
    if (!newChildName || !newChildAge) return;
    const newChild = {
      id: `child-new-${Date.now()}`,
      name: newChildName,
      age: Number(newChildAge),
      completedLevels: {},
    };
    addChild(newChild);
    pickChild(newChild);
    setShowAddChild(false);
    setNewChildName('');
    setNewChildAge('');
  }

  // 這個孩子在這位老師底下,目前完成到第几级(0代表還沒上過課)
  function getCompletedIndex(child) {
    return child.completedLevels[instructor.id] ?? 0;
  }

  function pickAlternative(cls, slot) {
    setSelectedClass(cls);
    setSelectedSlot(slot);
    if (selectedChild) setReferenceNote(`${selectedChild.name} ${cls.title}`);
  }

  function handleConfirmBooking() {
    const isOnline = paymentMethod === 'credit_card' || paymentMethod === 'ach';
    let status;
    if (selectedSlot.seatsLeft > 0) {
      status = isOnline ? 'confirmed' : 'pending_payment';
    } else {
      status = 'waitlisted';
    }
    const newBooking = {
      id: `bk-new-${Date.now()}`,
      childId: selectedChild.id,
      childName: selectedChild.name,
      parentEmail: parent.email,
      instructorId: instructor.id,
      classId: selectedClass.id,
      slotId: selectedSlot.id,
      status,
    };
    addBooking(newBooking);
    setResult({ status });
    setStep(5);
  }

  // 蒐集「其他可選的時段」:同一個課程的其他時段 + 同一位老師其他課程的時段
  const alternativeOptions = [];
  instructorClasses.forEach((cls) => {
    cls.slots.forEach((slot) => {
      if (slot.id === selectedSlot.id && cls.id === selectedClass.id) return;
      alternativeOptions.push({ cls, slot });
    });
  });

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <Link to={`/class/${instructor.id}/${initialClass.id}`} style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        ← 返回课程详情
      </Link>
      <h1 style={{ marginTop: 12, fontSize: 24 }}>报名 {selectedClass.title}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
        第 {step} 步 / 共 5 步 · {STEP_LABELS[step - 1]}
      </p>

      <div className="flow-steps">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`flow-step${step >= s ? ' done' : ''}`} />
        ))}
      </div>

      {step === 1 && (
        <div className="flow-card">
          <h2 style={{ marginBottom: 6 }}>选择孩子</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
            系统会依据孩子目前的程度,显示完整的进度路径,确认这个课程是否合适。
          </p>
          <div className="child-pick-grid">
            {parent.children.length === 0 && (
              <div className="banner banner-info" style={{ gridColumn: '1 / -1' }}>
                {parent.name},您的帐号底下还没有孩子档案,请先新增一位。
              </div>
            )}
            {parent.children.map((child) => (
              <button
                key={child.id}
                className={`child-pick-card${selectedChild?.id === child.id ? ' selected' : ''}`}
                onClick={() => pickChild(child)}
              >
                <div className="child-pick-name">{child.name}</div>
                <div className="child-pick-meta">{child.age} 岁</div>
              </button>
            ))}
          </div>

          {!showAddChild ? (
            <button className="secondary full" onClick={() => setShowAddChild(true)} style={{ marginBottom: 18 }}>
              + 新增孩子
            </button>
          ) : (
            <div style={{ border: '1.5px dashed var(--line)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
              <label>
                孩子姓名
                <input value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder="例如:小明" />
              </label>
              <label>
                年龄
                <input type="number" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)} placeholder="例如:6" />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="secondary" onClick={() => setShowAddChild(false)}>取消</button>
                <button className="full" onClick={handleAddChild}>新增并选择</button>
              </div>
            </div>
          )}

          {selectedChild && (
            <ProgressPath
              instructor={instructor}
              selectedClass={selectedClass}
              completedIndex={getCompletedIndex(selectedChild)}
              childName={selectedChild.name}
            />
          )}

          <button className="full" disabled={!selectedChild} onClick={() => setStep(2)}>
            继续
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flow-card">
          <h2 style={{ marginBottom: 6 }}>确认时段</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
            目前选择的时段如下。如果时间不合适,下面也列出这位老师其他班级的时段可以替换。
          </p>

          <div className="summary-row">
            <span className="label">目前选择</span>
            <span>{selectedClass.title} · {selectedSlot.day} {selectedSlot.time}</span>
          </div>
          <div className="summary-row">
            <span className="label">名额状态</span>
            <span>{selectedSlot.seatsLeft > 0 ? `剩 ${selectedSlot.seatsLeft} 位` : '已满 · 将加入候补'}</span>
          </div>

          <div style={{ marginTop: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
              {instructor.name} 老师的其他时段/班级
            </div>
            <div className="slot-list">
              {alternativeOptions.map(({ cls, slot }) => (
                <button
                  key={slot.id}
                  className="slot-pill"
                  disabled={slot.seatsLeft === 0}
                  onClick={() => pickAlternative(cls, slot)}
                  style={selectedSlot.id === slot.id && selectedClass.id === cls.id ? { borderColor: 'var(--amber)', background: '#FFF7EA' } : undefined}
                >
                  <span>{cls.title} · {slot.day} {slot.time}</span>
                  <span className="seats">{slot.seatsLeft > 0 ? `剩 ${slot.seatsLeft} 位` : '已满(可候补)'}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="secondary" onClick={() => setStep(1)}>← 返回</button>
            <button className="full" onClick={() => setStep(3)}>继续</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flow-card">
          <h2 style={{ marginBottom: 16 }}>确认课程资讯</h2>
          <div className="summary-row"><span className="label">学生</span><span>{selectedChild.name}</span></div>
          <div className="summary-row"><span className="label">课程</span><span>{selectedClass.title}</span></div>
          <div className="summary-row"><span className="label">老师</span><span>{instructor.name}</span></div>
          <div className="summary-row"><span className="label">时间</span><span>{selectedSlot.day} {selectedSlot.time}</span></div>
          <div className="summary-row"><span className="label">费用</span><span>${selectedClass.price}/{selectedClass.priceUnit}</span></div>
          <div className="summary-row">
            <span className="label">名额状态</span>
            <span>{selectedSlot.seatsLeft > 0 ? `剩 ${selectedSlot.seatsLeft} 位` : '已满 · 将加入候补'}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="secondary" onClick={() => setStep(2)}>← 返回</button>
            <button className="full" onClick={() => setStep(4)}>继续</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flow-card">
          <h2 style={{ marginBottom: 16 }}>选择付款方式</h2>
          <label>
            付款方式
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="credit_card">信用卡(线上即时)</option>
              <option value="ach">银行转帐 ACH(线上即时)</option>
              <option value="venmo">Venmo(转帐后需老师确认)</option>
              <option value="zelle">Zelle(转帐后需老师确认)</option>
              <option value="check">支票(需老师确认)</option>
            </select>
          </label>

          {(paymentMethod === 'venmo' || paymentMethod === 'zelle' || paymentMethod === 'check') && (
            <>
              <div className="banner banner-info">
                请转帐后,在备注填写学生姓名+课程名称,方便老师对帐确认。
              </div>
              <label>
                转帐备注
                <input value={referenceNote} onChange={(e) => setReferenceNote(e.target.value)} />
              </label>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="secondary" onClick={() => setStep(3)}>← 返回</button>
            <button className="full" onClick={handleConfirmBooking}>送出报名</button>
          </div>
        </div>
      )}

      {step === 5 && result && (
        <div className="flow-card">
          <h2 style={{ marginBottom: 12 }}>报名已送出</h2>
          {result.status === 'confirmed' && (
            <div className="banner banner-success">报名成功,已收到付款,期待开课！</div>
          )}
          {result.status === 'pending_payment' && (
            <div className="banner banner-info">报名已送出,待老师确认收到付款后正式生效。</div>
          )}
          {result.status === 'waitlisted' && (
            <div className="banner banner-warn">这个时段目前已满,已将 {selectedChild.name} 加入候补名单。</div>
          )}
          <Link to="/"><button className="full">回到搜寻结果</button></Link>
        </div>
      )}
    </div>
  );
}

// 完整進度路径視覺化:取代原本一行文字的等級提示
function ProgressPath({ instructor, selectedClass, completedIndex, childName }) {
  const targetIndex = selectedClass.levelIndex;
  const isRecommended = targetIndex === completedIndex + 1;
  const isBehind = targetIndex > completedIndex + 1;
  const isAlreadyPast = targetIndex <= completedIndex;

  return (
    <div className="level-track-box">
      <div className="level-track-title">{childName} 在「{instructor.track.name}」的进度</div>
      <div className="level-track-row">
        {instructor.track.levels.map((lvl, i) => {
          const levelNum = i + 1;
          let pillClass = 'level-pill';
          let tag = '';
          if (levelNum <= completedIndex) {
            tag = '已完成';
          } else if (levelNum === targetIndex) {
            pillClass += ' current';
            tag = '本次报名';
          } else if (levelNum === completedIndex + 1) {
            tag = '建议下一步';
          }
          return (
            <span key={lvl} className={pillClass} title={tag}>
              {lvl}{tag ? ` · ${tag}` : ''}
            </span>
          );
        })}
      </div>

      {isRecommended && (
        <div className="banner banner-success" style={{ marginTop: 14, marginBottom: 0 }}>
          {childName} 目前完成度符合,这是合理的下一步课程。
        </div>
      )}
      {isBehind && (
        <div className="banner banner-warn" style={{ marginTop: 14, marginBottom: 0 }}>
          {childName} 目前完成到「{instructor.track.levels[completedIndex] || '尚未开始'}」,建议先完成「{instructor.track.levels[completedIndex] || instructor.track.levels[0]}」再报这一级,确定要跳级吗?
        </div>
      )}
      {isAlreadyPast && (
        <div className="banner banner-warn" style={{ marginTop: 14, marginBottom: 0 }}>
          系统发现 {childName} 可能已经完成过这一级或更高的等级,确定要重新报名吗?
        </div>
      )}
    </div>
  );
}
