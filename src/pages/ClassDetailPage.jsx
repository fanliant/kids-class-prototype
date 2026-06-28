import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { instructors } from '../mockData';
import { useCourses } from '../context/CoursesContext';
import CategoryIcon from '../components/CategoryIcon';
import { useAuth } from '../context/AuthContext';

const categoryToIconType = { 鋼琴: 'piano', 游泳: 'swim', 中文: 'chinese' };

export default function ClassDetailPage() {
  const { instructorId, classId } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const { getCoursesByInstructor } = useCourses();
  const instructor = instructors.find((i) => i.id === instructorId);
  if (!instructor) return <div className="page">找不到这位老师。</div>;
  const cls = getCoursesByInstructor(instructor.id).find((c) => c.id === classId);
  if (!cls) return <div className="page">找不到这个课程。</div>;

  const iconType = categoryToIconType[instructor.category];

  function goToBooking(slotId) {
    requireAuth(() => navigate(`/book/${instructor.id}/${cls.id}/${slotId}`));
  }

  return (
    <div className="page">
      <div className={`detail-hero cat-${iconType}`} style={{ background: getGradient(iconType) }}>
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <h1>{cls.title}</h1>
          <div className="sub">{instructor.name} · {instructor.location}</div>
        </div>
      </div>

      <div className="detail-layout">
        <div>
          <div className="instructor-strip">
            <div className="instructor-avatar">{instructor.name[0]}</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{instructor.name}</div>
              <div className="instructor-strip-meta">
                {instructor.category} · {instructor.yearsExperience} 年教学经验 · ★ {instructor.rating}({instructor.reviewCount} 则评价)
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>关于这位老师</h2>
            <p>{instructor.bio}</p>
          </div>

          <div className="level-track-box">
            <div className="level-track-title">{instructor.track.name}</div>
            <div className="level-track-row">
              {instructor.track.levels.map((lvl, i) => (
                <span key={lvl} className={`level-pill${i + 1 === cls.levelIndex ? ' current' : ''}`}>
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h2>课程内容</h2>
            <p>{cls.description}</p>
            {cls.googleClassroomUrl && (
              <a
                href={cls.googleClassroomUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: '#1a73e8', color: 'white', padding: '9px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
              >
                <span>🎓</span> 进入 Google Classroom
              </a>
            )}
          </div>

          <div className="detail-section">
            <h2>可预约时段</h2>
            <div className="class-option">
              <div className="class-option-head">
                <span className="class-option-title">{cls.title}</span>
                <span className="class-option-price">${cls.price}/{cls.priceUnit}</span>
              </div>
              <div className="class-option-desc">{cls.ageRange} · 每堂 {cls.duration} 分钟</div>
              <div className="slot-list">
                {cls.slots.map((slot) => (
                  <button
                    key={slot.id}
                    className="slot-pill"
                    disabled={slot.seatsLeft === 0}
                    onClick={() => goToBooking(slot.id)}
                  >
                    <span>{slot.day} {slot.time}</span>
                    <span className="seats">{slot.seatsLeft > 0 ? `剩 ${slot.seatsLeft} 位` : '已满(可候补)'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>家长评价</h2>
            {instructor.reviews.map((r, i) => (
              <div className="review-card" key={i}>
                <div className="review-stars">{'★'.repeat(r.rating)}</div>
                <p style={{ margin: 0 }}>{r.text}</p>
                <div className="review-author">{r.author}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky-side">
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
            ${cls.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/{cls.priceUnit}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {cls.ageRange} · {cls.capacity - cls.booked > 0 ? `剩 ${cls.capacity - cls.booked} 位` : '已满,可加入候补'}
          </div>
          <button
            className="full"
            onClick={() => goToBooking(cls.slots[0]?.id)}
          >
            选时段报名
          </button>
          <Link to={`/school/${instructor.id}`} style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            ← 返回 {instructor.name} 的课程列表
          </Link>
        </div>
      </div>
    </div>
  );
}

function getGradient(iconType) {
  if (iconType === 'piano') return 'linear-gradient(135deg, #1F3D34, #345E50)';
  if (iconType === 'swim') return 'linear-gradient(135deg, #2C5078, #4A6FA5)';
  return 'linear-gradient(135deg, #7A3B2E, #B5701E)';
}
