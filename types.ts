export type GradeValue = number | null;

export interface Student {
  id: string;
  nre: string;
  expediente: string;
  apellido1: string;
  apellido2: string;
  nombre: string;
  grupo: string;
  subgrupo: string;
  fechaNacimiento: string;
  telefono: string;
  emailPersonal: string;
  emailOficial: string;
  fotoUrl: string;
}

export interface PracticeGroup {
  id: string;
  name: string;
  color: string;
  studentIds: string[];
}

export interface ServiceRole {
    id: string;
    name: string;
    color: string;
    type: 'leader' | 'secondary';
}

export interface StudentRoleAssignment {
    studentId: string;
    roleId: string;
}

export interface Elaboration {
    id: string;
    name: string;
    responsibleGroupId: string;
}

export interface Agrupacion {
    id: string;
    name: string;
    studentIds: string[];
}

export interface Service {
    id: string;
    name: string;
    date: string;
    trimester: 't1' | 't2' | 't3';
    isLocked: boolean;
    type: 'normal' | 'agrupacion';
    // For 'normal' type
    assignedGroups: {
        comedor: string[];
        takeaway: string[];
    };
    elaborations: {
        comedor: Elaboration[];
        takeaway: Elaboration[];
    };
    // For 'agrupacion' type
    agrupaciones?: Agrupacion[];
    studentRoles: StudentRoleAssignment[];
}

export interface PreServiceBehaviorScores {
    [itemId: string]: number | null;
}

export interface PreServiceIndividualEvaluation {
    attendance: boolean;
    hasFichas: boolean;
    hasUniforme: boolean;
    hasMaterial: boolean;
    behaviorScores: PreServiceBehaviorScores;
    observations: string;
}

export interface PreServiceDayEvaluation {
    name: string;
    groupObservations: { [groupId: string]: string };
    individualEvaluations: { [studentId: string]: PreServiceIndividualEvaluation };
}

export interface ServiceDayIndividualScores {
    attendance: boolean;
    scores: (number | null)[];
    observations: string;
    halveGroupScore?: boolean;
}

export interface ServiceDayGroupScores {
    scores: (number | null)[];
    observations: string;
}

export interface ServiceEvaluation {
    id: string;
    serviceId: string;
    preService: { [date: string]: PreServiceDayEvaluation };
    serviceDay: {
        groupScores: { [groupId: string]: ServiceDayGroupScores };
        individualScores: { [studentId: string]: ServiceDayIndividualScores };
    };
}

export interface EntryExitRecord {
    id: string;
    studentId: string;
    date: string;
    type: 'Salida Anticipada' | 'Llegada Tarde';
    reason: string;
}

export interface PrincipalGrade {
    servicios: GradeValue;
    practico: GradeValue;
    teorico1: GradeValue;
    teorico2: GradeValue;
}

export interface PrincipalGrades {
  [studentId: string]: {
    t1: PrincipalGrade;
    t2: PrincipalGrade;
    t3?: PrincipalGrade;
    recFinal: GradeValue;
  };
}

export interface OtherModuleGrade {
    t1: GradeValue;
    t2: GradeValue;
    t3?: GradeValue;
    rec: GradeValue;
}

export interface OtherGrades {
    [studentId: string]: {
        [moduleName: string]: OtherModuleGrade;
    };
}

export type ExamPeriod = 't1' | 't2' | 't3' | 'rec';

export interface PracticalExamCriterionScore {
    score: number | null;
    notes: string;
}

export interface PracticalExamEvaluation {
    id: string;
    studentId: string;
    examPeriod: ExamPeriod;
    scores: {
        [raId: string]: {
            [criterionId: string]: PracticalExamCriterionScore;
        };
    };
    finalScore?: number;
}

export interface StudentAcademicPeriodGrades {
    manualGrades: { [instrumentKey: string]: GradeValue };
}

export interface StudentAcademicGrades {
    [periodKey: string]: StudentAcademicPeriodGrades;
}

export interface AcademicGrades {
    [studentId: string]: StudentAcademicGrades;
}


export interface CourseModuleGrades {
    t1: GradeValue;
    t2: GradeValue;
    t3?: GradeValue;
    rec: GradeValue;
    isConvalidated?: boolean;
}

export interface StudentCourseGrades {
    [module: string]: Partial<CourseModuleGrades>;
}

export interface CourseGrades {
    [studentId: string]: StudentCourseGrades;
}

export interface TeacherData {
    name: string;
    email: string;
    logo: string | null;
}

export interface InstituteData {
    name: string;
    address: string;
    cif: string;
    logo: string | null;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

export interface StudentCalculatedGrades {
    serviceAverages: {
        t1: number | null;
        t2: number | null;
        t3?: number | null;
    };
    practicalExams: {
        t1: number | null;
        t2: number | null;
        t3?: number | null;
        rec: number | null;
    };
}

export interface ReportViewModel {
    service: Service;
    evaluation: ServiceEvaluation;
    students: Student[];
    practiceGroups: PracticeGroup[];
    serviceRoles: ServiceRole[];
    teacherData: TeacherData;
    instituteData: InstituteData;
    participatingStudents: Student[];
    groupedStudentsInService: {
        group: PracticeGroup;
        students: Student[];
    }[];
    entryExitRecords: EntryExitRecord[];
}

export interface TrimesterDateRange {
    start: string;
    end: string;
}

export interface TrimesterDates {
    t1: TrimesterDateRange;
    t2: TrimesterDateRange;
    t3?: TrimesterDateRange;
}

export interface TimelineEvent {
  date: Date;
  type: 'incidencia' | 'observacion';
  title: string;
  content: string;
  serviceName?: string;
}

export interface RADashboardSummary {
  totalStudents: number;
  overallAverage: number | null;
  passingStudents: number;
  atRiskStudents: number;
}

export interface RAProgressData {
  id: string;
  name: string;
  average: number | null;
  weight: number;
}

export interface HighlightedStudent {
    id: string;
    name: string;
    score: number;
    fotoUrl: string;
}

// --- New types for Auxiliary Components ---
export interface ResultadoAprendizaje {
  id: string;
  nombre: string;
  descripcion: string;
  competencias: string[];
  criteriosEvaluacion: string[];
  area?: string;
  ponderacion?: number;
}

export interface AsociacionCriterio {
    id: string;
    utId: string;
    activityIds: string[];
}

export interface CriterioEvaluacion {
  id: string;
  descripcion: string;
  indicadores: string[];
  ponderacion: number;
  asociaciones: AsociacionCriterio[];
  raId?: string;
  raNombre?: string;
}

export interface EvaluationActivity {
    id: string;
    name: string;
    trimester: 't1' | 't2';
}

export interface InstrumentoEvaluacion {
  id: string;
  nombre: string;
  descripcion: string;
  pesoTotal?: number;
  activities: EvaluationActivity[];
}


export interface Profesor {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    especialidad: string;
    telefono: string;
}

export interface UnidadTrabajo {
    id: string;
    nombre: string;
    descripcion: string;
}

// --- New types for Optativo Module ---
export interface OptativoExam {
  id: string;
  name: string;
  trimester: 't1' | 't2';
}

export interface OptativoGrades {
  [studentId: string]: {
    [examId: string]: number | null;
  };
}