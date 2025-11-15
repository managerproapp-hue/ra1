import React from 'react';
import { HighlightedStudent } from '../../types';
import { TrophyIcon, AlertTriangleIcon } from '../icons';

interface StudentHighlightsProps {
    highlights: {
        top: HighlightedStudent[];
        bottom: HighlightedStudent[];
    };
}

const StudentListItem: React.FC<{ student: HighlightedStudent }> = ({ student }) => (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
        <div className="flex items-center">
            <img src={student.fotoUrl} alt={student.name} className="w-8 h-8 rounded-full object-cover mr-3" />
            <span className="text-sm font-medium text-gray-800">{student.name}</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{student.score.toFixed(2)}</span>
    </div>
);

const StudentHighlights: React.FC<StudentHighlightsProps> = ({ highlights }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold text-green-700 flex items-center mb-2">
                        <TrophyIcon className="w-5 h-5 mr-2" />
                        Top 3 Alumnos
                    </h4>
                    <div className="space-y-1">
                        {highlights.top.length > 0 ? (
                            highlights.top.map(s => <StudentListItem key={s.id} student={s} />)
                        ) : (
                            <p className="text-sm text-gray-500 px-2">No hay datos suficientes.</p>
                        )}
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold text-yellow-700 flex items-center mb-2">
                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                        3 Alumnos con Menor Nota
                    </h4>
                    <div className="space-y-1">
                         {highlights.bottom.length > 0 ? (
                            highlights.bottom.map(s => <StudentListItem key={s.id} student={s} />)
                        ) : (
                            <p className="text-sm text-gray-500 px-2">No hay datos suficientes.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentHighlights;