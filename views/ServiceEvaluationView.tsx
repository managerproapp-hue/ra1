

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Service, ServiceEvaluation, Student, PracticeGroup, EntryExitRecord, PreServiceDayEvaluation, ServiceDayIndividualScores, Agrupacion, PreServiceIndividualEvaluation } from '../types';
import { PRE_SERVICE_BEHAVIOR_ITEMS, BEHAVIOR_RATING_MAP, GROUP_EVALUATION_ITEMS, INDIVIDUAL_EVALUATION_ITEMS } from '../data/constants';
import { PlusIcon, TrashIcon } from '../components/icons';

interface ServiceEvaluationViewProps {
    service: Service;
    evaluation: ServiceEvaluation;
    onEvaluationChange: React.Dispatch<React.SetStateAction<ServiceEvaluation | null>>;
    students: Student[];
    practiceGroups: PracticeGroup[];
    entryExitRecords: EntryExitRecord[];
    isLocked: boolean;
}

const getWeekMonday = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

// --- Reusable Components for Evaluation Tables ---

const PreServiceIndividualTable: React.FC<{
    studentsInGroup: Student[];
    evaluationData: PreServiceDayEvaluation;
    entryExitRecordsForWeek: Record<string, EntryExitRecord[]>;
    onUpdate: (studentId: string, field: string, value: any, behaviorItemId?: string) => void;
    isLocked: boolean;
}> = ({ studentsInGroup, evaluationData, entryExitRecordsForWeek, onUpdate, isLocked }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border font-semibold text-gray-600 w-1/4 text-left">Criterio Individual</th>
                        {studentsInGroup.map(s => <th key={s.id} className="p-2 border font-semibold text-gray-600 truncate">{s.apellido1} {s.nombre.charAt(0)}.</th>)}
                    </tr>
                </thead>
                <tbody>
                    {/* FIX: Corrected type assertion for accessing object property */}
                    {(['attendance', 'hasFichas', 'hasUniforme', 'hasMaterial'] as const).map(field => (
                        <tr key={field}>
                            <td className="p-2 border font-medium capitalize text-left">{field === 'attendance' ? 'Asistencia' : field.replace('has', '')}</td>
                            {studentsInGroup.map(s => {
                                const isChecked = evaluationData?.individualEvaluations[s.id]?.[field] ?? (field === 'attendance');
                                return (
                                <td key={s.id} className="p-2 border text-center">
                                    <input type="checkbox" checked={isChecked} onChange={e => onUpdate(s.id, field, e.target.checked)} className="h-4 w-4" disabled={isLocked} />
                                </td>
                            )})}
                        </tr>
                    ))}
                    <tr className="bg-gray-50"><td colSpan={studentsInGroup.length + 1} className="p-1 border text-center font-semibold">Conducta / Preparación</td></tr>
                    {PRE_SERVICE_BEHAVIOR_ITEMS.map(item => (
                        <tr key={item.id}>
                            <td className="p-2 border text-left">{item.label}</td>
                            {studentsInGroup.map(s => {
                                const indEval = evaluationData?.individualEvaluations[s.id];
                                const isAbsent = !(indEval?.attendance ?? true);
                                const currentScore = indEval?.behaviorScores[item.id];
                                return (
                                <td key={s.id} className="p-1 border text-center">
                                    <div className="flex justify-center items-center space-x-1">
                                    {BEHAVIOR_RATING_MAP.map(rating => {
                                        const isSelected = currentScore === rating.value;
                                        return <button key={rating.value} 
                                            onClick={() => onUpdate(s.id, 'behaviorScores', isSelected ? null : rating.value, item.id)}
                                            disabled={isLocked || isAbsent}
                                            className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold transition ${isSelected ? rating.selectedColor : rating.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                                            title={rating.label}
                                        >{rating.symbol}</button>
                                    })}
                                    </div>
                                </td>
                            )})}
                        </tr>
                    ))}
                     <tr className="bg-gray-50"><td colSpan={studentsInGroup.length + 1} className="p-1 border text-center font-semibold">Observaciones Individuales</td></tr>
                     <tr>
                        <td className="p-2 border text-left font-medium">Incidencias (Salidas/Entradas)</td>
                        {studentsInGroup.map(s => (
                             <td key={s.id} className="p-2 border align-top">
                                 <div className="max-h-20 overflow-y-auto">
                                 {(entryExitRecordsForWeek[s.id] || []).length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {(entryExitRecordsForWeek[s.id] || []).map(rec => (
                                            <li key={rec.id}><strong>{rec.date.substring(0,5)} {rec.type}:</strong> {rec.reason}</li>
                                        ))}
                                    </ul>
                                 ) : <p className="text-gray-400 italic">Sin incidencias</p>}
                                 </div>
                             </td>
                        ))}
                     </tr>
                     <tr>
                        <td className="p-2 border text-left font-medium">Comentarios Adicionales</td>
                         {studentsInGroup.map(s => {
                            const indEval = evaluationData?.individualEvaluations[s.id];
                            const isAbsent = !(indEval?.attendance ?? true);
                            return (
                                <td key={s.id} className="p-1 border align-top">
                                    <textarea 
                                        value={indEval?.observations || ''}
                                        onChange={e => onUpdate(s.id, 'observations', e.target.value)}
                                        disabled={isLocked || isAbsent}
                                        className="w-full h-20 p-1 rounded-md border-gray-200 resize-none disabled:bg-gray-100"
                                        placeholder="Anotaciones..."
                                    />
                                </td>
                         )})}
                     </tr>
                </tbody>
            </table>
        </div>
    );
};

