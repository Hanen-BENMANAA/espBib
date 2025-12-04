// src/pages/user-profile/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { getUser } from '../../lib/auth';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const token = session.token;
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
        });
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement du profil'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!profileData.firstName?.trim() || !profileData.lastName?.trim()) {
      setMessage({
        type: 'error',
        text: 'Le prénom et le nom sont requis'
      });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const session = JSON.parse(localStorage.getItem('esprim_session') || '{}');
      const token = session.token;

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName
        })
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Profil mis à jour avec succès !' 
        });
        setIsEditing(false);
        
        // Update session storage
        session.userName = `${profileData.firstName} ${profileData.lastName}`;
        localStorage.setItem('esprim_session', JSON.stringify(session));
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.message || 'Erreur lors de la mise à jour du profil' 
        });
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ 
        type: 'error', 
        text: 'Erreur de connexion au serveur' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      student: 'Étudiant',
      teacher: 'Enseignant',
      admin: 'Administrateur'
    };
    return roleMap[role] || role;
  };

  const getRoleIcon = (role) => {
    const iconMap = {
      student: 'GraduationCap',
      teacher: 'BookOpen',
      admin: 'Shield'
    };
    return iconMap[role] || 'User';
  };

  const getRoleColor = (role) => {
    const colorMap = {
      student: 'bg-blue-600',
      teacher: 'bg-green-600',
      admin: 'bg-red-600'
    };
    return colorMap[role] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <Icon name="ChevronLeft" size={20} />
          <span className="text-sm font-medium">Retour</span>
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className={`w-24 h-24 ${getRoleColor(user?.role)} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon name={getRoleIcon(user?.role)} size={48} className="text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mon Profil
              </h1>
              <p className="text-gray-600 mb-3">
                Gérez vos informations personnelles
              </p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'teacher' 
                    ? 'bg-green-100 text-green-800' 
                    : user?.role === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Icon name="Shield" size={14} className="mr-1" />
                  {getRoleDisplay(user?.role)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Compte Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <Icon 
                name={message.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
                size={24} 
                className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}
              />
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-red-50 to-blue-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Icon name="User" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Informations Personnelles</h3>
                  <p className="text-sm text-gray-600">Vos données de profil ESPRIM</p>
                </div>
              </div>
              
              {!isEditing && (
                <Button
                  variant="default"
                  size="sm"
                  iconName="Edit"
                  iconPosition="left"
                  onClick={() => setIsEditing(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Modifier
                </Button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-6">
            
            {/* Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Prénom"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  required
                  placeholder="Votre prénom"
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Input
                  label="Nom"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  required
                  placeholder="Votre nom"
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
            </div>

            {/* Email Section */}
            <div>
              <Input
                label="Email Institutionnel"
                value={profileData.email}
                disabled
                type="email"
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Icon name="Lock" size={12} />
                L'email institutionnel ne peut pas être modifié
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">À propos de vos données</p>
                  <p>
                    Vos informations sont sécurisées et utilisées uniquement dans le cadre de la plateforme ESPRIM. 
                    Pour modifier votre email, contactez l'administration.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfileData();
                  setMessage({ type: '', text: '' });
                }}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button
                variant="default"
                iconName="Save"
                iconPosition="left"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}

        </div>

        {/* Account Info Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sécurité du Compte</h3>
                <p className="text-sm text-gray-600">Protégez votre compte ESPRIM</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Membre depuis</p>
                    <p className="text-gray-600">{new Date().toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon name="Clock" size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dernière connexion</p>
                    <p className="text-gray-600">{new Date().toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Statut du compte</p>
                    <p className="text-green-600 font-medium">Actif et vérifié</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                iconName="Key"
                iconPosition="left"
                onClick={() => navigate('/change-password')}
                fullWidth
                className="border-gray-300 hover:bg-gray-50"
              >
                Modifier le mot de passe
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default UserProfilePage;