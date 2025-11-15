import React from 'react';
import { RADashboardSummary } from '../../types';
import { UsersIcon, BarChartIcon, TrophyIcon, AlertTriangleIcon } from '../icons';

interface SummaryStatsProps {
    summary: RADashboardSummary;
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
        <div className="flex-shrink-0 p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color: color }} />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
                icon={UsersIcon} 
                title="Total Alumnos" 
                value={summary.totalStudents} 
                color="#3b82f6" 
            />
            <StatCard 
                icon={BarChartIcon} 
                title="Promedio General (Ex. Práct.)" 
                value={summary.overallAverage?.toFixed(2) ?? 'N/A'} 
                color="#8b5cf6"
            />
            <StatCard 
                icon={TrophyIcon} 
                title="Alumnos Aprobados" 
                value={`${summary.passingStudents} de ${summary.totalStudents}`}
                color="#10b981" 
            />
            <StatCard 
                icon={AlertTriangleIcon} 
                title="Alumnos en Riesgo" 
                value={`${summary.atRiskStudents} de ${summary.totalStudents}`}
                color="#f59e0b" 
            />
        </div>
    );
};

export default SummaryStats;