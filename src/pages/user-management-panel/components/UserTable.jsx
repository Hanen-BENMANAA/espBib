import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const UserTable = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onEditUser,
  onViewProfile,
  onResetPassword,
  onToggleStatus,
  sortConfig,
  onSort,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(users?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users?.slice(startIndex, endIndex);

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'student': return 'Étudiant';
      case 'teacher': return 'Enseignant';
      case 'admin': return 'Administrateur';
      default: return role;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-gray-500';
      case 'suspended': return 'text-error';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'student', label: 'Étudiant' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'admin', label: 'Administrateur' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Filters and Search */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher par nom, email ou ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              iconName="Search"
              iconSize={16}
            />
          </div>

          <div className="flex gap-2">
            <Select
              options={roleOptions}
              value={filters?.role}
              onChange={(value) => onFilterChange('role', value)}
              className="w-40"
            />
            <Select
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => onFilterChange('status', value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background-secondary">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedUsers?.length === currentUsers?.length && currentUsers?.length > 0}
                  indeterminate={selectedUsers?.length > 0 && selectedUsers?.length < currentUsers?.length}
                  onChange={(checked) => onSelectAll(checked)}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Nom</span>
                  <Icon name={getSortIcon('name')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('email')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Email</span>
                  <Icon name={getSortIcon('email')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('role')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Rôle</span>
                  <Icon name={getSortIcon('role')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('department')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Département</span>
                  <Icon name={getSortIcon('department')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Statut</span>
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => onSort('lastLogin')}
                  className="flex items-center space-x-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  <span>Dernière connexion</span>
                  <Icon name={getSortIcon('lastLogin')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers?.map((user) => (
              <tr key={user?.id} className="border-b border-border hover:bg-background-secondary/50">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(checked) => onSelectUser(user?.id, checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{user?.name}</div>
                      <div className="text-xs text-text-secondary">
                        {user?.studentId || user?.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-text-primary">{user?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {getRoleLabel(user?.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-text-primary">{user?.department}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.status === 'active' ? 'bg-success/10 text-success' :
                    user?.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-error/10 text-error'
                  }`}>
                    {getStatusLabel(user?.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-text-primary">
                    {user?.lastLogin ? new Date(user?.lastLogin)?.toLocaleDateString('fr-FR') : 'Jamais'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(user)}
                      iconName="Eye"
                      iconSize={14}
                      title="Voir le profil"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      iconName="Edit"
                      iconSize={14}
                      title="Modifier"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResetPassword(user)}
                      iconName="Key"
                      iconSize={14}
                      title="Réinitialiser le mot de passe"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStatus(user)}
                      iconName={user?.status === 'active' ? 'UserX' : 'UserCheck'}
                      iconSize={14}
                      title={user?.status === 'active' ? 'Désactiver' : 'Activer'}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            Affichage de {startIndex + 1} à {Math.min(endIndex, users?.length)} sur {users?.length} utilisateurs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
              iconSize={14}
            >
              Précédent
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
              iconSize={14}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
