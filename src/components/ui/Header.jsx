// src/components/ui/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import NotificationPanel from '../notifications/NotificationPanel';
import { logout } from '../../lib/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  // Get user from session
  const sessionStr = localStorage.getItem('esprim_session') || sessionStorage.getItem('esprim_session');
  const session = sessionStr ? JSON.parse(sessionStr) : null;

  const role = session?.userRole || 'student';
  const isTeacher = role === 'teacher' || role === 'faculty' || role === 'admin';
  
  // Get user name from session
  const firstName = session?.userName?.split(' ')[0] || '';
  const lastName = session?.userName?.split(' ')[1] || '';
  const userName = session?.userName || (isTeacher ? 'Enseignant' : 'Étudiant');
  const userEmail = session?.userEmail || 'user@esprim.tn';
  
  // Generate initials
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Navigation items based on role
  const mainNavItems = isTeacher
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

  const isActive = (path) => location.pathname === path;

  // Get role badge color
  const getRoleColor = () => {
    switch(role) {
      case 'teacher':
      case 'faculty':
        return 'bg-green-600';
      case 'admin':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  // Get role display text
  const getRoleDisplay = () => {
    switch(role) {
      case 'teacher':
      case 'faculty':
        return 'Enseignant';
      case 'admin':
        return 'Administrateur';
      default:
        return 'Étudiant';
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to={isTeacher ? '/teacher/dashboard' : '/student/dashboard'} 
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Icon name="GraduationCap" size={24} color="white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">ESPRIM</h1>
                  <p className="text-xs text-gray-500 -mt-1">Virtual Library</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {mainNavItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isActive(item.path) 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right Section: Notifications + Profile */}
            <div className="flex items-center gap-3">

              {/* Notifications */}
              <NotificationPanel />

              {/* User Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-100"
                >
                  <div className={`w-9 h-9 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-semibold shadow-md`}>
                    {userInitials}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
                  </div>
                  <Icon 
                    name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    className="text-gray-500"
                  />
                </Button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-red-50 to-blue-50 border-b border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                          {userInitials}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{userName}</p>
                          <p className="text-xs text-gray-600">{userEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          role === 'teacher' || role === 'faculty' 
                            ? 'bg-green-100 text-green-800' 
                            : role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Icon name="Shield" size={12} className="mr-1" />
                          {getRoleDisplay()}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon name="User" size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Profil</p>
                          <p className="text-xs text-gray-500">Gérer vos informations</p>
                        </div>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Icon name="Settings" size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Paramètres</p>
                          <p className="text-xs text-gray-500">Préférences et sécurité</p>
                        </div>
                      </Link>

                      <div className="my-2 border-t border-gray-200"></div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Icon name="LogOut" size={16} className="text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Déconnexion</p>
                          <p className="text-xs text-red-500">Quitter votre session</p>
                        </div>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Session active</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>En ligne</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Icon name={isMenuOpen ? "X" : "Menu"} size={24} />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-gray-50">
              <nav className="py-3 px-4 space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path) 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Icon name="LogOut" size={32} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirmer la déconnexion
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {userName}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Êtes-vous sûr de vouloir vous déconnecter de votre compte ESPRIM ?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Attention</p>
                    <p>Vos données non sauvegardées seront perdues. Assurez-vous d'avoir enregistré votre travail.</p>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connecté en tant que</span>
                  <span className="font-medium text-gray-900">{getRoleDisplay()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Session depuis</span>
                  <span className="font-medium text-gray-900">
                    {new Date(session?.loginTime || Date.now()).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
              >
                Annuler
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Icon name="LogOut" size={18} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;