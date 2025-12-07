// src/components/ui/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationPanel from '../notifications/NotificationPanel';
import { logout } from '../../lib/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  const sessionStr = localStorage.getItem('esprim_session') || sessionStorage.getItem('esprim_session');
  const session = sessionStr ? JSON.parse(sessionStr) : null;
  const role = session?.userRole || 'student';
  const isTeacher = ['teacher', 'faculty', 'admin'].includes(role);

  const userName = session?.userName || (isTeacher ? 'Enseignant' : 'Étudiant');
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const navItems = isTeacher
    ? [
        { label: 'Tableau de Bord', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
        { label: 'Validation', path: '/teacher/validation', icon: 'CheckCircle' },
        { label: 'Bibliothèque', path: '/library', icon: 'Library' },
        { label: 'Favoris', path: '/favorites', icon: 'Heart' },
      ]
    : [
        { label: 'Tableau de Bord', path: '/student/dashboard', icon: 'LayoutDashboard' },
        { label: 'Soumission', path: '/student/submit-report', icon: 'FileText' },
        { label: 'Bibliothèque', path: '/library', icon: 'Library' },
        { label: 'Favoris', path: '/favorites', icon: 'Heart' },
      ];

  const isActive = (path) => location.pathname.startsWith(path);

  const getRoleColor = () => (role === 'admin' ? 'bg-red-600' : isTeacher ? 'bg-green-600' : 'bg-blue-600');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">

            <Link to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center">
                <Icon name="GraduationCap" size={26} color="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ESPRIM</h1>
                <p className="text-xs text-gray-500 font-medium">Virtual Library</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <button className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-medium text-sm transition-all shadow-sm whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-red-600 text-white shadow-red-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}>
                    <Icon name={item.icon} size={18} />
                    {item.label}
                  </button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <NotificationPanel />
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition">
                  <div className={`w-9 h-9 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{isTeacher ? 'Enseignant' : 'Étudiant'}</p>
                  </div>
                  <Icon name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold`}>
                          {userInitials}
                        </div>
                        <div>
                          <p className="font-semibold">{userName}</p>
                          <p className="text-sm text-gray-600">{session?.userEmail || ''}</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setIsUserMenuOpen(false); setShowLogoutConfirm(true); }} className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3">
                      <Icon name="LogOut" size={18} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>

              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <nav className="lg:hidden border-t border-gray-200 py-3">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 mx-4 rounded-full ${isActive(item.path) ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon name={item.icon} size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Déconnexion</h3>
            <p className="text-gray-600 mb-6">Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl">
                Annuler
              </button>
              <button onClick={handleLogout} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl">
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;