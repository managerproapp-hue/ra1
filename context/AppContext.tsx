import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
    Student, PracticeGroup, Service, ServiceEvaluation, ServiceRole, EntryExitRecord, 
    AcademicGrades, CourseGrades, PracticalExamEvaluation, TeacherData, InstituteData, Toast, ToastType, StudentCalculatedGrades, TrimesterDates,
    ResultadoAprendizaje, CriterioEvaluacion, InstrumentoEvaluacion, Profesor, UnidadTrabajo,
    AsociacionCriterio
} from '../types';
import { parseFile } from '../services/csvParser';
import { SERVICE_GRADE_WEIGHTS } from '../data/constants';

import { resultadosAprendizaje as mockRA } from '../data/ra-data';
import { criteriosEvaluacion as mockCriterios } from '../data/criterios-data';
import { instrumentosEvaluacion as mockInstrumentos } from '../data/instrumentos-data';
import { profesores as mockProfesores } from '../data/profesores-data';
import { unidadesTrabajo as mockUTs } from '../data/ut-data';


// --- Custom Hook for Local Storage ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;
      
      // Migration logic for services to add 'type' property
      if (key === 'services' && Array.isArray(parsedItem)) {
          return parsedItem.map((s: any) => ({
              ...s,
              type: s.type || 'normal'
          })) as T;
      }

      return parsedItem;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

const defaultTrimesterDates: TrimesterDates = {
  t1: { start: '2025-09-01', end: '2025-12-22' },
  t2: { start: '2026-01-08', end: '2026-04-11' },
};


// --- App Context Definition ---
interface AppContextType {
    students: Student[];
    setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
    practiceGroups: PracticeGroup[];
    setPracticeGroups: React.Dispatch<React.SetStateAction<PracticeGroup[]>>;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    serviceEvaluations: ServiceEvaluation[];
    setServiceEvaluations: React.Dispatch<React.SetStateAction<ServiceEvaluation[]>>;
    serviceRoles: ServiceRole[];
    setServiceRoles: React.Dispatch<React.SetStateAction<ServiceRole[]>>;
    entryExitRecords: EntryExitRecord[];
    setEntryExitRecords: React.Dispatch<React.SetStateAction<EntryExitRecord[]>>;
    academicGrades: AcademicGrades;
    setAcademicGrades: React.Dispatch<React.SetStateAction<AcademicGrades>>;
    courseGrades: CourseGrades;
    setCourseGrades: React.Dispatch<React.SetStateAction<CourseGrades>>;
    practicalExamEvaluations: PracticalExamEvaluation[];
    setPracticalExamEvaluations: React.Dispatch<React.SetStateAction<PracticalExamEvaluation[]>>;
    teacherData: TeacherData;
    setTeacherData: React.Dispatch<React.SetStateAction<TeacherData>>;
    instituteData: InstituteData;
    setInstituteData: React.Dispatch<React.SetStateAction<InstituteData>>;
    trimesterDates: TrimesterDates;
    setTrimesterDates: React.Dispatch<React.SetStateAction<TrimesterDates>>;
    
    // New data for auxiliary components
    resultadosAprendizaje: Record<string, ResultadoAprendizaje>;
    setResultadosAprendizaje: React.Dispatch<React.SetStateAction<Record<string, ResultadoAprendizaje>>>;
    criteriosEvaluacion: Record<string, CriterioEvaluacion>;
    setCriteriosEvaluacion: React.Dispatch<React.SetStateAction<Record<string, CriterioEvaluacion>>>;
    instrumentosEvaluacion: Record<string, InstrumentoEvaluacion>;
    setInstrumentosEvaluacion: React.Dispatch<React.SetStateAction<Record<string, InstrumentoEvaluacion>>>;
    profesores: Profesor[];
    setProfesores: React.Dispatch<React.SetStateAction<Profesor[]>>;
    unidadesTrabajo: Record<string, UnidadTrabajo>;
    setUnidadesTrabajo: React.Dispatch<React.SetStateAction<Record<string, UnidadTrabajo>>>;

    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    
    handleFileUpload: (file: File) => Promise<void>;
    handleUpdateStudent: (student: Student) => void;

    handleCreateService: (trimester: 't1' | 't2' | 't3', type: 'normal' | 'agrupacion') => string;
    handleSaveServiceAndEvaluation: (service: Service, evaluation: ServiceEvaluation) => void;
    handleDeleteService: (serviceId: string) => void;
    onDeleteRole: (roleId: string) => void;
    handleDeleteInstrumento: (instrumentoId: string) => void;
    handleSaveEntryExitRecord: (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => void;
    handleSavePracticalExam: (evaluation: PracticalExamEvaluation) => void;
    
    // CRUD for academic structure
    handleSaveRA: (ra: ResultadoAprendizaje) => void;
    handleDeleteRA: (raId: string) => void;
    handleSaveCriterio: (criterio: CriterioEvaluacion, parentRaId: string) => void;
    handleDeleteCriterio: (criterioId: string, parentRaId: string) => void;
    handleSaveUT: (ut: UnidadTrabajo) => void;
    handleDeleteUT: (utId: string) => void;
    handleResetApp: () => void;
    
    calculatedStudentGrades: Record<string, StudentCalculatedGrades>;

    // Helper functions
    getRA: (raId: string) => ResultadoAprendizaje | undefined;
    getCriterio: (criterioId: string) => CriterioEvaluacion | undefined;
    getInstrumento: (instrumentoId: string) => InstrumentoEvaluacion | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Basic Data States
    const [students, setStudents] = useLocalStorage<Student[]>('students', []);
    const [practiceGroups, setPracticeGroups] = useLocalStorage<PracticeGroup[]>('practiceGroups', []);
    const [services, setServices] = useLocalStorage<Service[]>('services', []);
    const [serviceEvaluations, setServiceEvaluations] = useLocalStorage<ServiceEvaluation[]>('serviceEvaluations', []);
    const [serviceRoles, setServiceRoles] = useLocalStorage<ServiceRole[]>('serviceRoles', [
        { id: 'role1', name: 'Jefe de Cocina', color: '#ef4444', type: 'leader' },
        { id: 'role2', name: 'Segundo de Cocina', color: '#f97316', type: 'leader' },
        { id: 'role3', name: 'Jefe de Partida', color: '#84cc16', type: 'secondary' },
        { id: 'role4', name: 'Cocinero', color: '#22c55e', type: 'secondary' },
        { id: 'role5', name: 'Ayudante', color: '#3b82f6', type: 'secondary' },
    ]);
    const [entryExitRecords, setEntryExitRecords] = useLocalStorage<EntryExitRecord[]>('entryExitRecords', []);

    // Academic Grades States
    const [academicGrades, setAcademicGrades] = useLocalStorage<AcademicGrades>('academicGrades', {});
    const [courseGrades, setCourseGrades] = useLocalStorage<CourseGrades>('courseGrades', {});
    const [practicalExamEvaluations, setPracticalExamEvaluations] = useLocalStorage<PracticalExamEvaluation[]>('practicalExamEvaluations', []);
    
    // App Config States
    const [teacherData, setTeacherData] = useLocalStorage<TeacherData>('teacher-app-data', {
        name: 'Juan Codina Barranco',
        email: 'juan.codina@murciaeduca.es',
        logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+CiAgPHN0eWxlPgogICAgLmpjYi10ZXh0IHsgZm9udDogYm9sZCAxODBweCBzYW5zLXNlcmlmOyBmaWxsOiAjMDA0N0FCOyB9CiAgICAuc2luY2UtdGV4dCB7IGZvbnQ6IDYwcHggc2Fucy1zZXJpZjsgZmlsbDogIzAwMDsgfQogICAgLmNsb3VkLXNoYXBlIHsgZmlsbDogI0QzRDNEMzsgb3BhY2l0eTogMC42OyB9CiAgPC9zdHlsZT4KICA8cGF0aCBjbGFzcz0iY2xvdWQtc2hhcGUiIGQ9Ik00MDMuMywxMzkuN2MtMjEuOC00OS44LTcxLjctODMuNy0xMjguMi04My43Yy00MCwwLTc2LjQsMTUuOC0xMDMuMiw0MS42Yy0xMC40LTUuNS0yMi4xLTguNy0zNC42LTguN2MtNDAuOCwwLTc0LDMzLjItNzQsNzRjMCw1LjcsMC43LDExLjMsMS45LDE2LjZDMjYuNSwxOTEuOSwwLDIzNC4yLDAsMjg0YzAsNTUuMiw0NC44LDEwMCwxMDAsMTAwaDcwLjNjLTE1LjMtMjQuOS0yNC4zLTUzLjctMjQuMy04NWMwLTgwLDY0LjctMTQ1LDE0NS0xNDVjMjIuMSwwLDQzLjIsNSw2Mi4yLDE0LjJjLTUtMjIuNy03LjgtNDYuMy03LjgtNzAuMmMwLTguNiwwLjYtMTcuMSwxLjgtMjUuNUMzNjkuOCwxNTQuNSwzODcuOCwxNDMuNiw0MDMuMywxMzkuN3ogTTQxMiwyODRjMC01NS4yLTQ0LjgtMTAwLTEwMC0xMDBjLTYuOCwwLTEzLjUsMC43LTIwLDJjMzMuMywyMy4zLDU1LDYxLjksNTUsMTA1YzAsMjktOS4xLDU1LjktMjQuNSw3OGg5OS41YzU1LjIsMCwxMDAtNDQuOCwxMDAtMTAwQzUxMiwzMjMuOCw0NzIuNSwyOTEuOSw0MTIsMjg0eiIvPgogIDx0ZXh0IHg9IjI1NiIgeT0iMjcwIiBjbGFzcz0iamNiLXRleHQiIHRleHQtYW5jaGyPSJtaWRkbGUiPkpDQjwvdGV4dD4KICA8dGV4dCB4PSIyNTYiIHk9IjM0MCIgY2xhc3M9InNpbmNlLXRleHQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRFU0RFIDE5OTk8L3RleHQ+Cjwvc3ZnPg=='
    });
    const [instituteData, setInstituteData] = useLocalStorage<InstituteData>('institute-app-data', { name: 'CIFP Hostelería y Turismo de Cartagena', address: 'Calle Muralla del Mar, 3, 30202 Cartagena, Murcia', cif: 'Q1234567A', logo: null });
    const [trimesterDates, setTrimesterDates] = useLocalStorage<TrimesterDates>('trimester-dates', defaultTrimesterDates);
    
    // Auxiliary Components Data
    const [resultadosAprendizaje, setResultadosAprendizaje] = useLocalStorage<Record<string, ResultadoAprendizaje>>('resultadosAprendizaje', mockRA);
    const [criteriosEvaluacion, setCriteriosEvaluacion] = useLocalStorage<Record<string, CriterioEvaluacion>>('criteriosEvaluacion', mockCriterios);
    const [instrumentosEvaluacion, setInstrumentosEvaluacion] = useLocalStorage<Record<string, InstrumentoEvaluacion>>('instrumentosEvaluacion', mockInstrumentos);
    const [profesores, setProfesores] = useLocalStorage<Profesor[]>('profesores', mockProfesores);
    const [unidadesTrabajo, setUnidadesTrabajo] = useLocalStorage<Record<string, UnidadTrabajo>>('unidadesTrabajo', mockUTs);

    // Toasts State
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        const id = new Date().getTime().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    // --- Calculated Data ---
    const calculatedStudentGrades = useMemo(() => {
        const result: Record<string, StudentCalculatedGrades> = {};

        const servicesByTrimester: Record<'t1' | 't2' | 't3', Service[]> = { t1: [], t2: [], t3: [] };
        services.forEach(s => {
            if (s.trimester) servicesByTrimester[s.trimester].push(s);
        });
        
        students.forEach(student => {
            const grades: StudentCalculatedGrades = {
                serviceAverages: { t1: null, t2: null, t3: null },
                practicalExams: { t1: null, t2: null, t3: null, rec: null }
            };

            // Calculate Service Averages for each trimester
            (['t1', 't2', 't3'] as const).forEach(trimester => {
                const servicesInTrimester = servicesByTrimester[trimester];
                const numServicesInTrimester = servicesInTrimester.length;

                if (numServicesInTrimester === 0) {
                    grades.serviceAverages[trimester] = null;
                    return;
                }

                let totalIndividual = 0;
                let totalGroup = 0;

                servicesInTrimester.forEach(service => {
                    const evaluation = serviceEvaluations.find(e => e.serviceId === service.id);
                    const individualEval = evaluation?.serviceDay.individualScores[student.id];

                    let individualGrade = 0;
                    let groupGrade = 0;

                    if (individualEval && individualEval.attendance !== false) {
                        individualGrade = (individualEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);

                        if (service.type === 'agrupacion') {
                            const studentAgrupacion = service.agrupaciones?.find(a => a.studentIds.includes(student.id));
                            if (studentAgrupacion && evaluation) {
                                const groupEval = evaluation.serviceDay.groupScores[studentAgrupacion.id];
                                if (groupEval) {
                                    groupGrade = (groupEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                                    if (individualEval.halveGroupScore) {
                                        groupGrade /= 2;
                                    }
                                }
                            }
                        } else { // 'normal'
                            const practiceGroup = practiceGroups.find(pg => pg.studentIds.includes(student.id));
                            if (practiceGroup && evaluation) {
                                const groupEval = evaluation.serviceDay.groupScores[practiceGroup.id];
                                if (groupEval) {
                                    groupGrade = (groupEval.scores || []).reduce((sum, score) => sum + (score || 0), 0);
                                    if (individualEval.halveGroupScore) {
                                        groupGrade /= 2;
                                    }
                                }
                            }
                        }
                    }
                    
                    totalIndividual += individualGrade;
                    totalGroup += groupGrade;
                });
                
                const avgIndividual = totalIndividual / numServicesInTrimester;
                const avgGroup = totalGroup / numServicesInTrimester;
                const finalAvg = (avgIndividual + avgGroup) / 2;
                grades.serviceAverages[trimester] = finalAvg;
            });

            // Get Practical Exam Scores
            practicalExamEvaluations.forEach(e => {
                if (e.studentId === student.id && e.finalScore !== undefined) {
                    grades.practicalExams[e.examPeriod] = e.finalScore;
                }
            });

            result[student.id] = grades;
        });

        return result;
    }, [students, services, serviceEvaluations, practicalExamEvaluations, practiceGroups]);
    

    // --- Handler Functions ---
    const handleFileUpload = async (file: File) => {
        const { data, error } = await parseFile(file);
        if (error) {
            addToast(error, 'error');
            return;
        }
        setStudents(data.sort((a,b) => a.apellido1.localeCompare(b.apellido1)));
        addToast(`${data.length} alumnos importados con éxito.`, 'success');
    };
    
    const handleUpdateStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
        addToast('Ficha del alumno actualizada.', 'success');
    };

    const handleCreateService = (trimester: 't1' | 't2' | 't3', type: 'normal' | 'agrupacion' = 'normal') => {
        const newServiceId = `service-${Date.now()}`;
        const newService: Service = {
            id: newServiceId, 
            name: type === 'normal' ? `Nuevo Servicio ${new Date().toLocaleDateString('es-ES')}` : `Servicio Agrupaciones ${new Date().toLocaleDateString('es-ES')}`,
            date: new Date().toISOString().split('T')[0],
            trimester, 
            isLocked: false, 
            type,
            assignedGroups: { comedor: [], takeaway: [] }, 
            elaborations: { comedor: [], takeaway: [] },
            agrupaciones: type === 'agrupacion' ? [] : undefined,
            studentRoles: []
        };
        const newEvaluation: ServiceEvaluation = { id: `eval-${newServiceId}`, serviceId: newServiceId, preService: {}, serviceDay: { groupScores: {}, individualScores: {} } };
        
        setServices(prev => [...prev, newService]);
        setServiceEvaluations(prev => [...prev, newEvaluation]);
        addToast('Nuevo servicio creado.', 'success');
        return newServiceId;
    };
    
    const handleSaveServiceAndEvaluation = (service: Service, evaluation: ServiceEvaluation) => {
        setServices(prev => prev.map(s => s.id === service.id ? service : s));
        setServiceEvaluations(prev => prev.map(e => e.serviceId === service.id ? evaluation : e));
        addToast(`Servicio '${service.name}' guardado.`, 'success');
    };

    const handleDeleteService = (serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setServiceEvaluations(prev => prev.filter(e => e.serviceId !== serviceId));
        addToast('Servicio eliminado.', 'info');
    };
    
    const onDeleteRole = (roleId: string) => {
        setServiceRoles(prev => prev.filter(r => r.id !== roleId));
        setServices(prev => prev.map(s => ({
            ...s,
            studentRoles: s.studentRoles.filter(sr => sr.roleId !== roleId)
        })));
        addToast('Rol de servicio eliminado.', 'info');
    };

    const handleDeleteInstrumento = (instrumentoId: string) => {
        if (!window.confirm("¿Seguro que quieres eliminar este instrumento y todas sus actividades? Esta acción no se puede deshacer.")) return;
        setInstrumentosEvaluacion(prev => {
            const newInstrumentos = { ...prev };
            delete newInstrumentos[instrumentoId];
            return newInstrumentos;
        });
        addToast('Instrumento eliminado.', 'info');
    };

    const handleSaveEntryExitRecord = (record: Omit<EntryExitRecord, 'id' | 'studentId'>, studentIds: string[]) => {
        const newRecords: EntryExitRecord[] = studentIds.map(studentId => ({
            ...record,
            id: `rec-${studentId}-${Date.now()}`,
            studentId,
        }));
        setEntryExitRecords(prev => [...prev, ...newRecords]);
        addToast(`${newRecords.length} registro(s) guardado(s).`, 'success');
    };
    
    const handleSavePracticalExam = (evaluation: PracticalExamEvaluation) => {
        setPracticalExamEvaluations(prev => {
            const index = prev.findIndex(e => e.id === evaluation.id);
            if (index > -1) {
                const newEvals = [...prev];
                newEvals[index] = evaluation;
                return newEvals;
            }
            return [...prev, evaluation];
        });
        addToast('Examen práctico guardado.', 'success');
    };

    const handleSaveRA = (ra: ResultadoAprendizaje) => {
        setResultadosAprendizaje(prev => ({...prev, [ra.id]: ra}));
        addToast(`RA '${ra.nombre}' guardado.`, 'success');
    };

    const handleDeleteRA = (raId: string) => {
        setResultadosAprendizaje(prev => {
            const newRAs = {...prev};
            const raToDelete = newRAs[raId];
            if(raToDelete) {
                setCriteriosEvaluacion(prevCriterios => {
                    const newCriterios = {...prevCriterios};
                    raToDelete.criteriosEvaluacion.forEach(critId => delete newCriterios[critId]);
                    return newCriterios;
                });
            }
            delete newRAs[raId];
            return newRAs;
        });
        addToast('RA y sus criterios eliminados.', 'info');
    };

    const handleSaveCriterio = (criterio: CriterioEvaluacion, parentRaId: string) => {
        setCriteriosEvaluacion(prev => ({...prev, [criterio.id]: criterio}));
        setResultadosAprendizaje(prev => {
            const parentRA = prev[parentRaId];
            if (parentRA && !parentRA.criteriosEvaluacion.includes(criterio.id)) {
                return { ...prev, [parentRaId]: { ...parentRA, criteriosEvaluacion: [...parentRA.criteriosEvaluacion, criterio.id] } };
            }
            return prev;
        });
        addToast(`Criterio guardado.`, 'success');
    };
    
    const handleDeleteCriterio = (criterioId: string, parentRaId: string) => {
        setCriteriosEvaluacion(prev => {
            const newCriterios = {...prev};
            delete newCriterios[criterioId];
            return newCriterios;
        });
         setResultadosAprendizaje(prev => {
            const parentRA = prev[parentRaId];
            if (parentRA) {
                return { ...prev, [parentRaId]: { ...parentRA, criteriosEvaluacion: parentRA.criteriosEvaluacion.filter(id => id !== criterioId) } };
            }
            return prev;
        });
        addToast('Criterio eliminado.', 'info');
    };

    const handleSaveUT = (ut: UnidadTrabajo) => {
        setUnidadesTrabajo(prev => ({ ...prev, [ut.id]: ut }));
        addToast(`Unidad de Trabajo '${ut.nombre}' guardada.`, 'success');
    };
    
    const handleDeleteUT = (utId: string) => {
        if(window.confirm('¿Seguro que quieres eliminar esta Unidad de Trabajo?')) {
            setUnidadesTrabajo(prev => {
                const newUTs = { ...prev };
                delete newUTs[utId];
                return newUTs;
            });
             setCriteriosEvaluacion(prev => {
                const newCriterios = { ...prev };
                (Object.values(newCriterios) as CriterioEvaluacion[]).forEach(c => {
                    if (c.asociaciones) {
                        c.asociaciones = c.asociaciones.filter(a => a.utId !== utId);
                    }
                });
                return newCriterios;
            });
            addToast('Unidad de Trabajo eliminada.', 'info');
        }
    };

    const handleResetApp = () => {
        localStorage.clear();
        addToast('Aplicación reseteada. Recargando...', 'success');
        setTimeout(() => window.location.reload(), 2000);
    };
    
    // Helper Functions
    const getRA = (raId: string) => resultadosAprendizaje[raId];
    const getCriterio = (criterioId: string) => criteriosEvaluacion[criterioId];
    const getInstrumento = (instrumentoId: string) => instrumentosEvaluacion[instrumentoId];

    const value: AppContextType = {
        students, setStudents, practiceGroups, setPracticeGroups, services, setServices, serviceEvaluations, setServiceEvaluations, serviceRoles, setServiceRoles, entryExitRecords, setEntryExitRecords, academicGrades, setAcademicGrades, courseGrades, setCourseGrades, practicalExamEvaluations, setPracticalExamEvaluations, teacherData, setTeacherData, instituteData, setInstituteData, trimesterDates, setTrimesterDates,
        resultadosAprendizaje, setResultadosAprendizaje, criteriosEvaluacion, setCriteriosEvaluacion, instrumentosEvaluacion, setInstrumentosEvaluacion, profesores, setProfesores, unidadesTrabajo, setUnidadesTrabajo,
        toasts, addToast,
        handleFileUpload, handleUpdateStudent,
        handleCreateService, handleSaveServiceAndEvaluation, handleDeleteService, onDeleteRole, handleDeleteInstrumento, handleSaveEntryExitRecord, handleSavePracticalExam,
        handleSaveRA, handleDeleteRA, handleSaveCriterio, handleDeleteCriterio, handleSaveUT, handleDeleteUT, handleResetApp,
        calculatedStudentGrades,
        getRA, getCriterio, getInstrumento
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};