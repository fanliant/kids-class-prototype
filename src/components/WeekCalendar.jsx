import React from 'react';

const WEEKDAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

// events: [{ day, time, title, sub, colorClass, tag, onClick }]
// tag: 可選的小標籤文字(例如「已請假」「補課」「待確認付款」)
// onClick: 可選,有提供時這個事件卡片會變成可點擊
export default function WeekCalendar({ events, emptyText = '本週尚无排课' }) {
  const grouped = WEEKDAYS.map((day) => {
    const dayEvents = events
      .filter((e) => e.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    return { day, dayEvents };
  });

  const hasAnyEvent = events.length > 0;

  return (
    <div className="week-cal">
      {grouped.map(({ day, dayEvents }) => (
        <div className="week-cal-col" key={day}>
          <div className="week-cal-day-label">{day}</div>
          <div className="week-cal-day-body">
            {dayEvents.length === 0 && <div className="week-cal-empty-slot">—</div>}
            {dayEvents.map((ev, i) => {
              const Tag = ev.onClick ? 'button' : 'div';
              return (
                <Tag
                  key={i}
                  className={`week-cal-event${ev.colorClass ? ` ${ev.colorClass}` : ''}${ev.onClick ? ' clickable' : ''}`}
                  onClick={ev.onClick}
                  type={ev.onClick ? 'button' : undefined}
                >
                  <div className="week-cal-event-time">{ev.time}</div>
                  <div className="week-cal-event-title">{ev.title}</div>
                  {ev.sub && <div className="week-cal-event-sub">{ev.sub}</div>}
                  {ev.location && <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', marginTop:1 }}>📍 {ev.location}</div>}
                  {ev.tag && <div className="week-cal-event-tag">{ev.tag}</div>}
                </Tag>
              );
            })}
          </div>
        </div>
      ))}
      {!hasAnyEvent && (
        <div className="week-cal-overlay-empty">{emptyText}</div>
      )}
    </div>
  );
}
