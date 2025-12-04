// src/layouts/LibraryLayout.jsx - WITH NOTIFICATIONS

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, Library, Grid3x3, Menu, Bell, 
  ChevronDown, User, Settings, LogOut 
} from 'lucide-react';

// Import notification panels
import TeacherNotificationPanel from '../components/notifications/TeacherNotificationPanel';
import NotificationPanel from '../components/notifications/NotificationPanel';

const LibraryLayout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Get user session
  const sessionStr = localStorage.getItem('esprim_session') || sessionStorage.getItem('esprim_session');
  const user = sessionStr ? JSON.parse(sessionStr) : null;
  
  // Check both 'role' and 'userRole' properties
  const role = user?.role || user?.userRole || 'student';
  const isTeacher = ['teacher', 'faculty', 'admin'].includes(role);
  
  const userName = user?.name || user?.fullname || user?.userName || (isTeacher ? 'Leila Trabelsi' : 'Étudiant');
  const userEmail = user?.email || user?.userEmail || 'user@esprim.fr';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ==============================================
  // TEACHER LAYOUT (with sidebar like dashboard)
  // ==============================================
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Teacher Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">ESPRIM</h1>
                  <p className="text-sm text-gray-500">Virtual Library</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Teacher Notifications */}
              <TeacherNotificationPanel />
              
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{userInitials}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">Enseignant</p>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                        <User size={18} /> Profil
                      </button>
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                        <Settings size={18} /> Paramètres
                      </button>
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600">
                        <LogOut size={18} /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Teacher Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="flex flex-col h-full pt-20 lg:pt-4">
              <nav className="flex-1 px-4 space-y-2">
                {/* Tableau de Bord */}
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Grid3x3 size={20} />
                  <span className="font-medium">Tableau de Bord</span>
                </button>

                {/* Bibliothèque (Active) */}
                <button
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white"
                >
                  <Library size={20} />
                  <span className="font-medium">Bibliothèque</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // ==============================================
  // STUDENT LAYOUT (with header navigation)
  // ==============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/student/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ESPRIM</h1>
                <p className="text-xs text-gray-500 -mt-1">Virtual Library</p>
              </div>
            </Link>

            {/* Student Navigation */}
            <nav className="hidden lg:flex items-center space-x-7">
              <Link to="/student/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                  <Grid3x3 size={18} />
                  <span>Tableau de Bord</span>
                </button>
              </Link>

              <Link to="/report-submission-form">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                  <FileText size={18} />
                  <span>Soumission</span>
                </button>
              </Link>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white">
                <Library size={18} />
                <span>Bibliothèque</span>
              </button>

              <Link to="/favorites">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                  <span>❤️</span>
                  <span>Favoris</span>
                </button>
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Student Notifications */}
              <NotificationPanel />

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-gray-500">Étudiant</p>
                  </div>
                  <ChevronDown size={16} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <p className="font-medium">{userName}</p>
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                        <User size={18} /> Profil
                      </button>
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                        <Settings size={18} /> Paramètres
                      </button>
                      <button className="w-full text-left flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600">
                        <LogOut size={18} /> Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Student Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};

export default LibraryLayout;