// Routes.jsx - VERSION FINALE 2025 (PRÊTE À L'EMPLOI)

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./lib/auth";

// Pages
import LoginAuthentication from "./pages/login-authentication";
import StudentDashboard from "./pages/student-dashboard";
import ReportSubmissionForm from "./pages/report-submission-form";
import SecurePDFReader from "./pages/secure-pdf-reader";
import TeacherValidationDashboard from "./pages/teacher-validation-dashboard";
import AdministrativeDashboard from "./pages/administrative-dashboard";

// AJOUT CRUCIAL : Import de l'interface de validation
import ReportValidationInterface from "./pages/report-validation-interface";  // VÉRIFIE LE CHEMIN !

// 404 PAGE
const NotFound = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui',
    backgroundColor: '#f5f5f5'
  }}>
    <h1 style={{ fontSize: '4rem', margin: 0, color: '#333' }}>404</h1>
    <p style={{ fontSize: '1.5rem', color: '#666', marginTop: '1rem' }}>
      Page non trouvée
    </p>
    <a 
      href="/login"
      style={{
        marginTop: '2rem',
        padding: '0.75rem 1.5rem',
        background: '#0066cc',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        fontWeight: '500'
      }}
    >
      Retour à la connexion
    </a>
  </div>
);

// PROTECTED ROUTE WITH ROLE
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    const redirectMap = {
      student: "/student/dashboard",
      teacher: "/teacher/dashboard",
      admin: "/admin/dashboard"
    };
    return <Navigate to={redirectMap[user.role] ?? "/login"} replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LoginAuthentication />} />
        <Route path="/login" element={<LoginAuthentication />} />

        {/* STUDENT ROUTES */}
        <Route 
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/student/submit-report"
          element={
            <ProtectedRoute allowedRole="student">
              <ReportSubmissionForm />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/report-submission-form"
          element={<Navigate to="/student/submit-report" replace />}
        />

        <Route 
          path="/student/view-report/:id"
          element={
            <ProtectedRoute allowedRole="student">
              <SecurePDFReader />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/secure-pdf-reader"
          element={
            <ProtectedRoute allowedRole="student">
              <SecurePDFReader />
            </ProtectedRoute>
          }
        />

        {/* TEACHER ROUTES */}
        <Route 
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherValidationDashboard />
            </ProtectedRoute>
          }
        />

      {/* INTERFACE DE VALIDATION D'UN RAPPORT - AVEC ID DANS L'URL */}
<Route 
  path="/report-validation-interface/:reportId"
  element={
    <ProtectedRoute allowedRole="teacher">
      <ReportValidationInterface />
    </ProtectedRoute>
  } 
/>

        {/* Compatibilité ancienne URL */}
        <Route 
          path="/teacher-validation-dashboard"
          element={<Navigate to="/teacher/dashboard" replace />}
        />

        {/* ADMIN ROUTES */}
        <Route 
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdministrativeDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 - Doit être en dernier */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}