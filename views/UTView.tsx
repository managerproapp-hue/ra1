import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { UnidadTrabajo, CriterioEvaluacion, ResultadoAprendizaje, InstrumentoEvaluacion } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, SaveIcon, XIcon, BookOpenIcon, ChevronDownIcon, ChevronRightIcon, PrinterIcon } from '../components/icons';
import { generateFullPlanningPDF } from '../services/reportGenerator';

interface UTFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UnidadTrabajo) => void;
    initialData: UnidadTrabajo;
}

const UTFormModal: React.FC<UTFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{initialData.id.startsWith('ut_') ? 'Nueva Unidad de Trabajo' : 'Editar Unidad de Trabajo'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} required className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
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

const AsociacionesSummary: React.FC<{ 
    utId: string;
}> = ({ utId }) => {
    const { resultadosAprendizaje, criteriosEvaluacion, instrumentosEvaluacion } = useAppContext();

    const structuredData = useMemo(() => {
        const grouped: Record<string, { ra: ResultadoAprendizaje; criterios: { criterio: CriterioEvaluacion; instrumentos: string[] }[] }> = {};
        
        const allCriterios = Object.values(criteriosEvaluacion) as CriterioEvaluacion[];
        const criteriaForThisUT = allCriterios.filter(c => 
            (c.asociaciones || []).some(a => a.utId === utId)
        );

        criteriaForThisUT.forEach(crit => {
            const raId = crit.raId;
            if (!raId) return;

            if (!grouped[raId]) {
                const ra = resultadosAprendizaje[raId];
                if (ra) {
                    grouped[raId] = { ra, criterios: [] };
                }
            }
            
            if (grouped[raId]) {
                const asociacionForThisUT = (crit.asociaciones || []).find(a => a.utId === utId);
                const instrumentos: string[] = [];
                
                if (asociacionForThisUT) {
                    asociacionForThisUT.activityIds.forEach(actId => {
                        for (const inst of Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]) {
                            const activity = inst.activities.find(a => a.id === actId);
                            if (activity) {
                                instrumentos.push(`${inst.nombre}: ${activity.name} (${activity.trimester.toUpperCase()})`);
                                break;
                            }
                        }
                    });
                }

                grouped[raId].criterios.push({ criterio: crit, instrumentos });
            }
        });
        
        return Object.values(grouped).sort((a, b) => a.ra.nombre.localeCompare(b.ra.nombre));
    }, [utId, criteriosEvaluacion, resultadosAprendizaje, instrumentosEvaluacion]);
    
    if (structuredData.length === 0) {
        return <p className="text-sm text-gray-500">Esta UT no está asociada a ningún criterio de evaluación.</p>;
    }

    return (
        <div className="space-y-4">
            {structuredData.map(({ ra, criterios }) => (
                <div key={ra.id} className="text-sm bg-gray-50 p-3 rounded-lg border">
                    <p className="font-bold text-base text-blue-700">{ra.nombre}</p>
                    <ul className="mt-2 space-y-3">
                        {criterios.map(({ criterio, instrumentos }) => (
                            <li key={criterio.id} className="pl-4 border-l-2 border-blue-200">
                                <p className="font-semibold text-gray-800">{criterio.descripcion} <span className="font-bold">({criterio.ponderacion}%)</span></p>
                                {instrumentos.length > 0 && (
                                    <div className="mt-1">
                                        <p className="text-xs font-bold text-gray-500">Instrumentos:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {instrumentos.map((inst, index) => (
                                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{inst}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};


const UTView: React.FC = () => {
    const { 
        unidadesTrabajo, 
        resultadosAprendizaje, 
        criteriosEvaluacion, 
        instrumentosEvaluacion, 
        handleSaveUT, 
        handleDeleteUT,
        teacherData,
        instituteData
    } = useAppContext();
    const [modalState, setModalState] = useState<{ isOpen: boolean; data: UnidadTrabajo | null }>({ isOpen: false, data: null });
    const [expandedUTs, setExpandedUTs] = useState<Set<string>>(new Set());

    const handleOpenModal = (data: UnidadTrabajo | null) => {
        setModalState({ isOpen: true, data: data || { id: `ut_${Date.now()}`, nombre: '', descripcion: '' } });
    };

    const handleCloseModal = () => setModalState({ isOpen: false, data: null });
    
    const toggleExpand = (utId: string) => {
        setExpandedUTs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(utId)) newSet.delete(utId);
            else newSet.add(utId);
            return newSet;
        });
    };
    
    const handlePrintAll = () => {
        const allUTs = Object.values(unidadesTrabajo) as UnidadTrabajo[];
        
        const allUTData = allUTs.map(ut => {
             const grouped: Record<string, { ra: ResultadoAprendizaje; criterios: { criterio: CriterioEvaluacion; instrumentos: string[] }[] }> = {};
            
            const allCriterios = Object.values(criteriosEvaluacion) as CriterioEvaluacion[];
            const criteriaForThisUT = allCriterios.filter(c => (c.asociaciones || []).some(a => a.utId === ut.id));

            criteriaForThisUT.forEach(crit => {
                const raId = crit.raId;
                if (!raId || !resultadosAprendizaje[raId]) return;
                if (!grouped[raId]) grouped[raId] = { ra: resultadosAprendizaje[raId], criterios: [] };
                
                const asociacionForThisUT = (crit.asociaciones || []).find(a => a.utId === ut.id);
                const instrumentos = (asociacionForThisUT?.activityIds || []).map(actId => {
                    for (const inst of Object.values(instrumentosEvaluacion) as InstrumentoEvaluacion[]) {
                        const activity = inst.activities.find(a => a.id === actId);
                        if (activity) return `${inst.nombre}: ${activity.name} (${activity.trimester.toUpperCase()})`;
                    }
                    return 'Actividad no encontrada';
                });
                grouped[raId].criterios.push({ criterio: crit, instrumentos });
            });
            return { ut, associatedRAs: Object.values(grouped).sort((a,b)=>a.ra.nombre.localeCompare(b.ra.nombre)) };
        });

        generateFullPlanningPDF(allUTData, teacherData, instituteData);
    };

    return (
        <div>
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center"><BookOpenIcon className="w-8 h-8 mr-3 text-purple-500"/>Unidades de Trabajo (UT)</h1>
                    <p className="text-gray-500 mt-1">Define las unidades didácticas y visualiza su planificación académica completa.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrintAll} className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition">
                        <PrinterIcon className="w-5 h-5 mr-1" /> Imprimir Planificación Completa
                    </button>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nueva UT
                    </button>
                </div>
            </header>
            <div className="space-y-4">
                {Object.values(unidadesTrabajo || {}).map((ut: UnidadTrabajo) => {
                    const isExpanded = expandedUTs.has(ut.id);
                    return (
                        <div key={ut.id} className="bg-white rounded-lg shadow-sm">
                            <div className="flex items-center p-4">
                                <button onClick={() => toggleExpand(ut.id)} className="p-1 rounded-full hover:bg-gray-100">
                                    {isExpanded ? <ChevronDownIcon className="w-5 h-5"/> : <ChevronRightIcon className="w-5 h-5"/>}
                                </button>
                                <div className="flex-1 ml-2 cursor-pointer" onClick={() => toggleExpand(ut.id)}>
                                    <h3 className="font-bold text-lg text-gray-800">{ut.nombre}</h3>
                                    <p className="text-sm text-gray-600">{ut.descripcion}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(ut)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteUT(ut.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t p-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Planificación Académica Asociada</h4>
                                    <AsociacionesSummary utId={ut.id} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {modalState.isOpen && <UTFormModal isOpen={modalState.isOpen} onClose={handleCloseModal} onSave={handleSaveUT} initialData={modalState.data!} />}
        </div>
    );
};

export default UTView;