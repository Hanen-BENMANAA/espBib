import React, { useState, useEffect } from 'react';
import NavigationHeader from '../../components/ui/NavigationHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import UserTable from './components/UserTable';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import UserProfileModal from './components/UserProfileModal';
import CreateUserModal from './components/CreateUserModal';
import CSVImportModal from './components/CSVImportModal';

const UserManagementPanel = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  
  // Modal states
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Ahmed Ben Salah',
      email: 'ahmed.bensalah@esprim.tn',
      role: 'student',
      department: 'Informatique',
      studentId: '2024INF001',
      status: 'active',
      lastLogin: '2024-11-14T18:30:00',
      createdAt: '2024-09-15T10:00:00'
    },
    {
      id: 2,
      name: 'Fatima Zahra Mansouri',
      email: 'fatima.mansouri@esprim.tn',
      role: 'teacher',
      department: 'Informatique',
      employeeId: 'EMP001',
      status: 'active',
      lastLogin: '2024-11-14T16:45:00',
      createdAt: '2024-08-20T14:30:00'
    },
    {
      id: 3,
      name: 'Mohamed Trabelsi',
      email: 'mohamed.trabelsi@esprim.tn',
      role: 'student',
      department: 'Génie Civil',
      studentId: '2024GC002',
      status: 'active',
      lastLogin: '2024-11-14T12:15:00',
      createdAt: '2024-09-10T09:20:00'
    },
    {
      id: 4,
      name: 'Leila Khelifi',
      email: 'leila.khelifi@esprim.tn',
      role: 'admin',
      department: 'Administration',
      employeeId: 'ADM001',
      status: 'active',
      lastLogin: '2024-11-14T19:00:00',
      createdAt: '2024-07-01T08:00:00'
    },
    {
      id: 5,
      name: 'Karim Bouazizi',
      email: 'karim.bouazizi@esprim.tn',
      role: 'student',
      department: 'Génie Électrique',
      studentId: '2024GE003',
      status: 'inactive',
      lastLogin: '2024-11-10T14:20:00',
      createdAt: '2024-09-05T11:45:00'
    },
    {
      id: 6,
      name: 'Sonia Gharbi',
      email: 'sonia.gharbi@esprim.tn',
      role: 'teacher',
      department: 'Génie Mécanique',
      employeeId: 'EMP002',
      status: 'active',
      lastLogin: '2024-11-13T17:30:00',
      createdAt: '2024-08-15T13:10:00'
    },
    {
      id: 7,
      name: 'Youssef Hamdi',
      email: 'youssef.hamdi@esprim.tn',
      role: 'student',
      department: 'Génie Industriel',
      studentId: '2024GI004',
      status: 'suspended',
      lastLogin: '2024-11-08T10:00:00',
      createdAt: '2024-09-12T15:30:00'
    },
    {
      id: 8,
      name: 'Nadia Jebali',
      email: 'nadia.jebali@esprim.tn',
      role: 'teacher',
      department: 'Génie Civil',
      employeeId: 'EMP003',
      status: 'active',
      lastLogin: '2024-11-14T08:45:00',
      createdAt: '2024-08-25T16:20:00'
    }
  ]);

  // Filter and sort users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         (user?.studentId && user?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase())) ||
                         (user?.employeeId && user?.employeeId?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
    
    const matchesRole = !filters?.role || user?.role === filters?.role;
    const matchesDepartment = !filters?.department || user?.department?.toLowerCase()?.includes(filters?.department?.toLowerCase());
    const matchesStatus = !filters?.status || user?.status === filters?.status;
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  })?.sort((a, b) => {
    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];
    
    if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Statistics
  const stats = {
    total: users?.length,
    active: users?.filter(u => u?.status === 'active')?.length,
    inactive: users?.filter(u => u?.status === 'inactive')?.length,
    suspended: users?.filter(u => u?.status === 'suspended')?.length,
    students: users?.filter(u => u?.role === 'student')?.length,
    teachers: users?.filter(u => u?.role === 'teacher')?.length,
    admins: users?.filter(u => u?.role === 'admin')?.length
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleSelectUser = (userId, selected) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedUsers(filteredUsers?.map(user => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(prev => prev?.map(user => 
      user?.id === updatedUser?.id ? { ...user, ...updatedUser } : user
    ));
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleCreateUser = (newUser) => {
    const user = {
      ...newUser,
      id: users?.length + 1,
      status: 'active',
      lastLogin: null,
      createdAt: new Date()?.toISOString()
    };
    setUsers(prev => [...prev, user]);
    setShowCreateUser(false);
  };

  const handleResetPassword = (user) => {
    // Mock password reset
    alert(`Réinitialisation du mot de passe envoyée à ${user?.email}`);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev?.map(u => 
      u?.id === user?.id ? { ...u, status: newStatus } : u
    ));
  };

  const handleBulkActivate = () => {
    setUsers(prev => prev?.map(user => 
      selectedUsers?.includes(user?.id) ? { ...user, status: 'active' } : user
    ));
    setSelectedUsers([]);
  };

  const handleBulkDeactivate = () => {
    setUsers(prev => prev?.map(user => 
      selectedUsers?.includes(user?.id) ? { ...user, status: 'inactive' } : user
    ));
    setSelectedUsers([]);
  };

  const handleBulkRoleChange = (newRole) => {
    setUsers(prev => prev?.map(user => 
      selectedUsers?.includes(user?.id) ? { ...user, role: newRole } : user
    ));
    setSelectedUsers([]);
  };

  const handleBulkExport = () => {
    const selectedUserData = users?.filter(user => selectedUsers?.includes(user?.id));
    const csvContent = [
      'Nom,Email,Rôle,Département,Statut,Dernière connexion,Créé le',
      ...selectedUserData?.map(user => [
        user?.name,
        user?.email,
        user?.role,
        user?.department,
        user?.status,
        user?.lastLogin || 'Jamais',
        new Date(user.createdAt)?.toLocaleDateString('fr-FR')
      ]?.join(','))
    ]?.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs_selectionnes.csv';
    a?.click();
    window.URL?.revokeObjectURL(url);
    
    setSelectedUsers([]);
  };

  const handleCSVImport = (results) => {
    // Mock handling of CSV import results
    console.log('Import results:', results);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        userRole="admin"
      />
      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <NavigationHeader
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          userRole="admin"
          userName="Leila Khelifi"
          institutionName="ESPRIM"
        />

        {/* Page Content */}
        <main className="pt-16 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <BreadcrumbTrail />

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-text-primary">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-text-secondary mt-1">
                  Administration complète des comptes étudiants, enseignants et administrateurs
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCSVImport(true)}
                  iconName="Upload"
                  iconSize={16}
                >
                  Importer CSV
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowCreateUser(true)}
                  iconName="UserPlus"
                  iconSize={16}
                >
                  Nouvel utilisateur
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} className="text-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stats?.total}</div>
                    <div className="text-sm text-text-secondary">Total utilisateurs</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={20} className="text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stats?.active}</div>
                    <div className="text-sm text-text-secondary">Utilisateurs actifs</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="GraduationCap" size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stats?.students}</div>
                    <div className="text-sm text-text-secondary">Étudiants</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon name="BookOpen" size={20} className="text-secondary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-primary">{stats?.teachers}</div>
                    <div className="text-sm text-text-secondary">Enseignants</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Operations Toolbar */}
            <BulkOperationsToolbar
              selectedCount={selectedUsers?.length}
              onBulkActivate={handleBulkActivate}
              onBulkDeactivate={handleBulkDeactivate}
              onBulkRoleChange={handleBulkRoleChange}
              onBulkExport={handleBulkExport}
              onClearSelection={() => setSelectedUsers([])}
            />

            {/* User Table */}
            <UserTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
              onEditUser={handleEditUser}
              onViewProfile={handleViewProfile}
              onResetPassword={handleResetPassword}
              onToggleStatus={handleToggleStatus}
              sortConfig={sortConfig}
              onSort={handleSort}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </main>
      </div>
      {/* Modals */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSave={handleCreateUser}
      />
      <CSVImportModal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
};

export default UserManagementPanel;