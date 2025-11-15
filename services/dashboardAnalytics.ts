import { Student, PracticalExamEvaluation } from '../types';
import { RADashboardSummary, RAProgressData, HighlightedStudent } from '../types';
import { PRACTICAL_EXAM_RUBRIC } from '../data/constants';

export function calculateRADashboardSummary(students: Student[], evaluations: PracticalExamEvaluation[]): RADashboardSummary {
    const totalStudents = students.length;
    if (totalStudents === 0) {
        return { totalStudents: 0, overallAverage: null, passingStudents: 0, atRiskStudents: 0 };
    }

    const finalScores = evaluations
        .map(e => e.finalScore)
        .filter(score => typeof score === 'number') as number[];

    const overallAverage = finalScores.length > 0
        ? finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length
        : null;

    const studentAverages: { [studentId: string]: number } = {};
    evaluations.forEach(e => {
        if (e.finalScore !== undefined) {
             studentAverages[e.studentId] = Math.max(studentAverages[e.studentId] || 0, e.finalScore);
        }
    });

    const passingStudents = Object.values(studentAverages).filter(avg => avg >= 5).length;
    const atRiskStudents = Object.values(studentAverages).filter(avg => avg < 5).length;
    
    return {
        totalStudents,
        overallAverage,
        passingStudents,
        atRiskStudents
    };
}

export function calculateRAProgress(evaluations: PracticalExamEvaluation[]): RAProgressData[] {
    return PRACTICAL_EXAM_RUBRIC.map(ra => {
        const scoresForRa: number[] = [];

        evaluations.forEach(evaluation => {
            const raScores = evaluation.scores[ra.id];
            if (raScores) {
                let raScoreSum = 0;
                let criteriaCount = 0;
                
                Object.values(raScores).forEach(criterionScore => {
                    if (typeof criterionScore.score === 'number') {
                        raScoreSum += criterionScore.score;
                        criteriaCount++;
                    }
                });
                
                if (criteriaCount > 0) {
                    scoresForRa.push(raScoreSum / criteriaCount);
                }
            }
        });

        const average = scoresForRa.length > 0
            ? scoresForRa.reduce((sum, score) => sum + score, 0) / scoresForRa.length
            : null;
            
        return {
            id: ra.id,
            name: ra.name,
            average,
            weight: ra.weight
        };
    });
}

export function getStudentHighlights(students: Student[], evaluations: PracticalExamEvaluation[]): { top: HighlightedStudent[], bottom: HighlightedStudent[] } {
    const studentScores: { [id: string]: { name: string, scores: number[], fotoUrl: string } } = {};

    students.forEach(s => {
        studentScores[s.id] = { name: `${s.apellido1}, ${s.nombre}`, scores: [], fotoUrl: s.fotoUrl };
    });

    evaluations.forEach(e => {
        if (studentScores[e.studentId] && e.finalScore !== undefined) {
            studentScores[e.studentId].scores.push(e.finalScore);
        }
    });

    const studentAverages = Object.entries(studentScores)
        .map(([id, data]) => {
            const avg = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0;
            return { id, name: data.name, score: avg, fotoUrl: data.fotoUrl };
        })
        .filter(s => s.score > 0) // Only include students with scores
        .sort((a, b) => b.score - a.score);

    const top = studentAverages.slice(0, 3);
    const bottom = studentAverages.slice(-3).reverse();

    return { top, bottom };
}