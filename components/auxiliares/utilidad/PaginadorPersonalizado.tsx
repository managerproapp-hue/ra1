import React, { useState } from 'react';

interface PaginadorPersonalizadoProps {
  paginaActual: number;
  totalPaginas: number;
  onCambioPagina: (pagina: number) => void;
  className?: string;
}

const PaginadorPersonalizado: React.FC<PaginadorPersonalizadoProps> = ({
  paginaActual,
  totalPaginas,
  onCambioPagina,
  className = '',
}) => {
  if (totalPaginas <= 1) return null;

  const irPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) onCambioPagina(pagina);
  };

  const pages = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <button onClick={() => irPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Anterior</button>
      <div className="flex items-center gap-1">
        {pages.map(p => (
          <button key={p} onClick={() => irPagina(p)} className={`px-3 py-1 rounded ${paginaActual === p ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>{p}</button>
        ))}
      </div>
      <button onClick={() => irPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Siguiente</button>
    </nav>
  );
};

export const usePaginacion = (totalItems: number, itemsPorPaginaInicial = 10) => {
  const [itemsPorPagina, setItemsPorPagina] = useState(itemsPorPaginaInicial);
  const [paginaActual, setPaginaActual] = useState(1);
  
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(Math.max(1, Math.min(nuevaPagina, totalPaginas)));
  };
  
  return {
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    setItemsPorPagina,
    indiceInicio,
    indiceFin,
    cambiarPagina
  };
};

export default PaginadorPersonalizado;
