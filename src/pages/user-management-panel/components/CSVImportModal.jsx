import React, { useState, useRef } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CSVImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Validate headers
      const requiredHeaders = ['name', 'email', 'role'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        setErrors([`Colonnes manquantes: ${missingHeaders.join(', ')}`]);
        setPreview([]);
        return;
      }

      // Parse data rows
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return { ...row, rowNumber: index + 2 };
      });

      // Validate data
      const validationErrors = [];
      data.forEach((row, index) => {
        if (!row.name) validationErrors.push(`Ligne ${row.rowNumber}: Nom manquant`);
        if (!row.email) validationErrors.push(`Ligne ${row.rowNumber}: Email manquant`);
        if (!row.role) validationErrors.push(`Ligne ${row.rowNumber}: Rôle manquant`);
        if (row.email && !/\S+@\S+\.\S+/.test(row.email)) {
          validationErrors.push(`Ligne ${row.rowNumber}: Email invalide`);
        }
        if (row.role && !['student', 'teacher', 'admin'].includes(row.role)) {
          validationErrors.push(`Ligne ${row.rowNumber}: Rôle invalide (doit être: student, teacher, admin)`);
        }
      });

      setErrors(validationErrors);
      setPreview(data.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file || errors.length > 0) return;

    setIsProcessing(true);
    try {
      await onImport(file);
      handleClose();
    } catch (error) {
      setErrors(['Erreur lors de l\'importation']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = 'name,email,role,department,studentId,employeeId\n' +
                      'John Doe,john@example.com,student,Informatique,12345,\n' +
                      'Jane Smith,jane@example.com,teacher,Génie Civil,,EMP001\n' +
                      'Admin User,admin@example.com,admin,Administration,,ADM001\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Importer des utilisateurs (CSV)
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-background-secondary rounded-lg p-4">
            <h3 className="text-sm font-medium text-text-primary mb-2">Instructions</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Le fichier CSV doit contenir les colonnes: name, email, role</li>
              <li>• Colonnes optionnelles: department, studentId, employeeId</li>
              <li>• Le rôle doit être: student, teacher, ou admin</li>
              <li>• Téléchargez le modèle pour voir le format correct</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="mt-3"
              iconName="Download"
              iconSize={14}
            >
              Télécharger le modèle
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Sélectionner un fichier CSV
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file"
              />
              <label htmlFor="csv-file" className="cursor-pointer">
                <Icon name="Upload" size={32} className="mx-auto text-text-secondary mb-2" />
                <p className="text-sm text-text-secondary">
                  {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
                </p>
              </label>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-error mb-2">Erreurs de validation</h4>
              <ul className="text-sm text-error space-y-1 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-primary">Aperçu (5 premières lignes)</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-background-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left">Nom</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Rôle</th>
                      <th className="px-3 py-2 text-left">Département</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">{row.role}</td>
                        <td className="px-3 py-2">{row.department || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleImport}
            disabled={!file || errors.length > 0 || isProcessing}
          >
            {isProcessing ? 'Importation...' : 'Importer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
