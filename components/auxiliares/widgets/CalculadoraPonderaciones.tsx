import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';

interface CalculadoraPonderacionesProps {
  criteriosSeleccionados: string[];
  puntuacionesActuales?: Record<string, { puntuacion?: number | null }>;
  onPonderacionCambio?: (ponderaciones: Record<string, number>, total: number) => void;
  mostrarRecomendaciones?: boolean;
  className?: string;
}

const CalculadoraPonderaciones: React.FC<CalculadoraPonderacionesProps> = ({
  criteriosSeleccionados,
  puntuacionesActuales,
  onPonderacionCambio,
  mostrarRecomendaciones = true,
  className = ''
}) => {
  const { criteriosEvaluacion } = useAppContext();
  const [ponderaciones, setPonderaciones] = useState<Record<string, number>>({});

  useEffect(() => {
    const nuevasPonderaciones: Record<string, number> = {};
    criteriosSeleccionados.forEach(criterioId => {
      nuevasPonderaciones[criterioId] = criteriosEvaluacion[criterioId]?.ponderacion || 0;
    });
    setPonderaciones(nuevasPonderaciones);
  }, [criteriosSeleccionados, criteriosEvaluacion]);

  const totalPonderacion = useMemo(() => Object.values(ponderaciones).reduce((sum: number, val: number) => sum + val, 0), [ponderaciones]);

  const manejarCambioPonderacion = (criterioId: string, nuevaPonderacionStr: string) => {
    const nuevaPonderacion = parseInt(nuevaPonderacionStr, 10);
    if (isNaN(nuevaPonderacion) || nuevaPonderacion < 0 || nuevaPonderacion > 100) return;
    const nuevasPonderaciones = { ...ponderaciones, [criterioId]: nuevaPonderacion };
    setPonderaciones(nuevasPonderaciones);
    if (onPonderacionCambio) onPonderacionCambio(nuevasPonderaciones, Object.values(nuevasPonderaciones).reduce((s: number, v: number) => s + v, 0));
  };
  
  const distribuirEquitativamente = () => {
    if (criteriosSeleccionados.length === 0) return;
    const cantidad = criteriosSeleccionados.length;
    const ponderacionPorCriterio = Math.floor(100 / cantidad);
    const resto = 100 - (ponderacionPorCriterio * cantidad);
    const nuevasPonderaciones: Record<string, number> = {};
    criteriosSeleccionados.forEach((criterioId, index) => {
      nuevasPonderaciones[criterioId] = ponderacionPorCriterio + (index < resto ? 1 : 0);
    });
    setPonderaciones(nuevasPonderaciones);
    if (onPonderacionCambio) onPonderacionCambio(nuevasPonderaciones, 100);
  };

  const { color, texto } = useMemo(() => {
    if (totalPonderacion === 100) return { color: 'text-green-600', texto: 'Distribución perfecta' };
    if (totalPonderacion > 100) return { color: 'text-red-600', texto: `Exceso de ${totalPonderacion - 100}%` };
    return { color: 'text-yellow-600', texto: `Falta ${100 - totalPonderacion}%` };
  }, [totalPonderacion]);

  const puntuacionFinal = useMemo(() => {
    if (!puntuacionesActuales) return 0;
    return criteriosSeleccionados.reduce((total: number, criterioId: string) => {
      const puntuacion = puntuacionesActuales[criterioId]?.puntuacion;
      const ponderacion = ponderaciones[criterioId] || 0;
      if (typeof puntuacion === 'number') {
        return total + (puntuacion * ponderacion) / 100;
      }
      return total;
    }, 0);
  }, [puntuacionesActuales, ponderaciones, criteriosSeleccionados]);
  
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Calculadora de Ponderaciones</h3>
        <div className={`font-bold ${color}`}>Total: {totalPonderacion}% / 100%</div>
      </div>
      <div className={`text-sm mb-4 ${color}`}>{texto}</div>
      <button onClick={distribuirEquitativamente} disabled={criteriosSeleccionados.length === 0} className="w-full text-sm py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 mb-4 disabled:opacity-50">Distribución Equitativa</button>
      
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {criteriosSeleccionados.map(criterioId => {
          const criterio = criteriosEvaluacion[criterioId];
          const ponderacionActual = ponderaciones[criterioId] || 0;
          return (
            <div key={criterioId} className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-semibold truncate">{criterio?.descripcion || 'Criterio no encontrado'}</p>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" min="0" max="100" value={ponderacionActual} onChange={e => manejarCambioPonderacion(criterioId, e.target.value)} className="w-full"/>
                <input type="number" min="0" max="100" value={ponderacionActual} onChange={e => manejarCambioPonderacion(criterioId, e.target.value)} className="w-20 p-1 border rounded text-center"/>
              </div>
            </div>
          );
        })}
      </div>
      {puntuacionesActuales && (
        <div className="mt-4 pt-4 border-t text-center">
            <h4 className="font-semibold">Puntuación Final Proyectada</h4>
            <div className="text-2xl font-bold text-blue-600">{puntuacionFinal.toFixed(2)} / 5.0</div>
        </div>
      )}
    </div>
  );
};
export default CalculadoraPonderaciones;
