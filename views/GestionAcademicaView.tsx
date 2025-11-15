import React, { useState, useMemo, useEffect } from 'react';
// FIX: Add StudentCalculatedGrades to imports
import { Student, CourseModuleGrades, GradeValue, StudentCalculatedGrades, OptativoExam } from '../types';
import { ACADEMIC_EVALUATION_STRUCTURE, COURSE_MODULES } from '../data/constants';
import { ClipboardListIcon, SaveIcon, ExportIcon } from '../components/icons';
import { downloadPdfWithTables } from '../components/printUtils';
import { useAppContext } from '../context/AppContext';
import { calculateStudentPeriodAverages } from '../services/gradeCalculator';

const GestionAcademicaView: React.FC = () => {
    const { students, academicGrades, setAcademicGrades, courseGrades, setCourseGrades, calculatedStudentGrades, teacherData, instituteData, addToast, optativoExams, optativoGrades } = useAppContext();
    
    const [activeTab, setActiveTab] = useState('principal');
    const [localAcademicGrades, setLocalAcademicGrades] = useState(academicGrades);
    const [localCourseGrades, setLocalCourseGrades] = useState(courseGrades);
    const [isDirty, setIsDirty] = useState(false);
    
    useEffect(() => {
        setLocalAcademicGrades(JSON.parse(JSON.stringify(academicGrades)));
        setLocalCourseGrades(JSON.parse(JSON.stringify(courseGrades)));
        setIsDirty(false);
    }, [academicGrades, courseGrades]);

    const sostenibilidadAverages = useMemo(() => {
        const averages: { [studentId: string]: { t1: number | null, t2: number | null } } = {};
        const examsT1 = optativoExams.filter(e => e.trimester === 't1');
        const examsT2 = optativoExams.filter(e => e.trimester === 't2');

        students.forEach(student => {
            const studentGrades = optativoGrades[student.id] || {};
    
            const gradesT1 = examsT1.map(e => studentGrades[e.id]).filter(g => g !== null && g !== undefined) as number[];
            const avgT1 = gradesT1.length > 0 ? gradesT1.reduce((sum, g) => sum + g, 0) / gradesT1.length : null;
    
            const gradesT2 = examsT2.map(e => studentGrades[e.id]).filter(g => g !== null && g !== undefined) as number[];
            const avgT2 = gradesT2.length > 0 ? gradesT2.reduce((sum, g) => sum + g, 0) / gradesT2.length : null;
    
            averages[student.id] = { t1: avgT1, t2: avgT2 };
        });
        return averages;
    }, [students, optativoExams, optativoGrades]);


    const finalGradesAndAverages = useMemo(() => {
        const studentGroups = students.reduce((acc, student) => {
            (acc[student.grupo] = acc[student.grupo] || []).push(student);
            return acc;
        }, {} as Record<string, Student[]>);

        Object.keys(studentGroups).forEach(groupName => {
            studentGroups[groupName].sort((a,b) => a.apellido1.localeCompare(b.apellido1));
        });

        const studentGrades: Record<string, { averages: Record<string, number | null> }> = {};
        students.forEach(student => {
            studentGrades[student.id] = {
                averages: calculateStudentPeriodAverages(localAcademicGrades[student.id], calculatedStudentGrades[student.id])
            };
        });
        
        return { studentGroups, studentGrades };
    }, [students, localAcademicGrades, calculatedStudentGrades]);

    const handleManualGradeChange = (studentId: string, periodKey: string, instrumentKey: string, value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
        if (value !== '' && (isNaN(numericValue) || numericValue < 0 || numericValue > 10)) return;

        setLocalAcademicGrades(prev => {
            const newGrades = JSON.parse(JSON.stringify(prev));
            if (!newGrades[studentId]) newGrades[studentId] = {};
            if (!newGrades[studentId][periodKey]) newGrades[studentId][periodKey] = { manualGrades: {} };
            newGrades[studentId][periodKey].manualGrades[instrumentKey] = numericValue;
            return newGrades;
        });
        setIsDirty(true);
    };

    const handleCourseGradeChange = (studentId: string, moduleName: string, period: keyof CourseModuleGrades, value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
         if (value !== '' && (isNaN(numericValue) || numericValue < 0 || numericValue > 10)) return;
        
        setLocalCourseGrades(prev => {
            const newGrades = JSON.parse(JSON.stringify(prev));
            if (!newGrades[studentId]) newGrades[studentId] = {};
            if (!newGrades[studentId][moduleName]) newGrades[studentId][moduleName] = {};
            newGrades[studentId][moduleName][period] = numericValue;
            return newGrades;
        });
        setIsDirty(true);
    };

    const handleToggleConvalidation = (studentId: string, moduleName: string) => {
        setLocalCourseGrades(prev => {
            const newGrades = JSON.parse(JSON.stringify(prev));
            if (!newGrades[studentId]) newGrades[studentId] = {};
            if (!newGrades[studentId][moduleName]) newGrades[studentId][moduleName] = {};

            const currentStatus = newGrades[studentId][moduleName].isConvalidated || false;
            newGrades[studentId][moduleName].isConvalidated = !currentStatus;

            if (!currentStatus) { // Si se está convalidando, limpiar notas
                newGrades[studentId][moduleName].t1 = null;
                newGrades[studentId][moduleName].t2 = null;
                newGrades[studentId][moduleName].t3 = null;
                newGrades[studentId][moduleName].rec = null;
            }

            return newGrades;
        });
        setIsDirty(true);
    };

    const handleSaveChanges = () => {
        setAcademicGrades(localAcademicGrades);
        setCourseGrades(localCourseGrades);
        setIsDirty(false);
        addToast('Calificaciones guardadas con éxito.', 'success');
    };

    const handleExport = () => { /* PDF Export logic */ };
    
    return (
    <div>
        <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ClipboardListIcon className="w-8 h-8 mr-3 text-purple-500" />
                    Gestión Académica
                </h1>
                <p className="text-gray-500 mt-1">Introduce y visualiza todas las calificaciones del curso.</p>
            </div>
            <div className="flex items-center space-x-2">
                 <button onClick={handleSaveChanges} disabled={!isDirty} className={`flex items-center px-4 py-2 rounded-lg font-semibold transition ${!isDirty ? 'bg-green-200 text-green-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                    <SaveIcon className="w-5 h-5 mr-1" /> Guardar Cambios
                </button>
            </div>
        </header>

        <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-2">
                 <button onClick={() => setActiveTab('principal')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'principal' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Módulo Principal</button>
                 <button onClick={() => setActiveTab('otros')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'otros' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Otros Módulos</button>
            </nav>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {activeTab === 'principal' ? (
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-center border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border font-semibold text-gray-600 w-48 text-left sticky left-0 bg-gray-100" rowSpan={2}>Alumno</th>
                            {ACADEMIC_EVALUATION_STRUCTURE.periods.map(period => (<th key={period.key} className="p-2 border font-semibold text-gray-600" colSpan={period.instruments.length + 1}>{period.name}</th>))}
                        </tr>
                        <tr>
                            {ACADEMIC_EVALUATION_STRUCTURE.periods.flatMap(period => [
                                ...period.instruments.map(instrument => (<th key={`${period.key}-${instrument.key}`} className={`p-2 border font-semibold text-gray-500 text-[10px] ${instrument.type === 'calculated' ? 'bg-blue-50' : ''}`}>{instrument.name} ({instrument.weight * 100}%)</th>)),
                                <th key={`${period.key}-avg`} className="p-2 border font-bold text-gray-700 bg-gray-200">MEDIA</th>
                            ])}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(finalGradesAndAverages.studentGroups).map(([groupName, studentsInGroup]: [string, Student[]]) => (
                            <React.Fragment key={groupName}>
                                <tr><td colSpan={100} className="bg-gray-200 font-bold p-1 text-left pl-4">{groupName}</td></tr>
                                {studentsInGroup.map((student, index) => (
                                    <tr key={student.id} className={`group hover:bg-yellow-50 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className={`p-1 border text-left font-semibold text-gray-800 w-48 sticky left-0 group-hover:bg-yellow-50 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                                        {ACADEMIC_EVALUATION_STRUCTURE.periods.flatMap(period => {
                                            const studentAverage = finalGradesAndAverages.studentGrades[student.id].averages[period.key];
                                            return [
                                                ...period.instruments.map(instrument => {
                                                    let calculatedGrade: number | null = null;
                                                    if (instrument.type === 'calculated') {
                                                        if (instrument.key === 'servicios') {
                                                            const periodKey = period.key as 't1' | 't2' | 't3';
                                                            calculatedGrade = calculatedStudentGrades[student.id]?.serviceAverages[periodKey] ?? null;
                                                        } else {
                                                            const examKeyMap: Record<string, keyof StudentCalculatedGrades['practicalExams']> = {
                                                                'exPracticoT1': 't1',
                                                                'exPracticoT2': 't2',
                                                                'exPracticoT3': 't3',
                                                                'exPracticoRec': 'rec',
                                                            };
                                                            const examKey = examKeyMap[instrument.key];
                                                            if (examKey) {
                                                                calculatedGrade = calculatedStudentGrades[student.id]?.practicalExams[examKey] ?? null;
                                                            }
                                                        }
                                                    }
                                                    return (
                                                    <td key={`${period.key}-${instrument.key}`} className={`border ${instrument.type === 'calculated' ? 'bg-blue-50' : ''}`}>
                                                    {instrument.type === 'manual' ? (
                                                        <input type="number" step="0.1" min="0" max="10" value={localAcademicGrades[student.id]?.[period.key]?.manualGrades?.[instrument.key] ?? ''} onChange={e => handleManualGradeChange(student.id, period.key, instrument.key, e.target.value)} className="w-16 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none"/>
                                                    ) : (<span className="p-1.5 block">{calculatedGrade !== null ? calculatedGrade.toFixed(2) : '-'}</span>)}
                                                    </td>
                                                )}),
                                                <td key={`${period.key}-avg`} className={`p-1.5 border font-bold ${studentAverage !== null && studentAverage < 5 ? 'text-red-600' : 'text-black'} bg-gray-200`}>{studentAverage?.toFixed(2) ?? '-'}</td>
                                            ]
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
             <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-center">
                     <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border font-semibold text-gray-600 text-left">Alumno</th>
                            {COURSE_MODULES.map(module => <th key={module.name} colSpan={module.trimesters + 3} className="p-2 border font-semibold text-gray-600">{module.name}</th>)}
                        </tr>
                         <tr>
                            <th className="p-2 border font-semibold text-gray-600 text-left"></th>
                            {COURSE_MODULES.flatMap(module => [
                                <th key={`${module.name}-t1`} className="p-2 border font-semibold text-gray-500 text-[10px]">T1</th>,
                                <th key={`${module.name}-t2`} className="p-2 border font-semibold text-gray-500 text-[10px]">T2</th>,
                                ...(module.trimesters === 3 ? [<th key={`${module.name}-t3`} className="p-2 border font-semibold text-gray-500 text-[10px]">T3</th>] : []),
                                <th key={`${module.name}-rec`} className="p-2 border font-semibold text-gray-500 text-[10px]">REC</th>,
                                <th key={`${module.name}-final`} className="p-2 border font-bold text-gray-700 bg-gray-200">FINAL</th>,
                                <th key={`${module.name}-action`} className="p-2 border font-semibold text-gray-500 text-[10px]">Acción</th>,
                            ])}
                        </tr>
                    </thead>
                    <tbody>
                         {students.map((student, index) => (
                            <tr key={student.id} className={`group ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50`}>
                                <td className={`p-1 border text-left font-semibold text-gray-800 sticky left-0 group-hover:bg-yellow-50 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                                {COURSE_MODULES.map(module => {
                                    const isSostenibilidad = module.name === 'Sostenibilidad aplicada al sistema productivo';
                                    const studentCourseGrades = localCourseGrades[student.id] || {};
                                    const isConvalidated = studentCourseGrades[module.name]?.isConvalidated;
                                    
                                    const grades = isSostenibilidad 
                                        ? sostenibilidadAverages[student.id]
                                        : studentCourseGrades[module.name] || {};

                                    const validGrades = ([grades.t1, grades.t2, module.trimesters === 3 ? (grades as any).t3 : undefined] as (GradeValue | undefined)[])
                                        .map(g => g !== null && g !== undefined ? parseFloat(String(g)) : NaN)
                                        .filter(g => !isNaN(g));
                                    
                                    const finalAvg = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : null;

                                    return (
                                        <React.Fragment key={module.name}>
                                            {isConvalidated ? (
                                                <>
                                                    <td colSpan={module.trimesters + 2} className="border text-center font-bold text-green-600 bg-green-50">CONVALIDADA</td>
                                                    <td className="border text-center"><button onClick={() => handleToggleConvalidation(student.id, module.name)} className="text-xs text-gray-500 hover:text-red-600 p-1">Anular</button></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="border">
                                                        {isSostenibilidad ? (<span className="p-1.5 block">{grades.t1?.toFixed(2) ?? '-'}</span>) : (<input type="number" step="0.1" min="0" max="10" value={(grades as CourseModuleGrades).t1 ?? ''} onChange={e => handleCourseGradeChange(student.id, module.name, 't1', e.target.value)} className="w-16 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none" />)}
                                                    </td>
                                                    <td className="border">
                                                        {isSostenibilidad ? (<span className="p-1.5 block">{grades.t2?.toFixed(2) ?? '-'}</span>) : (<input type="number" step="0.1" min="0" max="10" value={(grades as CourseModuleGrades).t2 ?? ''} onChange={e => handleCourseGradeChange(student.id, module.name, 't2', e.target.value)} className="w-16 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none" />)}
                                                    </td>
                                                    {module.trimesters === 3 && (<td className="border"><input type="number" step="0.1" min="0" max="10" value={(grades as CourseModuleGrades).t3 ?? ''} onChange={e => handleCourseGradeChange(student.id, module.name, 't3', e.target.value)} className="w-16 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none" /></td>)}
                                                    <td className="border"><input type="number" step="0.1" min="0" max="10" value={(grades as CourseModuleGrades).rec ?? ''} onChange={e => handleCourseGradeChange(student.id, module.name, 'rec', e.target.value)} className="w-16 p-1.5 text-center bg-transparent focus:bg-yellow-100 outline-none" /></td>
                                                    <td className={`p-1.5 border font-bold ${finalAvg !== null && finalAvg < 5 ? 'text-red-600' : 'text-black'} bg-gray-200`}>{finalAvg?.toFixed(2) ?? '-'}</td>
                                                    <td className="border text-center">
                                                        {!isSostenibilidad && (
                                                            <button onClick={() => handleToggleConvalidation(student.id, module.name)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Convalidar</button>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tr>
                         ))}
                    </tbody>
                </table>
             </div>
        )}
        </div>
    </div>
  );
};

export default GestionAcademicaView;