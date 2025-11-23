import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaTools, FaHistory, FaClipboardCheck } from 'react-icons/fa';

const Maintenance = () => {
  const navigate = useNavigate();
  const { selectedAircraft } = useAuth();

  const handleScheduleMaintenance = () => {
    navigate('/maintenance/schedule');
  };

  const maintenanceOptions = [
    {
      id: 'schedule',
      title: 'Schedule Maintenance',
      description: 'Create and manage scheduled maintenance jobs with inspection checklists',
      icon: FaCalendarAlt,
      color: 'blue',
      action: handleScheduleMaintenance,
    },
    {
      id: 'history',
      title: 'Maintenance History',
      description: 'View past maintenance records and completed job cards',
      icon: FaHistory,
      color: 'green',
      action: () => navigate('/maintenance/history'),
    },
    {
      id: 'active',
      title: 'Active Jobs',
      description: 'Monitor ongoing maintenance work and job status',
      icon: FaTools,
      color: 'orange',
      action: () => navigate('/maintenance/active'),
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Generate maintenance reports and analyze aircraft health',
      icon: FaClipboardCheck,
      color: 'purple',
      action: () => navigate('/maintenance/reports'),
    },
  ];

  const colorClasses = {
    blue: {
      border: 'border-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-100',
      text: 'text-blue-600',
    },
    green: {
      border: 'border-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-600',
      hoverBg: 'hover:bg-green-100',
      text: 'text-green-600',
    },
    orange: {
      border: 'border-orange-600',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-600',
      hoverBg: 'hover:bg-orange-100',
      text: 'text-orange-600',
    },
    purple: {
      border: 'border-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-100',
      text: 'text-purple-600',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Maintenance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage aircraft maintenance schedules, inspections, and job cards
        </p>
      </div>

      {/* Selected Aircraft Info */}
      {selectedAircraft && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Selected Aircraft:</span>
            <span className="text-sm font-medium text-slate-900">
              {selectedAircraft.registration || ''} {selectedAircraft.name || ''}
            </span>
          </div>
        </div>
      )}

      {/* Maintenance Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceOptions.map((option) => {
          const colors = colorClasses[option.color];
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              onClick={option.action}
              className={`rounded-2xl border-l-4 ${colors.border} bg-white p-5 shadow-sm transition-all ${colors.hoverBg} text-left`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-xl ${colors.iconBg} p-3 text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Stats (Optional) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-600 mb-1">Upcoming Maintenance</div>
          <div className="text-2xl font-bold text-slate-900">3</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-600 mb-1">Active Jobs</div>
          <div className="text-2xl font-bold text-slate-900">1</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
          <div className="text-xs font-semibold text-slate-600 mb-1">Completed This Month</div>
          <div className="text-2xl font-bold text-slate-900">7</div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
