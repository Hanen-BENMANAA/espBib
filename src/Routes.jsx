// Routes.jsx - VERSION CORRIGÉE
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./lib/auth";

// IMPORT ONLY PAGE COMPONENTS
import LoginAuthentication from "./pages/login-authentication";
import StudentDashboard from "./pages/student-dashboard";
import ReportSubmissionForm from "./pages/report-submission-form";
import SecurePDFReader from "./pages/secure-pdf-reader";
import TeacherValidationDashboard from "./pages/teacher-validation-dashboard";
import AdministrativeDashboard from "./pages/administrative-dashboard";

// PAGE 404
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

// ROLE PROTECTION AMÉLIORÉE
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getUser();
  
  // Debugging - À retirer en production
  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Required role:", allowedRole);
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== allowedRole) {
    console.log(`User role ${user.role} doesn't match required role ${allowedRole}`);
    // Rediriger vers le dashboard approprié selon le rôle
    switch(user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

// MAIN COMPONENT
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginAuthentication />} />
        <Route path="/login" element={<LoginAuthentication />} />

        {/* STUDENT ROUTES - TOUTES LES VARIANTES */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Route principale pour la soumission */}
        <Route 
          path="/student/submit-report" 
          element={
            <ProtectedRoute allowedRole="student">
              <ReportSubmissionForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Route alternative (pour compatibilité) */}
        <Route 
          path="/report-submission-form" 
          element={
            <ProtectedRoute allowedRole="student">
              <ReportSubmissionForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Routes de visualisation */}
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

        {/* ADMIN ROUTES */}
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