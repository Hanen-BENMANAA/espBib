// src/pages/user-settings/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { getUser } from '../../lib/auth';

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    reportUpdates: true,
    commentNotifications: true,
    validationAlerts: true,
    language: 'fr',
    theme: 'light'
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setMessage({ 
      type: 'info', 
      text: 'Paramètre modifié. N\'oubliez pas de sauvegarder.' 
    });
  };

  const handleSave = () => {
    // Save to localStorage for now (can be extended to backend)
    localStorage.setItem('user_settings', JSON.stringify(settings));
    setMessage({ 
      type: 'success', 
      text: 'Paramètres enregistrés avec succès !' 
    });
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="font-medium text-gray-900 mb-1">{label}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
          enabled ? 'bg-red-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Settings" size={48} className="text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Paramètres
              </h1>
              <p className="text-gray-600">
                Personnalisez votre expérience ESPRIM
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : message.type === 'info'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <Icon 
                name={
                  message.type === 'success' ? 'CheckCircle' : 
                  message.type === 'info' ? 'Info' : 
                  'AlertCircle'
                } 
                size={24} 
                className={
                  message.type === 'success' ? 'text-green-600' : 
                  message.type === 'info' ? 'text-blue-600' : 
                  'text-red-600'
                }
              />
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 
                message.type === 'info' ? 'text-blue-800' : 
                'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">

          {/* Notifications Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon name="Bell" size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                  <p className="text-sm text-gray-600">Gérez vos préférences de notification</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                label="Notifications par Email"
                description="Recevoir des notifications par email"
              />
              
              <ToggleSwitch
                enabled={settings.reportUpdates}
                onChange={() => handleToggle('reportUpdates')}
                label="Mises à jour des rapports"
                description="Notifications sur les changements de statut"
              />
              
              <ToggleSwitch
                enabled={settings.commentNotifications}
                onChange={() => handleToggle('commentNotifications')}
                label="Commentaires"
                description="Alertes pour les nouveaux commentaires"
              />
              
              <ToggleSwitch
                enabled={settings.validationAlerts}
                onChange={() => handleToggle('validationAlerts')}
                label="Alertes de validation"
                description="Notifications de validation/rejet"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Icon name="Sliders" size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Préférences</h2>
                  <p className="text-sm text-gray-600">Personnalisez l'interface</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Language */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Langue de l'interface
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'fr', label: 'Français', flag: '🇫🇷' },
                    { value: 'en', label: 'English', flag: '🇬🇧' },
                    { value: 'ar', label: 'العربية', flag: '🇹🇳' }
                  ].map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, language: lang.value }));
                        setMessage({ type: 'info', text: 'Langue modifiée. Sauvegardez pour appliquer.' });
                      }}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                        settings.language === lang.value
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <span className={`text-sm font-medium ${
                        settings.language === lang.value ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Thème d'affichage
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Clair', icon: 'Sun' },
                    { value: 'dark', label: 'Sombre', icon: 'Moon' },
                    { value: 'auto', label: 'Auto', icon: 'Laptop' }
                  ].map(theme => (
                    <button
                      key={theme.value}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, theme: theme.value }));
                        setMessage({ type: 'info', text: 'Thème modifié. Sauvegardez pour appliquer.' });
                      }}
                      className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all ${
                        settings.theme === theme.value
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon 
                        name={theme.icon} 
                        size={32} 
                        className={settings.theme === theme.value ? 'text-red-600' : 'text-gray-600'}
                      />
                      <span className={`text-sm font-medium ${
                        settings.theme === theme.value ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
                  <p className="text-sm text-gray-600">Protégez votre compte</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Compte sécurisé</p>
                    <p>Votre compte est protégé par un mot de passe fort et une authentification sécurisée.</p>
                  </div>
                </div>
              </div>

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

        {/* Save Button */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            size="lg"
            iconName="Save"
            iconPosition="left"
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30"
          >
            Enregistrer les modifications
          </Button>
        </div>

      </main>
    </div>
  );
};

export default UserSettingsPage;