import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { OptativoExam } from '../types';
import { PlusIcon, TrashIcon, FileSpreadsheetIcon } from '../components/icons';

const OptativoView: React.FC = () => {
    const { students, optativoExams, setOptativoExams, optativoGrades, setOptativoGrades, addToast } = useAppContext();

    const sortedStudents = useMemo(() => [...students].sort((a,b) => a.apellido1.localeCompare(b.apellido1)), [students]);
    
    const examsT1 = useMemo(() => optativoExams.filter(e => e.trimester === 't1'), [optativoExams]);
    const examsT2 = useMemo(() => optativoExams.filter(e => e.trimester === 't2'), [optativoExams]);

    const handleAddExam = (trimester: 't1' | 't2') => {
        const newExam: OptativoExam = {
            id: `opt-exam-${Date.now()}`,
            name: `Examen ${trimester.toUpperCase()} #${trimester === 't1' ? examsT1.length + 1 : examsT2.length + 1}`,
            trimester,
        };
        setOptativoExams(prev => [...prev, newExam]);
        addToast(`Nuevo examen añadido para ${trimester.toUpperCase()}.`, 'success');
    };

    const handleDeleteExam = (examId: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este examen y todas sus notas?')) {
            setOptativoExams(prev => prev.filter(e => e.id !== examId));
            // Also clean up grades associated with this exam
            setOptativoGrades(prev => {
                const newGrades = { ...prev };
                Object.keys(newGrades).forEach(studentId => {
                    if (newGrades[studentId][examId]) {
                        delete newGrades[studentId][examId];
                    }
                });
                return newGrades;
            });
            addToast('Examen eliminado.', 'info');
        }
    };

    const handleExamNameChange = (examId: string, newName: string) => {
        setOptativoExams(prev => prev.map(e => e.id === examId ? { ...e, name: newName } : e));
    };

    const handleGradeChange = (studentId: string, examId: string, value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
        if (value !== '' && (isNaN(numericValue) || numericValue < 0 || numericValue > 10)) return;

        setOptativoGrades(prev => {
            const newGrades = JSON.parse(JSON.stringify(prev));
            if (!newGrades[studentId]) {
                newGrades[studentId] = {};
            }
            newGrades[studentId][examId] = numericValue;
            return newGrades;
        });
    };

    const calculateAverage = (studentId: string, exams: OptativoExam[]): string => {
        if (exams.length === 0) return '-';
        const studentGrades = optativoGrades[studentId] || {};
        const grades = exams.map(e => studentGrades[e.id]).filter(g => g !== null && g !== undefined) as number[];
        if (grades.length === 0) return '-';
        const avg = grades.reduce((sum, g) => sum + g, 0) / grades.length;
        return avg.toFixed(2);
    };

    return (
        <div>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <FileSpreadsheetIcon className="w-8 h-8 mr-3 text-blue-500" />
                        Módulo Optativo: Sostenibilidad
                    </h1>
                    <p className="text-gray-500 mt-1">Gestiona los exámenes y calificaciones para el módulo optativo.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleAddExam('t1')} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"><PlusIcon className="w-5 h-5 mr-1" />Añadir Examen T1</button>
                    <button onClick={() => handleAddExam('t2')} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><PlusIcon className="w-5 h-5 mr-1" />Añadir Examen T2</button>
                </div>
            </header>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm text-center border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border font-semibold text-gray-600 w-48 text-left sticky left-0 bg-gray-100">Alumno</th>
                            {examsT1.map(exam => (
                                <th key={exam.id} className="p-2 border font-semibold text-gray-600 bg-blue-50 relative">
                                    <input type="text" value={exam.name} onChange={e => handleExamNameChange(exam.id, e.target.value)} className="w-full text-center bg-transparent font-semibold focus:bg-white outline-none"/>
                                    <button onClick={() => handleDeleteExam(exam.id)} className="text-red-500 hover:text-red-700 absolute top-1 right-1"><TrashIcon className="w-3 h-3"/></button>
                                </th>
                            ))}
                            {examsT1.length > 0 && <th className="p-2 border font-bold text-gray-700 bg-blue-200">MEDIA T1</th>}
                            
                            {examsT2.map(exam => (
                                <th key={exam.id} className="p-2 border font-semibold text-gray-600 bg-green-50 relative">
                                    <input type="text" value={exam.name} onChange={e => handleExamNameChange(exam.id, e.target.value)} className="w-full text-center bg-transparent font-semibold focus:bg-white outline-none"/>
                                    <button onClick={() => handleDeleteExam(exam.id)} className="text-red-500 hover:text-red-700 absolute top-1 right-1"><TrashIcon className="w-3 h-3"/></button>
                                </th>
                            ))}
                            {examsT2.length > 0 && <th className="p-2 border font-bold text-gray-700 bg-green-200">MEDIA T2</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStudents.map(student => {
                            const avgT1 = calculateAverage(student.id, examsT1);
                            const avgT2 = calculateAverage(student.id, examsT2);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 group">
                                    <td className="p-1 border text-left font-semibold text-gray-800 w-48 sticky left-0 bg-white group-hover:bg-gray-50">{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                                    {examsT1.map(exam => (
                                        <td key={exam.id} className="border">
                                            <input type="number" step="0.1" min="0" max="10" value={optativoGrades[student.id]?.[exam.id] ?? ''} onChange={e => handleGradeChange(student.id, exam.id, e.target.value)} className="w-20 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none"/>
                                        </td>
                                    ))}
                                    {examsT1.length > 0 && <td className={`p-1.5 border font-bold ${parseFloat(avgT1) < 5 ? 'text-red-600' : 'text-black'} bg-blue-100`}>{avgT1}</td>}
                                    
                                    {examsT2.map(exam => (
                                        <td key={exam.id} className="border">
                                            <input type="number" step="0.1" min="0" max="10" value={optativoGrades[student.id]?.[exam.id] ?? ''} onChange={e => handleGradeChange(student.id, exam.id, e.target.value)} className="w-20 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none"/>
                                        </td>
                                    ))}
                                    {examsT2.length > 0 && <td className={`p-1.5 border font-bold ${parseFloat(avgT2) < 5 ? 'text-red-600' : 'text-black'} bg-green-100`}>{avgT2}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {optativoExams.length === 0 && <div className="text-center p-8 text-gray-500">No hay exámenes creados. Añade un examen para el Trimestre 1 o 2 para empezar.</div>}
            </div>
        </div>
    );
};

export default OptativoView;