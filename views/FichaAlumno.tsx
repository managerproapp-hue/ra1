

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student, TimelineEvent, PreServiceDayEvaluation, ResultadoAprendizaje, Service, CourseModuleGrades, GradeValue } from '../types';
import { 
    PencilIcon,
    CameraIcon,
    SaveIcon,
    ArrowRightLeftIcon,
    MessageCircleIcon,
    PrinterIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    BarChartIcon
} from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { generateStudentFilePDF } from '../services/reportGenerator';
import { calculateRAGrade, calculateCriterioGrade } from '../services/academicAnalytics';
import { calculateStudentPeriodAverages } from '../services/gradeCalculator';
import { ACADEMIC_EVALUATION_STRUCTURE, COURSE_MODULES } from '../data/constants';

interface FichaAlumnoProps {
  student: Student;
  onBack: () => void;
  onUpdatePhoto: (studentId: string, photoUrl: string) => void;
  onUpdateStudent: (student: Student) => void;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isEditing?: boolean; children?: React.ReactNode }> = ({ label, value, isEditing, children }) => (
    <div className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-gray-50">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 col-span-2">{isEditing ? children : (value || '-')}</dd>
    </div>
);

const Tab: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-medium text-sm rounded-md transition-colors
            ${isActive
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
    >
        {label}
    </button>
);

const CombinedPerformanceChart: React.FC<{
    data: { name: string; studentGrade: number | null; classAverage: number | null }[];
}> = ({ data }) => {
    if (data.length === 0) return null;

    const chartHeight = 150; // in px
    const chartWidth = data.length * 60; // dynamic width
    const maxValue = 10;

    // Create SVG path for the line
    const points = data.map((item, index) => {
        if (item.classAverage === null) return null;
        const x = index * 60 + 30; // center of the bar
        const y = chartHeight - (item.classAverage / maxValue) * chartHeight;
        return `${x},${y}`;
    }).filter(Boolean).join(' ');

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div style={{ width: Math.max(chartWidth, 300), height: chartHeight + 30 }} className="relative mx-auto">
                {/* Y-axis labels */}
                <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-gray-500" style={{ height: chartHeight }}>
                    <span>10</span>
                    <span>5</span>
                    <span>0</span>
                </div>

                {/* Bars */}
                <div className="absolute bottom-[30px] left-0 right-0 h-full flex justify-around items-end border-l border-b border-gray-200" style={{ height: chartHeight }}>
                    {data.map((item, index) => {
                        const barHeight = item.studentGrade !== null ? `${(item.studentGrade / maxValue) * 100}%` : '2%';
                        const barColor = item.studentGrade === null ? 'bg-gray-300' : item.studentGrade < 5 ? 'bg-orange-400' : 'bg-teal-400';
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end px-2 h-full" title={`Tu nota: ${item.studentGrade?.toFixed(2) ?? 'N/A'}\nMedia clase: ${item.classAverage?.toFixed(2) ?? 'N/A'}`}>
                                <div className={`w-full max-w-[30px] rounded-t-md transition-all duration-500 ease-out ${barColor}`} style={{ height: barHeight }}></div>
                            </div>
                        );
                    })}
                </div>
                {/* Line */}
                <svg className="absolute top-0 left-0 w-full" style={{ height: chartHeight }}>
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        points={points}
                    />
                    {data.map((item, index) => {
                        if (item.classAverage === null) return null;
                        const cx = index * 60 + 30;
                        const cy = chartHeight - (item.classAverage / maxValue) * chartHeight;
                        return <circle key={index} cx={cx} cy={cy} r="3" fill="#3b82f6" stroke="white" strokeWidth="1" />;
                    })}
                </svg>
                 {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 h-[30px] flex justify-around items-start">
                    {data.map((item, index) => (
                         <div key={index} className="flex-1 text-xs text-gray-500 text-center px-1 truncate" title={item.name}>{item.name}</div>
                    ))}
                </div>
            </div>
             <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 bg-teal-400 mr-2 rounded-sm"></span>Tu Nota</div>
                <div className="flex items-center"><div className="w-4 h-0.5 bg-blue-500 mr-2"></div>Media de la Clase</div>
            </div>
        </div>
    );
};


const FichaAlumno: React.FC<FichaAlumnoProps> = ({ student, onBack, onUpdatePhoto, onUpdateStudent }) => {
  const { 
    students,
    teacherData, 
    instituteData,
    resultadosAprendizaje, 
    criteriosEvaluacion, 
    academicGrades: allAcademicGrades,
    calculatedStudentGrades: allCalculatedGrades,
    courseGrades: allCourseGrades,
    setCourseGrades,
    services,
    practiceGroups,
    serviceEvaluations,
    entryExitRecords: allEntryExitRecords,
    optativoExams, 
    optativoGrades,
    addToast
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student>(student);
  const [activeTab, setActiveTab] = useState('general');
  const [expandedRAs, setExpandedRAs] = useState<Set<string>>(new Set());

  const fullName = `${student.apellido1} ${student.apellido2}, ${student.nombre}`.trim();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditedStudent(student) }, [student]);

  const studentEntryExitRecords = useMemo(() => 
    allEntryExitRecords.filter(r => r.studentId === student.id), 
    [allEntryExitRecords, student.id]
  );
  
  const sostenibilidadAverages = useMemo(() => {
    const examsT1 = optativoExams.filter(e => e.trimester === 't1');
    const examsT2 = optativoExams.filter(e => e.trimester === 't2');
    const studentGrades = optativoGrades[student.id] || {};

    const gradesT1 = examsT1.map(e => studentGrades[e.id]).filter(g => g !== null && g !== undefined) as number[];
    const avgT1 = gradesT1.length > 0 ? gradesT1.reduce((sum, g) => sum + g, 0) / gradesT1.length : null;

    const gradesT2 = examsT2.map(e => studentGrades[e.id]).filter(g => g !== null && g !== undefined) as number[];
    const avgT2 = gradesT2.length > 0 ? gradesT2.reduce((sum, g) => sum + g, 0) / gradesT2.length : null;

    return { t1: avgT1, t2: avgT2 };
  }, [student.id, optativoExams, optativoGrades]);

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    studentEntryExitRecords.forEach(rec => {
        events.push({
            date: parseDate(rec.date),
            type: 'incidencia',
            title: rec.type,
            content: rec.reason,
        });
    });

    serviceEvaluations.forEach(ev => {
        const service = services.find(s => s.id === ev.serviceId);
        if(!service) return;

        Object.entries(ev.preService).forEach(([date, preServiceDay]) => {
            const obs = (preServiceDay as PreServiceDayEvaluation).individualEvaluations[student.id]?.observations;
            if (obs) {
                events.push({ date: new Date(date), type: 'observacion', title: `Observación Pre-Servicio`, content: obs, serviceName: service.name });
            }
        });

        const serviceDayObs = ev.serviceDay.individualScores[student.id]?.observations;
        if(serviceDayObs) {
            events.push({ date: new Date(service.date), type: 'observacion', title: `Observación Día de Servicio`, content: serviceDayObs, serviceName: service.name });
        }
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studentEntryExitRecords, serviceEvaluations, services, student.id]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (typeof loadEvent.target?.result === 'string') onUpdatePhoto(student.id, loadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedStudent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    onUpdateStudent(editedStudent);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedStudent(student);
    setIsEditing(false);
  };

  const handlePrint = () => {
      generateStudentFilePDF(
          student,
          allCalculatedGrades[student.id],
          allAcademicGrades[student.id],
          allCourseGrades[student.id],
          timelineEvents,
          teacherData,
          instituteData
      );
  };

  const handleToggleConvalidation = (moduleName: string) => {
    setCourseGrades(prev => {
        const newGrades = JSON.parse(JSON.stringify(prev));
        if (!newGrades[student.id]) newGrades[student.id] = {};
        if (!newGrades[student.id][moduleName]) newGrades[student.id][moduleName] = {};

        const currentStatus = newGrades[student.id][moduleName].isConvalidated || false;
        newGrades[student.id][moduleName].isConvalidated = !currentStatus;

        if (!currentStatus) { // Si se está convalidando, limpiar notas
            newGrades[student.id][moduleName].t1 = null;
            newGrades[student.id][moduleName].t2 = null;
            newGrades[student.id][moduleName].t3 = null;
            newGrades[student.id][moduleName].rec = null;
        }
        
        return newGrades;
    });
    addToast('Estado de convalidación actualizado.', 'success');
  };
  
   const studentServicesData = useMemo(() => {
        const studentPracticeGroup = practiceGroups.find(pg => pg.studentIds.includes(student.id));

        return services
            .map(service => {
                const evaluation = serviceEvaluations.find(e => e.serviceId === service.id);
                if (!evaluation) return null;

                let participationInfo = null;
                if (service.type === 'normal' && studentPracticeGroup && (service.assignedGroups.comedor.includes(studentPracticeGroup.id) || service.assignedGroups.takeaway.includes(studentPracticeGroup.id))) {
                    participationInfo = { groupName: studentPracticeGroup.name };
                } else if (service.type === 'agrupacion') {
                    const agrupacion = service.agrupaciones?.find(a => a.studentIds.includes(student.id));
                    if (agrupacion) {
                        participationInfo = { groupName: `Agrup. ${agrupacion.name}` };
                    }
                }
                
                if (!participationInfo) return null;

                // Grade for current student
                const individualEval = evaluation.serviceDay.individualScores[student.id];
                if (!individualEval || individualEval.attendance === false) return null;
                const individualGrade = (individualEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                let groupGrade = 0;
                if (studentPracticeGroup && service.type === 'normal') {
                    const groupEval = evaluation.serviceDay.groupScores[studentPracticeGroup.id];
                    if (groupEval) {
                        groupGrade = (groupEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                        if (individualEval.halveGroupScore) groupGrade /= 2;
                    }
                }
                const studentFinalGrade = (individualGrade + groupGrade) / 2;
                
                const observations = [
                    individualEval.observations,
                    studentPracticeGroup ? evaluation.serviceDay.groupScores[studentPracticeGroup.id]?.observations : ''
                ].filter(Boolean).join(' | ');
                
                // Calculate class average for this service
                const gradesOfAllStudents: number[] = [];
                students.forEach(s => {
                    let participated = false;
                    const sPracticeGroup = practiceGroups.find(pg => pg.studentIds.includes(s.id));
                    if (service.type === 'normal' && sPracticeGroup && (service.assignedGroups.comedor.includes(sPracticeGroup.id) || service.assignedGroups.takeaway.includes(sPracticeGroup.id))) {
                        participated = true;
                    } else if (service.type === 'agrupacion' && (service.agrupaciones || []).some(a => a.studentIds.includes(s.id))) {
                        participated = true;
                    }

                    if (participated) {
                        const sIndividualEval = evaluation.serviceDay.individualScores[s.id];
                        if (!sIndividualEval || sIndividualEval.attendance === false) {
                            gradesOfAllStudents.push(0);
                        } else {
                            const sIndividualGrade = (sIndividualEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                            let sGroupGrade = 0;
                            if (sPracticeGroup && service.type === 'normal') {
                                const sGroupEval = evaluation.serviceDay.groupScores[sPracticeGroup.id];
                                if (sGroupEval) {
                                    sGroupGrade = (sGroupEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                                    if (sIndividualEval.halveGroupScore) sGroupGrade /= 2;
                                }
                            }
                            gradesOfAllStudents.push((sIndividualGrade + sGroupGrade) / 2);
                        }
                    }
                });
                const classAverage = gradesOfAllStudents.length > 0 ? gradesOfAllStudents.reduce((a, b) => a + b, 0) / gradesOfAllStudents.length : null;

                return { service, studentGrade: studentFinalGrade, classAverage, individualGrade, groupGrade, observations, ...participationInfo };
            })
            .filter((s): s is NonNullable<typeof s> => s !== null)
            .sort((a,b) => new Date(a.service.date).getTime() - new Date(b.service.date).getTime());
    }, [student.id, students, services, serviceEvaluations, practiceGroups]);


  const TimelineIcon: React.FC<{type: TimelineEvent['type']}> = ({ type }) => {
    const baseClass = "w-8 h-8 rounded-full flex items-center justify-center text-white";
    if (type === 'incidencia') return <div className={`${baseClass} bg-orange-500`}><ArrowRightLeftIcon className="w-5 h-5"/></div>;
    if (type === 'observacion') return <div className={`${baseClass} bg-blue-500`}><MessageCircleIcon className="w-5 h-5"/></div>;
    return null;
  };
  
  return (
    <div>
      <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center">
            <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <img className="h-20 w-20 rounded-full object-cover mr-4" src={student.fotoUrl} alt={`Foto de ${fullName}`} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
                    <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div>
                <h1 className="text-4xl font-bold text-gray-800">{fullName}</h1>
                <p className="text-gray-500 text-lg">{student.grupo} | {student.emailOficial}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {isEditing ? (
                <>
                    <button onClick={handleSave} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><SaveIcon className="w-4 h-4 mr-2" />Guardar</button>
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                </>
            ) : (
                 <>
                    <button onClick={handlePrint} className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"><PrinterIcon className="w-4 h-4 mr-2" />Imprimir Ficha</button>
                    <button onClick={() => setIsEditing(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"><PencilIcon className="w-4 h-4 mr-2" />Editar Ficha</button>
                 </>
            )}
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800 font-medium text-2xl leading-none p-1 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">&times;</button>
        </div>
      </header>

      <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-2">
                <Tab label="Información General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <Tab label="Resumen Académico" isActive={activeTab === 'academico'} onClick={() => setActiveTab('academico')} />
                <Tab label="Resultados de Aprendizaje" isActive={activeTab === 'ra'} onClick={() => setActiveTab('ra')} />
                <Tab label="Resumen de Servicios" isActive={activeTab === 'servicios'} onClick={() => setActiveTab('servicios')} />
            </nav>
        </div>

        {activeTab === 'general' && (
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="w-full xl:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-4 border-b"><h3 className="text-lg font-bold text-gray-800">Datos Personales</h3></div>
                    <dl className="divide-y divide-gray-200">
                        <InfoRow label="NRE" value={editedStudent.nre} isEditing={isEditing}><input name="nre" value={editedStudent.nre} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                        <InfoRow label="Nº Expediente" value={editedStudent.expediente} isEditing={isEditing}><input name="expediente" value={editedStudent.expediente} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                        <InfoRow label="Fecha de Nacimiento" value={editedStudent.fechaNacimiento} isEditing={isEditing}><input name="fechaNacimiento" value={editedStudent.fechaNacimiento} onChange={handleInputChange} className="w-full p-1 border rounded" type="date" /></InfoRow>
                        <InfoRow label="Teléfono" value={editedStudent.telefono} isEditing={isEditing}><input name="telefono" value={editedStudent.telefono} onChange={handleInputChange} className="w-full p-1 border rounded" /></InfoRow>
                        <InfoRow label="Email Personal" value={editedStudent.emailPersonal} isEditing={isEditing}><input name="emailPersonal" value={editedStudent.emailPersonal} onChange={handleInputChange} className="w-full p-1 border rounded" type="email" /></InfoRow>
                    </dl>
                </div>
                <div className="w-full xl:col-span-1 space-y-6">
                    <div className="bg-white shadow-md rounded-lg p-4 sticky top-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial y Anotaciones</h3>
                        <div className="relative max-h-96 overflow-y-auto pr-2">
                            {timelineEvents.length > 0 ? timelineEvents.map((event, index) => (
                                <div key={index} className="flex gap-4 pb-6">
                                    <div className="relative"><TimelineIcon type={event.type} />{index < timelineEvents.length - 1 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200"></div>}</div>
                                    <div><p className="text-xs text-gray-500">{event.date.toLocaleDateString('es-ES')}{event.serviceName && ` - ${event.serviceName}`}</p><p className="font-bold text-sm">{event.title}</p><p className="text-sm text-gray-600">{event.content}</p></div>
                                </div>
                            )) : <p className="text-sm text-gray-500 text-center py-4">No hay eventos en el historial.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'academico' && (
             <div className="space-y-8">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 p-4 border-b">Resumen del Módulo Principal</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-center">
                             <thead className="bg-gray-50 text-xs text-gray-600 uppercase"><tr><th className="px-4 py-3 text-left">Calificación</th>{ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => <th key={p.key} className="px-4 py-3">{p.name}</th>)}</tr></thead>
                             <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
                                {ACADEMIC_EVALUATION_STRUCTURE.periods[0].instruments.map(instrument => {
                                    return (
                                    <tr key={instrument.key}>
                                        <td className="px-4 py-2 text-left font-medium">{instrument.name} ({instrument.weight * 100}%)</td>
                                        {ACADEMIC_EVALUATION_STRUCTURE.periods.map(period => {
                                             let grade: number | null = null;
                                            if (instrument.type === 'manual') {
                                                const manualGrade = allAcademicGrades[student.id]?.[period.key]?.manualGrades?.[instrument.key];
                                                grade = (manualGrade === null || manualGrade === undefined) ? null : parseFloat(String(manualGrade));
                                            } else { // calculated
                                                if (instrument.key === 'servicios') {
                                                    grade = allCalculatedGrades[student.id]?.serviceAverages?.[period.key as 't1' | 't2' | 't3'] ?? null;
                                                } else {
                                                    const examKey = (period.key === 'rec' ? 'exPracticoRec' : `exPractico${period.key.toUpperCase()}`) as keyof typeof allCalculatedGrades[string]['practicalExams'];
                                                    grade = allCalculatedGrades[student.id]?.practicalExams?.[examKey] ?? null;
                                                }
                                            }
                                            return <td key={`${period.key}-${instrument.key}`}>{grade?.toFixed(2) ?? '-'}</td>
                                        })}
                                    </tr>
                                )})}
                             </tbody>
                             <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td className="px-4 py-2 text-left">Media Ponderada</td>
                                    {ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => {
                                        const avg = calculateStudentPeriodAverages(allAcademicGrades[student.id], allCalculatedGrades[student.id])[p.key];
                                        return <td key={p.key} className={avg !== null && avg < 5 ? 'text-red-600' : ''}>{avg?.toFixed(2) ?? '-'}</td>
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                 <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 p-4 border-b">Resumen de Otros Módulos</h3>
                     <div className="overflow-x-auto">
                           <table className="min-w-full text-sm text-center">
                                <thead className="bg-gray-50 text-xs text-gray-600 uppercase"><tr><th className="px-4 py-3 text-left">Módulo</th><th>T1</th><th>T2</th><th>T3</th><th>REC</th><th className="px-4 py-3">Media Final</th><th className="px-4 py-3">Acción</th></tr></thead>
                                <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
                                    {COURSE_MODULES.map(mod => {
                                        const isSostenibilidad = mod.name === 'Sostenibilidad aplicada al sistema productivo';
                                        const isConvalidated = allCourseGrades[student.id]?.[mod.name]?.isConvalidated;
                                        
                                        const grades = isSostenibilidad 
                                            ? sostenibilidadAverages 
                                            : (allCourseGrades[student.id]?.[mod.name] || {});

                                        const validGrades = ([
                                            grades.t1, 
                                            grades.t2, 
                                            mod.trimesters === 3 ? (grades as any).t3 : undefined
                                        ] as (GradeValue | undefined)[])
                                            .map(g => g !== null && g !== undefined ? parseFloat(String(g)) : NaN)
                                            .filter(g => !isNaN(g));
                                        
                                        const finalAvg = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length) : null;

                                        return (
                                            <tr key={mod.name}>
                                                <td className="px-4 py-2 text-left font-medium">{mod.name}</td>
                                                {isConvalidated ? (
                                                    <>
                                                        <td colSpan={5} className="text-center font-bold text-green-600 bg-green-50">CONVALIDADA</td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button onClick={() => handleToggleConvalidation(mod.name)} className="text-xs text-gray-500 hover:text-red-600">Anular</button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{grades.t1 !== null && grades.t1 !== undefined ? grades.t1.toFixed(2) : '-'}</td>
                                                        <td>{grades.t2 !== null && grades.t2 !== undefined ? grades.t2.toFixed(2) : '-'}</td>
                                                        <td>{mod.trimesters === 3 ? ((grades as any).t3 ?? '-') : <span className="text-gray-400">N/A</span>}</td>
                                                        <td>{(grades as any).rec ?? '-'}</td>
                                                        <td className={`font-bold ${finalAvg !== null && finalAvg < 5 ? 'text-red-600' : ''}`}>{finalAvg?.toFixed(2) ?? '-'}</td>
                                                        <td className="px-4 py-2 text-center">
                                                          {!isSostenibilidad && (
                                                            <button onClick={() => handleToggleConvalidation(mod.name)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Convalidar</button>
                                                          )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                </div>
            </div>
        )}

        {activeTab === 'ra' && (
             <div className="space-y-4">
                {Object.values(resultadosAprendizaje).map((ra: ResultadoAprendizaje) => {
                    const isExpanded = expandedRAs.has(ra.id);
                    const { grade, ponderacionTotal } = calculateRAGrade(ra, student.id, criteriosEvaluacion, allAcademicGrades, allCalculatedGrades);
                    return (
                        <div key={ra.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="flex items-center p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedRAs(p => p.has(ra.id) ? (p.delete(ra.id), new Set(p)) : new Set(p.add(ra.id)))}>
                                {isExpanded ? <ChevronDownIcon className="w-5 h-5 mr-2"/> : <ChevronRightIcon className="w-5 h-5 mr-2"/>}
                                <div className="flex-1 ml-2"><h4 className="font-bold text-gray-800">{ra.nombre}</h4><p className="text-xs text-gray-500">Ponderación evaluada: {ponderacionTotal}%</p></div>
                                <div className="text-right"><p className="text-sm font-medium text-gray-500">Nota RA</p><p className={`text-2xl font-bold ${grade === null ? 'text-gray-400' : grade < 5 ? 'text-red-600' : 'text-green-600'}`}>{grade?.toFixed(2) ?? 'N/E'}</p></div>
                            </div>
                            {isExpanded && (<div className="border-t bg-gray-50 p-4"><h5 className="text-sm font-semibold text-gray-600 mb-2">Desglose de Criterios</h5><div className="space-y-2">{ra.criteriosEvaluacion.map(cId => {const c = criteriosEvaluacion[cId]; if(!c) return null; const cGrade = calculateCriterioGrade(c,student.id,allAcademicGrades,allCalculatedGrades); return (<div key={c.id} className="flex justify-between p-2 bg-white rounded-md border"><div><p className="text-sm text-gray-800">{c.descripcion}</p></div><div className="text-right flex-shrink-0 ml-4"><p className="text-xs text-gray-500">Pond: {c.ponderacion}%</p><p className={`font-bold ${cGrade === null ? 'text-gray-400' : cGrade < 5 ? 'text-red-500' : 'text-gray-800'}`}>{cGrade?.toFixed(2) ?? 'N/E'}</p></div></div>);})}</div></div>)}
                        </div>
                    )
                })}
            </div>
        )}

        {activeTab === 'servicios' && (
            <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center"><BarChartIcon className="w-6 h-6 mr-2 text-blue-500"/>Rendimiento en Servicios</h3>
                {studentServicesData && studentServicesData.length > 0 ? (
                    <>
                        <CombinedPerformanceChart data={studentServicesData.map(d => ({ name: d.service.name, studentGrade: d.studentGrade, classAverage: d.classAverage }))} />
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100"><tr><th className="p-2 text-left">Servicio</th><th className="p-2">Fecha</th><th className="p-2">Grupo/Agrupación</th><th className="p-2">Nota Ind.</th><th className="p-2">Nota Grupal</th><th className="p-2">Nota Final</th><th className="p-2 text-left">Observaciones</th></tr></thead>
                                <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
                                    {studentServicesData.map(data => (
                                        <tr key={data.service.id}>
                                            <td className="p-2 font-semibold">{data.service.name}</td>
                                            <td className="p-2 text-center">{new Date(data.service.date).toLocaleDateString('es-ES')}</td>
                                            <td className="p-2 text-center">{data.groupName}</td>
                                            <td className="p-2 text-center font-medium">{data.individualGrade.toFixed(2)}</td>
                                            <td className="p-2 text-center font-medium">{data.groupGrade.toFixed(2)}</td>
                                            <td className={`p-2 text-center font-bold ${data.studentGrade < 5 ? 'text-red-600' : 'text-green-600'}`}>{data.studentGrade.toFixed(2)}</td>
                                            <td className="p-2 text-gray-600 max-w-xs truncate" title={data.observations}>{data.observations}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : <p className="text-center text-gray-500 py-8">El alumno no ha participado en ningún servicio evaluado todavía.</p>}
            </div>
        )}
    </div>
  );
};

export default FichaAlumno;