import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedSidebar = ({ 
  isCollapsed = false, 
  isOpen = false, 
  onToggle,
  e = 'teacher' 
}) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  // Navigation items with role-based visibility
  const navigationItems = [
    {
      id: 'auth',
      label: 'Authentification',
      path: '/login-authentication',
      icon: 'Shield',
      roles: ['admin', 'teacher', 'student'],
      description: 'Accès sécurisé au système'
    },
    {
      id: 'validation',
      label: 'Validation des Rapports',
      icon: 'FileCheck',
      roles: ['teacher', 'admin'],
      description: 'Révision et validation des documents',
      children: [
        {
          id: 'dashboard',
          label: 'Tableau de Bord',
          path: '/teacher-validation-dashboard',
          icon: 'LayoutDashboard',
          description: 'Vue d\'ensemble des validations'
        },
        {
          id: 'interface',
          label: 'Interface de Validation',
          path: '/report-validation-interface',
          icon: 'CheckSquare',
          description: 'Révision détaillée des rapports'
        }
      ]
    },
    {
      id: 'users',
      label: 'Gestion des Utilisateurs',
      path: '/user-management-panel',
      icon: 'Users',
      roles: ['admin'],
      description: 'Administration des comptes utilisateurs'
    },
    {
      id: 'system',
      label: 'Configuration Système',
      path: '/system-configuration',
      icon: 'Settings',
      roles: ['admin'],
      description: 'Paramètres et configuration globale'
    }
  ];

  // Filter navigation items based on user role
  const getVisibleItems = () => {
    return navigationItems?.filter(item => 
      item?.roles?.includes(e)
    );
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev?.[sectionId]
    }));
  };

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  const isParentActive = (item) => {
    if (item?.children) {
      return item?.children?.some(child => isActiveRoute(child?.path));
    }
    return false;
  };

  const NavItem = ({ item, isChild = false }) => {
    const hasChildren = item?.children && item?.children?.length > 0;
    const isExpanded = expandedSections?.[item?.id];
    const isActive = item?.path ? isActiveRoute(item?.path) : isParentActive(item);

    if (hasChildren) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => toggleSection(item?.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-academic group ${
              isActive 
                ? 'bg-primary text-primary-foreground shadow-academic' 
                : 'text-text-primary hover:bg-muted hover:text-text-primary'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon 
                name={item?.icon} 
                size={20} 
                className={isActive ? 'text-primary-foreground' : 'text-text-secondary group-hover:text-text-primary'}
              />
              {!isCollapsed && (
                <span className="font-medium">{item?.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <Icon 
                name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                size={16}
                className={`transition-academic ${isActive ? 'text-primary-foreground' : 'text-text-secondary'}`}
              />
            )}
          </button>
          {/* Children */}
          {!isCollapsed && isExpanded && (
            <div className="ml-6 space-y-1 border-l border-border pl-4">
              {item?.children?.map(child => (
                <NavItem key={child?.id} item={child} isChild={true} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        href={item?.path}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-academic group ${
          isChild ? 'text-sm' : ''
        } ${
          isActive 
            ? 'bg-primary text-primary-foreground shadow-academic' 
            : 'text-text-primary hover:bg-muted hover:text-text-primary'
        }`}
        title={isCollapsed ? item?.label : item?.description}
      >
        <Icon 
          name={item?.icon} 
          size={isChild ? 18 : 20} 
          className={isActive ? 'text-primary-foreground' : 'text-text-secondary group-hover:text-text-primary'}
        />
        {!isCollapsed && (
          <span className={`font-medium ${isChild ? 'text-sm' : ''}`}>
            {item?.label}
          </span>
        )}
      </a>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-150 lg:hidden"
          onClick={onToggle}
        />
      )}
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-150 h-full bg-surface border-r border-border shadow-academic-lg
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:fixed
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                {/* ESPRIM Logo */}
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="BookOpen" size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-heading font-semibold text-lg text-text-primary">
                    ESPRIM
                  </h1>
                  <p className="text-xs font-caption text-text-secondary">
                    Virtual Library
                  </p>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Icon name="BookOpen" size={20} className="text-primary-foreground" />
              </div>
            )}

            {/* Desktop Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hidden lg:flex"
            >
              <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {getVisibleItems()?.map(item => (
              <NavItem key={item?.id} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed && (
              <div className="text-xs font-caption text-text-secondary text-center">
                <p>© 2024 ESPRIM</p>
                <p>Version 2.1.0</p>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-2 h-2 bg-success rounded-full mx-auto" title="Système opérationnel" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default RoleBasedSidebar;