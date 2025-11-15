import React from 'react';

interface GradeTrendChartProps {
    trimesterAverages: {
        t1: number | null;
        t2: number | null;
        t3?: number | null; // Make t3 optional
    };
}

const GradeTrendChart: React.FC<GradeTrendChartProps> = ({ trimesterAverages }) => {
    const data = [
        { name: '1º Trimestre', value: trimesterAverages.t1, color: 'bg-blue-400' },
        { name: '2º Trimestre', value: trimesterAverages.t2, color: 'bg-green-400' },
        // Conditionally include 3rd trimester if it exists
        ...(trimesterAverages.t3 !== undefined ? [{ name: '3º Trimestre', value: trimesterAverages.t3, color: 'bg-purple-400' }] : []),
    ];

    const maxValue = 10;

    return (
        <div className="w-full">
            <div className="flex justify-between items-end h-48 p-4 bg-gray-50 rounded-lg">
                {data.map((item, index) => {
                    const height = item.value !== null ? `${(item.value / maxValue) * 100}%` : '2%';
                    const gradeColor = item.value === null ? 'text-gray-500' : item.value < 5 ? 'text-red-600' : 'text-gray-800';
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end px-2">
                            <div className="text-sm font-bold" style={{ color: gradeColor }}>
                                {item.value?.toFixed(2) ?? 'N/A'}
                            </div>
                            <div
                                className={`w-full rounded-t-md transition-all duration-500 ease-out ${item.color} ${item.value === null ? 'bg-gray-200' : ''}`}
                                style={{ height }}
                                title={`${item.name}: ${item.value?.toFixed(2) ?? 'No disponible'}`}
                            ></div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                {data.map(item => <span key={item.name} className="flex-1 text-center">{item.name}</span>)}
            </div>
        </div>
    );
};

export default GradeTrendChart;