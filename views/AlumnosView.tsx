import React, { useState, useMemo } from 'react';
import { Student, ResultadoAprendizaje } from '../types';
import StudentTable from '../components/StudentTable';
import FileUpload from '../components/FileUpload';
import FichaAlumno from './FichaAlumno'; 
import AddStudentModal from '../components/AddStudentModal';
import { SearchIcon, UserPlusIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { calculateRAGrade } from '../services/academicAnalytics';

const AlumnosView: React.FC = () => {
  const { 
      students, setStudents,
      resultadosAprendizaje, criteriosEvaluacion,
      academicGrades, calculatedStudentGrades,
      handleFileUpload: contextHandleFileUpload, 
      addToast, handleUpdateStudent
  } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    await contextHandleFileUpload(file);
    setLoading(false);
  };

  const studentsWithRAProgress = useMemo(() => {
    return students.map(student => {
        const raProgress = (Object.values(resultadosAprendizaje) as ResultadoAprendizaje[]).map(ra => {
            const { grade } = calculateRAGrade(
                ra, 
                student.id, 
                criteriosEvaluacion,
                academicGrades,
                calculatedStudentGrades
            );
            return { id: ra.id, name: ra.nombre, grade };
        }).sort((a,b) => a.name.localeCompare(b.name));
        return { ...student, raProgress };
    });
  }, [students, resultadosAprendizaje, criteriosEvaluacion, academicGrades, calculatedStudentGrades]);


  const filteredStudents = useMemo(() => {
    if (!searchTerm) {
      return studentsWithRAProgress;
    }
    return studentsWithRAProgress.filter(student => {
      const fullName = `${student.nombre} ${student.apellido1} ${student.apellido2}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             student.nre.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.grupo.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [studentsWithRAProgress, searchTerm]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };
  
  const handleUpdatePhoto = (studentId: string, photoUrl: string) => {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, fotoUrl: photoUrl } : s));
      if (selectedStudent?.id === studentId) {
          setSelectedStudent(prev => prev ? { ...prev, fotoUrl: photoUrl } : null);
      }
      addToast('Foto del alumno actualizada.', 'success');
  };

  const handleSaveNewStudent = (newStudentData: Omit<Student, 'id' | 'fotoUrl'>) => {
    const newStudent: Student = {
        ...newStudentData,
        id: `${newStudentData.nre}-${Date.now()}`,
        fotoUrl: `https://picsum.photos/seed/${newStudentData.nre || Date.now()}/200`,
    };
    setStudents(prev => [...prev, newStudent].sort((a,b) => a.apellido1.localeCompare(b.apellido1)));
    addToast('Alumno añadido con éxito.', 'success');
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    handleUpdateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);
  };
  
  if (selectedStudent) {
      return <FichaAlumno 
          student={selectedStudent} 
          onBack={handleBackToList}
          onUpdatePhoto={handleUpdatePhoto}
          onUpdateStudent={handleSaveStudent}
       />;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Clase</h1>
        <p className="text-gray-500 mt-1">Visualiza, busca y gestiona la información clave de tus alumnos.</p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Buscar por nombre, NRE, grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-600 transition text-sm">
            <UserPlusIcon className="w-5 h-5 mr-1" />
            Nuevo Alumno
          </button>
        </div>
      </div>
      
      {students.length === 0 && (
          <div className="mt-8">
            <h3 className="text-center text-xl font-semibold text-gray-600 mb-4">No hay datos de alumnos.</h3>
            <p className="text-center text-gray-500 mb-6">Sube un archivo Excel para empezar a gestionar a tus estudiantes.</p>
            <div className="max-w-xl mx-auto">
                <FileUpload onFileUpload={handleFileUpload} disabled={loading} />
                {loading && <p className="text-center mt-4 text-blue-500">Procesando archivo...</p>}
            </div>
          </div>
      )}

      {students.length > 0 && filteredStudents.length === 0 && (
        <div className="text-center py-10">
            <p className="text-lg text-gray-600">No se encontraron alumnos con el criterio de búsqueda.</p>
        </div>
      )}

      {students.length > 0 && filteredStudents.length > 0 && (
          <StudentTable 
              students={filteredStudents} 
              onViewStudent={handleViewStudent}
          />
      )}
      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewStudent}
      />
    </div>
  );
};

export default AlumnosView;