import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student & { raProgress: { id: string, name: string, grade: number | null }[] };
  onViewStudent: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onViewStudent }) => {
  const { raProgress, ...studentData } = student;
  const fullName = `${studentData.nombre} ${studentData.apellido1} ${studentData.apellido2}`.trim();

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer flex flex-col"
      onClick={() => onViewStudent(studentData)}
    >
      <img className="w-full h-28 object-cover object-center" src={studentData.fotoUrl} alt={`Photo of ${fullName}`} />
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-white truncate" title={fullName}>{fullName}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{`Grupo: ${studentData.grupo} - ${studentData.subgrupo}`}</p>
      </div>
      
      {raProgress && raProgress.length > 0 && (
          <div className="px-4 pb-4 border-t border-gray-100 mt-auto pt-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Progreso RAs</h4>
              <div className="space-y-2">
                  {raProgress.slice(0, 3).map(ra => {
                      const percentage = ra.grade !== null ? (ra.grade / 10) * 100 : 0;
                      const barColor = ra.grade === null ? 'bg-gray-200' : ra.grade < 5 ? 'bg-red-400' : ra.grade < 7 ? 'bg-yellow-400' : 'bg-green-400';
                      
                      return (
                          <div key={ra.id} title={`${ra.name}: ${ra.grade?.toFixed(2) ?? 'N/E'}`}>
                              <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-xs text-gray-600 truncate max-w-[80%]">{ra.name}</span>
                                  <span className={`text-xs font-bold ${ra.grade === null ? 'text-gray-400' : ''}`}>
                                      {ra.grade?.toFixed(1) ?? 'N/E'}
                                  </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percentage}%` }}></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentCard;
