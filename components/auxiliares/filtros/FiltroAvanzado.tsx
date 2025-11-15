import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { ResultadoAprendizaje } from '../../../types';

interface FiltrosAvanzadosProps {
  datos: any[];
  filtrosIniciales?: any;
  onFiltrosCambio: (datosFiltrados: any[]) => void;
  filtrosDisponibles?: {
    fechas?: boolean;
    ra?: boolean;
    criterios?: boolean;
    estado?: boolean;
    puntuacion?: boolean;
    evaluador?: boolean;
    alumno?: boolean;
  };
  className?: string;
}

const FiltroAvanzado: React.FC<FiltrosAvanzadosProps> = ({ 
  datos,
  filtrosIniciales = {},
  onFiltrosCambio,
  filtrosDisponibles,
  className = ''
}) => {
  const { resultadosAprendizaje, criteriosEvaluacion, profesores, alumnos } = useAppContext();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const filtrosActivos = Object.fromEntries(Object.entries(filtros).filter(([, value]) => value !== '' && value !== null && (!Array.isArray(value) || value.length > 0)));
    
    const datosFiltrados = datos.filter(item => {
        // Implement filtering logic here based on 'item' structure and 'filtrosActivos'
        // This is highly dependent on the 'datos' structure
        return true; 
    });
    
    onFiltrosCambio(datosFiltrados);
  }, [filtros, datos, onFiltrosCambio]);

  const manejarCambioFiltro = (nombre: string, valor: any) => setFiltros(prev => ({ ...prev, [nombre]: valor }));
  const limpiarFiltros = () => setFiltros({});
  const numeroFiltrosActivos = Object.keys(filtros).length;

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <h4 className="font-bold">Filtros Avanzados</h4>
            {numeroFiltrosActivos > 0 && <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">{numeroFiltrosActivos}</span>}
        </div>
        <div>
            {numeroFiltrosActivos > 0 && <button onClick={limpiarFiltros} className="text-sm text-gray-600 hover:text-red-600 mr-4">Limpiar</button>}
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="text-lg font-bold">{mostrarFiltros ? '−' : '+'}</button>
        </div>
      </div>
      {mostrarFiltros && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrosDisponibles?.fechas && (
                <div><label className="text-sm font-medium">Rango de Fechas</label><div className="flex gap-2 mt-1"><input type="date" value={filtros.fechaInicio || ''} onChange={e => manejarCambioFiltro('fechaInicio', e.target.value)} className="w-full p-2 border rounded"/><input type="date" value={filtros.fechaFin || ''} onChange={e => manejarCambioFiltro('fechaFin', e.target.value)} className="w-full p-2 border rounded"/></div></div>
            )}
            {filtrosDisponibles?.ra && (
                <div><label className="text-sm font-medium">Resultados de Aprendizaje</label><select multiple value={filtros.raIds || []} onChange={e => manejarCambioFiltro('raIds', Array.from(e.target.selectedOptions, (o: HTMLOptionElement) => o.value))} className="w-full p-2 border rounded mt-1 bg-white h-24">{Object.values(resultadosAprendizaje).map((ra: ResultadoAprendizaje) => <option key={ra.id} value={ra.id}>{ra.nombre}</option>)}</select></div>
            )}
            {filtrosDisponibles?.evaluador && (
                <div><label className="text-sm font-medium">Evaluador</label><select value={filtros.evaluadorId || ''} onChange={e => manejarCambioFiltro('evaluadorId', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white"><option value="">Todos</option>{profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}</select></div>
            )}
        </div>
      )}
    </div>
  );
};

export default FiltroAvanzado;