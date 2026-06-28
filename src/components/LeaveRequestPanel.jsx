import React, { useState } from 'react';
import { useBookings } from '../context/BookingsContext';

// booking: 目前要請假的這筆預約
// instructor / cls / currentSlot: 對應的老師/課程/原本時段資訊
// alternativeSlots: 同一門課其他可選的時段(已排除掉目前這個時段)
export default function LeaveRequestPanel({ booking, instructor, cls, currentSlot, alternativeSlots, onClose }) {
  const { requestLeaveNoMakeup, requestLeaveWithMakeup, cancelLeave } = useBookings();
  const [selectedMakeupSlotId, setSelectedMakeupSlotId] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const alreadyOnLeave = booking.leaveStatus === 'no_makeup' || booking.leaveStatus === 'makeup_scheduled';

  function handleConfirmNoMakeup() {
    requestLeaveNoMakeup(booking.id);
    setSubmitted('no_makeup');
  }

  function handleConfirmMakeup() {
    if (!selectedMakeupSlotId) return;
    requestLeaveWithMakeup(booking.id, selectedMakeupSlotId);
    setSubmitted('makeup_scheduled');
  }

  function handleCancelLeave() {
    cancelLeave(booking.id);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 4 }}>{cls.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5, marginBottom: 16 }}>
          {instructor.name} · {currentSlot.day} {currentSlot.time}
        </p>

        {alreadyOnLeave && !submitted && (
          <>
            <div className="banner banner-info">
              {booking.leaveStatus === 'no_makeup'
                ? '已登记请假,这门课不支援补课。'
                : `已登记请假,补课时段:${formatMakeupSlot(cls, booking.makeupSlotId)}`}
            </div>
            <button className="full" onClick={handleCancelLeave}>取消请假,恢复原时段</button>
          </>
        )}

        {!alreadyOnLeave && !submitted && (
          <>
            {!cls.allowsMakeup && (
              <>
                <div className="banner banner-warn">
                  这门课不支援补课。请假后,这次课程不会安排其他时段,确定要请假吗?
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="secondary" onClick={onClose}>取消</button>
                  <button className="full" onClick={handleConfirmNoMakeup}>确定请假</button>
                </div>
              </>
            )}

            {cls.allowsMakeup && (
              <>
                <p style={{ fontSize: 13.5, marginBottom: 10 }}>
                  这门课支援补课,请选择一个补课时段:
                </p>
                {alternativeSlots.length === 0 ? (
                  <div className="banner banner-warn">
                    目前没有其他开放的时段可以补课,请直接联络老师协调。
                  </div>
                ) : (
                  <div className="slot-list" style={{ marginBottom: 16 }}>
                    {alternativeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        className="slot-pill"
                        disabled={slot.seatsLeft === 0}
                        style={selectedMakeupSlotId === slot.id ? { borderColor: 'var(--amber)', background: '#FFF7EA' } : undefined}
                        onClick={() => setSelectedMakeupSlotId(slot.id)}
                      >
                        <span>{slot.day} {slot.time}</span>
                        <span className="seats">{slot.seatsLeft > 0 ? `剩 ${slot.seatsLeft} 位` : '已满'}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="secondary" onClick={onClose}>取消</button>
                  <button className="full" disabled={!selectedMakeupSlotId} onClick={handleConfirmMakeup}>
                    确认请假并安排补课
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {submitted === 'no_makeup' && (
          <>
            <div className="banner banner-success">已登记请假,这门课不支援补课,老师端会同步看到。</div>
            <button className="full" onClick={onClose}>关闭</button>
          </>
        )}

        {submitted === 'makeup_scheduled' && (
          <>
            <div className="banner banner-success">
              已登记请假,补课时段:{formatMakeupSlot(cls, selectedMakeupSlotId)},老师端会同步看到。
            </div>
            <button className="full" onClick={onClose}>关闭</button>
          </>
        )}
      </div>
    </div>
  );
}

function formatMakeupSlot(cls, slotId) {
  const slot = cls.slots.find((s) => s.id === slotId);
  if (!slot) return '未知时段';
  return `${slot.day} ${slot.time}`;
}
