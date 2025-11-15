import React from 'react';
import Icon from '../../../components/AppIcon';

const StudentStatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Rapports soumis',
      value: stats?.totalSubmissions,
      icon: 'FileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Rapports validés',
      value: stats?.validatedReports,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'En attente',
      value: stats?.pendingReports,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Brouillons',
      value: stats?.draftReports,
      icon: 'Edit',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-academic p-4 academic-shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-academic ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stat?.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat?.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentStatsOverview;