import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { InstrumentoEvaluacion, EvaluationActivity, Student, AcademicGrades, StudentCalculatedGrades } from '../types';
import { PencilIcon, SaveIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from '../components/icons';

interface InstrumentoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InstrumentoEvaluacion) => void;
    initialData: InstrumentoEvaluacion | null;
}

const InstrumentoFormModal: React.FC<InstrumentoFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    React.useEffect(() => {
        if (initialData) {
            setFormData(JSON.parse(JSON.stringify(initialData)));
        }
    }, [initialData]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p!, [name]: name === 'pesoTotal' ? parseInt(value) || 0 : value }));
    };

    const handleActivityChange = (activityId: string, field: keyof EvaluationActivity, value: string) => {
        const updatedActivities = formData.activities.map(act =>
            act.id === activityId ? { ...act, [field]: value } : act
        );
        setFormData({ ...formData, activities: updatedActivities });
    };

    const handleAddActivity = () => {
        const newActivity: EvaluationActivity = {
            id: `act_${Date.now()}`,
            name: 'Nueva Actividad',
            trimester: 't1'
        };
        setFormData({ ...formData, activities: [...formData.activities, newActivity] });
    };

    const handleDeleteActivity = (activityId: string) => {
        setFormData({ ...formData, activities: formData.activities.filter(act => act.id !== activityId) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const title = initialData?.id.startsWith('inst_') ? 'Nuevo Instrumento' : 'Editar Instrumento';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Peso Total (%)</label>
                        <input type="number" name="pesoTotal" value={formData.pesoTotal || ''} onChange={handleChange} min="0" max="100" className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actividades de Evaluación</label>
                        <div className="space-y-2 border p-3 rounded-md bg-gray-50 max-h-60 overflow-y-auto">
                            {formData.activities.map(act => (
                                <div key={act.id} className="flex items-center gap-2">
                                    <input type="text" value={act.name} onChange={e => handleActivityChange(act.id, 'name', e.target.value)} className="flex-grow p-1.5 border rounded-md text-sm" placeholder="Nombre de actividad"/>
                                    <select value={act.trimester} onChange={e => handleActivityChange(act.id, 'trimester', e.target.value)} className="p-1.5 border rounded-md text-sm bg-white">
                                        <option value="t1">1º Trim</option>
                                        <option value="t2">2º Trim</option>
                                    </select>
                                    <button type="button" onClick={() => handleDeleteActivity(act.id)} className="p-1.5 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                             <button type="button" onClick={handleAddActivity} className="mt-2 text-sm text-blue-600 flex items-center font-semibold"><PlusIcon className="w-4 h-4 mr-1" />Añadir Actividad</button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold flex items-center"><SaveIcon className="w-5 h-5 mr-2" />Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ActivityRow: React.FC<{
    activity: EvaluationActivity;
    onUpdate: (activity: EvaluationActivity) => void;
    onDelete: () => void;
}> = ({ activity, onUpdate, onDelete }) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <input
                type="text"
                value={activity.name}
                onChange={e => onUpdate({ ...activity, name: e.target.value })}
                className="flex-grow p-1.5 border rounded-md text-sm"
                placeholder="Nombre de la actividad"
            />
            <select
                value={activity.trimester}
                onChange={e => onUpdate({ ...activity, trimester: e.target.value as 't1' | 't2' })}
                className="p-1.5 border rounded-md text-sm bg-white"
            >
                <option value="t1">1º Trimestre</option>
                <option value="t2">2º Trimestre</option>
            </select>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
        </div>
    );
};

const getGradeForActivity = (
    studentId: string,
    activity: EvaluationActivity,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): number | null => {
    const studentAcademic = academicGrades[studentId];
    const studentCalculated = calculatedGrades[studentId];

    switch (activity.id) {
        // Examen Teórico
        case 'act-1': // Examen 1 T1
            return studentAcademic?.t1?.manualGrades?.examen1 ?? null;
        case 'act-2': // Examen 2 T1
            return studentAcademic?.t1?.manualGrades?.examen2 ?? null;
        case 'act-8': // Examen 3 T2 (mapped to examen1 in T2)
            return studentAcademic?.t2?.manualGrades?.examen1 ?? null;
        case 'act-9': // Examen 4 T2 (mapped to examen2 in T2)
            return studentAcademic?.t2?.manualGrades?.examen2 ?? null;
        
        // Servicios
        case 'act-6': // Servicios T1
            return studentCalculated?.serviceAverages?.t1 ?? null;
        case 'act-13': // Servicios T2
            return studentCalculated?.serviceAverages?.t2 ?? null;

        // Examen Práctico
        case 'act-7': // Ex. Practico T1
            return studentCalculated?.practicalExams?.t1 ?? null;
        case 'act-14': // Ex. Practico T2
            return studentCalculated?.practicalExams?.t2 ?? null;
            
        // Otros (Fichas, Trabajos, Práctica Diaria) - Aún no tienen origen de datos
        case 'act-3':
        case 'act-10':
        case 'act-4':
        case 'act-11':
        case 'act-5':
        case 'act-12':
        default:
            return null;
    }
};

const GradesMatrix: React.FC<{
    instrument: InstrumentoEvaluacion;
}> = ({ instrument }) => {
    const { students, academicGrades, calculatedGrades } = useAppContext();
    const sortedStudents = useMemo(() => [...students].sort((a,b) => a.apellido1.localeCompare(b.apellido1)), [students]);

    if(instrument.activities.length === 0) {
        return <div className="text-center text-sm text-gray-500 py-4">Este instrumento no tiene actividades de evaluación definidas.</div>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-2 border font-semibold text-gray-600 w-48 text-left sticky left-0 bg-gray-200">Alumno</th>
                        {instrument.activities.map(act => (
                            <th key={act.id} className="p-2 border font-semibold text-gray-600">{act.name} ({act.trimester.toUpperCase()})</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-100 group">
                            <td className="p-2 border text-left font-medium text-gray-800 w-48 sticky left-0 bg-white group-hover:bg-gray-100">{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                            {instrument.activities.map(act => {
                                const grade = getGradeForActivity(student.id, act, academicGrades, calculatedGrades);
                                return (
                                    <td key={act.id} className={`p-2 border text-center font-semibold ${grade !== null && grade < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                                        {grade !== null ? grade.toFixed(2) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const InstrumentosView: React.FC = () => {
    const { instrumentosEvaluacion: contextInstrumentos, setInstrumentosEvaluacion, handleDeleteInstrumento, addToast } = useAppContext();
    
    const [localInstrumentos, setLocalInstrumentos] = useState(contextInstrumentos);
    const [expandedInstrument, setExpandedInstrument] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean; data: InstrumentoEvaluacion | null }>({ isOpen: false, data: null });

    useEffect(() => {
        setLocalInstrumentos(contextInstrumentos);
    }, [contextInstrumentos]);

    const handleOpenModal = (data: InstrumentoEvaluacion | null) => {
        setModalState({ isOpen: true, data: data || { id: `inst_${Date.now()}`, nombre: '', descripcion: '', pesoTotal: 0, activities: [] } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, data: null });

    const handleSaveInstrument = (data: InstrumentoEvaluacion) => {
        setInstrumentosEvaluacion(prev => ({ ...prev, [data.id]: data }));
        addToast(`Instrumento '${data.nombre}' guardado.`, 'success');
        handleCloseModal();
    };
    
    const handleUpdateInstrumentLocally = (updatedInstrument: InstrumentoEvaluacion) => {
        setLocalInstrumentos(prev => ({
            ...prev,
            [updatedInstrument.id]: updatedInstrument,
        }));
    };
    
    const handleSaveAllPonderaciones = () => {
        const totalPeso = (Object.values(localInstrumentos) as InstrumentoEvaluacion[]).reduce((sum, inst) => sum + (inst.pesoTotal || 0), 0);
        if (totalPeso > 100) {
            addToast(`El peso total no puede superar el 100% (actual: ${totalPeso}%)`, 'error');
            return;
        }
        setInstrumentosEvaluacion(localInstrumentos);
        addToast('Ponderaciones guardadas con éxito.', 'success');
    };

    const totalPeso = useMemo(() => (Object.values(localInstrumentos) as InstrumentoEvaluacion[]).reduce((sum, inst) => sum + (inst.pesoTotal || 0), 0), [localInstrumentos]);

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><PencilIcon className="w-8 h-8 mr-3 text-purple-500"/>Planificación y Ponderación</h1>
                    <p className="text-gray-500 mt-1">Define el peso de cada instrumento y visualiza las notas asociadas.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleOpenModal(null)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nuevo Instrumento
                    </button>
                    <button onClick={handleSaveAllPonderaciones} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                        <SaveIcon className="w-5 h-5 mr-1" /> Guardar Ponderaciones
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-1/3">Tipo de Instrumento</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Valor Total (%)</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Nº Actividades</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                </table>
                <div className="space-y-1">
                    {(Object.values(localInstrumentos) as InstrumentoEvaluacion[]).map((inst) => {
                        const isExpanded = expandedInstrument === inst.id;
                        return (
                            <div key={inst.id} className="border-t">
                                <div className="flex items-center">
                                    <div className="w-1/3 px-4 py-3 font-medium">
                                        <button onClick={() => setExpandedInstrument(isExpanded ? null : inst.id)} className="flex items-center gap-2 w-full text-left">
                                            {isExpanded ? <ChevronDownIcon className="w-4 h-4"/> : <ChevronRightIcon className="w-4 h-4"/>}
                                            {inst.nombre}
                                        </button>
                                    </div>
                                    <div className="w-1/4 px-4 py-3">
                                        <input 
                                            type="number" 
                                            value={inst.pesoTotal || ''}
                                            onChange={e => handleUpdateInstrumentLocally({ ...inst, pesoTotal: parseInt(e.target.value) || 0 })}
                                            className="w-24 mx-auto p-1.5 text-center bg-yellow-50 border rounded-md"
                                            min="0" max="100"
                                        />
                                    </div>
                                    <div className="w-1/4 px-4 py-3 text-center font-medium">{inst.activities.length}</div>
                                    <div className="w-1/4 px-4 py-3 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleOpenModal(inst)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteInstrumento(inst.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 bg-gray-50 border-t">
                                        <h4 className="font-semibold text-md mb-2 text-gray-700">Desglose de Notas del Instrumento: {inst.nombre}</h4>
                                        <GradesMatrix instrument={inst} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                 <div className="bg-gray-100 border-t-2 p-3 flex justify-end items-center font-bold">
                    <span className="mr-4">TOTAL PONDERACIÓN</span>
                    <span className={`text-lg ${totalPeso > 100 ? 'text-red-600' : totalPeso < 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {totalPeso}%
                    </span>
                 </div>
            </div>
            {modalState.isOpen && <InstrumentoFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSaveInstrument} initialData={modalState.data} />}
        </div>
    );
};

export default InstrumentosView;