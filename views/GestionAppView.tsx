import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ServiceRole, TrimesterDates } from '../types';
import { SettingsIcon, SaveIcon, PlusIcon, TrashIcon, UploadIcon, ExportIcon, XIcon, CalendarDaysIcon, AlertTriangleIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';

const DataCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">{children}</div>
);

const RoleModal: React.FC<{
    role: ServiceRole | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: ServiceRole) => void;
}> = ({ role, isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#cccccc');

    React.useEffect(() => {
        if (role) {
            setName(role.name);
            setColor(role.color);
        }
    }, [role]);

    if (!isOpen || !role) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...role, name, color });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{role.id.startsWith('new-') ? 'Añadir Nuevo Rol' : 'Editar Rol'}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">Nombre del Rol</label>
                        <input type="text" id="roleName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="roleColor" className="block text-sm font-medium text-gray-700">Color</label>
                        <input type="color" id="roleColor" value={color} onChange={e => setColor(e.target.value)} className="mt-1 block w-full h-10" />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RestoreModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    availableKeys: string[];
    selectedKeys: Set<string>;
    onKeyToggle: (key: string) => void;
    onSelectAll: (selectAll: boolean) => void;
}> = ({ isOpen, onClose, onConfirm, availableKeys, selectedKeys, onKeyToggle, onSelectAll }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Restauración Selectiva</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon className="w-6 h-6 text-gray-600" /></button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">Selecciona los módulos de datos que deseas restaurar. Los módulos no seleccionados conservarán sus datos actuales.</p>
                
                <div className="flex justify-end space-x-3 mb-3">
                    <button onClick={() => onSelectAll(true)} className="text-xs font-semibold text-blue-600 hover:underline">Seleccionar todo</button>
                    <button onClick={() => onSelectAll(false)} className="text-xs font-semibold text-blue-600 hover:underline">Deseleccionar todo</button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 border-t border-b py-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableKeys.map(key => (
                            <label key={key} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedKeys.has(key)}
                                    onChange={() => onKeyToggle(key)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-800">{key}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold flex items-center">
                        <UploadIcon className="w-5 h-5 mr-2" />
                        Confirmar Restauración
                    </button>
                </div>
            </div>
        </div>
    );
};


const GestionAppView: React.FC = () => {
    const { 
        teacherData, setTeacherData, instituteData, setInstituteData, 
        serviceRoles, setServiceRoles, onDeleteRole, addToast,
        trimesterDates, setTrimesterDates, handleResetApp
    } = useAppContext();
    
    const [currentTeacherData, setCurrentTeacherData] = useState(teacherData);
    const [currentInstituteData, setCurrentInstituteData] = useState(instituteData);
    const [currentTrimesterDates, setCurrentTrimesterDates] = useState(trimesterDates);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<ServiceRole | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [backupData, setBackupData] = useState<Record<string, any> | null>(null);
    const [restoreKeys, setRestoreKeys] = useState<Set<string>>(new Set());
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');

    
    const backupOptions = [
        'students', 'practiceGroups', 'services', 'serviceEvaluations', 'serviceRoles', 'entryExitRecords', 
        'academicGrades', 'courseGrades', 'practicalExamEvaluations', 'optativoExams', 'optativoGrades',
        'resultadosAprendizaje', 'criteriosEvaluacion', 'instrumentosEvaluacion', 'profesores', 'unidadesTrabajo',
        'teacher-app-data', 'institute-app-data', 'trimester-dates'
    ];

    const backupOptionLabels: Record<string, string> = {
        'students': 'Alumnos',
        'practiceGroups': 'Grupos de Práctica',
        'services': 'Servicios',
        'serviceEvaluations': 'Evaluaciones de Servicio',
        'serviceRoles': 'Roles de Servicio',
        'entryExitRecords': 'Salidas/Entradas',
        'academicGrades': 'Notas Académicas',
        'courseGrades': 'Notas Otros Módulos',
        'practicalExamEvaluations': 'Exámenes Prácticos',
        'optativoExams': 'Exámenes Optativo',
        'optativoGrades': 'Notas Optativo',
        'resultadosAprendizaje': 'Resultados Aprendizaje',
        'criteriosEvaluacion': 'Criterios Evaluación',
        'instrumentosEvaluacion': 'Instrumentos',
        'profesores': 'Profesores',
        'unidadesTrabajo': 'Unidades de Trabajo',
        'teacher-app-data': 'Datos del Profesor',
        'institute-app-data': 'Datos del Instituto',
        'trimester-dates': 'Fechas Trimestres'
    };
    
    const [backupKeys, setBackupKeys] = useState<string[]>(backupOptions);
    
    useEffect(() => {
        setCurrentTrimesterDates(trimesterDates);
    }, [trimesterDates]);

    const handleLogoChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setter((prev: any) => ({ ...prev, [field]: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleOpenRoleModal = (role: ServiceRole | null, type?: 'leader' | 'secondary') => {
        if (role) {
            setEditingRole(role);
        } else if(type) {
            setEditingRole({
                id: `new-role-${Date.now()}`,
                name: 'Nuevo Rol',
                color: '#808080',
                type,
            });
        }
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = (role: ServiceRole) => {
        if (role.id.startsWith('new-')) {
             setServiceRoles(prev => [...prev, role]);
        } else {
             setServiceRoles(prev => prev.map(r => r.id === role.id ? role : r));
        }
        addToast('Rol guardado.', 'success');
    };
    
    const handleDeleteRoleInternal = (roleId: string, roleName: string) => {
        if(window.confirm(`¿Estás seguro que quieres eliminar el rol "${roleName}"? Esta acción no se puede deshacer.`)) {
            onDeleteRole(roleId);
        }
    }
    
    const handleTrimesterDateChange = (trimester: 't1' | 't2', field: 'start' | 'end', value: string) => {
        setCurrentTrimesterDates(prev => ({
            ...prev,
            [trimester]: { ...prev[trimester], [field]: value }
        }));
    };

    const leaderRoles = useMemo(() => serviceRoles.filter(r => r.type === 'leader'), [serviceRoles]);
    const secondaryRoles = useMemo(() => serviceRoles.filter(r => r.type === 'secondary'), [serviceRoles]);

    const handleBackup = () => {
        if (backupKeys.length === 0) {
            addToast('Por favor, selecciona al menos un módulo de datos para respaldar.', 'error');
            return;
        }
        const backupData: Record<string, any> = {};
        backupKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                backupData[key] = JSON.parse(data);
            }
        });

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `backup-culinary-app-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('Copia de seguridad descargada.', 'success');
    };
    
    const restoreFileInputRef = useRef<HTMLInputElement>(null);

    const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                const dataKeys = Object.keys(data);
                
                if (dataKeys.length === 0) {
                    addToast('El archivo de copia de seguridad está vacío o no es válido.', 'error');
                    return;
                }

                setBackupData(data);
                setRestoreKeys(new Set(dataKeys));
                setIsRestoreModalOpen(true);
            } catch (error) {
                addToast('Error al leer el archivo de copia de seguridad. Asegúrate de que es un archivo .json válido.', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    };

    const executeRestore = () => {
        if (!backupData || restoreKeys.size === 0) {
            addToast('No hay datos o módulos seleccionados para restaurar.', 'info');
            return;
        }

        if (window.confirm(`¡Atención! Esto sobrescribirá los ${restoreKeys.size} módulos de datos seleccionados. Los datos no seleccionados no se verán afectados. ¿Deseas continuar?`)) {
            try {
                restoreKeys.forEach(key => {
                    if (backupData.hasOwnProperty(key)) {
                        localStorage.setItem(key, JSON.stringify(backupData[key]));
                    }
                });
                addToast('Restauración selectiva completada. La aplicación se recargará.', 'success');
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                addToast('Ocurrió un error durante la restauración.', 'error');
                console.error(error);
            } finally {
                setIsRestoreModalOpen(false);
                setBackupData(null);
                setRestoreKeys(new Set());
            }
        }
    };

    const toggleBackupKey = (key: string) => {
        setBackupKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    }
    
    const handleToggleRestoreKey = (key: string) => {
        setRestoreKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleSelectAllRestoreKeys = (selectAll: boolean) => {
        if (selectAll && backupData) {
            setRestoreKeys(new Set(Object.keys(backupData)));
        } else {
            setRestoreKeys(new Set());
        }
    };

    const openResetModal = () => {
        setResetConfirmText('');
        setIsResetModalOpen(true);
    };

    const closeResetModal = () => {
        setIsResetModalOpen(false);
    };

    const confirmReset = () => {
        if (resetConfirmText === 'BORRAR DATOS') {
            handleResetApp();
            closeResetModal();
        }
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <SettingsIcon className="w-8 h-8 mr-3 text-blue-500" />
                    Gestión de la App
                </h1>
                <p className="text-gray-500 mt-1">Personaliza la información, gestiona roles y realiza copias de seguridad.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <DataCard title="Datos del Profesor">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Datos del Profesor</h3>
                        <div className="flex items-center space-x-4 mb-4">
                             <img src={currentTeacherData.logo || 'https://via.placeholder.com/80'} alt="Logo Profesor" className="w-20 h-20 rounded-full object-cover bg-gray-200" />
                            <input type="file" accept="image/*" onChange={handleLogoChange(setCurrentTeacherData, 'logo')} className="text-sm" />
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre y Apellidos" value={currentTeacherData.name} onChange={e => setCurrentTeacherData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded" />
                            <input type="email" placeholder="Email" value={currentTeacherData.email} onChange={e => setCurrentTeacherData(p => ({...p, email: e.target.value}))} className="w-full p-2 border rounded" />
                            <button onClick={() => { setTeacherData(currentTeacherData); addToast('Datos del profesor guardados.', 'success'); }} className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"><SaveIcon className="w-5 h-5 mr-2" />Guardar Datos</button>
                        </div>
                    </DataCard>

                    <DataCard title="Datos del Instituto">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Datos del Instituto</h3>
                        <div className="flex items-center space-x-4 mb-4">
                             <img src={currentInstituteData.logo || 'https://via.placeholder.com/80'} alt="Logo Instituto" className="w-20 h-20 rounded-md object-cover bg-gray-200" />
                            <input type="file" accept="image/*" onChange={handleLogoChange(setCurrentInstituteData, 'logo')} className="text-sm" />
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Nombre del Centro" value={currentInstituteData.name} onChange={e => setCurrentInstituteData(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded" />
                            <input type="text" placeholder="Dirección" value={currentInstituteData.address} onChange={e => setCurrentInstituteData(p => ({...p, address: e.target.value}))} className="w-full p-2 border rounded" />
                            <input type="text" placeholder="CIF" value={currentInstituteData.cif} onChange={e => setCurrentInstituteData(p => ({...p, cif: e.target.value}))} className="w-full p-2 border rounded" />
                            <button onClick={() => { setInstituteData(currentInstituteData); addToast('Datos del instituto guardados.', 'success'); }} className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"><SaveIcon className="w-5 h-5 mr-2" />Guardar Datos</button>
                        </div>
                    </DataCard>

                    <DataCard title="Fechas de los Trimestres">
                        <div className="flex items-center mb-4">
                            <CalendarDaysIcon className="w-6 h-6 mr-3 text-blue-500"/>
                            <h3 className="text-xl font-bold text-gray-800">Fechas de los Trimestres</h3>
                        </div>
                        <div className="space-y-4">
                            {(['t1', 't2'] as const).map((trimestre, index) => (
                                <div key={trimestre}>
                                    <h4 className="font-semibold text-gray-700 mb-2">{index + 1}º Trimestre</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-500">Fecha de Inicio</label>
                                            <input type="date" value={currentTrimesterDates[trimestre].start} onChange={e => handleTrimesterDateChange(trimestre, 'start', e.target.value)} className="w-full p-2 border rounded mt-1"/>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Fecha de Fin</label>
                                            <input type="date" value={currentTrimesterDates[trimestre].end} onChange={e => handleTrimesterDateChange(trimestre, 'end', e.target.value)} className="w-full p-2 border rounded mt-1"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button onClick={() => { setTrimesterDates(currentTrimesterDates); addToast('Fechas de los trimestres guardadas.', 'success'); }} className="mt-4 w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"><SaveIcon className="w-5 h-5 mr-2" />Guardar Fechas</button>
                    </DataCard>
                </div>

                <div className="space-y-8">
                    <DataCard title="Roles de Servicio">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">Líderes del Servicio</h4>
                                    <button onClick={() => handleOpenRoleModal(null, 'leader')} className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded hover:bg-blue-200">Añadir</button>
                                </div>
                                <div className="space-y-2">
                                    {leaderRoles.map(role => (
                                        <div key={role.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <div className="flex items-center cursor-pointer" onClick={() => handleOpenRoleModal(role)}>
                                                <div className="w-5 h-5 rounded-sm mr-2" style={{ backgroundColor: role.color }}></div>
                                                <span className="text-sm">{role.name}</span>
                                            </div>
                                            <div>
                                                <button onClick={() => handleDeleteRoleInternal(role.id, role.name)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">Roles Secundarios</h4>
                                    <button onClick={() => handleOpenRoleModal(null, 'secondary')} className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded hover:bg-blue-200">Añadir</button>
                                </div>
                                <div className="space-y-2">
                                     {secondaryRoles.map(role => (
                                        <div key={role.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                            <div className="flex items-center cursor-pointer" onClick={() => handleOpenRoleModal(role)}>
                                                <div className="w-5 h-5 rounded-sm mr-2" style={{ backgroundColor: role.color }}></div>
                                                <span className="text-sm">{role.name}</span>
                                            </div>
                                            <div>
                                                <button onClick={() => handleDeleteRoleInternal(role.id, role.name)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DataCard>

                    <DataCard title="Backup y Restauración">
                         <h3 className="text-xl font-bold text-gray-800 mb-4">Backup y Restauración</h3>
                         <div className="space-y-6">
                            <div>
                                <h4 className="font-bold mb-2">Crear Copia de Seguridad</h4>
                                <p className="text-sm text-gray-600 mb-3">Selecciona los módulos de datos para incluir en la copia de seguridad.</p>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    {backupOptions.map(key => (
                                        <label key={key} className="flex items-center">
                                            <input type="checkbox" checked={backupKeys.includes(key)} onChange={() => toggleBackupKey(key)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="ml-2">{backupOptionLabels[key] || key}</span>
                                        </label>
                                    ))}
                                </div>
                                <button onClick={handleBackup} className="w-full flex items-center justify-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition"><ExportIcon className="w-5 h-5 mr-2" />Crear y Descargar Copia</button>
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="font-bold mb-2">Restaurar Copia de Seguridad</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md mb-3">Restaura datos desde un archivo de copia de seguridad. Podrás seleccionar qué módulos de datos quieres restaurar.</p>
                                <input type="file" accept=".json" onChange={handleRestoreFileSelect} ref={restoreFileInputRef} className="hidden" />
                                <button onClick={() => restoreFileInputRef.current?.click()} className="w-full flex items-center justify-center bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition"><UploadIcon className="w-5 h-5 mr-2" />Seleccionar Archivo de Backup...</button>
                            </div>
                         </div>
                    </DataCard>
                </div>
            </div>

            <div className="mt-8">
                <DataCard title="Zona de Peligro">
                    <div className="border-2 border-dashed border-red-400 bg-red-50 p-4 rounded-lg">
                        <div className="flex items-start">
                            <AlertTriangleIcon className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"/>
                            <div>
                                <h3 className="text-xl font-bold text-red-800">Resetear Aplicación</h3>
                                <p className="text-red-700 mt-1">Esta acción borrará permanentemente TODOS los datos de la aplicación, incluyendo alumnos, grupos, servicios, evaluaciones y configuraciones. Esta acción es irreversible.</p>
                                <button
                                    onClick={openResetModal}
                                    className="mt-4 flex items-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                                >
                                    <TrashIcon className="w-5 h-5 mr-2"/>
                                    Borrar todos los datos...
                                </button>
                            </div>
                        </div>
                    </div>
                </DataCard>
            </div>

            <RoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} role={editingRole} onSave={handleSaveRole} />
             <RestoreModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onConfirm={executeRestore}
                availableKeys={backupData ? Object.keys(backupData).map((k: string) => backupOptionLabels[k] ?? k) : []}
                selectedKeys={new Set(Array.from(restoreKeys).map((k: string) => backupOptionLabels[k] ?? k))}
                onKeyToggle={(label: string) => {
                    // FIX: Explicitly type `k` to resolve potential type inference issues with indexing.
                    const key = Object.keys(backupOptionLabels).find((k: string) => backupOptionLabels[k] === label) ?? label;
                    handleToggleRestoreKey(key);
                }}
                onSelectAll={handleSelectAllRestoreKeys}
            />

            {isResetModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeResetModal}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <AlertTriangleIcon className="w-8 h-8 text-red-500 mr-3"/>
                            <h3 className="text-xl font-bold text-red-800">¿Estás absolutamente seguro?</h3>
                        </div>
                        <p className="text-gray-700 mb-4">Esta acción no se puede deshacer. Todos los datos serán eliminados permanentemente. Para confirmar, por favor escribe <strong className="text-red-600">BORRAR DATOS</strong> en el campo de abajo.</p>
                        
                        <div className="mb-4">
                            <label htmlFor="confirmReset" className="block text-sm font-medium text-gray-700 mb-1">Confirmación</label>
                            <input
                                id="confirmReset"
                                type="text"
                                value={resetConfirmText}
                                onChange={e => setResetConfirmText(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                placeholder="BORRAR DATOS"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                            <button onClick={closeResetModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                                Cancelar
                            </button>
                            <button
                                onClick={confirmReset}
                                disabled={resetConfirmText !== 'BORRAR DATOS'}
                                className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold flex items-center disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Entiendo las consecuencias, borrar todo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAppView;