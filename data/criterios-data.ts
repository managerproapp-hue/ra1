import { CriterioEvaluacion } from '../types';

export const criteriosEvaluacion: Record<string, CriterioEvaluacion> = {
  // Criterios para Cocina Básica
  cocina_001: {
    id: 'cocina_001',
    raId: 'cocina_basica',
    descripcion: 'Prepara correctamente las técnicas básicas de cocción (hervir, freír, hornear)',
    indicadores: [
      'Mantiene temperaturas adecuadas de cocción',
      'Controla tiempos de cocción según el alimento',
      'Logra texturas y puntos de cocción apropiados'
    ],
    ponderacion: 20,
    asociaciones: [
        { id: 'asoc-c1-ut1', utId: 'ut1', activityIds: ['act-5', 'act-6'] }, // P. Diaria 1, Servicios 1
        { id: 'asoc-c1-ut2', utId: 'ut2', activityIds: ['act-7'] } // Ex. Practico 1
    ]
  },
  cocina_002: {
    id: 'cocina_002',
    raId: 'cocina_basica',
    descripcion: 'Maneja con destreza los utensilios y equipos básicos de cocina',
    indicadores: [
      'Identifica y usa correctamente cada utensilio',
      'Mantiene y guarda adecuadamente los equipos',
      'Demuestra eficiencia en el manejo de herramientas'
    ],
    ponderacion: 15,
    asociaciones: []
  },
  cocina_003: {
    id: 'cocina_003',
    raId: 'cocina_basica',
    descripcion: 'Aplica principios de higiene alimentaria en todas las operaciones',
    indicadores: [
      'Mantiene higiene personal adecuada',
      'Manipula alimentos con técnicas seguras',
      'Conserva alimentos según normativas'
    ],
    ponderacion: 25,
    asociaciones: []
  },
  cocina_004: {
    id: 'cocina_004',
    raId: 'cocina_basica',
    descripcion: 'Colabora efectivamente en trabajo de equipo en cocina',
    indicadores: [
      'Se comunica efectivamente con compañeros',
      'Asume responsabilidades en el equipo',
      'Respeta jerarquías y protocolos de cocina'
    ],
    ponderacion: 15,
    asociaciones: []
  },
  cocina_005: {
    id: 'cocina_005',
    raId: 'cocina_basica',
    descripcion: 'Demuestra organización y planificación en sus tareas culinarias',
    indicadores: [
      'Planifica mise en place eficientemente',
      'Gestiona tiempo de trabajo apropiadamente',
      'Mantiene orden y limpieza en su área'
    ],
    ponderacion: 25,
    asociaciones: []
  },
  // Criterios para Cocina Mediterránea
  med_001: {
    id: 'med_001',
    raId: 'cocina_mediterranea',
    descripcion: 'Identifica y selecciona ingredientes típicos mediterráneos',
    indicadores: [
      'Conoce propiedades nutricionales de ingredientes',
      'Selecciona productos de temporada apropiados',
      'Identifica productos locales y regionales'
    ],
    ponderacion: 20,
    asociaciones: []
  },
  med_002: {
    id: 'med_002',
    raId: 'cocina_mediterranea',
    descripcion: 'Elabora platos tradicionales mediterráneos con técnica correcta',
    indicadores: [
      'Reproduce recetas tradicionales autenticas',
      'Aplica técnicas específicas mediterráneas',
      'Conserva sabores y tradiciones culinarias'
    ],
    ponderacion: 25,
    asociaciones: []
  },
  // Criterios para Panadería
  pan_001: {
    id: 'pan_001',
    raId: 'panaderia_pasteleria',
    descripcion: 'Domina el proceso de elaboración de masas panarias',
    indicadores: [
      'Controla proporciones y mezclado de ingredientes',
      'Gestiona procesos de fermentación adecuadamente',
      'Logra texturas y volúmenes apropiados'
    ],
    ponderacion: 30,
    asociaciones: []
  }
};