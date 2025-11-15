import React from 'react';
import { RAProgressData } from '../../types';

interface RAProgressProps {
    raProgressData: RAProgressData[];
}

const RAProgress: React.FC<RAProgressProps> = ({ raProgressData }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <div className="space-y-4">
                {raProgressData.map(ra => {
                    const percentage = ra.average !== null ? (ra.average / 10) * 100 : 0;
                    const barColor = ra.average === null ? 'bg-gray-200' : ra.average < 5 ? 'bg-red-400' : ra.average < 7 ? 'bg-yellow-400' : 'bg-green-400';

                    return (
                        <div key={ra.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">{ra.name} ({ra.weight * 100}%)</span>
                                <span className={`text-sm font-bold ${ra.average === null ? 'text-gray-500' : ra.average < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {ra.average?.toFixed(2) ?? 'N/A'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${barColor}`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RAProgress;