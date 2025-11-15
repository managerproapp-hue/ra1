import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { CriterioEvaluacion } from '../../../types';

interface SelectorCriteriosProps {
  raIds: string[];
  valorSeleccionado: string[];
  onSeleccion: (seleccionados: string[]) => void;
  maxSelecciones?: number;
  mostrarIndicadores?: boolean;
  mostrarPonderaciones?: boolean;
  mostrarInstrumentos?: boolean;
  className?: string;
  disabled?: boolean;
}

const SelectorCriterios: React.FC<SelectorCriteriosProps> = ({ 
  raIds, 
  valorSeleccionado, 
  onSeleccion,
  maxSelecciones,
  mostrarIndicadores = true,
  mostrarPonderaciones = true,
  mostrarInstrumentos = true,
  className = '',
  disabled = false 
}) => {
  const { criteriosEvaluacion, instrumentosEvaluacion, getRA } = useAppContext();
  const [filtro, setFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('ponderacion'); // 'ponderacion', 'nombre', 'instrumento'

  const criteriosDisponibles = useMemo(() => {
    const criterios: CriterioEvaluacion[] = [];
    const criterioIds = new Set<string>();
    
    raIds.forEach(raId => {
      const ra = getRA(raId);
      if (ra) {
        ra.criteriosEvaluacion.forEach(criterioId => {
          const criterio = criteriosEvaluacion[criterioId];
          if (criterio && !criterioIds.has(criterioId)) {
            criterios.push({ ...criterio, raId, raNombre: ra.nombre });
            criterioIds.add(criterioId);
          }
        });
      }
    });
    return criterios;
  }, [raIds, criteriosEvaluacion, getRA]);

  const criteriosFiltrados = useMemo(() => {
    let criterios = [...criteriosDisponibles];
    if (filtro) {
      criterios = criterios.filter(criterio =>
        criterio.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
        criterio.raNombre?.toLowerCase().includes(filtro.toLowerCase())
      );
    }
    
    switch (ordenarPor) {
      case 'ponderacion':
        criterios.sort((a, b) => b.ponderacion - a.ponderacion);
        break;
      case 'nombre':
        criterios.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        break;
      case 'instrumento':
        criterios.sort((a, b) => (a.instrumentos[0] || '').localeCompare(b.instrumentos[0] || ''));
        break;
    }
    return criterios;
  }, [criteriosDisponibles, filtro, ordenarPor]);

  const manejarToggleSeleccion = (criterioId: string) => {
    if (disabled) return;
    const estaSeleccionado = valorSeleccionado?.includes(criterioId);
    
    if (estaSeleccionado) {
      onSeleccion(valorSeleccionado.filter(id => id !== criterioId));
    } else {
      if (maxSelecciones && valorSeleccionado?.length >= maxSelecciones) return;
      onSeleccion([...(valorSeleccionado || []), criterioId]);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${className} ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">Criterios de Evaluación</h3>
          <div className="text-sm text-gray-600">
            <span>{valorSeleccionado?.length || 0} de {criteriosDisponibles.length} seleccionados</span>
            {maxSelecciones && <span className="ml-2 text-xs">(Límite: {maxSelecciones})</span>}
          </div>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar criterios..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="p-2 border rounded bg-white">
          <option value="ponderacion">Por ponderación</option>
          <option value="nombre">Por nombre</option>
          <option value="instrumento">Por instrumento</option>
        </select>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {criteriosFiltrados.map(criterio => {
          const estaSeleccionado = valorSeleccionado?.includes(criterio.id);
          const puedeSeleccionar = !maxSelecciones || valorSeleccionado?.length < maxSelecciones || estaSeleccionado;
          return (
            <div
              key={criterio.id}
              className={`p-3 border rounded-md cursor-pointer transition-all ${estaSeleccionado ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-200' : 'bg-white hover:bg-gray-50'} ${!puedeSeleccionar && !estaSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => puedeSeleccionar && manejarToggleSeleccion(criterio.id)}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 mt-1 border rounded flex items-center justify-center flex-shrink-0 mr-3 ${estaSeleccionado ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white'}`}>
                  {estaSeleccionado && <span>✓</span>}
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">{criterio.raNombre}</span>
                    {mostrarPonderaciones && <span className="text-sm font-bold text-blue-600">{criterio.ponderacion}%</span>}
                  </div>
                  <h4 className="font-semibold text-gray-800">{criterio.descripcion}</h4>
                </div>
              </div>
              {mostrarIndicadores && (
                <div className="mt-2 pl-8">
                  <p className="text-xs font-bold text-gray-500">Indicadores:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {criterio.indicadores.map((indicador, index) => <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{indicador}</span>)}
                  </div>
                </div>
              )}
              {mostrarInstrumentos && (
                <div className="mt-2 pl-8">
                  <p className="text-xs font-bold text-gray-500">Instrumentos:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {criterio.instrumentos.map(instId => <span key={instId} className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{instrumentosEvaluacion[instId]?.nombre || instId}</span>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {criteriosFiltrados.length === 0 && <div className="text-center text-sm text-gray-500 p-4">No hay criterios con los filtros aplicados.</div>}
      </div>
    </div>
  );
};

export default SelectorCriterios;
