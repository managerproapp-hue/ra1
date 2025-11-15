import React from 'react';
import { Student } from '../types';

interface StudentTableProps {
  students: (Student & { raProgress: { id: string, name: string, grade: number | null }[] })[];
  onViewStudent: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onViewStudent }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre Completo</th>
              <th scope="col" className="px-4 py-3">NRE</th>
              <th scope="col" className="px-4 py-3">Grupo</th>
              <th scope="col" className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => {
              const { raProgress, ...studentData } = student;
              const fullName = `${studentData.apellido1} ${studentData.apellido2}, ${studentData.nombre}`.trim();
              const isEven = index % 2 === 0;
              const trBg = isEven ? 'bg-white' : 'bg-gray-50';
              const tdBg = isEven ? 'bg-gray-50' : 'bg-gray-100';
              return (
                <React.Fragment key={student.id}>
                  <tr className={`${trBg} border-t hover:bg-blue-50`}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="w-10 h-10 rounded-full object-cover mr-4" 
                          src={studentData.fotoUrl} 
                          alt={`Foto de ${fullName}`} 
                        />
                        {fullName}
                      </div>
                    </td>
                    <td className="px-4 py-3">{studentData.nre}</td>
                    <td className="px-4 py-3">{studentData.grupo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => onViewStudent(studentData)} className="font-medium text-blue-600 hover:underline">Ver Ficha</button>
                    </td>
                  </tr>
                  <tr className={`${trBg} border-b`}>
                    <td colSpan={4} className={`p-4 ${tdBg}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
                            {raProgress.map(ra => {
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
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;