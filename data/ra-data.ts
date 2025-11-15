import { ResultadoAprendizaje } from '../types';

export const resultadosAprendizaje: Record<string, ResultadoAprendizaje> = {
  cocina_basica: {
    id: 'cocina_basica',
    nombre: 'Cocina Básica',
    descripcion: 'Desarrolla habilidades básicas de cocina y manipulación de alimentos',
    ponderacion: 40,
    competencias: [
      'Aplicar técnicas básicas de cocina',
      'Manejar utensilios y equipos de cocina',
      'Mantener principios de higiene alimentaria',
      'Trabajar en equipo en cocina'
    ],
    criteriosEvaluacion: [
      'cocina_001', 'cocina_002', 'cocina_003', 'cocina_004', 'cocina_005'
    ]
  },
  cocina_mediterranea: {
    id: 'cocina_mediterranea',
    nombre: 'Cocina Mediterránea',
    descripcion: 'Domina los fundamentos de la cocina mediterránea tradicional',
    ponderacion: 40,
    competencias: [
      'Preparar platos típicos mediterráneos',
      'Conocer ingredientes y productos locales',
      'Aplicar técnicas de cocina saludable',
      'Gestionar mise en place mediterráneo'
    ],
    criteriosEvaluacion: [
      'med_001', 'med_002', 'med_003', 'med_004', 'med_005', 'med_006'
    ]
  },
  panaderia_pasteleria: {
    id: 'panaderia_pasteleria',
    nombre: 'Panadería y Pastelería',
    descripcion: 'Especialización en productos de panadería y repostería',
    ponderacion: 20,
    competencias: [
      'Elaborar masas y panes artesanales',
      'Preparar postres y repostería fina',
      'Controlar procesos de fermentación',
      'Aplicar técnicas de decoración'
    ],
    criteriosEvaluacion: [
      'pan_001', 'pan_002', 'pan_003', 'pan_004', 'pan_005', 'pan_006'
    ]
  }
};