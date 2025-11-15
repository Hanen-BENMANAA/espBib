import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationHeader = ({ 
  isCollapsed = false, 
  onToggleSidebar, 
  userRole = 'teacher',
  userName = 'Marie Dubois',
  institutionName = 'Université de Paris'
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      student: 'Étudiant',
      teacher: 'Enseignant',
      admin: 'Administrateur'
    };
    return roleNames?.[role] || 'Utilisateur';
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-100 bg-surface border-b border-border shadow-academic">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Mobile Menu Toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
            iconName="Menu"
            iconSize={20}
          >
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
          
          {/* Breadcrumb placeholder for mobile */}
          <div className="ml-4 lg:hidden">
            <h1 className="text-lg font-heading font-medium text-text-primary">
              ESPRIM Virtual Library
            </h1>
          </div>
        </div>

        {/* Right Section - User Controls */}
        <div className="flex items-center space-x-4">
          {/* Session Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-muted rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-caption text-text-secondary">
              Session active
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-muted transition-academic"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {userName?.split(' ')?.map(n => n?.[0])?.join('')}
                </span>
              </div>
              
              {/* User Info - Hidden on mobile */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-text-primary">
                  {userName}
                </div>
                <div className="text-xs font-caption text-text-secondary">
                  {getRoleDisplayName(userRole)}
                </div>
              </div>
              
              <Icon 
                name={showUserMenu ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-text-secondary transition-academic"
              />
            </Button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-academic-lg z-200">
                <div className="p-4 border-b border-border">
                  <div className="font-medium text-text-primary">{userName}</div>
                  <div className="text-sm font-caption text-text-secondary">
                    {getRoleDisplayName(userRole)} • {institutionName}
                  </div>
                </div>
                
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-academic flex items-center space-x-3">
                    <Icon name="User" size={16} className="text-text-secondary" />
                    <span>Mon Profil</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-academic flex items-center space-x-3">
                    <Icon name="Settings" size={16} className="text-text-secondary" />
                    <span>Paramètres</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-academic flex items-center space-x-3">
                    <Icon name="HelpCircle" size={16} className="text-text-secondary" />
                    <span>Aide</span>
                  </button>
                  
                  <div className="border-t border-border mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-error/10 transition-academic flex items-center space-x-3"
                    >
                      <Icon name="LogOut" size={16} className="text-error" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;