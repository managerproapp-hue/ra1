import React from 'react';

interface PasoDefinicion {
  titulo: string;
  descripcion: string;
  subProgreso?: number;
}

interface IndicadorProgresoProps {
  pasosCompletados: number;
  pasosTotales: number;
  pasoActual: number;
  pasosDefinicion: PasoDefinicion[];
  mostrarEtiquetas?: boolean;
  mostrarPorcentaje?: boolean;
  animacion?: boolean;
  className?: string;
}

const IndicadorProgreso: React.FC<IndicadorProgresoProps> = ({ 
  pasosCompletados,
  pasosTotales,
  pasoActual,
  pasosDefinicion,
  mostrarEtiquetas = true,
  mostrarPorcentaje = true,
  animacion = true,
  className = ''
}) => {
  const porcentaje = pasosTotales > 0 ? Math.round((pasosCompletados / pasosTotales) * 100) : 0;

  const obtenerEstadoPaso = (indice: number) => {
    if (indice < pasoActual) return 'completed';
    if (indice === pasoActual) return 'current';
    return 'pending';
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold">Progreso de Evaluación</h4>
        {mostrarPorcentaje && <span className="font-bold text-blue-600">{porcentaje}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full bg-blue-600 ${animacion ? 'transition-all duration-500' : ''}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      {mostrarEtiquetas && (
        <div className="mt-4 space-y-4">
          {pasosDefinicion.map((paso, indice) => {
            const estado = obtenerEstadoPaso(indice);
            const isCompleted = estado === 'completed';
            const isCurrent = estado === 'current';
            return (
              <div key={indice} className={`flex items-start ${isCurrent ? 'font-bold' : ''} ${isCompleted ? 'text-gray-500' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {isCompleted ? '✓' : indice + 1}
                </div>
                <div>
                  <h5 className="text-sm">{paso.titulo}</h5>
                  <p className="text-xs text-gray-500">{paso.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const useIndicadorProgreso = (totalPasos: number, pasosDefinicion: PasoDefinicion[]) => {
  const [pasoActual, setPasoActual] = React.useState(0);
  const [pasosCompletados, setPasosCompletados] = React.useState(0);

  const avanzarPaso = (pasoIndex: number | null = null) => {
    const siguientePaso = pasoIndex !== null ? pasoIndex : pasoActual + 1;
    if (siguientePaso < totalPasos) {
      setPasoActual(siguientePaso);
      if (siguientePaso > pasoActual) setPasosCompletados(prev => prev + 1);
    }
  };
  const retrocederPaso = () => { if (pasoActual > 0) setPasoActual(prev => prev - 1); };
  const marcarPasoCompleto = (pasoIndex: number) => { setPasosCompletados(prev => Math.max(prev, pasoIndex + 1)); };

  return { pasoActual, pasosCompletados, avanzarPaso, retrocederPaso, marcarPasoCompleto, pasosDefinicion, totalPasos };
};

export default IndicadorProgreso;
