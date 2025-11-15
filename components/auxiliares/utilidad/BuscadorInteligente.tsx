import React, { useState, useEffect, useRef } from 'react';

interface BuscadorInteligenteProps {
  datos: any[];
  camposBusqueda: string[];
  valorInicial?: string;
  placeholder?: string;
  onSeleccion: (item: any) => void;
  mostrarSugerencias?: boolean;
  maxSugerencias?: number;
  minCaracteresBusqueda?: number;
  className?: string;
}

const BuscadorInteligente: React.FC<BuscadorInteligenteProps> = ({
  datos,
  camposBusqueda,
  valorInicial = '',
  placeholder = 'Buscar...',
  onSeleccion,
  mostrarSugerencias = true,
  maxSugerencias = 5,
  minCaracteresBusqueda = 2,
  className = '',
  ...props
}) => {
  const [termino, setTermino] = useState(valorInicial);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const obtenerValorCampo = (item: any, campo: string): string => {
    return campo.split('.').reduce((o, i) => (o ? o[i] : ''), item) || '';
  };

  useEffect(() => {
    if (termino.length >= minCaracteresBusqueda && mostrarSugerencias) {
      const terminoLower = termino.toLowerCase();
      const coincidencias = datos.filter(item => 
        camposBusqueda.some(campo => 
          String(obtenerValorCampo(item, campo)).toLowerCase().includes(terminoLower)
        )
      ).slice(0, maxSugerencias);
      setSugerencias(coincidencias);
      setMostrarDropdown(true);
    } else {
      setSugerencias([]);
      setMostrarDropdown(false);
    }
    setIndiceSeleccionado(-1);
  }, [termino, datos, camposBusqueda, maxSugerencias, minCaracteresBusqueda, mostrarSugerencias]);

  const manejarSeleccion = (item: any) => {
    setTermino(obtenerValorCampo(item, camposBusqueda[0]));
    setMostrarDropdown(false);
    setIndiceSeleccionado(-1);
    onSeleccion(item);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <input
        type="text"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        onFocus={() => { if (sugerencias.length > 0) setMostrarDropdown(true); }}
        placeholder={placeholder}
        className="w-full p-2 border rounded"
        {...props}
      />
      {mostrarDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {sugerencias.length > 0 ? sugerencias.map((item, indice) => (
            <div
              key={indice}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${indice === indiceSeleccionado ? 'bg-gray-100' : ''}`}
              onClick={() => manejarSeleccion(item)}
            >
              <div className="font-semibold">{obtenerValorCampo(item, camposBusqueda[0])}</div>
              <div className="text-sm text-gray-500">{camposBusqueda.length > 1 ? obtenerValorCampo(item, camposBusqueda[1]) : ''}</div>
            </div>
          )) : (
            <div className="p-3 text-sm text-gray-500">No se encontraron resultados.</div>
          )}
        </div>
      )}
    </div>
  );
};

export const useBusquedaInteligente = (datos: any[], camposBusqueda: string[]) => {
    const [resultados, setResultados] = useState<any[]>([]);
    const buscar = (termino: string) => {
        if (!termino) {
            setResultados([]);
            return;
        }
        const terminoLower = termino.toLowerCase();
        const coincidencias = datos.filter(item => 
            camposBusqueda.some(campo => 
                String(campo.split('.').reduce((o, i) => o?.[i], item) || '').toLowerCase().includes(terminoLower)
            )
        );
        setResultados(coincidencias);
    };
    return { resultados, buscar };
};

export default BuscadorInteligente;
