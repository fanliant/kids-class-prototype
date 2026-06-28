import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { load, save, KEYS, generateSessionsForCourse } from '../utils/storage';
import { useCourses } from './CoursesContext';

const SessionsCtx = createContext(null);

export function SessionsProvider({ children }) {
  const { courses } = useCourses();
  const [sessions, setSessions] = useState(() => load(KEYS.SESSIONS, []));

  // Whenever courses change, generate sessions for any course that doesn't have them yet
  useEffect(() => {
    if (!courses || courses.length === 0) return;
    setSessions((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      let changed = false;
      const next = [...prev];
      courses.forEach((course) => {
        if (!course.slots || course.slots.length === 0) return;
        const generated = generateSessionsForCourse(course);
        generated.forEach((s) => {
          if (!existingIds.has(s.id)) {
            next.push(s);
            existingIds.add(s.id);
            changed = true;
          }
        });
      });
      return changed ? next : prev;
    });
  }, [courses]);

  // Persist on every change
  useEffect(() => {
    save(KEYS.SESSIONS, sessions);
  }, [sessions]);

  const markAttendance = useCallback((sessionId, studentKey, status) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, attendance: { ...s.attendance, [studentKey]: status } }
          : s
      )
    );
  }, []);

  const requestSubstitute = useCallback((sessionId, reason) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, substituteRequest: { reason, status: 'pending', requestedAt: new Date().toISOString() } }
          : s
      )
    );
  }, []);

  const approveSubstitute = useCallback((sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId && s.substituteRequest
          ? { ...s, substituteRequest: { ...s.substituteRequest, status: 'approved' } }
          : s
      )
    );
  }, []);

  const cancelSubstituteRequest = useCallback((sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, substituteRequest: null } : s
      )
    );
  }, []);

  const getSessionsForInstructor = useCallback(
    (instructorId) => sessions.filter((s) => s.instructorId === instructorId),
    [sessions]
  );

  const getSessionsForDate = useCallback(
    (instructorId, dateStr) =>
      sessions.filter((s) => s.instructorId === instructorId && s.date === dateStr),
    [sessions]
  );

  const pendingSubRequests = sessions.filter(
    (s) => s.substituteRequest?.status === 'pending'
  );

  return (
    <SessionsCtx.Provider
      value={{
        sessions,
        pendingSubRequests,
        getSessionsForInstructor,
        getSessionsForDate,
        markAttendance,
        requestSubstitute,
        approveSubstitute,
        cancelSubstituteRequest,
      }}
    >
      {children}
    </SessionsCtx.Provider>
  );
}

export function useSessions() {
  return useContext(SessionsCtx);
}
