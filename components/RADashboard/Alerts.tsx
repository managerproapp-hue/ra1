import React from 'react';
import { InfoIcon, AlertTriangleIcon } from '../icons';

const alerts = [
    { type: 'warning', text: 'Hay 3 alumnos con una media de RA por debajo de 4.0.', priority: 'Alta' },
    { type: 'info', text: 'Nueva evaluación de Examen Práctico (T2) disponible para calificar.', priority: 'Media' },
    { type: 'info', text: 'El progreso general del RA2 ha aumentado un 5% esta semana.', priority: 'Baja' }
];

const Alerts: React.FC = () => {
    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'warning': return { icon: <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50', border: 'border-yellow-400' };
            default: return { icon: <InfoIcon className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', border: 'border-blue-400' };
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <div className="space-y-3">
                {alerts.map((alert, index) => {
                    const styles = getAlertStyles(alert.type);
                    return (
                        <div key={index} className={`flex items-start p-3 rounded-md border-l-4 ${styles.bg} ${styles.border}`}>
                            <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-700">{alert.text}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Alerts;