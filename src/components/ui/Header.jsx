import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Tableau de Bord',
      path: '/student-dashboard',
      icon: 'LayoutDashboard',
      roles: ['student', 'faculty', 'admin']
    },
    {
      label: 'Soumission',
      path: '/report-submission-form',
      icon: 'FileText',
      roles: ['student']
    },
    {
      label: 'Validation',
      path: '/faculty-validation-dashboard',
      icon: 'CheckCircle',
      roles: ['faculty', 'admin']
    },
    {
      label: 'Bibliothèque',
      path: '/public-library-catalog',
      icon: 'Library',
      roles: ['student', 'faculty', 'admin', 'guest']
    }
  ];

  const secondaryItems = [
    {
      label: 'Lecteur PDF',
      path: '/secure-pdf-reader',
      icon: 'FileText',
      roles: ['student', 'faculty', 'admin', 'guest']
    },
    {
      label: 'Administration',
      path: '/administrative-dashboard',
      icon: 'Settings',
      roles: ['admin']
    }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    // Logout logic here
    console.log('Logout clicked');
  };

  return (
    <header className="sticky top-0 z-100 bg-card border-b border-border academic-shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/student-dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-academic flex items-center justify-center">
                <Icon name="GraduationCap" size={20} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-heading font-semibold text-foreground">
                  ESPRIM
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Virtual Library
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-academic text-sm font-medium academic-transition ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
            
            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                iconName="MoreHorizontal"
                iconSize={16}
              >
                Plus
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-academic academic-shadow-lg z-200">
                  <div className="py-1">
                    {secondaryItems?.map((item) => (
                      <Link
                        key={item?.path}
                        to={item?.path}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted academic-transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon name={item?.icon} size={16} />
                        <span>{item?.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Bell" size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </Button>

            {/* User Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleUserMenu}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  Étudiant
                </span>
                <Icon name="ChevronDown" size={16} />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-academic academic-shadow-lg z-200">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-popover-foreground">
                        Jean Dupont
                      </p>
                      <p className="text-xs text-muted-foreground">
                        jean.dupont@esprim.fr
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted academic-transition"
                    >
                      <Icon name="User" size={16} />
                      <span>Profil</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted academic-transition"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Paramètres</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted academic-transition"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleMenu}
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="py-2 space-y-1">
              {[...navigationItems, ...secondaryItems]?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium academic-transition ${
                    isActivePath(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;