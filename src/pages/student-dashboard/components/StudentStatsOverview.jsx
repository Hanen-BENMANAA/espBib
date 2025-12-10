// src/pages/student-dashboard/components/StudentStatsOverview.jsx
import React from 'react';
import { FileText, Clock, CheckCircle, Edit } from 'lucide-react';

const StudentStatsOverview = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Rapports soumis */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Rapports soumis</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.totalSubmissions || 0}
            </p>
          </div>
          <FileText className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      {/* En attente */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">En attente</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats?.pendingReports || 0}
            </p>
          </div>
          <Clock className="h-12 w-12 text-orange-600" />
        </div>
      </div>

      {/* Validés */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Validés</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.validatedReports || 0}
            </p>
          </div>
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>

      {/* Brouillons */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Brouillons</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.draftReports || 0}
            </p>
          </div>
          <Edit className="h-12 w-12 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default StudentStatsOverview;