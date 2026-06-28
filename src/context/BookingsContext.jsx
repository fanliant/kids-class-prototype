import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockEnrollments, mockBookings } from '../mockData';
import { load, save } from '../utils/storage';

const BookingsContext = createContext(null);
const BOOKINGS_VERSION = 15;

function seedEnrollments() {
  return mockEnrollments.map((e) => ({ ...e, createdAt: '2026-06-20T00:00:00Z' }));
}

export function BookingsProvider({ children }) {
  const [enrollments, setEnrollments] = useState(() => {
    const v = load('kcp_bookings_version', 0);
    if (v < BOOKINGS_VERSION) {
      save('kcp_bookings_version', BOOKINGS_VERSION);
      return seedEnrollments();
    }
    return load('kcp_enrollments', seedEnrollments());
  });

  useEffect(() => { save('kcp_enrollments', enrollments); }, [enrollments]);

  // ── Enrollment CRUD ───────────────────────────────────────────────────────
  function addEnrollment(enrollment) {
    setEnrollments((p) => [...p, { ...enrollment, id: `en-${Date.now()}`, createdAt: new Date().toISOString() }]);
  }

  function updateEnrollment(id, updates) {
    setEnrollments((p) => p.map((e) => e.id === id ? { ...e, ...updates } : e));
  }

  function confirmPayment(id) {
    setEnrollments((p) => p.map((e) =>
      e.id === id ? { ...e, status: 'confirmed', paymentStatus: 'paid' } : e
    ));
  }

  function getEnrollmentsByProduct(productId) {
    return enrollments.filter((e) => e.productId === productId);
  }

  function getEnrollmentsByStudio(studioId) {
    return enrollments.filter((e) => e.studioId === studioId);
  }

  function getEnrollmentsByParent(email) {
    return enrollments.filter((e) => e.parentEmail === email);
  }

  // ── Legacy compatibility ──────────────────────────────────────────────────
  // 旧UI用 bookings 和 classId
  const bookings = enrollments.map((e) => ({
    ...e,
    classId: e.productId,
    instructorId: e.studioId,
  }));

  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  return (
    <BookingsContext.Provider value={{
      // New API
      enrollments,
      addEnrollment, updateEnrollment, confirmPayment,
      getEnrollmentsByProduct, getEnrollmentsByStudio, getEnrollmentsByParent,
      // Legacy
      bookings,
      recentEnrollments,
    }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  return useContext(BookingsContext);
}
