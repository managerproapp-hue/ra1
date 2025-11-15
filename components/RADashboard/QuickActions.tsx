import React from 'react';
import { PencilRulerIcon, ClipboardListIcon, FileTextIcon, SettingsIcon } from '../icons';

const actions = [
    { label: 'Evaluar Ex. Práctico', icon: PencilRulerIcon, color: 'text-blue-500' },
    { label: 'Ver Resumen Notas', icon: ClipboardListIcon, color: 'text-green-500' },
    { label: 'Generar Informe RA', icon: FileTextIcon, color: 'text-purple-500' },
    { label: 'Configurar Rúbricas', icon: SettingsIcon, color: 'text-gray-500' },
];

const QuickActions: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button key={index} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <Icon className={`w-8 h-8 mb-2 ${action.color}`} />
                            <span className="text-sm font-medium text-center text-gray-700">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;