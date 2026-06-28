export const KEYS = {
  ACCOUNTS:     'kcp_accounts',
  CURRENT_USER: 'kcp_current_user',
  COURSES:      'kcp_courses',
  BOOKINGS:     'kcp_bookings',
  SESSIONS:     'kcp_sessions',
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed', e);
  }
}

export function resetAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}

// ── Session generation ────────────────────────────────────────────────────────
const DAY_TO_DOW = {
  '星期一': 1, '星期二': 2, '星期三': 3, '星期四': 4,
  '星期五': 5, '星期六': 6, '星期日': 0,
};

export function generateSessionsForCourse(course) {
  const sessions = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = course.termStartDate ? new Date(course.termStartDate) : new Date(today);
  const end   = course.termEndDate   ? new Date(course.termEndDate)   : null;
  const maxWeeks = 12;

  (course.slots || []).forEach((slot) => {
    const targetDow = DAY_TO_DOW[slot.day];
    if (targetDow === undefined) return;

    // First occurrence on or after start
    const curr = new Date(start);
    const diff = (targetDow - curr.getDay() + 7) % 7;
    curr.setDate(curr.getDate() + diff);

    for (let w = 0; w < maxWeeks; w++) {
      if (end && curr > end) break;
      const dateStr = curr.toISOString().slice(0, 10);

      sessions.push({
        id: `sess-${course.id}-${slot.id}-${dateStr}`,
        courseId: course.id,
        courseTitle: course.title,
        instructorId: course.instructorId,
        slotId: slot.id,
        date: dateStr,
        day: slot.day,
        time: slot.time,
        assignedInstructorId: course.instructorId,
        substituteRequest: null, // { reason, status:'pending'|'approved', subId }
        attendance: {},           // childName → 'present'|'absent'
        notes: '',
        status: 'scheduled',
      });

      curr.setDate(curr.getDate() + 7);
    }
  });

  return sessions;
}

// Date helpers
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekRange(weekOffset = 0) {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}
