import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportViewModel, Student, ServiceRole, TeacherData, InstituteData, StudentCalculatedGrades, StudentAcademicGrades, StudentCourseGrades, TimelineEvent, GradeValue, UnidadTrabajo, ResultadoAprendizaje, CriterioEvaluacion, InstrumentoEvaluacion } from '../types';
import { PRE_SERVICE_BEHAVIOR_ITEMS, BEHAVIOR_RATING_MAP, INDIVIDUAL_EVALUATION_ITEMS, GROUP_EVALUATION_ITEMS, ACADEMIC_EVALUATION_STRUCTURE, COURSE_MODULES } from '../data/constants';
import { calculateStudentPeriodAverages } from './gradeCalculator';


// --- Reusable PDF Generation Helpers ---

const addImageToPdf = (doc: jsPDF, imageData: string | null, x: number, y: number, w: number, h: number) => {
    if (imageData && imageData.startsWith('data:image')) {
        try {
            const imageType = imageData.substring(imageData.indexOf('/') + 1, imageData.indexOf(';'));
            doc.addImage(imageData, imageType.toUpperCase(), x, y, w, h);
        } catch (e) { console.error("Error adding image:", e); }
    }
};

const PAGE_MARGIN = 15;

const addFooter = (doc: jsPDF, data: any, teacherData: TeacherData, instituteData: InstituteData) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setFontSize(8).setTextColor(120);
    const date = new Date().toLocaleDateString('es-ES');
    doc.text(`${instituteData.name || 'Instituto'} - ${teacherData.name || 'Profesor'}`, PAGE_MARGIN, pageHeight - 10);
    doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(date, pageWidth - PAGE_MARGIN, pageHeight - 10, { align: 'right' });
};

const drawLeadersSection = (doc: jsPDF, viewModel: ReportViewModel, startY: number, didDrawPage: (data: any) => void): number => {
    const { service, serviceRoles, participatingStudents } = viewModel;

    const leaders = participatingStudents
        .map(student => ({
            student,
            role: serviceRoles.find(r => r.id === service.studentRoles.find(sr => sr.studentId === student.id)?.roleId)
        }))
        .filter(item => item.role?.type === 'leader')
        .sort((a, b) => (a.role?.name || '').localeCompare(b.role?.name || ''));

    if (leaders.length === 0) {
        return startY;
    }
    
    const leadersBody = leaders.map(l => [
        { content: l.role?.name || 'Rol desconocido', styles: { fontStyle: 'bold' } },
        `${l.student.nombre} ${l.student.apellido1} ${l.student.apellido2}`
    ]);

    autoTable(doc, {
        startY: startY,
        head: [['Puesto Principal', 'Alumno Asignado']],
        body: leadersBody,
        theme: 'striped',
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold', halign: 'center' },
        didDrawPage,
        margin: { top: 35, bottom: 20 }
    });

    return (doc as any).lastAutoTable.finalY;
};


// --- Planning PDF ---

export const generatePlanningPDF = (viewModel: ReportViewModel) => {
    const { service, serviceRoles, groupedStudentsInService, students, teacherData, instituteData } = viewModel;
    const doc = new jsPDF('p', 'mm', 'a4');
    let lastY = 0;

    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        addImageToPdf(doc, teacherData.logo, pageWidth - PAGE_MARGIN - 15, 10, 15, 15);
        
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(40);
        doc.text(`Planning: ${service.name}`, pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100);
        doc.text(`Fecha: ${new Date(service.date).toLocaleDateString('es-ES')}`, pageWidth / 2, 24, { align: 'center' });
        
        addFooter(doc, data, teacherData, instituteData);
    };

    lastY = drawLeadersSection(doc, viewModel, 32, didDrawPage) + 8;

    if (service.type === 'agrupacion') {
        (service.agrupaciones || []).forEach(agrupacion => {
            const studentsInAgrupacion = students
                .filter(s => agrupacion.studentIds.includes(s.id))
                .sort((a, b) => a.apellido1.localeCompare(b.apellido1));

            const studentRolesBody = studentsInAgrupacion.map(student => {
                const role = serviceRoles.find(r => r.id === service.studentRoles.find(sr => sr.studentId === student.id)?.roleId);
                return [`${student.apellido1} ${student.apellido2}, ${student.nombre}`, role?.name || ''];
            });

            const tableHeightEstimate = 15 + (studentRolesBody.length * 7);
            if (lastY + tableHeightEstimate > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); lastY = 35; }

            autoTable(doc, {
                startY: lastY,
                head: [[{ content: `Elaboración: ${agrupacion.name}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [232, 245, 252], textColor: [26, 115, 232] } }]],
                body: studentRolesBody,
                columns: [{ header: 'Alumno' }, { header: 'Puesto' }],
                theme: 'grid',
                didDrawPage: (data) => addFooter(doc, data, teacherData, instituteData),
                margin: { top: 35, bottom: 20 }
            });
            lastY = (doc as any).lastAutoTable.finalY + 5;
        });

    } else { // 'normal' type
        const drawServiceSection = (area: 'comedor' | 'takeaway') => {
            const pageHeight = doc.internal.pageSize.getHeight();
            if (lastY > pageHeight - 40) { doc.addPage(); lastY = 35; }
        
            autoTable(doc, {
                startY: lastY,
                body: [[`SERVICIO DE ${area.toUpperCase()}`]],
                theme: 'plain',
                styles: { minCellHeight: 8, valign: 'middle', halign: 'center', fillColor: [230, 240, 230], fontStyle: 'bold', textColor: 40 }
            });
            lastY = (doc as any).lastAutoTable.finalY;

            groupedStudentsInService.filter(g => service.assignedGroups[area].includes(g.group.id)).forEach(groupData => {
                const elaborationsText = 'Elaboraciones:\n' + (service.elaborations[area].filter(e => e.responsibleGroupId === groupData.group.id).map(e => `- ${e.name}`).join('\n'));
                const studentRolesBody = groupData.students.map(student => {
                    const role = serviceRoles.find(r => r.id === service.studentRoles.find(sr => sr.studentId === student.id)?.roleId);
                    return [`${student.apellido1} ${student.apellido2}, ${student.nombre}`, role?.name || ''];
                });
                
                const tableHeightEstimate = 15 + (studentRolesBody.length * 7); // Estimate
                if (lastY + tableHeightEstimate > pageHeight - 20) { doc.addPage(); lastY = 35; }

                autoTable(doc, {
                    startY: lastY,
                    body: [
                        [{ content: `Grupo ${groupData.group.name}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }],
                        [{ content: elaborationsText, colSpan: 2, styles: { minCellHeight: 10, whiteSpace: 'pre-wrap' } }],
                        ...studentRolesBody
                    ],
                    theme: 'grid',
                    columnStyles: { 1: { halign: 'right' } },
                    didDrawPage: (data) => addFooter(doc, data, teacherData, instituteData),
                    margin: { top: 35, bottom: 20 }
                });
                lastY = (doc as any).lastAutoTable.finalY;
            });
            lastY += 8;
        };
        
        drawServiceSection('comedor');
        drawServiceSection('takeaway');
    }

    doc.save(`Planning_${service.name.replace(/ /g, '_')}.pdf`);
};

// --- Tracking Sheet PDF ---

export const generateTrackingSheetPDF = (viewModel: ReportViewModel) => {
    const { service, participatingStudents, teacherData, instituteData } = viewModel;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // HEADER
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        addImageToPdf(doc, teacherData.logo, pageWidth - PAGE_MARGIN - 15, 10, 15, 15);
        
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(40);
        doc.text(`Ficha de Seguimiento Semanal: ${service.name}`, pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100);
        doc.text(`Fecha del servicio: ${new Date(service.date).toLocaleDateString('es-ES')}`, pageWidth / 2, 24, { align: 'center' });
        
        // FOOTER
        addFooter(doc, data, teacherData, instituteData);
    };

    const sortedStudents = [...participatingStudents].sort((a, b) => 
        a.apellido1.localeCompare(b.apellido1) || (a.apellido2 || '').localeCompare(b.apellido2 || '') || a.nombre.localeCompare(b.nombre)
    );

    const head = [
        [
            { content: '#', rowSpan: 2, styles: { valign: 'middle'} },
            { content: 'Alumno', rowSpan: 2, styles: { valign: 'middle'} },
            { content: 'Día 1', colSpan: 4, styles: { halign: 'center' } },
            { content: 'Día 2', colSpan: 4, styles: { halign: 'center' } },
            { content: 'Conducta Semanal', rowSpan: 2, styles: { valign: 'middle'} },
            { content: 'Observaciones', rowSpan: 2, styles: { valign: 'middle'} },
        ],
        [
            'Asis.', 'Unif.', 'Fichas', 'Mat.',
            'Asis.', 'Unif.', 'Fichas', 'Mat.',
        ]
    ];
    
    const body = sortedStudents.map((student, index) => {
        return [
            index + 1,
            `${student.apellido1} ${student.apellido2}, ${student.nombre}`,
            '', '', '', '', // Día 1
            '', '', '', '', // Día 2
            '', // Conducta
            ''  // Observaciones
        ];
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 32,
        didDrawPage,
        margin: { top: 30, bottom: 20 },
        theme: 'grid',
        headStyles: { fillColor: [74, 85, 104], fontSize: 8, valign: 'middle' },
        styles: { fontSize: 8, cellPadding: 1.5, minCellHeight: 10, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' }, // #
            1: { cellWidth: 55 }, // Alumno
            2: { cellWidth: 12, halign: 'center' }, // D1 Asist.
            3: { cellWidth: 12, halign: 'center' }, // D1 Unif.
            4: { cellWidth: 12, halign: 'center' }, // D1 Fichas
            5: { cellWidth: 12, halign: 'center' }, // D1 Mat.
            6: { cellWidth: 12, halign: 'center' }, // D2 Asist.
            7: { cellWidth: 12, halign: 'center' }, // D2 Unif.
            8: { cellWidth: 12, halign: 'center' }, // D2 Fichas
            9: { cellWidth: 12, halign: 'center' }, // D2 Mat.
            10: { cellWidth: 25, halign: 'center' }, // Conducta
            11: { cellWidth: 'auto' }, // Observaciones
        },
        didDrawCell: (data) => {
            // Draw checkboxes for day 1 and day 2 columns
            if (data.section === 'body' && data.column.index >= 2 && data.column.index <= 9) {
                const checkBoxSize = 3;
                const x = data.cell.x + (data.cell.width / 2) - (checkBoxSize / 2);
                const y = data.cell.y + (data.cell.height / 2) - (checkBoxSize / 2);
                doc.setDrawColor(150);
                doc.rect(x, y, checkBoxSize, checkBoxSize);
            }
        }
    });

    doc.save(`Ficha_Seguimiento_Semanal_${service.name.replace(/ /g, '_')}.pdf`);
};