const ServiceDayIndividualEvaluationTable: React.FC<{
    studentsInGroup: Student[];
    evaluationData: { [studentId: string]: ServiceDayIndividualScores };
    onUpdate: (studentId: string, updates: Partial<ServiceDayIndividualScores>, itemIndex?: number) => void;
    handleNumericInputChange: (e: React.ChangeEvent<HTMLInputElement>, max: number, updateFn: (value: number | null) => void) => void;
    entryExitRecordsForWeek: Record<string, EntryExitRecord[]>;
    isLocked: boolean;
}> = ({ studentsInGroup, evaluationData, onUpdate, handleNumericInputChange, entryExitRecordsForWeek, isLocked }) => {
    
    const totals = useMemo(() => {
        const studentTotals: { [studentId: string]: number } = {};
        studentsInGroup.forEach(s => {
            const scores = evaluationData[s.id]?.scores?.filter(score => score !== null) as number[] || [];
            studentTotals[s.id] = scores.reduce((sum, score) => sum + score, 0);
        });
        return studentTotals;
    }, [studentsInGroup, evaluationData]);
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border font-semibold text-gray-600 w-1/4 text-left">Criterio</th>
                        {studentsInGroup.map(s => <th key={s.id} className="p-2 border font-semibold text-gray-600 truncate">{s.apellido1} {s.nombre.charAt(0)}.</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 border font-medium text-left">Asistencia</td>
                        {studentsInGroup.map(s => (
                            <td key={s.id} className="p-2 border text-center">
                                <input 
                                    type="checkbox" 
                                    checked={evaluationData[s.id]?.attendance ?? true} 
                                    onChange={e => onUpdate(s.id, { attendance: e.target.checked })} 
                                    className="h-4 w-4" 
                                    disabled={isLocked}
                                />
                            </td>
                        ))}
                    </tr>
                    {INDIVIDUAL_EVALUATION_ITEMS.map((item, index) => (
                        <tr key={item.id}>
                            <td className="p-2 border text-left">{item.label}</td>
                            {studentsInGroup.map(s => {
                                const studentEval = evaluationData[s.id];
                                const isAbsent = !(studentEval?.attendance ?? true);
                                return (
                                    <td key={s.id} className="p-1 border">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max={item.maxScore}
                                            value={studentEval?.scores?.[index] ?? ''}
                                            onChange={e => handleNumericInputChange(e, item.maxScore, value => {
                                                const newScores = [...(studentEval?.scores || Array(INDIVIDUAL_EVALUATION_ITEMS.length).fill(null))];
                                                newScores[index] = value;
                                                onUpdate(s.id, { scores: newScores }, index);
                                            })}
                                            disabled={isLocked || isAbsent}
                                            placeholder={`max: ${item.maxScore.toFixed(2)}`}
                                            className="w-full text-center p-1.5 rounded-md border-gray-300 placeholder-gray-300 disabled:bg-gray-100"
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
                 <tfoot>
                    <tr className="bg-gray-100 font-bold">
                        <td className="p-2 border text-left">TOTAL</td>
                        {studentsInGroup.map(s => (
                            <td key={s.id} className="p-2 border text-center">
                                {totals[s.id].toFixed(2)} / {INDIVIDUAL_EVALUATION_ITEMS.reduce((acc, item) => acc + item.maxScore, 0).toFixed(2)}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td className="p-2 border text-left font-medium">Participación Grupal</td>
                        {studentsInGroup.map(s => {
                            const studentEval = evaluationData[s.id];
                            const isHalved = studentEval?.halveGroupScore === true;
                            const isAbsent = !(studentEval?.attendance ?? true);
                            return (
                                <td key={s.id} className="p-1 border text-center align-middle">
                                    <button
                                        onClick={() => onUpdate(s.id, { halveGroupScore: !isHalved })}
                                        disabled={isLocked || isAbsent}
                                        className={`px-2 py-1 text-xs rounded w-full font-semibold transition-colors ${
                                            isHalved
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={isHalved ? "La nota grupal se reduce a la mitad por baja participación." : "La nota grupal cuenta al 100%."}
                                    >
                                        {isHalved ? 'Penalizado (50%)' : 'Normal (100%)'}
                                    </button>
                                </td>
                            );
                        })}
                    </tr>
                    <tr>
                        <td className="p-2 border text-left font-medium">Incidencias (Salidas/Entradas)</td>
                        {studentsInGroup.map(s => (
                             <td key={s.id} className="p-2 border align-top">
                                 <div className="max-h-20 overflow-y-auto">
                                 {(entryExitRecordsForWeek[s.id] || []).length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {(entryExitRecordsForWeek[s.id] || []).map(rec => (
                                            <li key={rec.id}><strong>{rec.date.substring(0,5)} {rec.type}:</strong> {rec.reason}</li>
                                        ))}
                                    </ul>
                                 ) : <p className="text-gray-400 italic">Sin incidencias</p>}
                                 </div>
                             </td>
                        ))}
                    </tr>
                    <tr>
                        <td className="p-2 border text-left font-medium">Observaciones</td>
                        {studentsInGroup.map(s => {
                            const isAbsent = !(evaluationData[s.id]?.attendance ?? true);
                            return (
                                <td key={s.id} className="p-1 border">
                                    <textarea
                                        value={evaluationData[s.id]?.observations || ''}
                                        onChange={e => onUpdate(s.id, { observations: e.target.value })}
                                        disabled={isLocked || isAbsent}
                                        className="w-full h-20 p-1 rounded-md border-gray-200 resize-none disabled:bg-gray-100"
                                        placeholder="Anotaciones..."
                                    />
                                </td>
                            );
                        })}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};


const ServiceEvaluationView: React.FC<ServiceEvaluationViewProps> = ({ service, evaluation, onEvaluationChange, students, practiceGroups, entryExitRecords, isLocked }) => {
    const [activeTab, setActiveTab] = useState<'pre-service' | 'service-day'>('pre-service');
    const [activePreServiceDate, setActivePreServiceDate] = useState<string | null>(null);

    const evaluationUnits = useMemo(() => {
        const units: { id: string; name: string; students: Student[] }[] = [];
        if (service.type === 'agrupacion') {
            (service.agrupaciones || []).forEach(agrupacion => {
                units.push({
                    id: agrupacion.id,
                    name: agrupacion.name,
                    students: students.filter(s => agrupacion.studentIds.includes(s.id)).sort((a, b) => a.apellido1.localeCompare(b.apellido1)),
                });
            });
        } else {
            const groupIds = new Set([...(service.assignedGroups?.comedor || []), ...(service.assignedGroups?.takeaway || [])]);
            practiceGroups.filter(pg => groupIds.has(pg.id)).forEach(group => {
                units.push({
                    id: group.id,
                    name: group.name,
                    students: students.filter(s => group.studentIds.includes(s.id)).sort((a, b) => a.apellido1.localeCompare(b.apellido1)),
                });
            });
        }
        return units;
    }, [service, students, practiceGroups]);

    const preServiceDates = useMemo(() => Object.keys(evaluation.preService || {}).sort((a,b) => new Date(a).getTime() - new Date(b).getTime()), [evaluation.preService]);
    
    useEffect(() => {
        if (preServiceDates.length > 0 && (!activePreServiceDate || !preServiceDates.includes(activePreServiceDate))) {
            setActivePreServiceDate(preServiceDates[preServiceDates.length - 1]);
        } else if (preServiceDates.length === 0) {
            setActivePreServiceDate(null);
        }
    }, [preServiceDates, activePreServiceDate]);

    const entryExitRecordsForWeek = useMemo(() => {
        const serviceDate = new Date(service.date);
        serviceDate.setHours(12,0,0,0);
        const weekStart = getWeekMonday(serviceDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const relevantRecords = entryExitRecords.filter(rec => {
            const [day, month, year] = rec.date.split('/');
            const recDate = new Date(`${year}-${month}-${day}`);
            recDate.setHours(12,0,0,0);
            return recDate >= weekStart && recDate <= weekEnd;
        });

        // FIX: Explicitly type the accumulator in the reduce function to resolve "Type 'unknown' cannot be used as an index type" error.
        return relevantRecords.reduce((acc: Record<string, EntryExitRecord[]>, rec) => {
            if (!acc[rec.studentId]) {
                acc[rec.studentId] = [];
            }
            acc[rec.studentId].push(rec);
            return acc;
        }, {});

    }, [service.date, entryExitRecords]);

    const deepCloneAndUpdate = useCallback((updateFn: (draft: ServiceEvaluation) => void) => {
        onEvaluationChange(prev => {
            if (!prev) return null;
            const newEval: ServiceEvaluation = JSON.parse(JSON.stringify(prev));
            updateFn(newEval);
            return newEval;
        });
    }, [onEvaluationChange]);

    const handleAddPreServiceDay = () => {
        const dateStr = prompt("Introduce la fecha para el nuevo día de pre-servicio (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            if(dateStr) alert("Formato de fecha inválido.");
            return;
        }

        if (evaluation.preService && evaluation.preService[dateStr]) {
            alert("Ya existe un día de pre-servicio para esta fecha.");
            setActivePreServiceDate(dateStr);
            return;
        }

        deepCloneAndUpdate(draft => {
            if (!draft.preService) draft.preService = {};
            
            const individualEvaluations: { [studentId: string]: any } = {};
            const allStudentIdsInService = new Set(evaluationUnits.flatMap(unit => unit.students.map(s => s.id)));
            allStudentIdsInService.forEach(studentId => {
                individualEvaluations[studentId] = {
                    attendance: true, hasFichas: true, hasUniforme: true, hasMaterial: true,
                    behaviorScores: {}, observations: ''
                };
            });
            
            const defaultName = `Pre-servicio ${new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
            draft.preService[dateStr] = { name: defaultName, groupObservations: {}, individualEvaluations };
        });
        setActivePreServiceDate(dateStr);
    };
    
    const handleDeletePreServiceDay = (date: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este día de pre-servicio?')) {
            deepCloneAndUpdate(draft => {
                delete draft.preService[date];
            });
        }
    };

    const handlePreServiceIndividualUpdate = (date: string, studentId: string, field: string, value: any, behaviorItemId?: string) => {
        deepCloneAndUpdate(draft => {
            if (draft.preService[date]?.individualEvaluations[studentId]) {
                if (field === 'behaviorScores' && behaviorItemId) {
                    if (!draft.preService[date].individualEvaluations[studentId].behaviorScores) {
                        draft.preService[date].individualEvaluations[studentId].behaviorScores = {};
                    }
                    draft.preService[date].individualEvaluations[studentId].behaviorScores[behaviorItemId] = value;
                } else {
                    (draft.preService[date].individualEvaluations[studentId] as any)[field] = value;
                }
            }
        });
    };

    const handlePreServiceGroupObservationChange = (date: string, groupId: string, value: string) => {
        deepCloneAndUpdate(draft => {
            if (draft.preService[date]) {
                if (!draft.preService[date].groupObservations) draft.preService[date].groupObservations = {};
                draft.preService[date].groupObservations[groupId] = value;
            }
        });
    };
    
    const handlePreServiceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activePreServiceDate) return;
        const newName = e.target.value;
        const date = activePreServiceDate;
        deepCloneAndUpdate(draft => {
            if(draft.preService[date]) draft.preService[date].name = newName;
        });
    };

    const handleServiceDayIndividualUpdate = (studentId: string, updates: Partial<ServiceDayIndividualScores>) => {
        deepCloneAndUpdate(draft => {
            if (!draft.serviceDay.individualScores[studentId]) {
                draft.serviceDay.individualScores[studentId] = {
                    attendance: true, scores: Array(INDIVIDUAL_EVALUATION_ITEMS.length).fill(null),
                    observations: '', halveGroupScore: false,
                };
            }
            Object.assign(draft.serviceDay.individualScores[studentId], updates);
            if (updates.attendance === false) {
                draft.serviceDay.individualScores[studentId].scores = Array(INDIVIDUAL_EVALUATION_ITEMS.length).fill(null);
            }
        });
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>, max: number, updateFn: (value: number | null) => void) => {
        const value = e.target.value;
        if (value === '') {
            updateFn(null);
            return;
        }
        const numericValue = parseFloat(value.replace(',', '.'));
        if (!isNaN(numericValue) && numericValue >= 0) {
            updateFn(Math.min(numericValue, max));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-lg shadow-sm">
                <nav className="flex space-x-1">
                    <button onClick={() => setActiveTab('pre-service')} className={`flex-1 px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === 'pre-service' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Día Previo</button>
                    <button onClick={() => setActiveTab('service-day')} className={`flex-1 px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === 'service-day' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Día de Servicio</button>
                </nav>
            </div>
            
            {activeTab === 'pre-service' && (
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 border-b pb-4 flex-wrap">
                        {preServiceDates.map(date => {
                             const preServiceDay = evaluation.preService[date];
                             const displayName = preServiceDay?.name || `Pre-servicio ${new Date(date + 'T12:00:00Z').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
                             return <button key={date} onClick={() => setActivePreServiceDate(date)} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activePreServiceDate === date ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>{displayName}</button>
                        })}
                         <button onClick={handleAddPreServiceDay} disabled={isLocked} className="flex items-center text-sm text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon className="w-4 h-4 mr-1" /> Añadir Día</button>
                    </div>

                     {activePreServiceDate && evaluation.preService[activePreServiceDate] && (
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <label htmlFor="pre-service-name" className="block text-sm font-medium text-gray-700">Nombre del Evento</label>
                                    <input id="pre-service-name" type="text" value={evaluation.preService[activePreServiceDate]?.name || ''} onChange={handlePreServiceNameChange} className="mt-1 block w-full md:w-96 p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100" placeholder="E.g., Pre-Servicio Semana 3" disabled={isLocked} />
                                </div>
                                <button onClick={() => handleDeletePreServiceDay(activePreServiceDate)} disabled={isLocked} className="text-sm text-red-600 hover:text-red-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-4 h-4 mr-1"/>Eliminar este día</button>
                            </div>
                        </div>
                     )}

                    {activePreServiceDate && evaluation.preService[activePreServiceDate] ? (
                        evaluationUnits.map(unit => {
                            if(unit.students.length === 0) return null;
                            return (
                                <div key={unit.id} className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-bold mb-3 text-gray-700">{unit.name}</h3>
                                    <div className="mb-4">
                                        <label htmlFor={`group-obs-${unit.id}`} className="block text-sm font-semibold text-gray-600 mb-1">Observaciones del Grupo</label>
                                        <textarea id={`group-obs-${unit.id}`} value={evaluation.preService[activePreServiceDate]?.groupObservations[unit.id] || ''} onChange={(e) => handlePreServiceGroupObservationChange(activePreServiceDate!, unit.id, e.target.value)} disabled={isLocked} rows={3} className="w-full p-2 text-sm border rounded-md bg-white disabled:bg-gray-100" placeholder="Anotaciones sobre el comportamiento, limpieza, organización, etc. del grupo en general." />
                                    </div>
                                    <PreServiceIndividualTable studentsInGroup={unit.students} evaluationData={evaluation.preService[activePreServiceDate!]} entryExitRecordsForWeek={entryExitRecordsForWeek} onUpdate={(studentId, field, value, behaviorItemId) => handlePreServiceIndividualUpdate(activePreServiceDate!, studentId, field, value, behaviorItemId)} isLocked={isLocked}/>
                                </div>
                            );
                        })
                    ) : <div className="text-center p-8 bg-white rounded-lg shadow-sm"><p className="text-gray-500">No hay un día de pre-servicio seleccionado. Por favor, añade o selecciona uno.</p></div>}
                </div>
            )}
            
            {activeTab === 'service-day' && (
                 <div className="space-y-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
                         <h3 className="text-xl font-bold mb-3 text-gray-700">{service.type === 'agrupacion' ? 'Evaluación de Agrupaciones' : 'Evaluación Grupal'}</h3>
                         <table className="min-w-full text-sm border-collapse">
                             <thead className="bg-gray-100"><tr><th className="p-2 border font-semibold text-left">Criterio</th>{evaluationUnits.map(unit => <th key={unit.id} className="p-2 border font-semibold">{unit.name}</th>)}</tr></thead>
                             <tbody>
                                 {GROUP_EVALUATION_ITEMS.map((item, itemIndex) => (<tr key={item.id}><td className="p-2 border text-left">{item.label}</td>{evaluationUnits.map(unit => {const groupEval = evaluation.serviceDay.groupScores[unit.id]; return (<td key={unit.id} className="p-1 border align-middle"><input type="number" step="0.1" min="0" max={item.maxScore} value={groupEval?.scores[itemIndex] ?? ''} onChange={e => handleNumericInputChange(e, item.maxScore, (value) => {deepCloneAndUpdate(draft => {if (!draft.serviceDay.groupScores[unit.id]) draft.serviceDay.groupScores[unit.id] = { scores: Array(GROUP_EVALUATION_ITEMS.length).fill(null), observations: ''}; draft.serviceDay.groupScores[unit.id].scores[itemIndex] = value;})})} placeholder={`max: ${item.maxScore.toFixed(2)}`} className="w-full text-center p-1.5 rounded-md border-gray-300 placeholder-gray-300 disabled:bg-gray-100" disabled={isLocked}/></td>)})}</tr>))}
                             </tbody>
                             <tfoot>
                                 <tr className="bg-gray-100 font-bold">
                                     <td className="p-2 border text-left">TOTAL</td>
                                     {evaluationUnits.map(unit => { const scores = evaluation.serviceDay.groupScores[unit.id]?.scores.filter(s => s !== null) as number[] || []; const total = scores.reduce((a, b) => a + b, 0); return <td key={unit.id} className="p-2 border text-center">{total.toFixed(2)} / {GROUP_EVALUATION_ITEMS.reduce((acc, item) => acc + item.maxScore, 0).toFixed(2)}</td>})}
                                 </tr>
                                 <tr>
                                    <td className="p-2 border text-left font-medium">Observaciones</td>
                                    {evaluationUnits.map(unit => (<td key={unit.id} className="p-1 border"><textarea value={evaluation.serviceDay.groupScores[unit.id]?.observations || ''} onChange={e => { deepCloneAndUpdate(draft => { if (!draft.serviceDay.groupScores[unit.id]) { draft.serviceDay.groupScores[unit.id] = { scores: Array(GROUP_EVALUATION_ITEMS.length).fill(null), observations: '' }; } draft.serviceDay.groupScores[unit.id].observations = e.target.value; }); }} className="w-full h-20 p-1 rounded-md border-gray-200 resize-none disabled:bg-gray-100" placeholder="Anotaciones..." disabled={isLocked}/></td>))}
                                </tr>
                             </tfoot>
                         </table>
                    </div>

                    {evaluationUnits.map(unit => {
                        if(unit.students.length === 0) return null;
                        return(<div key={unit.id} className="bg-white p-4 rounded-lg shadow-sm"><h3 className="text-xl font-bold mb-3 text-gray-700">Evaluación Individual - {unit.name}</h3><ServiceDayIndividualEvaluationTable studentsInGroup={unit.students} evaluationData={evaluation.serviceDay.individualScores} onUpdate={handleServiceDayIndividualUpdate} handleNumericInputChange={handleNumericInputChange} entryExitRecordsForWeek={entryExitRecordsForWeek} isLocked={isLocked}/></div>)
                    })}
                 </div>
            )}
        </div>
    );
};

export default ServiceEvaluationView;
