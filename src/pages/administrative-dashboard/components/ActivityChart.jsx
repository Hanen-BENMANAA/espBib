import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

import Button from '../../../components/ui/Button';

const ActivityChart = () => {
  const [chartType, setChartType] = useState('submissions');
  const [dateRange, setDateRange] = useState('7days');

  const submissionData = [
    { name: 'Lun', soumissions: 12, validations: 8 },
    { name: 'Mar', soumissions: 19, validations: 15 },
    { name: 'Mer', soumissions: 15, validations: 12 },
    { name: 'Jeu', soumissions: 22, validations: 18 },
    { name: 'Ven', soumissions: 28, validations: 25 },
    { name: 'Sam', soumissions: 8, validations: 6 },
    { name: 'Dim', soumissions: 5, validations: 4 }
  ];

  const userActivityData = [
    { name: 'Lun', etudiants: 45, enseignants: 12, admin: 3 },
    { name: 'Mar', etudiants: 52, enseignants: 15, admin: 4 },
    { name: 'Mer', etudiants: 48, enseignants: 13, admin: 2 },
    { name: 'Jeu', etudiants: 61, enseignants: 18, admin: 5 },
    { name: 'Ven', etudiants: 55, enseignants: 16, admin: 3 },
    { name: 'Sam', etudiants: 23, enseignants: 8, admin: 1 },
    { name: 'Dim', etudiants: 18, enseignants: 5, admin: 1 }
  ];

  const chartOptions = [
    { value: 'submissions', label: 'Soumissions & Validations', icon: 'FileText' },
    { value: 'users', label: 'Activité Utilisateurs', icon: 'Users' }
  ];

  const dateRangeOptions = [
    { value: '7days', label: '7 derniers jours' },
    { value: '30days', label: '30 derniers jours' },
    { value: '3months', label: '3 derniers mois' }
  ];

  const getCurrentData = () => {
    return chartType === 'submissions' ? submissionData : userActivityData;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-0">
          Graphiques d'Activité
        </h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-2">
            {chartOptions?.map((option) => (
              <Button
                key={option?.value}
                variant={chartType === option?.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType(option?.value)}
                iconName={option?.icon}
                iconPosition="left"
                iconSize={16}
              >
                {option?.label}
              </Button>
            ))}
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e?.target?.value)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            {dateRangeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'submissions' ? (
            <BarChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="soumissions" fill="var(--color-primary)" name="Soumissions" />
              <Bar dataKey="validations" fill="var(--color-success)" name="Validations" />
            </BarChart>
          ) : (
            <LineChart data={getCurrentData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="etudiants" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                name="Étudiants"
              />
              <Line 
                type="monotone" 
                dataKey="enseignants" 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                name="Enseignants"
              />
              <Line 
                type="monotone" 
                dataKey="admin" 
                stroke="var(--color-secondary)" 
                strokeWidth={2}
                name="Administrateurs"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;