// --- Full Evaluation Report PDF ---
export const generateFullEvaluationReportPDF = (viewModel: ReportViewModel) => {
    const { service, evaluation, groupedStudentsInService, students, teacherData, instituteData } = viewModel;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        addImageToPdf(doc, teacherData.logo, pageWidth - PAGE_MARGIN - 15, 10, 15, 15);
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(40);
        doc.text(`Ficha de Evaluación: ${service.name}`, pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100);
        doc.text(`Fecha del servicio: ${new Date(service.date).toLocaleDateString('es-ES')}`, pageWidth / 2, 24, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };

    const evaluationUnits = service.type === 'agrupacion'
    ? (service.agrupaciones || []).map(a => ({
        id: a.id,
        name: a.name,
        students: students.filter(s => a.studentIds.includes(s.id))
      }))
    : groupedStudentsInService.map(g => ({
        id: g.group.id,
        name: g.group.name,
        students: g.students
      }));

    if (evaluationUnits.length === 0) {
        doc.setFontSize(12).text('No hay grupos o alumnos asignados a este servicio.', PAGE_MARGIN, 40);
        doc.save(`Evaluacion_${service.name.replace(/ /g, '_')}.pdf`);
        return;
    }
    
    const groupEvalTitle = service.type === 'agrupacion' ? 'Evaluación de Agrupaciones' : 'Evaluación Grupal';
    const groupEvalHead = [[`Criterio de ${groupEvalTitle}`, ...evaluationUnits.map(unit => unit.name)]];
    const groupEvalBody: any[][] = GROUP_EVALUATION_ITEMS.map((item, index) => [item.label, ...evaluationUnits.map(unit => evaluation.serviceDay.groupScores[unit.id]?.scores[index]?.toFixed(2) ?? '-')]);
    const groupTotals = evaluationUnits.map(unit => (evaluation.serviceDay.groupScores[unit.id]?.scores || []).reduce((sum, s) => sum + (s || 0), 0));
    groupEvalBody.push([{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, ...groupTotals.map(total => ({ content: `${total.toFixed(2)} / 10.00`, styles: { fontStyle: 'bold' } }))]);
    groupEvalBody.push([{ content: 'Observaciones', styles: { fontStyle: 'bold' } }, ...evaluationUnits.map(unit => evaluation.serviceDay.groupScores[unit.id]?.observations || '')]);
    
    autoTable(doc, { head: groupEvalHead, body: groupEvalBody, startY: 32, margin: { top: 30, bottom: 20 }, headStyles: { fillColor: [56, 161, 105] }, didDrawPage });

    evaluationUnits.forEach(unit => {
        if (unit.students.length === 0) return;
        doc.addPage();
        
        const studentHeaders = unit.students.map(s => `${s.apellido1} ${s.nombre.charAt(0)}.`);
        const individualEvalHead = [['Criterio de Evaluación Individual', ...studentHeaders]];
        const individualEvalBody: any[][] = [];

        INDIVIDUAL_EVALUATION_ITEMS.forEach((item, index) => individualEvalBody.push([item.label, ...unit.students.map(s => evaluation.serviceDay.individualScores[s.id]?.scores[index]?.toFixed(2) ?? '-')]));
        const individualTotals = unit.students.map(s => (evaluation.serviceDay.individualScores[s.id]?.scores || []).reduce((sum, score) => sum + (score || 0), 0));
        individualEvalBody.push([{ content: 'TOTAL DÍA SERVICIO', styles: { fontStyle: 'bold' } }, ...individualTotals.map(total => ({ content: `${total.toFixed(2)} / 10.00`, styles: { fontStyle: 'bold' } }))]);
        individualEvalBody.push([{ content: 'Observaciones', styles: { fontStyle: 'bold' } }, ...unit.students.map(s => evaluation.serviceDay.individualScores[s.id]?.observations || '')]);
        
        const title = service.type === 'agrupacion' ? `Elaboración: ${unit.name}` : `Grupo ${unit.name}`;
        autoTable(doc, { head: [[{ content: title, colSpan: unit.students.length + 1, styles: { halign: 'center', fillColor: [49, 130, 206], fontStyle: 'bold' } }]], body: [], startY: 32, margin: { top: 30, bottom: 20 }, didDrawPage });
        autoTable(doc, { head: individualEvalHead, body: individualEvalBody, startY: (doc as any).lastAutoTable.finalY, margin: { top: 30, bottom: 20 }, headStyles: { fillColor: [74, 85, 104] }, didDrawPage });
    });

    doc.save(`Evaluacion_${service.name.replace(/ /g, '_')}.pdf`);
};


// --- Detailed Student Service Report PDF (Internal Helper) ---
const _drawDetailedStudentReportPage = (doc: jsPDF, viewModel: ReportViewModel, studentId: string) => {
    const { service, evaluation, students, practiceGroups, teacherData, instituteData, entryExitRecords } = viewModel;
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    let lastY = 0;
    const didDrawPage = (data: any) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(40);
        doc.text(service.name, pageWidth / 2, 16, { align: 'center' });
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100);
        doc.text(new Date(service.date + 'T12:00:00Z').toLocaleDateString('es-ES'), pageWidth / 2, 21, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };
    
    const preServiceDate = Object.keys(evaluation.preService)[0] || null;
    const preServiceEval = preServiceDate ? evaluation.preService[preServiceDate]?.individualEvaluations[student.id] : null;
    const preServiceBody: any[][] = [];
    if (preServiceEval) {
        preServiceBody.push(['Asistencia', preServiceEval.attendance ? 'Presente' : 'Ausente']);
        preServiceBody.push(['Fichas Técnicas', preServiceEval.hasFichas ? 'Sí' : 'No'], ['Uniforme', preServiceEval.hasUniforme ? 'Sí' : 'No'], ['Material', preServiceEval.hasMaterial ? 'Sí' : 'No']);
        PRE_SERVICE_BEHAVIOR_ITEMS.forEach(item => preServiceBody.push([item.label, BEHAVIOR_RATING_MAP.find(r => r.value === preServiceEval.behaviorScores[item.id])?.label ?? '-']));
        if (preServiceEval.observations) preServiceBody.push([{ content: 'Observaciones (Día Previo):', styles: { fontStyle: 'bold' } }, preServiceEval.observations]);
    } else { preServiceBody.push(['- Sin datos de pre-servicio -']); }

    const serviceDayEval = evaluation.serviceDay.individualScores[student.id];
    const serviceDayBody: any[][] = [];
    if (serviceDayEval) {
        serviceDayBody.push(['Asistencia', serviceDayEval.attendance ? 'Presente' : 'Ausente']);
        if (serviceDayEval.attendance) INDIVIDUAL_EVALUATION_ITEMS.forEach((item, index) => serviceDayBody.push([item.label, `${serviceDayEval.scores[index]?.toFixed(2) ?? '-'} / ${item.maxScore.toFixed(2)}`]));
        if (serviceDayEval.observations) serviceDayBody.push([{ content: 'Observaciones (Día de Servicio):', styles: { fontStyle: 'bold' } }, serviceDayEval.observations]);
    } else { serviceDayBody.push(['- Sin datos de día de servicio -']); }

    const incidents = entryExitRecords.filter(rec => rec.studentId === studentId).map(rec => [rec.date, rec.type, rec.reason]);

    if (service.type === 'agrupacion') {
        const studentAgrupacion = service.agrupaciones?.find(a => a.studentIds.includes(student.id));
        autoTable(doc, { startY: 30, head: [['Resumen del Servicio']], body: [['Servicio:', service.name], ['Fecha:', new Date(service.date + 'T12:00:00Z').toLocaleDateString('es-ES')], ['Alumno:', `${student.apellido1} ${student.apellido2}, ${student.nombre}`], ['Elaboración:', studentAgrupacion ? studentAgrupacion.name : 'No asignado']], theme: 'striped', headStyles: { fillColor: [74, 85, 104] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, { startY: lastY + 8, head: [['Evaluación Individual - Día Previo']], body: preServiceBody, theme: 'grid', headStyles: { fillColor: [49, 130, 206] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, { startY: lastY + 8, head: [['Evaluación Individual - Día de Servicio']], body: serviceDayBody, theme: 'grid', headStyles: { fillColor: [49, 130, 206] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;
    } else {
        const studentGroup = practiceGroups.find(g => g.studentIds.includes(student.id));
        autoTable(doc, { startY: 30, head: [['Resumen del Servicio']], body: [['Servicio:', service.name], ['Fecha:', new Date(service.date + 'T12:00:00Z').toLocaleDateString('es-ES')], ['Alumno:', `${student.apellido1} ${student.apellido2}, ${student.nombre}`], ['Grupo:', studentGroup ? studentGroup.name : 'No asignado']], theme: 'striped', headStyles: { fillColor: [74, 85, 104] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;
        
        autoTable(doc, { startY: lastY + 8, head: [['Evaluación Individual - Día Previo']], body: preServiceBody, theme: 'grid', headStyles: { fillColor: [49, 130, 206] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, { startY: lastY + 8, head: [['Evaluación Individual - Día de Servicio']], body: serviceDayBody, theme: 'grid', headStyles: { fillColor: [49, 130, 206] }, didDrawPage, margin: { bottom: 20 } });
        lastY = (doc as any).lastAutoTable.finalY;

        if(studentGroup) {
            const groupEval = evaluation.serviceDay.groupScores[studentGroup.id];
            const groupBody: any[][] = groupEval ? GROUP_EVALUATION_ITEMS.map((item, index) => [item.label, `${groupEval.scores[index]?.toFixed(2) ?? '-'} / ${item.maxScore.toFixed(2)}`]) : [['- Sin datos de evaluación de grupo -']];
            if (groupEval?.observations) groupBody.push([{ content: 'Observaciones Grupales:', styles: { fontStyle: 'bold' } }, groupEval.observations]);
            autoTable(doc, { startY: lastY + 8, head: [[`Evaluación Grupal (${studentGroup.name})`]], body: groupBody, theme: 'grid', headStyles: { fillColor: [56, 161, 105] }, didDrawPage, margin: { bottom: 20 } });
            lastY = (doc as any).lastAutoTable.finalY;
        }
    }
    
    if (incidents.length > 0) autoTable(doc, { startY: lastY + 8, head: [['Incidencias Registradas (Historial Completo)']], body: incidents, theme: 'striped', headStyles: { fillColor: [221, 107, 32] }, didDrawPage, margin: { bottom: 20 } });
};

export const generateDetailedStudentServiceReportPDF = (viewModel: ReportViewModel, studentId: string) => {
    const student = viewModel.students.find(s => s.id === studentId);
    if (!student) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    _drawDetailedStudentReportPage(doc, viewModel, studentId);
    doc.save(`Informe_${viewModel.service.name.replace(/ /g, '_')}_${student.apellido1}.pdf`);
};

export const generateAllDetailedStudentReportsPDF = (viewModel: ReportViewModel) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    viewModel.participatingStudents.forEach((student, index) => {
        if (index > 0) doc.addPage();
        _drawDetailedStudentReportPage(doc, viewModel, student.id);
    });
    doc.save(`Informes_Alumnos_${viewModel.service.name.replace(/ /g, '_')}.pdf`);
};

export const generateEntryExitSheetPDF = (students: Student[], teacherData: TeacherData, instituteData: InstituteData) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const didDrawPage = (data: any) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        addImageToPdf(doc, teacherData.logo, pageWidth - PAGE_MARGIN - 15, 10, 15, 15);
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(40).text('Hoja de Registro de Entradas y Salidas', pageWidth / 2, 18, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };
    const head = [['#', 'Alumno', 'Fecha', 'Tipo (E/S)', 'Motivo / Observaciones']];
    const body = [...students].sort((a, b) => a.apellido1.localeCompare(b.apellido1)).map((student, index) => [index + 1, `${student.apellido1} ${student.apellido2}, ${student.nombre}`, '', '', '']);
    autoTable(doc, { head, body, startY: 32, margin: { top: 35, bottom: 20 }, headStyles: { fillColor: [74, 85, 104] }, didDrawPage, styles: { cellPadding: 3, minCellHeight: 12 }, columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 }, 2: { cellWidth: 25 }, 3: { cellWidth: 20 }, 4: { cellWidth: 'auto' } } });
    doc.save(`Hoja_Registro_Entradas_Salidas.pdf`);
};

// --- NEW: Analytical Evaluation Report ---
export const generateAnalyticalEvaluationReportPDF = (viewModel: ReportViewModel) => {
    const { service, evaluation, groupedStudentsInService, participatingStudents, teacherData, instituteData, entryExitRecords } = viewModel;
    const doc = new jsPDF('l', 'mm', 'a4');
    let lastY = 0;

    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(40).text(`Informe Analítico: ${service.name}`, pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100).text(`Fecha del servicio: ${new Date(service.date).toLocaleDateString('es-ES')}`, pageWidth / 2, 24, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };

    // 1. Group Analysis (Only for 'normal' services)
    if (service.type === 'normal') {
        const participatingGroups = groupedStudentsInService.map(g => g.group);
        const groupScores = participatingGroups.map(group => {
            const scores = evaluation.serviceDay.groupScores[group.id]?.scores || [];
            const total = scores.reduce((sum, s) => sum + (s || 0), 0);
            return { group, scores, total };
        }).sort((a, b) => b.total - a.total);

        const criteriaStats = GROUP_EVALUATION_ITEMS.map((item, index) => {
            const scores = groupScores.map(gs => gs.scores[index]).filter(s => s !== null && s !== undefined) as number[];
            return {
                min: scores.length > 0 ? Math.min(...scores) : null,
                max: scores.length > 0 ? Math.max(...scores) : null
            };
        });

        const groupEvalHead = [['Rank', 'Grupo', ...GROUP_EVALUATION_ITEMS.map(i => i.label), 'Total']];
        const groupEvalBody = groupScores.map((gs, rankIndex) => {
            const row: any[] = [rankIndex + 1, gs.group.name];
            gs.scores.forEach((score, scoreIndex) => {
                const stat = criteriaStats[scoreIndex];
                const cell: any = { content: score?.toFixed(2) ?? '-' };
                if (score !== null && stat.min !== null && stat.max !== null) {
                    if (score === stat.max) cell.styles = { fillColor: [229, 245, 229] }; // Light green
                    if (score === stat.min) cell.styles = { fillColor: [254, 226, 226] }; // Light red
                }
                row.push(cell);
            });
            row.push({ content: gs.total.toFixed(2), styles: { fontStyle: 'bold' } });
            return row;
        });

        autoTable(doc, {
            head: groupEvalHead, body: groupEvalBody, startY: 32, margin: { top: 30, bottom: 20 },
            headStyles: { fillColor: [56, 161, 105], fontSize: 8 }, styles: { fontSize: 7, cellPadding: 1.5 },
            didDrawPage
        });
        lastY = (doc as any).lastAutoTable.finalY;
    } else {
         doc.setFontSize(10).setTextColor(100).text('El análisis de rendimiento grupal no aplica para servicios de agrupaciones.', PAGE_MARGIN, 32);
         lastY = 40;
    }


    // 2. Individual Analysis
    const individualPerformances = participatingStudents
        .map(student => {
            const indEval = evaluation.serviceDay.individualScores[student.id];
            if (!indEval || !indEval.attendance) return null;
            const totalScore = (indEval.scores || []).reduce((sum, s) => sum + (s || 0), 0);
            return { student, totalScore };
        })
        .filter(p => p !== null)
        .sort((a, b) => b!.totalScore - a!.totalScore) as { student: Student; totalScore: number }[];

    const topPerformers = individualPerformances.slice(0, 3);
    const needsSupport = individualPerformances.slice(-3).reverse();

    if (individualPerformances.length > 0) {
        const topBody = topPerformers.map((p, i) => [i + 1, `${p.student.apellido1}, ${p.student.nombre}`, p.totalScore.toFixed(2)]);
        autoTable(doc, {
            startY: lastY + 8, head: [['#', 'Top 3 Performers', 'Nota Ind.']], body: topBody,
            headStyles: { fillColor: [49, 130, 206] }, theme: 'striped', didDrawPage, tableWidth: 'wrap'
        });

        const needsSupportBody = needsSupport.map((p, i) => [i + 1, `${p.student.apellido1}, ${p.student.nombre}`, p.totalScore.toFixed(2)]);
        autoTable(doc, {
            startY: lastY + 8, head: [['#', 'Alumnos que Necesitan Apoyo', 'Nota Ind.']], body: needsSupportBody,
            headStyles: { fillColor: [221, 107, 32] }, theme: 'striped', didDrawPage, tableWidth: 'wrap',
            margin: { left: doc.internal.pageSize.getWidth() / 2 }
        });
        lastY = (doc as any).lastAutoTable.finalY;
    }

    // 3. Correlation Analysis
    const preServiceDate = Object.keys(evaluation.preService)[0];
    if (preServiceDate) {
        let uniformWith: number[] = [], uniformWithout: number[] = [];
        let late: number[] = [], onTime: number[] = [];

        individualPerformances.forEach(p => {
            const studentId = p.student.id;
            const preServiceEval = evaluation.preService[preServiceDate]?.individualEvaluations[studentId];
            if (preServiceEval?.hasUniforme) uniformWith.push(p.totalScore); else uniformWithout.push(p.totalScore);

            const isLate = entryExitRecords.some(r => r.studentId === studentId && (r.date === new Date(preServiceDate).toLocaleDateString('es-ES') || r.date === new Date(service.date).toLocaleDateString('es-ES')) && r.type === 'Llegada Tarde');
            if (isLate) late.push(p.totalScore); else onTime.push(p.totalScore);
        });

        const avg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A';

        const correlationBody = [
            ['Uniforme Completo', `${uniformWith.length} alumnos`, avg(uniformWith)],
            ['Uniforme Incompleto', `${uniformWithout.length} alumnos`, avg(uniformWithout)],
            ['Puntuales', `${onTime.length} alumnos`, avg(onTime)],
            ['Llegada Tarde', `${late.length} alumnos`, avg(late)],
        ];

        autoTable(doc, {
            startY: lastY + 10,
            head: [['Análisis de Correlación', 'Nº Alumnos', 'Nota Media Ind.']],
            body: correlationBody,
            headStyles: { fillColor: [107, 114, 128] }, didDrawPage
        });
    }

    doc.save(`Informe_Analitico_${service.name.replace(/ /g, '_')}.pdf`);
};

// --- Student File PDF ---
export const generateStudentFilePDF = (
    student: Student,
    calculatedGrades: StudentCalculatedGrades,
    academicGrades: StudentAcademicGrades | undefined,
    courseGrades: StudentCourseGrades | undefined,
    timelineEvents: TimelineEvent[],
    teacherData: TeacherData,
    instituteData: InstituteData
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    let lastY = 0;

    const fullName = `${student.apellido1} ${student.apellido2}, ${student.nombre}`;
    const finalAverages = calculateStudentPeriodAverages(academicGrades, calculatedGrades);

    const didDrawPage = (data: any) => addFooter(doc, data, teacherData, instituteData);

    // --- Header ---
    addImageToPdf(doc, student.fotoUrl, PAGE_MARGIN, 15, 25, 25);
    doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(40);
    doc.text(fullName, PAGE_MARGIN + 30, 25);
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100);
    doc.text(`NRE: ${student.nre} | Expediente: ${student.expediente} | Grupo: ${student.grupo}`, PAGE_MARGIN + 30, 32);
    doc.setDrawColor(200).line(PAGE_MARGIN, 45, pageWidth - PAGE_MARGIN, 45);
    lastY = 50;

    // --- Chart ---
    doc.setFontSize(12).setFont('helvetica', 'bold').text('Progresión Académica (Módulo Principal)', PAGE_MARGIN, lastY);
    lastY += 2;
    const chartData = [{ name: '1º Trim', value: finalAverages.t1 }, { name: '2º Trim', value: finalAverages.t2 }, { name: '3º Trim', value: finalAverages.t3 }];
    const chartStartY = lastY + 5, chartHeight = 35, chartWidth = contentWidth, barWidth = chartWidth / (chartData.length * 2);
    chartData.forEach((item, index) => {
        const barX = PAGE_MARGIN + (index * (barWidth * 2)) + (barWidth / 2), barValue = item.value ?? 0, barHeight = (barValue / 10) * chartHeight;
        doc.setFillColor(barValue < 5 ? 255 : 173, barValue < 5 ? 99 : 216, barValue < 5 ? 71 : 230);
        doc.rect(barX, chartStartY + chartHeight - barHeight, barWidth, barHeight, 'F');
        doc.setFontSize(9).setTextColor(0).text(item.value?.toFixed(2) ?? 'N/A', barX + barWidth / 2, chartStartY + chartHeight - barHeight - 2, { align: 'center' });
        doc.setFontSize(8).setTextColor(100).text(item.name, barX + barWidth / 2, chartStartY + chartHeight + 4, { align: 'center' });
    });
    lastY = chartStartY + chartHeight + 10;

    // --- Tables ---
    const checkPageBreak = (neededHeight: number) => { if (lastY + neededHeight > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); lastY = 25; } };

    checkPageBreak(40);
    autoTable(doc, { startY: lastY, head: [['Resumen de Calificaciones']], body: [
        ['Media Servicios (T1)', calculatedGrades?.serviceAverages?.t1?.toFixed(2) ?? '-'], ['Media Ex. Práctico (T1)', calculatedGrades?.practicalExams?.t1?.toFixed(2) ?? '-'],
        ['Media Servicios (T2)', calculatedGrades?.serviceAverages?.t2?.toFixed(2) ?? '-'], ['Media Ex. Práctico (T2)', calculatedGrades?.practicalExams?.t2?.toFixed(2) ?? '-'],
        ['Media Servicios (T3)', calculatedGrades?.serviceAverages?.t3?.toFixed(2) ?? '-'], ['Media Ex. Práctico (T3)', calculatedGrades?.practicalExams?.t3?.toFixed(2) ?? '-'],
        ['Media Ex. Práctico (REC)', calculatedGrades?.practicalExams?.rec?.toFixed(2) ?? '-'],
    ], theme: 'striped', headStyles: { fillColor: [74, 85, 104] }, didDrawPage, margin: { bottom: 20 } });
    lastY = (doc as any).lastAutoTable.finalY + 8;

    checkPageBreak(55);
    const mainModuleHead = [['Instrumento', ...ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => p.name)]];
    const mainModuleBody: any[][] = ACADEMIC_EVALUATION_STRUCTURE.periods[0].instruments.map(instrument => {
        const row: (string | number | null)[] = [`${instrument.name} (${instrument.weight * 100}%)`];
        ACADEMIC_EVALUATION_STRUCTURE.periods.forEach(period => {
            let grade: GradeValue | undefined = null;
            if (instrument.type === 'manual') grade = academicGrades?.[period.key]?.manualGrades?.[instrument.key];
            else if (instrument.key === 'servicios') grade = calculatedGrades?.serviceAverages?.[period.key as 't1'|'t2'|'t3'];
            else grade = calculatedGrades?.practicalExams?.[period.key as keyof typeof calculatedGrades.practicalExams];
            row.push(grade?.toFixed(2) ?? '-');
        });
        return row;
    });
    mainModuleBody.push([{ content: 'MEDIA PONDERADA', styles: { fontStyle: 'bold' } }, ...ACADEMIC_EVALUATION_STRUCTURE.periods.map(p => ({ content: finalAverages[p.key as keyof typeof finalAverages]?.toFixed(2) ?? '-', styles: { fontStyle: 'bold' } }))]);
    autoTable(doc, { startY: lastY, head: mainModuleHead, body: mainModuleBody, theme: 'grid', headStyles: { fillColor: [49, 130, 206] }, didDrawPage, margin: { bottom: 20 } });
    lastY = (doc as any).lastAutoTable.finalY + 8;

    checkPageBreak(60);
    const otherModulesHead = [['Módulo', 'T1', 'T2', 'T3', 'REC', 'Media Final']];
    const calculateSimpleAverage = (grades: any): string => { 
        if (!grades) return '-';
        const validGrades = (Object.values(grades) as any[]).map(g => parseFloat(String(g))).filter(g => !isNaN(g)); 
        return validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2) : '-'; 
    };
    const otherModulesBody: any[][] = COURSE_MODULES.map(mod => { const grades = courseGrades?.[mod.name] || {}; return [mod.name, grades.t1 ?? '-', grades.t2 ?? '-', grades.t3 ?? '-', grades.rec ?? '-', { content: calculateSimpleAverage(grades), styles: { fontStyle: 'bold' } }]; });
    autoTable(doc, { startY: lastY, head: otherModulesHead, body: otherModulesBody, theme: 'striped', headStyles: { fillColor: [74, 85, 104] }, didDrawPage, margin: { bottom: 20 } });
    lastY = (doc as any).lastAutoTable.finalY + 8;

    checkPageBreak(50);
    const timelineBody: any[][] = timelineEvents.map(event => [{ content: `${event.date.toLocaleDateString('es-ES')} - ${event.title}`, styles: { fontStyle: 'bold' } }, event.content]);
    if (timelineBody.length > 0) {
        autoTable(doc, { startY: lastY, head: [['Historial y Anotaciones']], body: timelineBody, theme: 'grid', headStyles: { fillColor: [237, 137, 54] }, didDrawPage, margin: { bottom: 20 } });
    }
    
    doc.save(`Ficha_Alumno_${student.apellido1}_${student.nombre}.pdf`);
};

// --- NEW: Full Planning PDF ---

type UTReportData = {
    ut: UnidadTrabajo,
    associatedRAs: {
        ra: ResultadoAprendizaje;
        criterios: {
            criterio: CriterioEvaluacion;
            instrumentos: string[];
        }[];
    }[]
};

const drawUTPage = (doc: jsPDF, utData: UTReportData, teacherData: TeacherData, instituteData: InstituteData) => {
    let lastY = 0;
    const { ut, associatedRAs } = utData;

    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(40).text('Planificación Académica Completa', pageWidth / 2, 16, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };
    
    // UT Title
    autoTable(doc, {
        startY: 25,
        body: [[{ content: ut.nombre, styles: { fontStyle: 'bold', fontSize: 14, halign: 'center' } }]],
        theme: 'plain',
        didDrawPage
    });
    lastY = (doc as any).lastAutoTable.finalY + 5;

    if (associatedRAs.length === 0) {
        doc.setFontSize(10).setTextColor(100).text('Esta unidad de trabajo no tiene criterios de evaluación asociados.', PAGE_MARGIN, lastY);
        return;
    }

    associatedRAs.forEach(raData => {
        if (lastY > doc.internal.pageSize.getHeight() - 50) {
            doc.addPage();
            lastY = 25;
        }

        autoTable(doc, {
            startY: lastY,
            body: [[{ content: raData.ra.nombre, styles: { fontStyle: 'bold', fontSize: 11 } }]],
            theme: 'plain',
            styles: { fillColor: [232, 245, 252], textColor: [26, 115, 232] },
            didDrawPage
        });
        lastY = (doc as any).lastAutoTable.finalY;

        const criteriosBody: any[][] = raData.criterios.map(c => [
            { content: `${c.criterio.ponderacion}%`, styles: { fontStyle: 'bold', cellWidth: 20 } },
            { content: c.criterio.descripcion, styles: { cellWidth: 'auto'} },
            { content: c.instrumentos.map(inst => `• ${inst}`).join('\n'), styles: { cellWidth: 50, fontSize: 8, whiteSpace: 'pre-wrap' } }
        ]);

        autoTable(doc, {
            startY: lastY,
            head: [['Pond. (RA)', 'Criterio de Evaluación', 'Instrumentos/Actividades']],
            body: criteriosBody,
            theme: 'striped',
            headStyles: { fillColor: [74, 85, 104], fontSize: 9 },
            styles: { fontSize: 9, cellPadding: 2, valign: 'middle' },
            didDrawPage
        });
        lastY = (doc as any).lastAutoTable.finalY + 8;
    });
};

export const generateFullPlanningPDF = (
    allUTData: UTReportData[],
    teacherData: TeacherData,
    instituteData: InstituteData
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    allUTData.forEach((utData, index) => {
        if (index > 0) {
            doc.addPage();
        }
        drawUTPage(doc, utData, teacherData, instituteData);
    });

    doc.save(`Planificacion_Academica_Completa.pdf`);
};

export const generateRAPlanningPDF = (
    resultadosAprendizaje: Record<string, ResultadoAprendizaje>,
    criteriosEvaluacion: Record<string, CriterioEvaluacion>,
    unidadesTrabajo: Record<string, UnidadTrabajo>,
    instrumentosEvaluacion: Record<string, InstrumentoEvaluacion>,
    teacherData: TeacherData,
    instituteData: InstituteData
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let isFirstPage = true;

    const didDrawPage = (data: any) => {
        const doc = data.doc;
        const pageWidth = doc.internal.pageSize.getWidth();
        addImageToPdf(doc, instituteData.logo, PAGE_MARGIN, 10, 15, 15);
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(40).text('Planificación por Resultados de Aprendizaje', pageWidth / 2, 16, { align: 'center' });
        addFooter(doc, data, teacherData, instituteData);
    };

    const sortedRAs = Object.values(resultadosAprendizaje).sort((a, b) => a.nombre.localeCompare(b.nombre));

    sortedRAs.forEach((ra, raIndex) => {
        if (raIndex > 0) {
            doc.addPage();
        }
        
        let lastY = 25;

        // RA Title
        autoTable(doc, {
            startY: lastY,
            body: [[{ content: ra.nombre, styles: { fontStyle: 'bold', fontSize: 14, halign: 'center', fillColor: [232, 245, 252], textColor: [26, 115, 232] } }]],
            theme: 'plain',
            didDrawPage: isFirstPage ? didDrawPage : (data) => addFooter(doc, data, teacherData, instituteData),
        });
        isFirstPage = false;
        lastY = (doc as any).lastAutoTable.finalY + 5;

        const criteriosBody: any[][] = [];
        ra.criteriosEvaluacion.forEach(critId => {
            const criterio = criteriosEvaluacion[critId];
            if (!criterio) return;

            const asociationsText: string[] = [];
            (criterio.asociaciones || []).forEach(asoc => {
                const utName = unidadesTrabajo[asoc.utId]?.nombre || 'UT desconocida';
                const activitiesText = (asoc.activityIds || []).map(actId => {
                    for (const inst of Object.values(instrumentosEvaluacion)) {
                        const activity = inst.activities.find(a => a.id === actId);
                        if (activity) {
                            return `${inst.nombre}: ${activity.name}`;
                        }
                    }
                    return 'Actividad desconocida';
                }).join(', ');
                asociationsText.push(`• ${utName}: ${activitiesText || 'Ninguna'}`);
            });

            criteriosBody.push([
                { content: `${criterio.ponderacion}%` },
                { content: criterio.descripcion },
                { content: asociationsText.join('\n') || 'Sin asociaciones' }
            ]);
        });

        if (criteriosBody.length > 0) {
             autoTable(doc, {
                startY: lastY,
                head: [['Pond.', 'Criterio de Evaluación', 'Asociaciones (UT: Instrumento)']],
                body: criteriosBody,
                theme: 'striped',
                headStyles: { fillColor: [74, 85, 104], fontSize: 9 },
                styles: { fontSize: 9, cellPadding: 2, valign: 'middle' },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 60, fontSize: 8, whiteSpace: 'pre-wrap' },
                },
                didDrawPage: (data) => addFooter(doc, data, teacherData, instituteData)
            });
        } else {
             doc.setFontSize(9).setTextColor(100).text('Este RA no tiene criterios de evaluación definidos.', PAGE_MARGIN, lastY);
        }
    });

    doc.save(`Planificacion_por_RA.pdf`);
};