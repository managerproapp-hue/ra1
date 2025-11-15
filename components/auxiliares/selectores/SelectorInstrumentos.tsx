import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { InstrumentoEvaluacion } from '../../../types';

interface SelectorInstrumentosProps {
  criteriosSeleccionados: string[];
  valorSeleccionado: string | null;
  onSeleccion: (instrumentoId: string) => void;
  mostrarPreviewEscalas?: boolean;
  className?: string;
  disabled?: boolean;
}

const SelectorInstrumentos: React.FC<SelectorInstrumentosProps> = ({ 
  criteriosSeleccionados,
  valorSeleccionado,
  onSeleccion,
  mostrarPreviewEscalas = true,
  className = '',
  disabled = false 
}) => {
  const { instrumentosEvaluacion, criteriosEvaluacion } = useAppContext();
  const [instrumentosExpandidos, setInstrumentosExpandidos] = useState<Record<string, boolean>>({});

  const instrumentosDisponibles = useMemo(() => {
    const instrumentos = new Map<string, InstrumentoEvaluacion>();
    criteriosSeleccionados.forEach(criterioId => {
      const criterio = criteriosEvaluacion[criterioId];
      if (criterio) {
        criterio.instrumentos.forEach(instrumentoId => {
          const instrumento = instrumentosEvaluacion[instrumentoId];
          if (instrumento && !instrumentos.has(instrumentoId)) {
            instrumentos.set(instrumentoId, instrumento);
          }
        });
      }
    });
    return Array.from(instrumentos.values());
  }, [criteriosSeleccionados, criteriosEvaluacion, instrumentosEvaluacion]);

  const toggleInstrumentoExpansion = (instrumentoId: string) => {
    setInstrumentosExpandidos(prev => ({ ...prev, [instrumentoId]: !prev[instrumentoId] }));
  };

  return (
    <div className={`${className} ${disabled ? 'opacity-60' : ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Seleccionar Instrumento</h3>
        <p className="text-sm text-gray-600">Elige el instrumento más apropiado para la evaluación.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {instrumentosDisponibles.map(instrumento => {
          const isSelected = valorSeleccionado === instrumento.id;
          const isExpanded = instrumentosExpandidos[instrumento.id];
          return (
            <div key={instrumento.id} className={`border rounded-lg transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}>
              <div 
                className={`p-4 cursor-pointer flex justify-between items-start ${disabled ? 'cursor-not-allowed' : ''}`}
                onClick={() => !disabled && onSeleccion(instrumento.id)}
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{instrumento.nombre}</h4>
                  <p className="text-xs text-gray-500">{instrumento.descripcion}</p>
                </div>
                <div className="flex items-center">
                  {isSelected && <span className="text-blue-600 mr-2">✓</span>}
                  {mostrarPreviewEscalas && (
                    <button className="text-gray-400 hover:text-gray-700" onClick={(e) => { e.stopPropagation(); toggleInstrumentoExpansion(instrumento.id); }}>
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                </div>
              </div>
              {mostrarPreviewEscalas && isExpanded && (
                <div className="border-t p-4 bg-gray-50">
                  <h5 className="text-xs font-bold mb-2">Escalas de evaluación:</h5>
                  <div className="space-y-2">
                    {instrumento.escalas?.map(escala => (
                      <div key={escala.valor} className="flex items-start text-xs">
                        <span className="font-bold w-6 text-center mr-2">{escala.valor}</span>
                        <div>
                          <span className="font-semibold text-gray-700">{escala.etiqueta}: </span>
                          <span className="text-gray-600">{escala.descripcion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {instrumentosDisponibles.length === 0 && <p className="text-sm text-gray-500 col-span-full text-center p-4">No hay instrumentos disponibles para los criterios seleccionados.</p>}
      </div>
    </div>
  );
};

export default SelectorInstrumentos;
