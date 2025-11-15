import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// First group of pages (your new system config pages)
import SystemConfiguration from './pages/system-configuration';
import LoginAuthentication from './pages/login-authentication';
import UserManagementPanel from './pages/user-management-panel';
import ReportValidationInterface from './pages/report-validation-interface';
import TeacherValidationDashboard from './pages/teacher-validation-dashboard';

// Second group of pages (library + dashboards)
import ReportSubmissionForm from './pages/report-submission-form';
import PublicLibraryCatalog from './pages/public-library-catalog';
import AdministrativeDashboard from './pages/administrative-dashboard';
import SecurePDFReader from './pages/secure-pdf-reader';
import StudentDashboard from './pages/student-dashboard';
import FacultyValidationDashboard from './pages/faculty-validation-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>

          {/* ===== Main Entry Route ===== */}
          <Route path="/" element={<LoginAuthentication />} />

          {/* ===== System & Authentication Routes ===== */}
          <Route path="/login-authentication" element={<LoginAuthentication />} />
          <Route path="/system-configuration" element={<SystemConfiguration />} />
          <Route path="/user-management-panel" element={<UserManagementPanel />} />
          <Route path="/report-validation-interface" element={<ReportValidationInterface />} />
          <Route path="/teacher-validation-dashboard" element={<TeacherValidationDashboard />} />

          {/* ===== Library & Dashboard Routes ===== */}
          <Route path="/public-library-catalog" element={<PublicLibraryCatalog />} />
          <Route path="/report-submission-form" element={<ReportSubmissionForm />} />
          <Route path="/administrative-dashboard" element={<AdministrativeDashboard />} />
          <Route path="/secure-pdf-reader" element={<SecurePDFReader />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty-validation-dashboard" element={<FacultyValidationDashboard />} />

          {/* ===== Catch-All ===== */}
          <Route path="*" element={<NotFound />} />

        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
