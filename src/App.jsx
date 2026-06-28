import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }     from './context/AuthContext';
import { CoursesProvider }  from './context/CoursesContext';
import { SessionsProvider } from './context/SessionsContext';
import { BookingsProvider } from './context/BookingsContext';
import Nav                       from './components/Nav';
import LoginModal                from './components/LoginModal';
import SearchPage                from './pages/SearchPage';
import SchoolPage                from './pages/SchoolPage';
import ClassDetailPage           from './pages/ClassDetailPage';
import BookingFlow               from './pages/BookingFlow';
import MyCalendarPage            from './pages/MyCalendarPage';
import TeacherDashboard          from './pages/TeacherDashboard';
import OwnerHome                 from './pages/OwnerHome';
import TeacherHome               from './pages/TeacherHome';
import ParentHome                from './pages/ParentHome';
import PaymentsPage              from './pages/PaymentsPage';
import CourseEnrollmentPage      from './pages/CourseEnrollmentPage';
import EnrollmentDashboard       from './pages/EnrollmentDashboard';
import OperationsPage            from './pages/OperationsPage';
import PayrollPage               from './pages/PayrollPage';
import AttendancePage            from './pages/AttendancePage';
import SchedulePage              from './pages/SchedulePage';
import LessonNotePage            from './pages/LessonNotePage';
import ChildProfilePage          from './pages/ChildProfilePage';
import InvoicePage               from './pages/InvoicePage';
import FinancePage               from './pages/FinancePage';
import TeacherManagementPage     from './pages/TeacherManagementPage';
import WebsiteManagementPage     from './pages/WebsiteManagementPage';
import EnrollmentFlow            from './pages/EnrollmentFlow';

export default function App() {
  return (
    <AuthProvider>
      <CoursesProvider>
        <SessionsProvider>
          <BookingsProvider>
            <HashRouter>
              <Nav />
              <Routes>
                <Route path="/"            element={<SearchPage />} />
                <Route path="/school/:instructorId"                element={<SchoolPage />} />
                <Route path="/class/:instructorId/:classId"        element={<ClassDetailPage />} />
                <Route path="/book/:instructorId/:classId/:slotId" element={<BookingFlow />} />
                <Route path="/owner"        element={<OwnerHome />} />
                <Route path="/teacher"      element={<TeacherHome />} />
                <Route path="/home"         element={<ParentHome />} />
                <Route path="/my-calendar"  element={<MyCalendarPage />} />
                <Route path="/dashboard"    element={<TeacherDashboard />} />
                <Route path="/payments"     element={<PaymentsPage />} />
                <Route path="/operations"   element={<OperationsPage />} />
                <Route path="/payroll"      element={<PayrollPage />} />
                <Route path="/teachers"     element={<TeacherManagementPage />} />
                <Route path="/website"      element={<WebsiteManagementPage />} />
                <Route path="/enroll/:productId" element={<EnrollmentFlow />} />
                <Route path="/attendance/:courseId/:sessionDate" element={<AttendancePage />} />
                <Route path="/notes/:courseId/:sessionDate" element={<LessonNotePage />} />
                <Route path="/child/:childId" element={<ChildProfilePage />} />
                <Route path="/invoices" element={<InvoicePage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/schedule"    element={<SchedulePage />} />
                <Route path="/my-schedule" element={<SchedulePage />} />
                <Route path="/enrollment"           element={<EnrollmentDashboard />} />
                <Route path="/enrollment/:courseId" element={<CourseEnrollmentPage />} />
              </Routes>
              <LoginModal />
            </HashRouter>
          </BookingsProvider>
        </SessionsProvider>
      </CoursesProvider>
    </AuthProvider>
  );
}
