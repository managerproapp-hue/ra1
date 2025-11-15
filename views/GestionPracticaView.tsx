

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Service, ServiceEvaluation, Elaboration, Student, PracticeGroup, ServiceRole, TeacherData, InstituteData, Agrupacion } from '../types';
import { PlusIcon, TrashIcon, SaveIcon, ChefHatIcon, LockClosedIcon, LockOpenIcon, FileTextIcon, ChevronDownIcon, ChevronRightIcon, UsersIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';

const ServiceEvaluationView = lazy(() => import('./ServiceEvaluationView'));
const ReportsCenterModal = lazy(() => import('../components/ReportsCenterModal'));

// Modal for assigning students to an agrupacion
const AsignarAlumnosModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (studentIds: string[]) => void;
    allStudents: Student[];
    initialStudentIds: string[];
    alreadyAssignedIds: Set<string>;
}> = ({ isOpen, onClose, onSave, allStudents, initialStudentIds, alreadyAssignedIds }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialStudentIds));
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const handleToggle = (studentId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };
    
    const filteredStudents = allStudents.filter(s => 
        `${s.nombre} ${s.apellido1} ${s.apellido2}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.apellido1.localeCompare(b.apellido1));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Asignar Alumnos</h3>
                <input type="text" placeholder="Buscar alumnos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded mb-4" />
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredStudents.map(student => {
                        const isAssignedElsewhere = alreadyAssignedIds.has(student.id) && !selectedIds.has(student.id);
                        return (
                            <label key={student.id} className={`flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer ${isAssignedElsewhere ? 'opacity-70' : ''}`}>
                                <input type="checkbox" checked={selectedIds.has(student.id)} onChange={() => handleToggle(student.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <img src={student.fotoUrl} alt="" className="w-8 h-8 rounded-full object-cover mx-3" />
                                <span className="text-sm flex-1">{student.apellido1} {student.apellido2}, {student.nombre}</span>
                                {isAssignedElsewhere && (
                                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Asignado</span>
                                )}
                            </label>
                        );
                    })}
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                    <button onClick={() => onSave(Array.from(selectedIds))} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar ({selectedIds.size})</button>
                </div>
            </div>
        </div>
    );
};

// Component for planning agrupaciones
const PlanificacionAgrupaciones: React.FC<{
    editedService: Service;
    setEditedService: React.Dispatch<React.SetStateAction<Service | null>>;
    isLocked: boolean;
    students: Student[];
}> = ({ editedService, setEditedService, isLocked, students }) => {
    const [newAgrupacionName, setNewAgrupacionName] = useState('');
    const [modalState, setModalState] = useState<{ isOpen: boolean; agrupacionId: string | null }>({ isOpen: false, agrupacionId: null });

    const handleAddAgrupacion = () => {
        if (!newAgrupacionName.trim()) return;
        const newAgrupacion: Agrupacion = {
            id: `agrup-${Date.now()}`,
            name: newAgrupacionName.trim(),
            studentIds: [],
        };
        setEditedService(prev => prev ? { ...prev, agrupaciones: [...(prev.agrupaciones || []), newAgrupacion] } : null);
        setNewAgrupacionName('');
    };

    const handleUpdateAgrupacion = (id: string, updates: Partial<Agrupacion>) => {
        setEditedService(prev => {
            if (!prev) return null;
            const updatedAgrupaciones = (prev.agrupaciones || []).map(a => a.id === id ? { ...a, ...updates } : a);
            return { ...prev, agrupaciones: updatedAgrupaciones };
        });
    };

    const handleDeleteAgrupacion = (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta elaboración y sus asignaciones?')) {
            setEditedService(prev => prev ? { ...prev, agrupaciones: (prev.agrupaciones || []).filter(a => a.id !== id) } : null);
        }
    };

    const openModal = (agrupacionId: string) => setModalState({ isOpen: true, agrupacionId });
    const closeModal = () => setModalState({ isOpen: false, agrupacionId: null });

    const handleSaveModal = (studentIds: string[]) => {
        if (modalState.agrupacionId) {
            handleUpdateAgrupacion(modalState.agrupacionId, { studentIds });
        }
        closeModal();
    };
    
    const editingAgrupacion = editedService.agrupaciones?.find(a => a.id === modalState.agrupacionId);

    const assignedStudentIdsInService = useMemo(() => {
        if (!editedService.agrupaciones || !modalState.agrupacionId) {
            return new Set<string>();
        }
        const otherAgrupaciones = editedService.agrupaciones.filter(a => a.id !== modalState.agrupacionId);
        return new Set<string>(otherAgrupaciones.flatMap(a => a.studentIds));
    }, [editedService.agrupaciones, modalState.agrupacionId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Elaboraciones y Agrupaciones</h3>
            
            {!isLocked && (
                <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg border">
                    <input
                        type="text"
                        value={newAgrupacionName}
                        onChange={e => setNewAgrupacionName(e.target.value)}
                        placeholder="Nombre de la nueva elaboración (ej. Entrante frío)"
                        className="flex-grow p-2 border rounded-md"
                    />
                    <button onClick={handleAddAgrupacion} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Añadir
                    </button>
                </div>
            )}
            
            <div className="space-y-4">
                {(editedService.agrupaciones || []).map((agrupacion, index) => {
                    const assignedStudents = students.filter(s => agrupacion.studentIds.includes(s.id));
                    return (
                        <div key={agrupacion.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center">
                                    <span className="font-bold text-gray-500 mr-2">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={agrupacion.name}
                                        onChange={e => handleUpdateAgrupacion(agrupacion.id, { name: e.target.value })}
                                        disabled={isLocked}
                                        className="text-lg font-bold bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-md p-1 -ml-1 disabled:bg-gray-100"
                                    />
                                </div>
                                {!isLocked && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openModal(agrupacion.id)} className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200">
                                            <UsersIcon className="w-4 h-4 mr-1" /> Asignar Alumnos ({agrupacion.studentIds.length})
                                        </button>
                                        <button onClick={() => handleDeleteAgrupacion(agrupacion.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {assignedStudents.length > 0 
                                    ? assignedStudents.map(s => (
                                        <div key={s.id} className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-sm" title={`${s.nombre} ${s.apellido1}`}>
                                            <img src={s.fotoUrl} alt="" className="w-6 h-6 rounded-full object-cover mr-2" />
                                            <span>{s.apellido1} {s.nombre.charAt(0)}.</span>
                                        </div>
                                      ))
                                    : <p className="text-sm text-gray-500 italic">No hay alumnos asignados a esta elaboración.</p>
                                }
                            </div>
                        </div>
                    );
                })}
                {(editedService.agrupaciones || []).length === 0 && (
                    <p className="text-center text-gray-500 py-6">No hay elaboraciones. Añade una para empezar a asignar alumnos.</p>
                )}
            </div>
            
            {modalState.isOpen && editingAgrupacion && (
                <AsignarAlumnosModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    onSave={handleSaveModal}
                    allStudents={students}
                    initialStudentIds={editingAgrupacion.studentIds}
                    alreadyAssignedIds={assignedStudentIdsInService}
                />
            )}
        </div>
    );
};

interface GestionPracticaViewProps {
    initialServiceId: string | null;
    initialServiceTab: 'planning' | 'evaluation' | null;
    clearInitialServiceContext: () => void;
}


const GestionPracticaView: React.FC<GestionPracticaViewProps> = ({ 
    initialServiceId, initialServiceTab, clearInitialServiceContext 
}) => {
    const {
        students, practiceGroups, services, serviceEvaluations, serviceRoles, 
        entryExitRecords, handleCreateService: contextCreateService, 
        handleSaveServiceAndEvaluation, handleDeleteService,
        teacherData, instituteData, addToast
    } = useAppContext();

    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(initialServiceId);
    const [editedService, setEditedService] = useState<Service | null>(null);
    const [editedEvaluation, setEditedEvaluation] = useState<ServiceEvaluation | null>(null);
    const [mainTab, setMainTab] = useState<'planning' | 'evaluation'>('planning');
    const [planningSubTab, setPlanningSubTab] = useState('distribucion');
    const [agrupacionPlanningSubTab, setAgrupacionPlanningSubTab] = useState('elaboraciones');
    const [newElaboration, setNewElaboration] = useState({
        comedor: { name: '', responsibleGroupId: '' },
        takeaway: { name: '', responsibleGroupId: '' }
    });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [collapsedTrimesters, setCollapsedTrimesters] = useState<Set<string>>(new Set());


    useEffect(() => {
        if (initialServiceId) {
            setSelectedServiceId(initialServiceId);
            if (initialServiceTab) setMainTab(initialServiceTab);
            clearInitialServiceContext();
        }
    }, [initialServiceId, initialServiceTab, clearInitialServiceContext]);

    useEffect(() => {
        if (selectedServiceId) {
            const service = services.find(s => s.id === selectedServiceId);
            const evaluation = serviceEvaluations.find(e => e.serviceId === selectedServiceId);
            setEditedService(service ? JSON.parse(JSON.stringify(service)) : null);
            setEditedEvaluation(evaluation ? JSON.parse(JSON.stringify(evaluation)) : null);
            if (!initialServiceId) setMainTab('planning');
            setPlanningSubTab('distribucion');
            setAgrupacionPlanningSubTab('elaboraciones');
        } else {
            setEditedService(null);
            setEditedEvaluation(null);
        }
    }, [selectedServiceId, services, serviceEvaluations, initialServiceId]);
    
    const handleCreateService = (trimester: 't1' | 't2' | 't3', type: 'normal' | 'agrupacion') => {
        const newServiceId = contextCreateService(trimester, type);
        setSelectedServiceId(newServiceId);
        setMainTab('planning');
    };

    const handleDelete = () => {
        if (editedService) {
           if (window.confirm(`¿Estás seguro de que quieres eliminar "${editedService.name}"?`)) {
                handleDeleteService(editedService.id);
                setSelectedServiceId(null);
           }
        }
    };
    
    const handleSave = () => {
        if (editedService && editedEvaluation) {
            handleSaveServiceAndEvaluation(editedService, editedEvaluation);
        }
    };
    
    const handleToggleLock = () => {
        if (editedService && editedEvaluation) {
            const action = editedService.isLocked ? 'abrir' : 'cerrar';
            const confirmationMessage = action === 'cerrar'
                ? '¿Estás seguro de que quieres cerrar este servicio? Una vez cerrado, no podrás realizar cambios hasta que lo vuelvas a abrir.'
                : '¿Estás seguro de que quieres abrir este servicio? Podrás volver a editar la planificación y las evaluaciones.';
            
            if (window.confirm(confirmationMessage)) {
                const toggledService = { ...editedService, isLocked: !editedService.isLocked };
                setEditedService(toggledService);
                handleSaveServiceAndEvaluation(toggledService, editedEvaluation);
            }
        }
    };
    
    const handleServiceFieldChange = (field: keyof Service, value: any) => {
        setEditedService(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    const toggleGroupAssignment = (area: 'comedor' | 'takeaway', groupId: string) => {
        if (!editedService || editedService.isLocked) return;
        const currentAssignments = editedService.assignedGroups[area];
        const newAssignments = currentAssignments.includes(groupId)
            ? currentAssignments.filter(id => id !== groupId)
            : [...currentAssignments, groupId];
        setEditedService({ ...editedService, assignedGroups: { ...editedService.assignedGroups, [area]: newAssignments } });
    };
    
    const handleAddElaboration = (area: 'comedor' | 'takeaway') => {
        if (editedService?.isLocked) return;
        const { name, responsibleGroupId } = newElaboration[area];
        if (!name.trim() || !responsibleGroupId) {
            alert('Introduce un nombre para el plato y selecciona un grupo responsable.');
            return;
        }
        const newElab: Elaboration = { id: `elab-${Date.now()}`, name, responsibleGroupId };
        if (editedService) {
            const updatedElaborations = { ...editedService.elaborations, [area]: [...editedService.elaborations[area], newElab] };
            setEditedService({ ...editedService, elaborations: updatedElaborations });
            setNewElaboration(prev => ({ ...prev, [area]: { name: '', responsibleGroupId: '' } }));
        }
    };

    const handleUpdateElaboration = (area: 'comedor' | 'takeaway', id: string, field: keyof Elaboration, value: string) => {
        if (editedService && !editedService.isLocked) {
            const updatedElaborations = { ...editedService.elaborations, [area]: editedService.elaborations[area].map(e => e.id === id ? { ...e, [field]: value } : e) };
            setEditedService({ ...editedService, elaborations: updatedElaborations });
        }
    };

    const handleDeleteElaboration = (area: 'comedor' | 'takeaway', id: string) => {
        if (editedService && !editedService.isLocked) {
            const updatedElaborations = { ...editedService.elaborations, [area]: editedService.elaborations[area].filter(e => e.id !== id) };
            setEditedService({ ...editedService, elaborations: updatedElaborations });
        }
    };

    const groupedStudentsInService = useMemo(() => {
        if (!editedService) return [];
        const assignedGroupIds = [...editedService.assignedGroups.comedor, ...editedService.assignedGroups.takeaway];
        const assignedGroups = practiceGroups.filter(g => assignedGroupIds.includes(g.id)).sort((a, b) => b.name.localeCompare(a.name));
        return assignedGroups.map(group => ({
            group,
            students: students.filter(s => group.studentIds.includes(s.id)).sort((a, b) => a.apellido1.localeCompare(b.apellido1) || a.nombre.localeCompare(b.nombre))
        }));
    }, [editedService, practiceGroups, students]);
    
    const handleStudentRoleChange = (studentId: string, roleId: string | null) => {
        if (!editedService || editedService.isLocked) return;
        const existingAssignmentIndex = editedService.studentRoles.findIndex(sr => sr.studentId === studentId);
        const newStudentRoles = [...editedService.studentRoles];
        if (roleId === null || roleId === '') {
            if (existingAssignmentIndex > -1) newStudentRoles.splice(existingAssignmentIndex, 1);
        } else {
             if (existingAssignmentIndex > -1) newStudentRoles[existingAssignmentIndex] = { studentId, roleId };
             else newStudentRoles.push({ studentId, roleId });
        }
        handleServiceFieldChange('studentRoles', newStudentRoles);
    };

    const groupedServices = useMemo(() => {
        const groups: { t1: Service[], t2: Service[], t3: Service[] } = { t1: [], t2: [], t3: [] };
        services.forEach(s => {
            if (s.trimester && groups[s.trimester]) {
                groups[s.trimester].push(s);
            }
        });
        // Sort services within each group by date, descending
        const sortByDateDesc = (a: Service, b: Service) => new Date(b.date).getTime() - new Date(a.date).getTime();
        groups.t1.sort(sortByDateDesc);
        groups.t2.sort(sortByDateDesc);
        groups.t3.sort(sortByDateDesc);
        return groups;
    }, [services]);

    const toggleTrimesterCollapse = (trimester: string) => {
        setCollapsedTrimesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trimester)) {
                newSet.delete(trimester);
            } else {
                newSet.add(trimester);
            }
            return newSet;
        });
    };


    if (practiceGroups.length === 0 && students.length > 0) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-700">Primero define los grupos de práctica</h2>
                <p className="text-gray-500 mt-2">No puedes gestionar servicios sin haber creado grupos de alumnos primero.</p>
            </div>
        );
    }
    
    const renderWorkspace = () => {
        if (!editedService || !editedEvaluation) {
             return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <ChefHatIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Selecciona un servicio o crea uno nuevo</h2>
                        <p className="mt-1 text-gray-500">Aquí podrás planificar, asignar puestos y evaluar.</p>
                    </div>
                </div>
            );
        }

        const isLocked = editedService.isLocked;
        const principalRoles = serviceRoles.filter(role => role.type === 'leader');

        return (
            <div>
                 <header className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4">
                         <button onClick={handleToggleLock} title={isLocked ? "Abrir servicio" : "Cerrar servicio"}>
                            {isLocked ? <LockClosedIcon className="w-8 h-8 text-red-500 hover:text-red-700" /> : <LockOpenIcon className="w-8 h-8 text-green-500 hover:text-green-700"/>}
                        </button>
                        <div>
                            <input type="text" value={editedService.name} onChange={(e) => handleServiceFieldChange('name', e.target.value)} disabled={isLocked} className="text-3xl font-bold text-gray-800 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-md p-1 -ml-1 disabled:bg-gray-100"/>
                            <input type="date" value={editedService.date} onChange={(e) => handleServiceFieldChange('date', e.target.value)} disabled={isLocked} className="text-gray-500 mt-1 block bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-md disabled:bg-gray-100"/>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                         <button onClick={() => setIsReportModalOpen(true)} className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition">
                            <FileTextIcon className="w-5 h-5 mr-1" /> Generar Informes
                        </button>
                        {!isLocked && <button onClick={handleSave} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"><SaveIcon className="w-5 h-5 mr-1" /> Guardar</button>}
                        {!isLocked && <button onClick={handleDelete} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"><TrashIcon className="w-5 h-5" /></button>}
                    </div>
                </header>

                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
                    <h4 className="text-md font-bold text-gray-700 mb-3">Puestos Principales del Servicio</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                        {principalRoles.map(role => {
                            const assignment = editedService.studentRoles.find(sr => sr.roleId === role.id);
                            const student = assignment ? students.find(s => s.id === assignment.studentId) : null;
                            return (
                                <div key={role.id} className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-500">{role.name}</span>
                                    <span className="text-md font-medium text-gray-800 truncate" title={student ? `${student.nombre} ${student.apellido1}` : 'Sin asignar'}>
                                        {student ? `${student.nombre} ${student.apellido1} ${student.apellido2}` : <span className="italic text-gray-400">Sin asignar</span>}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                {isLocked && (
                    <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
                        <p className="font-bold">Este servicio está cerrado y no puede ser modificado.</p>
                        <p className="text-sm">Toda la información es de solo lectura.</p>
                    </div>
                )}


                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-2">
                         <button onClick={() => setMainTab('planning')} className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${mainTab === 'planning' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Planificación</button>
                         <button onClick={() => setMainTab('evaluation')} className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${mainTab === 'evaluation' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>Evaluación</button>
                    </nav>
                </div>

                {mainTab === 'planning' && (
                    editedService.type === 'agrupacion' ? (
                        <div>
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-2">
                                    <button onClick={() => setAgrupacionPlanningSubTab('elaboraciones')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${agrupacionPlanningSubTab === 'elaboraciones' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Elaboraciones y Grupos</button>
                                    <button onClick={() => setAgrupacionPlanningSubTab('puestos')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${agrupacionPlanningSubTab === 'puestos' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Asignar Puestos</button>
                                </nav>
                            </div>
                            {agrupacionPlanningSubTab === 'elaboraciones' ? (
                                <PlanificacionAgrupaciones 
                                    editedService={editedService}
                                    setEditedService={setEditedService}
                                    isLocked={isLocked}
                                    students={students}
                                />
                            ) : (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-xl font-bold mb-4 text-gray-700">Asignación de Puestos por Elaboración</h3>
                                    <div className="space-y-6">
                                        {(editedService.agrupaciones || []).map((agrupacion, index) => {
                                            const studentsInAgrupacion = students
                                                .filter(s => agrupacion.studentIds.includes(s.id))
                                                .sort((a, b) => a.apellido1.localeCompare(b.apellido1));

                                            return (
                                                <div key={agrupacion.id} className="border rounded-lg overflow-hidden">
                                                    <h4 className="px-4 py-2 bg-gray-50 font-bold text-gray-700 border-b">
                                                        {index + 1}. {agrupacion.name}
                                                    </h4>
                                                    {studentsInAgrupacion.length > 0 ? (
                                                        <table className="min-w-full text-sm">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Alumno</th>
                                                                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Puesto</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {studentsInAgrupacion.map(student => (
                                                                    <tr key={student.id} className="border-t hover:bg-gray-50">
                                                                        <td className="px-4 py-2 font-medium text-gray-800">{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td>
                                                                        <td className="px-4 py-2">
                                                                            <select
                                                                                value={editedService.studentRoles.find(sr => sr.studentId === student.id)?.roleId || ''}
                                                                                onChange={e => handleStudentRoleChange(student.id, e.target.value || null)}
                                                                                disabled={isLocked}
                                                                                className="w-full p-1.5 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"
                                                                            >
                                                                                <option value="">Sin asignar</option>
                                                                                {serviceRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                                            </select>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 px-4 py-3">No hay alumnos asignados a esta elaboración.</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                    <div>
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="flex space-x-2">
                                <button onClick={() => setPlanningSubTab('distribucion')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${planningSubTab === 'distribucion' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Distribución y Platos</button>
                                <button onClick={() => setPlanningSubTab('puestos')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${planningSubTab === 'puestos' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>Asignar Puestos</button>
                            </nav>
                        </div>
                        {planningSubTab === 'distribucion' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {(['comedor', 'takeaway'] as const).map(area => {
                                    const areaColor = area === 'comedor' ? 'green' : 'blue';
                                    const assignedGroupIds = editedService.assignedGroups[area];
                                    const availableGroupsForElaboration = practiceGroups.filter(g => assignedGroupIds.includes(g.id));
                                
                                    return (
                                    <div key={area} className={`bg-white p-4 rounded-lg shadow-sm border-t-4 border-${areaColor}-500`}>
                                        <h3 className={`text-xl font-bold mb-3 capitalize text-${areaColor}-600`}>Grupos en {area}</h3>
                                        <div className="space-y-2">{practiceGroups.map(group => (<label key={group.id} className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer"><input type="checkbox" checked={assignedGroupIds.includes(group.id)} onChange={() => toggleGroupAssignment(area, group.id)} disabled={isLocked} className={`h-4 w-4 rounded border-gray-300 text-${areaColor}-600 focus:ring-${areaColor}-500`}/> <span className="ml-3 text-sm font-medium text-gray-800">{group.name}</span></label>))}</div>
                                        <div className="mt-6 border-t pt-4">
                                            <h4 className={`text-lg font-bold mb-3 text-${areaColor}-600`}>Elaboraciones para {area}</h4>
                                            <div className="space-y-3 mb-4">{editedService.elaborations[area].map((elab, index) => (<div key={elab.id} className="flex items-center gap-2 text-sm"><span className="font-semibold text-gray-500">{index + 1}.</span><input type="text" value={elab.name} onChange={e => handleUpdateElaboration(area, elab.id, 'name', e.target.value)} disabled={isLocked} className="flex-grow p-1.5 border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/><select value={elab.responsibleGroupId || ''} onChange={e => handleUpdateElaboration(area, elab.id, 'responsibleGroupId', e.target.value)} disabled={isLocked} className="p-1.5 border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"><option value="">Asignar...</option>{availableGroupsForElaboration.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select><button onClick={() => handleDeleteElaboration(area, elab.id)} disabled={isLocked} className="p-1 text-gray-400 hover:text-red-500 disabled:cursor-not-allowed"><TrashIcon className="w-4 h-4" /></button></div>))}</div>
                                            {!isLocked && (availableGroupsForElaboration.length > 0 ? (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"><input type="text" placeholder="Nombre del nuevo plato" value={newElaboration[area].name} onChange={e => setNewElaboration(p => ({...p, [area]: {...p[area], name: e.target.value}}))} className="flex-grow p-1.5 border-gray-300 rounded-md shadow-sm"/><select value={newElaboration[area].responsibleGroupId} onChange={e => setNewElaboration(p => ({...p, [area]: {...p[area], responsibleGroupId: e.target.value}}))} className="p-1.5 border-gray-300 rounded-md shadow-sm"><option value="">Seleccionar grupo...</option>{availableGroupsForElaboration.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select><button onClick={() => handleAddElaboration(area)} className={`bg-${areaColor}-500 text-white px-3 py-1.5 rounded-md font-semibold hover:bg-${areaColor}-600`}>Añadir</button></div>) : (<p className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded-md">Asigna al menos un grupo a esta área para poder añadir elaboraciones.</p>))}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        )}
                        {planningSubTab === 'puestos' && (
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-bold mb-3 text-gray-700">Puestos de Alumnos en Servicio</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left font-semibold text-gray-600">Alumno</th><th className="px-4 py-2 text-left font-semibold text-gray-600">Puesto</th></tr></thead>
                                        <tbody>
                                            {groupedStudentsInService.map(({ group, students: studentsInGroup }) => (
                                                <React.Fragment key={group.id}>
                                                    <tr><td colSpan={2} className={`px-4 py-2 font-bold text-gray-800 border-b-2 ${group.color.split(' ')[0]} ${group.color.split(' ')[1]}`}>{group.name}</td></tr>
                                                    {studentsInGroup.map(student => (<tr key={student.id} className={`border-b hover:bg-gray-50 border-l-4 ${group.color.split(' ')[1]}`}><td className="px-4 py-2 font-medium text-gray-800">{`${student.apellido1} ${student.apellido2}, ${student.nombre}`}</td><td className="px-4 py-2"><select value={editedService.studentRoles.find(sr => sr.studentId === student.id)?.roleId || ''} onChange={e => handleStudentRoleChange(student.id, e.target.value || null)} disabled={isLocked} className="w-full p-1.5 border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100"><option value="">Sin asignar</option>{serviceRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></td></tr>))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                    )
                )}
                 {mainTab === 'evaluation' && (
                    <Suspense fallback={<div className="text-center p-8">Cargando módulo de evaluación...</div>}>
                        <ServiceEvaluationView 
                           service={editedService}
                           evaluation={editedEvaluation}
                           onEvaluationChange={setEditedEvaluation}
                           students={students}
                           practiceGroups={practiceGroups}
                           entryExitRecords={entryExitRecords}
                           isLocked={isLocked}
                        />
                    </Suspense>
                )}
            </div>
        );
    };

    const TrimesterSection: React.FC<{ trimester: 't1' | 't2' | 't3', title: string }> = ({ trimester, title }) => {
        const isCollapsed = collapsedTrimesters.has(trimester);
        const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => toggleTrimesterCollapse(trimester)} className="flex items-center text-lg font-bold text-gray-800 w-full">
                         {isCollapsed ? <ChevronRightIcon className="w-5 h-5 mr-1" /> : <ChevronDownIcon className="w-5 h-5 mr-1" />}
                        {title}
                    </button>
                    <div className="relative">
                        <button onMouseEnter={() => setIsAddMenuOpen(true)} onClick={() => setIsAddMenuOpen(prev => !prev)} className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-transform transform hover:scale-110">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                        {isAddMenuOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border"
                                onMouseLeave={() => setIsAddMenuOpen(false)}
                            >
                                <a href="#" onClick={(e) => { e.preventDefault(); handleCreateService(trimester, 'normal'); setIsAddMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <div className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-3"></span>
                                        <div>
                                            <span className="font-semibold">Servicio Normal</span>
                                            <span className="block text-xs text-gray-500">Basado en grupos de prácticas.</span>
                                        </div>
                                    </div>
                                </a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleCreateService(trimester, 'agrupacion'); setIsAddMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                     <div className="flex items-center">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
                                        <div>
                                            <span className="font-semibold">Servicio de Agrupaciones</span>
                                            <span className="block text-xs text-gray-500">Grupos pequeños por elaboración.</span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                {!isCollapsed && (
                    <ul className="space-y-2 pl-2">
                        {groupedServices[trimester].map(service => {
                            const isAgrupacion = service.type === 'agrupacion';
                            const isSelected = selectedServiceId === service.id;
                            const colorClasses = isSelected
                                ? (isAgrupacion ? 'bg-purple-50 border-purple-500' : 'bg-blue-50 border-blue-500')
                                : (isAgrupacion ? 'border-purple-300 hover:bg-purple-50' : 'border-blue-300 hover:bg-blue-50');

                            return (
                                <li key={service.id}>
                                    <a 
                                        href="#" 
                                        onClick={(e) => { e.preventDefault(); setSelectedServiceId(service.id); setMainTab('planning'); }} 
                                        className={`block p-3 rounded-lg transition-colors border-l-4 ${colorClasses}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className={`font-semibold ${isSelected ? (isAgrupacion ? 'text-purple-800' : 'text-blue-800') : 'text-gray-800'}`}>{service.name}</p> 
                                            {service.isLocked && <LockClosedIcon className="w-4 h-4 text-gray-500" />}
                                        </div>
                                        <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString('es-ES')}</p>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-64px)]">
            <aside className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 bg-white p-4 border-r overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Servicios</h2>
                <div className="space-y-4">
                    <TrimesterSection trimester="t1" title="1º Trimestre" />
                    <TrimesterSection trimester="t2" title="2º Trimestre" />
                    <TrimesterSection trimester="t3" title="3º Trimestre" />
                </div>
            </aside>
            <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
                {renderWorkspace()}
            </main>
             {isReportModalOpen && editedService && editedEvaluation && (
                <Suspense fallback={<div />}>
                    <ReportsCenterModal
                        service={editedService}
                        evaluation={editedEvaluation}
                        onClose={() => setIsReportModalOpen(false)}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default GestionPracticaView;
