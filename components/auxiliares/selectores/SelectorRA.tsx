import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { ResultadoAprendizaje } from '../../../types';

interface SelectorRAProps {
  valorSeleccionado: string | string[] | null;
  onSeleccion: (valor: string | string[]) => void;
  multiple?: boolean;
  filtrarPorArea?: string;
  mostrarDescripcion?: boolean;
  mostrarCriterios?: boolean;
  className?: string;
  disabled?: boolean;
}

const SelectorRA: React.FC<SelectorRAProps> = ({ 
  valorSeleccionado, 
  onSeleccion, 
  multiple = false, 
  filtrarPorArea,
  mostrarDescripcion = true,
  mostrarCriterios = false,
  className = '',
  disabled = false 
}) => {
  const { resultadosAprendizaje, criteriosEvaluacion } = useAppContext();
  const [expandido, setExpandido] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const raFiltrados = useMemo(() => {
    let ra: ResultadoAprendizaje[] = Object.values(resultadosAprendizaje);
    if (filtrarPorArea) {
      ra = ra.filter((item: ResultadoAprendizaje) => item.area === filtrarPorArea);
    }
    if (busqueda) {
      ra = ra.filter((item: ResultadoAprendizaje) => 
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    return ra;
  }, [resultadosAprendizaje, busqueda, filtrarPorArea]);

  const manejarSeleccion = (ra: ResultadoAprendizaje) => {
    if (disabled) return;
    
    if (multiple) {
      const seleccionados = Array.isArray(valorSeleccionado) ? valorSeleccionado : [];
      const nuevosSeleccionados = seleccionados.includes(ra.id)
        ? seleccionados.filter(id => id !== ra.id)
        : [...seleccionados, ra.id];
      onSeleccion(nuevosSeleccionados);
    } else {
      onSeleccion(ra.id);
      setExpandido(false);
    }
  };

  const obtenerTextoSeleccionado = () => {
    if (multiple && Array.isArray(valorSeleccionado) && valorSeleccionado.length > 0) {
      const textos = valorSeleccionado.map(id => resultadosAprendizaje[id]?.nombre);
      return `${textos.length} RA seleccionado${textos.length > 1 ? 's' : ''}`;
    }
    if (!multiple && typeof valorSeleccionado === 'string') {
      return resultadosAprendizaje[valorSeleccionado]?.nombre || 'Seleccionar RA';
    }
    return 'Seleccionar RA...';
  };

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div 
        className={`flex items-center justify-between p-2 border rounded cursor-pointer ${expandido ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => !disabled && setExpandido(!expandido)}
      >
        <span className="truncate">{obtenerTextoSeleccionado()}</span>
        <span className="ml-2 text-gray-500">▼</span>
      </div>
      {expandido && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Buscar RA..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {raFiltrados.map(ra => {
              const isSelected = multiple 
                ? Array.isArray(valorSeleccionado) && valorSeleccionado.includes(ra.id)
                : valorSeleccionado === ra.id;
              return (
                <div
                  key={ra.id}
                  className={`p-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${isSelected ? 'bg-blue-100' : ''}`}
                  onClick={() => manejarSeleccion(ra)}
                >
                  <div>
                    <h4 className="font-bold">{ra.nombre}</h4>
                    {mostrarDescripcion && <p className="text-sm text-gray-600">{ra.descripcion}</p>}
                    {mostrarCriterios && (
                      <div className="text-xs text-gray-500 mt-1">
                        <small>
                          {ra.criteriosEvaluacion.length} criterios • 
                          Ponderación total: {ra.criteriosEvaluacion.reduce((sum, cid) => sum + (criteriosEvaluacion[cid]?.ponderacion || 0), 0)}%
                        </small>
                      </div>
                    )}
                  </div>
                  {multiple && (
                    <div className="w-5 h-5 border rounded flex items-center justify-center ml-2">
                      {isSelected && <span className="text-blue-600">✓</span>}
                    </div>
                  )}
                </div>
              );
            })}
            {raFiltrados.length === 0 && (
              <div className="p-3 text-center text-sm text-gray-500">
                No se encontraron RA que coincidan con la búsqueda
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorRA;
