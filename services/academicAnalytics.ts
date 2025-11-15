import { 
    CriterioEvaluacion,
    AcademicGrades, 
    StudentCalculatedGrades,
    ResultadoAprendizaje
} from '../types';

/**
 * Gets the grade for a student for a specific evaluation activity.
 * This function maps activity IDs to their corresponding grades in the data structure.
 */
const getGradeForActivity = (
    activityId: string,
    studentId: string,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): number | null => {
    const studentAcademic = academicGrades[studentId];
    const studentCalculated = calculatedGrades[studentId];

    // Mapping of activity IDs to their grade data sources
    const activityGradeMap: Record<string, () => number | null> = {
        'act-1': () => studentAcademic?.t1?.manualGrades?.examen1 ?? null,
        'act-2': () => studentAcademic?.t1?.manualGrades?.examen2 ?? null,
        'act-8': () => studentAcademic?.t2?.manualGrades?.examen1 ?? null,
        'act-9': () => studentAcademic?.t2?.manualGrades?.examen2 ?? null,
        'act-6': () => studentCalculated?.serviceAverages?.t1 ?? null,
        'act-13': () => studentCalculated?.serviceAverages?.t2 ?? null,
        'act-7': () => studentCalculated?.practicalExams?.t1 ?? null,
        'act-14': () => studentCalculated?.practicalExams?.t2 ?? null,
        // Other activities (Fichas, Trabajos, P. Diaria) do not have a data source defined yet
    };

    const gradeFn = activityGradeMap[activityId];
    return gradeFn ? gradeFn() : null;
};

/**
 * Calculates the final grade for an evaluation criterion by averaging the grades of its associated activities.
 */
export const calculateCriterioGrade = (
    criterio: CriterioEvaluacion,
    studentId: string,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): number | null => {
    if (!criterio.asociaciones || criterio.asociaciones.length === 0) {
        return null;
    }

    const associatedActivities = criterio.asociaciones.flatMap(asoc => asoc.activityIds);
    if (associatedActivities.length === 0) {
        return null;
    }

    const grades = associatedActivities
        .map(actId => getGradeForActivity(actId, studentId, academicGrades, calculatedGrades))
        .filter(g => g !== null) as number[];

    if (grades.length === 0) {
        return null;
    }

    // Simple average of all activities linked to the criterion
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return sum / grades.length;
};

/**
 * Calculates the final weighted grade for a Learning Outcome (RA) based on the grades of its criteria.
 */
export const calculateRAGrade = (
    ra: ResultadoAprendizaje,
    studentId: string,
    criteriosEvaluacion: Record<string, CriterioEvaluacion>,
    academicGrades: AcademicGrades,
    calculatedGrades: Record<string, StudentCalculatedGrades>
): { grade: number | null, ponderacionTotal: number } => {
    let weightedSum = 0;
    let ponderacionTotalEvaluada = 0;

    ra.criteriosEvaluacion.forEach(criterioId => {
        const criterio = criteriosEvaluacion[criterioId];
        if (criterio) {
            const criterioGrade = calculateCriterioGrade(criterio, studentId, academicGrades, calculatedGrades);
            
            if (criterioGrade !== null) {
                // The criterion's grade is already out of 10, so we multiply by its percentage weight
                weightedSum += criterioGrade * (criterio.ponderacion / 100);
                ponderacionTotalEvaluada += criterio.ponderacion;
            }
        }
    });

    if (ponderacionTotalEvaluada === 0) {
        return { grade: null, ponderacionTotal: 0 };
    }

    // Normalize the final grade to be out of 10
    const finalGrade = (weightedSum / (ponderacionTotalEvaluada / 100));
    return { grade: finalGrade, ponderacionTotal: ponderacionTotalEvaluada };
};