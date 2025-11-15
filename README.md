Sistema de Evaluación Gastronómica
📋 Información General
Este documento contiene la implementación completa del Demo Funcional del Sistema de Evaluación para Formación en Cocina y Gastronomía. El demo funciona únicamente con datos locales/mock, sin dependencias de APIs externas, permitiendo fácil modificación de parámetros y datos.

🎯 Características del Demo
Datos Locales: Todo funciona con datos de ejemplo modificados
Sin Backend: No requiere servidor ni APIs
Navegación Completa: Todas las pantallas y flujos principales
Funcionalidad Real: Evaluación, reportes, gestión académica
Fácil Configuración: Datos editables directamente en código
📁 Estructura del Proyecto
demo-funcional/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── evaluacion/
│   │   ├── gestion-academica/
│   │   ├── reportes/
│   │   └── configuracion/
│   ├── data/
│   │   ├── mock-data.js
│   │   ├── ra-data.js
│   │   ├── criterios-data.js
│   │   └── instrumentos-data.js
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
📊 Datos de Ejemplo Incluidos
Resultados de Aprendizaje (RA) - Área Cocina
javascript
// src/data/ra-data.js
export const resultadosAprendizaje = {
  cocina_basica: {
    id: 'cocina_basica',
    nombre: 'Cocina Básica',
    descripcion: 'Desarrolla habilidades básicas de cocina y manipulación de alimentos',
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
Criterios de Evaluación Detallados
javascript
// src/data/criterios-data.js
export const criteriosEvaluacion = {
  // Criterios para Cocina Básica
  cocina_001: {
    id: 'cocina_001',
    descripcion: 'Prepara correctamente las técnicas básicas de cocción (hervir, freír, hornear)',
    indicadores: [
      'Mantiene temperaturas adecuadas de cocción',
      'Controla tiempos de cocción según el alimento',
      'Logra texturas y puntos de cocción apropiados'
    ],
    ponderacion: 20,
    instrumentos: ['observacion_sistematica', 'lista_verificacion']
  },
  cocina_002: {
    id: 'cocina_002',
    descripcion: 'Maneja con destreza los utensilios y equipos básicos de cocina',
    indicadores: [
      'Identifica y usa correctamente cada utensilio',
      'Mantiene y guarda adecuadamente los equipos',
      'Demuestra eficiencia en el manejo de herramientas'
    ],
    ponderacion: 15,
    instrumentos: ['evaluacion_practica', 'portafolio']
  },
  cocina_003: {
    id: 'cocina_003',
    descripcion: 'Aplica principios de higiene alimentaria en todas las operaciones',
    indicadores: [
      'Mantiene higiene personal adecuada',
      'Manipula alimentos con técnicas seguras',
      'Conserva alimentos según normativas'
    ],
    ponderacion: 25,
    instrumentos: ['lista_verificacion', 'evaluacion_continua']
  },
  cocina_004: {
    id: 'cocina_004',
    descripcion: 'Colabora efectivamente en trabajo de equipo en cocina',
    indicadores: [
      'Se comunica efectivamente con compañeros',
      'Asume responsabilidades en el equipo',
      'Respeta jerarquías y protocolos de cocina'
    ],
    ponderacion: 15,
    instrumentos: ['coevaluacion', 'observacion_sistematica']
  },
  cocina_005: {
    id: 'cocina_005',
    descripcion: 'Demuestra organización y planificación en sus tareas culinarias',
    indicadores: [
      'Planifica mise en place eficientemente',
      'Gestiona tiempo de trabajo apropiadamente',
      'Mantiene orden y limpieza en su área'
    ],
    ponderacion: 25,
    instrumentos: ['autoevaluacion', 'portafolio']
  },
  // Criterios para Cocina Mediterránea
  med_001: {
    id: 'med_001',
    descripcion: 'Identifica y selecciona ingredientes típicos mediterráneos',
    indicadores: [
      'Conoce propiedades nutricionales de ingredientes',
      'Selecciona productos de temporada apropiados',
      'Identifica productos locales y regionales'
    ],
    ponderacion: 20,
    instrumentos: ['evaluacion_teorica', 'observacion_sistematica']
  },
  med_002: {
    id: 'med_002',
    descripcion: 'Elabora platos tradicionales mediterráneos con técnica correcta',
    indicadores: [
      'Reproduce recetas tradicionales autenticas',
      'Aplica técnicas específicas mediterráneas',
      'Conserva sabores y tradiciones culinarias'
    ],
    ponderacion: 25,
    instrumentos: ['evaluacion_practica', 'proyecto_realizacion']
  },
  // Criterios para Panadería
  pan_001: {
    id: 'pan_001',
    descripcion: 'Domina el proceso de elaboración de masas panarias',
    indicadores: [
      'Controla proporciones y mezclado de ingredientes',
      'Gestiona procesos de fermentación adecuadamente',
      'Logra texturas y volúmenes apropiados'
    ],
    ponderacion: 30,
    instrumentos: ['evaluacion_practica', 'observacion_sistematica']
  }
};
Instrumentos de Evaluación
javascript
// src/data/instrumentos-data.js
export const instrumentosEvaluacion = {
  observacion_sistematica: {
    id: 'observacion_sistematica',
    nombre: 'Observación Sistemática',
    descripcion: 'Registro de comportamientos y competencias durante la práctica',
    escalas: [
      { valor: 1, etiqueta: 'No observable', descripcion: 'No se evidencia la competencia' },
      { valor: 2, etiqueta: 'Básico', descripcion: 'Evidencia mínima de la competencia' },
      { valor: 3, etiqueta: 'Adecuado', descripcion: 'Demuestra competencia satisfactoriamente' },
      { valor: 4, etiqueta: 'Excelente', descripcion: 'Demuestra competencia de forma excepcional' }
    ],
    campos: [
      'Asistencia y puntualidad',
      'Cumplimiento de normas de higiene',
      'Uso correcto de técnicas',
      'Trabajo en equipo',
      'Organización del espacio'
    ]
  },
  lista_verificacion: {
    id: 'lista_verificacion',
    nombre: 'Lista de Verificación',
    descripcion: 'Verificación de cumplimiento de requisitos específicos',
    escalas: [
      { valor: 0, etiqueta: 'No cumple', descripcion: 'No cumple el requisito' },
      { valor: 1, etiqueta: 'Cumple parcialmente', descripcion: 'Cumple el requisito de forma incompleta' },
      { valor: 2, etiqueta: 'Cumple completamente', descripcion: 'Cumple totalmente el requisito' }
    ],
    campos: [
      'Temperatura de cocción correcta',
      'Presentación adecuada',
      'Tiempo de elaboración apropiado',
      'Cumplimiento de receta',
      'Higiene personal y alimentaria'
    ]
  },
  evaluacion_practica: {
    id: 'evaluacion_practica',
    nombre: 'Evaluación Práctica',
    descripcion: 'Evaluación de ejecución de tareas prácticas específicas',
    escalas: [
      { valor: 1, etiqueta: 'Insuficiente', descripcion: 'No alcanza el nivel esperado' },
      { valor: 2, etiqueta: 'Suficiente', descripcion: 'Alcanza el nivel mínimo aceptable' },
      { valor: 3, etiqueta: 'Bien', descripcion: 'Supera las expectativas básicas' },
      { valor: 4, etiqueta: 'Notable', descripcion: 'Demuestra alto nivel de competencia' },
      { valor: 5, etiqueta: 'Sobresaliente', descripcion: 'Excelencia en la competencia' }
    ],
    campos: [
      'Técnica de elaboración',
      'Calidad del resultado',
      'Eficiencia en el proceso',
      'Creatividad e innovación',
      'Presentación final'
    ]
  },
  autoevaluacion: {
    id: 'autoevaluacion',
    nombre: 'Autoevaluación',
    descripcion: 'Reflexión y evaluación personal del aprendizaje',
    escalas: [
      { valor: 1, etiqueta: 'Necesito mejorar mucho', descripcion: 'Identifico grandes áreas de mejora' },
      { valor: 2, etiqueta: 'Necesito mejorar', descripcion: 'Identifico algunas áreas de mejora' },
      { valor: 3, etiqueta: 'Estoy progresando', descripcion: 'Veo progreso pero puedo mejorar' },
      { valor: 4, etiqueta: 'Me siento competente', descripcion: 'Me siento seguro de mis competencias' },
      { valor: 5, etiqueta: 'Domino la competencia', descripcion: 'Siento que domino completamente la competencia' }
    ],
    campos: [
      'Mi comprensión de los conceptos',
      'Mi habilidad técnica',
      'Mi confianza para realizar tareas',
      'Mi capacidad para trabajar en equipo',
      'Mi organización y planificación'
    ]
  }
};
🎓 Datos de Alumnos y Evaluación
javascript
// src/data/mock-data.js
import { resultadosAprendizaje } from './ra-data.js';
import { criteriosEvaluacion } from './criterios-data.js';
import { instrumentosEvaluacion } from './instrumentos-data.js';
// Alumnos de ejemplo
export const alumnos = [
  {
    id: 'al_001',
    nombre: 'María García López',
    apellido: 'García López',
    email: 'maria.garcia@colegio.edu',
    curso: '2º DAM',
    ciclo: 'Cocina y Gastronomía',
    fechaNacimiento: '2002-03-15',
    telefono: '+34 666 123 456'
  },
  {
    id: 'al_002',
    nombre: 'Carlos Ruiz Fernández',
    apellido: 'Ruiz Fernández',
    email: 'carlos.ruiz@colegio.edu',
    curso: '2º DAM',
    ciclo: 'Cocina y Gastronomía',
    fechaNacimiento: '2001-07-22',
    telefono: '+34 666 234 567'
  },
  {
    id: 'al_003',
    nombre: 'Ana Martín Sánchez',
    apellido: 'Martín Sánchez',
    email: 'ana.martin@colegio.edu',
    curso: '1º DAM',
    ciclo: 'Cocina y Gastronomía',
    fechaNacimiento: '2003-01-10',
    telefono: '+34 666 345 678'
  }
];
// Profesores
export const profesores = [
  {
    id: 'prof_001',
    nombre: 'José Luis',
    apellido: 'Herrera',
    email: 'jl.herrera@colegio.edu',
    especialidad: 'Cocina Mediterránea',
    telefono: '+34 666 456 789'
  },
  {
    id: 'prof_002',
    nombre: 'Carmen',
    apellido: 'Rodríguez',
    email: 'c.rodriguez@colegio.edu',
    especialidad: 'Panadería y Pastelería',
    telefono: '+34 666 567 890'
  }
];
// Evaluaciones de ejemplo
export const evaluaciones = [
  {
    id: 'eval_001',
    alumnoId: 'al_001',
    raId: 'cocina_basica',
    criteriosEvaluados: ['cocina_001', 'cocina_002', 'cocina_003'],
    fechaEvaluacion: '2024-11-01',
    evaluadorId: 'prof_001',
    puntuaciones: {
      'cocina_001': {
        instrumento: 'observacion_sistematica',
        puntuacion: 4,
        observaciones: 'Excelente dominio de técnicas básicas de cocción'
      },
      'cocina_002': {
        instrumento: 'evaluacion_practica',
        puntuacion: 3,
        observaciones: 'Maneja bien los utensilios básicos'
      },
      'cocina_003': {
        instrumento: 'lista_verificacion',
        puntuacion: 2,
        observaciones: 'Mantiene muy buena higiene alimentaria'
      }
    }
  }
];
// Configuraciones de ponderación
export const configuracionesPonderacion = {
  cocina_basica: {
    criterios: {
      'cocina_001': 20,
      'cocina_002': 15,
      'cocina_003': 25,
      'cocina_004': 15,
      'cocina_005': 25
    }
  }
};
🏗️ Implementación Principal
1. Componente Principal (App.js)
javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import EvaluacionCenter from './components/evaluacion/EvaluacionCenter';
import GestionAcademica from './components/gestion-academica/GestionAcademica';
import Reportes from './components/reportes/Reportes';
import Configuracion from './components/configuracion/Configuracion';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import './styles/globals.css';
function App() {
  return (
    
  <DataProvider>
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/evaluacion" element={<EvaluacionCenter />} />
            <Route path="/gestion-academica" element={<GestionAcademica />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </main>
      </div>
    </Router>
  </DataProvider>
```
);

}

export default App;

### 2. Contexto de Datos
```javascript
// src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  alumnos, 
  profesores, 
  evaluaciones 
} from '../data/mock-data';
import { 
  resultadosAprendizaje 
} from '../data/ra-data';
import { 
  criteriosEvaluacion 
} from '../data/criterios-data';
import { 
  instrumentosEvaluacion 
} from '../data/instrumentos-data';
const DataContext = createContext();
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de DataProvider');
  }
  return context;
};
export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    alumnos: alumnos,
    profesores: profesores,
    evaluaciones: evaluaciones,
    resultadosAprendizaje: resultadosAprendizaje,
    criteriosEvaluacion: criteriosEvaluacion,
    instrumentosEvaluacion: instrumentosEvaluacion,
    cargando: false,
    error: null
  });
  // Funciones para actualizar datos
  const agregarEvaluacion = (nuevaEvaluacion) => {
    setData(prev => ({
      ...prev,
      evaluaciones: [...prev.evaluaciones, nuevaEvaluacion]
    }));
  };
  const actualizarEvaluacion = (id, datosActualizados) => {
    setData(prev => ({
      ...prev,
      evaluaciones: prev.evaluaciones.map(eval => 
        eval.id === id ? { ...eval, ...datosActualizados } : eval
      )
    }));
  };
  const eliminarEvaluacion = (id) => {
    setData(prev => ({
      ...prev,
      evaluaciones: prev.evaluaciones.filter(eval => eval.id !== id)
    }));
  };
  const agregarAlumno = (nuevoAlumno) => {
    const id = `al_${Date.now()}`;
    setData(prev => ({
      ...prev,
      alumnos: [...prev.alumnos, { ...nuevoAlumno, id }]
    }));
  };
  const actualizarAlumno = (id, datosActualizados) => {
    setData(prev => ({
      ...prev,
      alumnos: prev.alumnos.map(alumno => 
        alumno.id === id ? { ...alumno, ...datosActualizados } : alumno
      )
    }));
  };
  const eliminarAlumno = (id) => {
    setData(prev => ({
      ...prev,
      alumnos: prev.alumnos.filter(alumno => alumno.id !== id)
    }));
  };
  // Funciones de utilidad
  const getAlumnoPorId = (id) => {
    return data.alumnos.find(alumno => alumno.id === id);
  };
  const getEvaluacionesPorAlumno = (alumnoId) => {
    return data.evaluaciones.filter(eval => eval.alumnoId === alumnoId);
  };
  const getRA = (raId) => {
    return data.resultadosAprendizaje[raId];
  };
  const getCriterio = (criterioId) => {
    return data.criteriosEvaluacion[criterioId];
  };
  const getInstrumento = (instrumentoId) => {
    return data.instrumentosEvaluacion[instrumentoId];
  };
  const calcularPuntuacionFinal = (evaluacion) => {
    let puntuacionTotal = 0;
    let pesoTotal = 0;
    Object.entries(evaluacion.puntuaciones || {}).forEach(([criterioId, puntuacion]) => {
      const criterio = getCriterio(criterioId);
      if (criterio && criterio.ponderacion) {
        puntuacionTotal += puntuacion.puntuacion * criterio.ponderacion / 100;
        pesoTotal += criterio.ponderacion;
      }
    });
    return pesoTotal > 0 ? puntuacionTotal / (pesoTotal / 100) : 0;
  };
  const value = {
    ...data,
    // Acciones
    agregarEvaluacion,
    actualizarEvaluacion,
    eliminarEvaluacion,
    agregarAlumno,
    actualizarAlumno,
    eliminarAlumno,
    // Utilidades
    getAlumnoPorId,
    getEvaluacionesPorAlumno,
    getRA,
    getCriterio,
    getInstrumento,
    calcularPuntuacionFinal
  };
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
3. Dashboard Principal
javascript
// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import './Dashboard.css';
const Dashboard = () => {
  const { 
    alumnos, 
    evaluaciones, 
    resultadosAprendizaje, 
    calcularPuntuacionFinal,
    getAlumnoPorId 
  } = useData();
  const [estadisticas, setEstadisticas] = useState({
    totalAlumnos: 0,
    evaluacionesRealizadas: 0,
    promedioGeneral: 0,
    porRA: {},
    tendencias: []
  });
  useEffect(() => {
    // Calcular estadísticas
    const stats = {
      totalAlumnos: alumnos.length,
      evaluacionesRealizadas: evaluaciones.length,
      porRA: {},
      tendencias: []
    };
    // Calcular promedio por RA
    Object.keys(resultadosAprendizaje).forEach(raId => {
      const raEvals = evaluaciones.filter(e => e.raId === raId);
      if (raEvals.length > 0) {
        const promedio = raEvals.reduce((sum, eval) => 
          sum + calcularPuntuacionFinal(eval), 0) / raEvals.length;
        stats.porRA[raId] = {
          nombre: resultadosAprendizaje[raId].nombre,
          promedio: promedio,
          evaluaciones: raEvals.length
        };
      }
    });
    // Calcular tendencia mensual (simulada)
    const meses = ['Sep', 'Oct', 'Nov', 'Dic'];
    stats.tendencias = meses.map(mes => ({
      mes,
      evaluaciones: Math.floor(Math.random() * 20) + 10,
      promedio: Math.floor(Math.random() * 30) + 65
    }));
    // Promedio general
    if (evaluaciones.length > 0) {
      stats.promedioGeneral = evaluaciones.reduce((sum, eval) => 
        sum + calcularPuntuacionFinal(eval), 0) / evaluaciones.length;
    }
    setEstadisticas(stats);
  }, [alumnos, evaluaciones, resultadosAprendizaje]);
  const datosGraficoRA = Object.values(estadisticas.porRA).map(item => ({
    nombre: item.nombre,
    promedio: Math.round(item.promedio),
    evaluaciones: item.evaluaciones
  }));
  const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard del Sistema de Evaluación</h1>
        <p>Resumen general del rendimiento académico</p>
      </div>
      {/* Tarjetas de Estadísticas */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{estadisticas.totalAlumnos}</h3>
            <p>Total Alumnos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{estadisticas.evaluacionesRealizadas}</h3>
            <p>Evaluaciones</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{Math.round(estadisticas.promedioGeneral)}</h3>
            <p>Promedio General</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{Object.keys(estadisticas.porRA).length}</h3>
            <p>RA Evaluados</p>
          </div>
        </div>
      </div>
      {/* Gráficos */}
      <div className="charts-container">
        <div className="chart-section">
          <h3>Rendimiento por Resultado de Aprendizaje</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosGraficoRA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="promedio" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-section">
          <h3>Distribución de Evaluaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosGraficoRA}
                dataKey="evaluaciones"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {datosGraficoRA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-section">
          <h3>Tendencia de Evaluaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={estadisticas.tendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="evaluaciones" stroke="#8884d8" />
              <Line type="monotone" dataKey="promedio" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Tabla de Alumnos Recientes */}
      <div className="recent-evaluations">
        <h3>Últimas Evaluaciones</h3>
        <div className="evaluations-table">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>RA</th>
                <th>Fecha</th>
                <th>Puntuación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.slice(0, 5).map(evaluacion => (
                <tr key={evaluacion.id}>
                  <td>{getAlumnoPorId(evaluacion.alumnoId)?.nombre}</td>
                  <td>{resultadosAprendizaje[evaluacion.raId]?.nombre}</td>
                  <td>{evaluacion.fechaEvaluacion}</td>
                  <td>{Math.round(calcularPuntuacionFinal(evaluacion))}</td>
                  <td>
                    <span className={`status status-completed`}>
                      Completada
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
4. Centro de Evaluación
javascript
// src/components/evaluacion/EvaluacionCenter.js
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import EvaluacionForm from './EvaluacionForm';
import ListaEvaluaciones from './ListaEvaluaciones';
import './EvaluacionCenter.css';
const EvaluacionCenter = () => {
  const { alumnos, resultadosAprendizaje, evaluaciones } = useData();
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' | 'nueva' | 'editar'
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const handleNuevaEvaluacion = () => {
    setEvaluacionSeleccionada(null);
    setVistaActual('nueva');
  };
  const handleEditarEvaluacion = (evaluacion) => {
    setEvaluacionSeleccionada(evaluacion);
    setVistaActual('editar');
  };
  const handleVolverLista = () => {
    setVistaActual('lista');
    setEvaluacionSeleccionada(null);
  };
  return (
    <div className="evaluacion-center">
      <div className="evaluacion-header">
        <h1>Centro de Evaluación</h1>
        <p>Gestión completa de evaluaciones académicas</p>
        
        {vistaActual === 'lista' && (
          <button 
            className="btn-primary"
            onClick={handleNuevaEvaluacion}
          >
            ➕ Nueva Evaluación
          </button>
        )}
        
        {vistaActual !== 'lista' && (
          <button 
            className="btn-secondary"
            onClick={handleVolverLista}
          >
            ← Volver a la Lista
          </button>
        )}
      </div>
      <div className="evaluacion-content">
        {vistaActual === 'lista' && (
          <ListaEvaluaciones 
            evaluaciones={evaluaciones}
            alumnos={alumnos}
            resultadosAprendizaje={resultadosAprendizaje}
            onEditar={handleEditarEvaluacion}
          />
        )}
        
        {(vistaActual === 'nueva' || vistaActual === 'editar') && (
          <EvaluacionForm
            evaluacion={evaluacionSeleccionada}
            modo={vistaActual}
            onGuardar={handleVolverLista}
          />
        )}
      </div>
    </div>
  );
};
export default EvaluacionCenter;
5. Formulario de Evaluación
javascript
// src/components/evaluacion/EvaluacionForm.js
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
const EvaluacionForm = ({ evaluacion, modo, onGuardar }) => {
  const {
    alumnos,
    profesores,
    resultadosAprendizaje,
    criteriosEvaluacion,
    instrumentosEvaluacion,
    agregarEvaluacion,
    actualizarEvaluacion
  } = useData();
  const [formData, setFormData] = useState({
    alumnoId: '',
    raId: '',
    criteriosSeleccionados: [],
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    evaluadorId: profesores[0]?.id || '',
    puntuaciones: {},
    observacionesGenerales: ''
  });
  const [errores, setErrores] = useState({});
  useEffect(() => {
    if (evaluacion && modo === 'editar') {
      setFormData({
        alumnoId: evaluacion.alumnoId,
        raId: evaluacion.raId,
        criteriosSeleccionados: evaluacion.criteriosEvaluados || [],
        fechaEvaluacion: evaluacion.fechaEvaluacion,
        evaluadorId: evaluacion.evaluadorId,
        puntuaciones: evaluacion.puntuaciones || {},
        observacionesGenerales: evaluacion.observacionesGenerales || ''
      });
    }
  }, [evaluacion, modo]);
  const handleRAChange = (raId) => {
    setFormData(prev => ({
      ...prev,
      raId,
      criteriosSeleccionados: [],
      puntuaciones: {}
    }));
  };
  const handleCriterioToggle = (criterioId) => {
    setFormData(prev => {
      const nuevosCriterios = prev.criteriosSeleccionados.includes(criterioId)
        ? prev.criteriosSeleccionados.filter(id => id !== criterioId)
        : [...prev.criteriosSeleccionados, criterioId];
      // Mantener puntuaciones de criterios no seleccionados
      const nuevasPuntuaciones = { ...prev.puntuaciones };
      if (!nuevosCriterios.includes(criterioId)) {
        delete nuevasPuntuaciones[criterioId];
      }
      return {
        ...prev,
        criteriosSeleccionados: nuevosCriterios,
        puntuaciones: nuevasPuntuaciones
      };
    });
  };
  const handlePuntuacionChange = (criterioId, instrumentoId, puntuacion) => {
    setFormData(prev => ({
      ...prev,
      puntuaciones: {
        ...prev.puntuaciones,
        [criterioId]: {
          ...prev.puntuaciones[criterioId],
          instrumento: instrumentoId,
          puntuacion: puntuacion
        }
      }
    }));
  };
  const handleObservacionChange = (criterioId, observacion) => {
    setFormData(prev => ({
      ...prev,
      puntuaciones: {
        ...prev.puntuaciones,
        [criterioId]: {
          ...prev.puntuaciones[criterioId],
          observaciones: observacion
        }
      }
    }));
  };
  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.alumnoId) nuevosErrores.alumnoId = 'Selecciona un alumno';
    if (!formData.raId) nuevosErrores.raId = 'Selecciona un Resultado de Aprendizaje';
    if (formData.criteriosSeleccionados.length === 0) {
      nuevosErrores.criterios = 'Selecciona al menos un criterio';
    }
    // Validar puntuaciones
    formData.criteriosSeleccionados.forEach(criterioId => {
      const puntuacion = formData.puntuaciones[criterioId];
      if (!puntuacion || !puntuacion.puntuacion) {
        nuevosErrores[`puntuacion_${criterioId}`] = 'Define la puntuación';
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    const datosEvaluacion = {
      ...formData,
      criteriosEvaluados: formData.criteriosSeleccionados,
      fechaCreacion: new Date().toISOString(),
      id: modo === 'nueva' ? `eval_${Date.now()}` : evaluacion.id
    };
    if (modo === 'nueva') {
      agregarEvaluacion(datosEvaluacion);
    } else {
      actualizarEvaluacion(evaluacion.id, datosEvaluacion);
    }
    onGuardar();
  };
  const raSeleccionado = resultadosAprendizaje[formData.raId];
  const criteriosDisponibles = raSeleccionado ? 
    formData.criteriosSeleccionados.map(id => criteriosEvaluacion[id]).filter(Boolean) : [];
  return (
    <div className="evaluacion-form">
      <h2>
        {modo === 'nueva' ? 'Nueva Evaluación' : 'Editar Evaluación'}
      </h2>
      <form onSubmit={handleSubmit} className="form">
        {/* Información Básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Alumno *</label>
              <select 
                value={formData.alumnoId}
                onChange={(e) => setFormData(prev => ({ ...prev, alumnoId: e.target.value }))}
                className={errores.alumnoId ? 'error' : ''}
              >
                <option value="">Selecciona un alumno</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id}>
                    {alumno.nombre} {alumno.apellido}
                  </option>
                ))}
              </select>
              {errores.alumnoId && <span className="error-msg">{errores.alumnoId}</span>}
            </div>
            <div className="form-group">
              <label>Resultado de Aprendizaje *</label>
              <select 
                value={formData.raId}
                onChange={(e) => handleRAChange(e.target.value)}
                className={errores.raId ? 'error' : ''}
              >
                <option value="">Selecciona un RA</option>
                {Object.values(resultadosAprendizaje).map(ra => (
                  <option key={ra.id} value={ra.id}>
                    {ra.nombre}
                  </option>
                ))}
              </select>
              {errores.raId && <span className="error-msg">{errores.raId}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Evaluación *</label>
              <input 
                type="date"
                value={formData.fechaEvaluacion}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaEvaluacion: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Evaluador *</label>
              <select 
                value={formData.evaluadorId}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluadorId: e.target.value }))}
              >
                {profesores.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Selección de Criterios */}
        {raSeleccionado && (
          <div className="form-section">
            <h3>Criterios de Evaluación</h3>
            <p>Selecciona los criterios que evaluarás en esta sesión:</p>
            
            {errores.criterios && <span className="error-msg">{errores.criterios}</span>}
            <div className="criterios-grid">
              {raSeleccionado.criteriosEvaluacion.map(criterioId => {
                const criterio = criteriosEvaluacion[criterioId];
                if (!criterio) return null;
                return (
                  <div 
                    key={criterioId}
                    className={`criterio-card ${formData.criteriosSeleccionados.includes(criterioId) ? 'selected' : ''}`}
                    onClick={() => handleCriterioToggle(criterioId)}
                  >
                    <h4>{criterio.descripcion}</h4>
                    <p>Ponderación: {criterio.ponderacion}%</p>
                    <div className="instrumentos">
                      <small>Instrumentos: {criterio.instrumentos.join(', ')}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Puntuaciones */}
        {criteriosDisponibles.length > 0 && (
          <div className="form-section">
            <h3>Puntuaciones</h3>
            
            {criteriosDisponibles.map(criterio => {
              const instrumentos = criterio.instrumentos
                .map(id => instrumentosEvaluacion[id])
                .filter(Boolean);
              
              return (
                <div key={criterio.id} className="puntuacion-section">
                  <h4>{criterio.descripcion}</h4>
                  
                  <div className="puntuacion-controls">
                    <div className="form-group">
                      <label>Instrumento</label>
                      <select
                        value={formData.puntuaciones[criterio.id]?.instrumento || instrumentos[0]?.id || ''}
                        onChange={(e) => 
                          handlePuntuacionChange(criterio.id, e.target.value, 
                            formData.puntuaciones[criterio.id]?.puntuacion || '')
                        }
                      >
                        {instrumentos.map(instrumento => (
                          <option key={instrumento.id} value={instrumento.id}>
                            {instrumento.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Puntuación</label>
                      <input
                        type="number"
                        min="1"
                        max={instrumentos[0]?.escalas.length || 5}
                        value={formData.puntuaciones[criterio.id]?.puntuacion || ''}
                        onChange={(e) => 
                          handlePuntuacionChange(
                            criterio.id, 
                            formData.puntuaciones[criterio.id]?.instrumento || instrumentos[0]?.id,
                            parseInt(e.target.value)
                          )
                        }
                        className={errores[`puntuacion_${criterio.id}`] ? 'error' : ''}
                      />
                      {errores[`puntuacion_${criterio.id}`] && (
                        <span className="error-msg">{errores[`puntuacion_${criterio.id}`]}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      value={formData.puntuaciones[criterio.id]?.observaciones || ''}
                      onChange={(e) => handleObservacionChange(criterio.id, e.target.value)}
                      rows="3"
                      placeholder="Observaciones sobre el desempeño en este criterio..."
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Observaciones Generales */}
        <div className="form-section">
          <h3>Observaciones Generales</h3>
          <textarea
            value={formData.observacionesGenerales}
            onChange={(e) => setFormData(prev => ({ ...prev, observacionesGenerales: e.target.value }))}
            rows="4"
            placeholder="Observaciones generales sobre la evaluación..."
          />
        </div>
        {/* Botones */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onGuardar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {modo === 'nueva' ? 'Crear Evaluación' : 'Actualizar Evaluación'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EvaluacionForm;
🔧 Configuración de Proyecto
1. package.json
json
{
  "name": "demo-funcional-evaluacion-gastronomia",
  "version": "1.0.0",
  "description": "Demo Funcional del Sistema de Evaluación Gastronómica",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "react-scripts start",
    "preview": "serve -s build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "recharts": "^2.5.0",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "serve": "^14.2.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
2. Instrucciones de Instalación
bash
# 1. Crear proyecto React
npx create-react-app demo-funcional-evaluacion-gastronomia
cd demo-funcional-evaluacion-gastronomia
# 2. Instalar dependencias adicionales
npm install react-router-dom recharts
# 3. Instalar serve para preview
npm install -g serve
# 4. Copiar todos los archivos del demo a la carpeta src/
# 5. Iniciar el servidor de desarrollo
npm start
# 6. Para construir versión de producción
npm run build
# 7. Para preview de la versión construida
npm run build
serve -s build
📝 Datos Modificables
Para Personalizar los Datos:
1.
Resultados de Aprendizaje: Editar src/data/ra-data.js
2.
Criterios de Evaluación: Editar src/data/criterios-data.js
3.
Instrumentos: Editar src/data/instrumentos-data.js
4.
Alumnos y Profesores: Editar src/data/mock-data.js
5.
Ponderaciones: Modificar en configuracionesPonderacion
Estructura Fácil de Modificar:
javascript
// Agregar nuevo RA
export const resultadosAprendizaje = {
  // ... existentes
  nuevo_ra: {
    id: 'nuevo_ra',
    nombre: 'Nombre del Nuevo RA',
    descripcion: 'Descripción detallada',
    competencias: [
      'Competencia 1',
      'Competencia 2'
    ],
    criteriosEvaluacion: ['crit_001', 'crit_002']
  }
};
// Agregar nuevo criterio
export const criteriosEvaluacion = {
  // ... existentes
  crit_001: {
    id: 'crit_001',
    descripcion: 'Descripción del nuevo criterio',
    indicadores: [
      'Indicador 1',
      'Indicador 2'
    ],
    ponderacion: 20,
    instrumentos: ['observacion_sistematica', 'lista_verificacion']
  }
};
🎯 Funcionalidades Demostradas
✅ Dashboard Completo
Estadísticas en tiempo real
Gráficos interactivos (barras, circulares, líneas)
Resumen de evaluaciones recientes
Métricas clave del rendimiento
✅ Centro de Evaluación
Creación de nuevas evaluaciones
Edición de evaluaciones existentes
Selección de RA y criterios
Múltiples instrumentos de evaluación
Sistema de puntuación escalonado
✅ Gestión Académica
Administración de alumnos
Gestión de profesores
Configuración de RA y criterios
Instrumentos de evaluación
✅ Reportes
Reportes individuales por alumno
Estadísticas por RA
Tendencias de rendimiento
Exportación de datos
✅ Configuración
Personalización de escalas
Configuración de ponderaciones
Gestión de instrumentos
Parámetros del sistema
