import React from 'react';
import Icon from '../../../components/AppIcon';

const ValidationStatsPanel = () => {
  const stats = [
    {
      id: 1,
      title: "Rapports en Attente",
      value: 23,
      change: "+5",
      changeType: "increase",
      icon: "Clock",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      id: 2,
      title: "Validés Aujourd\'hui",
      value: 8,
      change: "+3",
      changeType: "increase",
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      id: 3,
      title: "Temps Moyen de Révision",
      value: "2.4h",
      change: "-0.3h",
      changeType: "decrease",
      icon: "Timer",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: 4,
      title: "Taux de Validation",
      value: "87%",
      change: "+2%",
      changeType: "increase",
      icon: "TrendingUp",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  const departmentWorkload = [
    { department: "Génie Informatique", pending: 8, total: 15, percentage: 53 },
    { department: "Génie Électrique", pending: 6, total: 12, percentage: 50 },
    { department: "Génie Mécanique", pending: 5, total: 10, percentage: 50 },
    { department: "Génie Civil", pending: 4, total: 8, percentage: 50 }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats?.map((stat) => (
          <div key={stat?.id} className="bg-card border border-border rounded-lg p-4 academic-shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat?.bgColor}`}>
                <Icon name={stat?.icon} size={20} className={stat?.color} />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                stat?.changeType === 'increase' ?'bg-success/10 text-success' :'bg-primary/10 text-primary'
              }`}>
                {stat?.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-sm text-muted-foreground">{stat?.title}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Department Workload */}
      <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Charge de Travail par Département</h3>
          <Icon name="BarChart3" size={20} className="text-muted-foreground" />
        </div>
        
        <div className="space-y-4">
          {departmentWorkload?.map((dept, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{dept?.department}</span>
                <span className="text-muted-foreground">
                  {dept?.pending}/{dept?.total} rapports
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 academic-transition"
                  style={{ width: `${dept?.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6 academic-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Actions Rapides</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted rounded-lg academic-transition">
            <Icon name="FileText" size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Exporter les Statistiques</p>
              <p className="text-xs text-muted-foreground">Télécharger le rapport mensuel</p>
            </div>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted rounded-lg academic-transition">
            <Icon name="Settings" size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Paramètres de Validation</p>
              <p className="text-xs text-muted-foreground">Configurer les critères</p>
            </div>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted rounded-lg academic-transition">
            <Icon name="Bell" size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">Gérer les alertes</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationStatsPanel;