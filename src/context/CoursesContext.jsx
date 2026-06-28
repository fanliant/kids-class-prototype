import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCourses, mockProducts, mockCurricula } from '../mockData';
import { load, save } from '../utils/storage';

const CoursesContext = createContext(null);

const DATA_VERSION = 20;

export function CoursesProvider({ children }) {

  // ── Curricula ────────────────────────────────────────────────────────────
  const [curricula, setCurricula] = useState(() => {
    const v = load('kcp_data_version', 0);
    if (v < DATA_VERSION) return mockCurricula;
    return load('kcp_curricula', mockCurricula);
  });

  // ── Courses (教什么) ─────────────────────────────────────────────────────
  const [courses, setCourses] = useState(() => {
    const v = load('kcp_data_version', 0);
    if (v < DATA_VERSION) {
      save('kcp_data_version', DATA_VERSION);
      return mockCourses;
    }
    return load('kcp_courses_v2', mockCourses);
  });

  // ── Products (怎么卖) ────────────────────────────────────────────────────
  const [products, setProducts] = useState(() => {
    const v = load('kcp_data_version', 0);
    if (v < DATA_VERSION) return mockProducts;
    return load('kcp_products', mockProducts);
  });

  useEffect(() => { save('kcp_curricula', curricula); }, [curricula]);
  useEffect(() => { save('kcp_courses_v2', courses); }, [courses]);
  useEffect(() => { save('kcp_products', products); }, [products]);

  // ── Curriculum CRUD ───────────────────────────────────────────────────────
  function addCurriculum(cur) { setCurricula((p) => [...p, { ...cur, id: `cur-${Date.now()}` }]); }
  function updateCurriculum(id, updates) { setCurricula((p) => p.map((c) => c.id === id ? { ...c, ...updates } : c)); }
  function deleteCurriculum(id) { setCurricula((p) => p.filter((c) => c.id !== id)); }
  function getCurriculaByStudio(studioId) { return curricula.filter((c) => c.studioId === studioId); }

  // ── Course CRUD ───────────────────────────────────────────────────────────
  function addCourse(course) { setCourses((p) => [...p, { ...course, id: `course-${Date.now()}`, createdAt: new Date().toISOString() }]); }
  function updateCourse(id, updates) { setCourses((p) => p.map((c) => c.id === id ? { ...c, ...updates } : c)); }
  function deleteCourse(id) { setCourses((p) => p.filter((c) => c.id !== id)); }
  function getCoursesByStudio(studioId) { return courses.filter((c) => c.studioId === studioId); }

  // ── Product CRUD ──────────────────────────────────────────────────────────
  function addProduct(product) { setProducts((p) => [...p, { ...product, id: `prod-${Date.now()}`, booked: 0, createdAt: new Date().toISOString() }]); }
  function updateProduct(id, updates) { setProducts((p) => p.map((pr) => pr.id === id ? { ...pr, ...updates } : pr)); }
  function deleteProduct(id) { setProducts((p) => p.filter((pr) => pr.id !== id)); }
  function getProductsByStudio(studioId) { return products.filter((p) => p.studioId === studioId); }
  function getProductsByCourse(courseId) { return products.filter((p) => p.courseId === courseId); }

  // ── Legacy compatibility: getCoursesByInstructor returns Products ─────────
  // 旧的UI用 getCoursesByInstructor，现在映射到 Products
  function getCoursesByInstructor(studioId) {
    return products
      .filter((p) => p.studioId === studioId)
      .map((p) => {
        const course = courses.find((c) => c.id === p.courseId);
        return {
          ...p,
          // legacy fields that old UI expects
          instructorId: p.studioId,
          classId: p.id,
          title: p.name,
          classType: p.deliveryFormat === 'private' ? 'one_on_one' : 'group',
          scheduleMode: p.scheduleModel,
          termStartDate: p.termStartDate,
          termEndDate: p.termEndDate,
          termTotalSessions: p.termTotalSessions,
          // course info
          ageRange: course ? `${course.ageMin}-${course.ageMax}岁` : '',
          description: course?.description || p.name,
          prerequisiteCourseId: course?.prerequisiteCourseId || null,
          levelIndex: course?.levelIndex || 99,
          courseName: course?.name || '',
          curriculumId: course?.curriculumId || null,
          duration: p.durationMin || 45,
        };
      });
  }

  return (
    <CoursesContext.Provider value={{
      // New API
      curricula, courses, products,
      addCurriculum, updateCurriculum, deleteCurriculum, getCurriculaByStudio,
      addCourse, updateCourse, deleteCourse, getCoursesByStudio,
      addProduct, updateProduct, deleteProduct, getProductsByStudio, getProductsByCourse,
      // Legacy API (backward compat)
      getCoursesByInstructor,
    }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  return useContext(CoursesContext);
}
