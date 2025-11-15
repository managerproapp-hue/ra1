import { InstrumentoEvaluacion } from '../types';

export const instrumentosEvaluacion: Record<string, InstrumentoEvaluacion> = {
  examen: {
    id: 'examen',
    nombre: 'Examen',
    descripcion: 'Pruebas teóricas escritas para evaluar conocimientos.',
    pesoTotal: 36,
    activities: [
      { id: 'act-1', name: 'Examen 1', trimester: 't1' },
      { id: 'act-2', name: 'Examen 2', trimester: 't1' },
      { id: 'act-8', name: 'Examen 3', trimester: 't2' },
      { id: 'act-9', name: 'Examen 4', trimester: 't2' },
    ]
  },
  fichas: {
    id: 'fichas',
    nombre: 'Fichas',
    descripcion: 'Recopilación de fichas técnicas o de trabajo.',
    pesoTotal: 2,
    activities: [
      { id: 'act-3', name: 'Fichas 1', trimester: 't1' },
      { id: 'act-10', name: 'Fichas 2', trimester: 't2' },
    ]
  },
  trabajos: {
    id: 'trabajos',
    nombre: 'Trabajos',
    descripcion: 'Trabajos de investigación o proyectos asignados.',
    pesoTotal: 2,
    activities: [
        { id: 'act-4', name: 'Trabajos 1', trimester: 't1' },
        { id: 'act-11', name: 'Trabajos 2', trimester: 't2' },
    ]
  },
  practica_diaria: {
    id: 'practica_diaria',
    nombre: 'P. Diaria',
    descripcion: 'Evaluación continua de la participación y trabajo diario en el aula.',
    pesoTotal: 30,
    activities: [
        { id: 'act-5', name: 'P. Diaria 1', trimester: 't1' },
        { id: 'act-12', name: 'P. Diaria 2', trimester: 't2' },
    ]
  },
  servicios: {
    id: 'servicios',
    nombre: 'Servicios',
    descripcion: 'Evaluación del desempeño durante los servicios prácticos de restaurante.',
    pesoTotal: 12,
    activities: [
        { id: 'act-6', name: 'Servicios 1', trimester: 't1' },
        { id: 'act-13', name: 'Servicios 2', trimester: 't2' },
    ]
  },
  ex_practico: {
    id: 'ex_practico',
    nombre: 'Ex. Practico',
    descripcion: 'Exámenes prácticos de elaboración y técnicas culinarias.',
    pesoTotal: 18,
    activities: [
        { id: 'act-7', name: 'Ex. Practico 1', trimester: 't1' },
        { id: 'act-14', name: 'Ex. Practico 2', trimester: 't2' },
    ]
  }
};
