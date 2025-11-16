// src/Routes.jsx - VERSION FINALE FONCTIONNELLE
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./lib/auth";

// === IMPORTS DIRECTS DES PAGES ===
import LoginAuthentication from "./pages/login-authentication";
import StudentDashboard from "./pages/student-dashboard";
import ReportSubmissionForm from "./pages/report-submission-form";
import SecurePDFReader from "./pages/secure-pdf-reader";
import TeacherValidationDashboard from "./pages/teacher-validation-dashboard";
import AdministrativeDashboard from "./pages/administrative-dashboard";
import ValidationStatsPanel from "./pages/teacher-validation-dashboard";
import ConsultationHistorySection from "./pages/student-dashboard";
import ActivityChart from "./pages/administrative-dashboard";
import UserManagementPanel from "./pages/administrative-dashboard";
import SystemSettingsPanel from "./pages/administrative-dashboard";
import ReportOverviewSection from "./pages/teacher-validation-dashboard";
import ManagementPanel from "./pages/administrative-dashboard";
import MetricsCard from "./pages/administrative-dashboard";
import QuickStats from "./pages/administrative-dashboard";

// === PAGE 404 ===
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

// === PROTECTION PAR RÔLE ===
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// === COMPOSANT PRINCIPAL ===
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LoginAuthentication />} />
        <Route path="/login" element={<LoginAuthentication />} />

        {/* ÉTUDIANT */}
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
          path="/student/view-report/:id" 
          element={
            <ProtectedRoute allowedRole="student">
              <SecurePDFReader />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/view-report" 
          element={
            <ProtectedRoute allowedRole="student">
              <SecurePDFReader />
            </ProtectedRoute>
          } 
        />

        {/* ENSEIGNANT */}
        <Route 
          path="/teacher/dashboard" 
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherValidationDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher-validation-dashboard" 
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherValidationDashboard />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdministrativeDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}