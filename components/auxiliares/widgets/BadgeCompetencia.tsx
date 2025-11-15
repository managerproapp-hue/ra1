import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { CriterioEvaluacion, PracticalExamCriterionScore } from '../../../types';

interface BadgeCompetenciaProps {
  puntuacion: number | null;
  puntuacionMaxima?: number;
  criterio?: CriterioEvaluacion;
  mostrarPorcentaje?: boolean;
  mostrarTrend?: boolean;
  trend?: number | null;
  className?: string;
  tamaño?: 'small' | 'medium' | 'large';
  variante?: 'primary' | 'custom';
}

export const BadgeCompetencia: React.FC<BadgeCompetenciaProps> = ({ 
  puntuacion, 
  puntuacionMaxima = 5,
  criterio,
  mostrarPorcentaje = true,
  mostrarTrend = false,
  trend = null,
  className = '',
  tamaño = 'medium',
}) => {
  const porcentaje = (puntuacion !== null && puntuacionMaxima) ? Math.round((puntuacion / puntuacionMaxima) * 100) : 0;

  const { nivel, texto, color, icono } = React.useMemo(() => {
    if (puntuacion === null) return { nivel: 'sin-evaluar', texto: 'Sin evaluar', color: 'bg-gray-100 text-gray-800 border-gray-300', icono: '⭕' };
    if (porcentaje >= 90) return { nivel: 'excelente', texto: 'Excelente', color: 'bg-green-100 text-green-800 border-green-300', icono: '🌟' };
    if (porcentaje >= 70) return { nivel: 'bueno', texto: 'Bueno', color: 'bg-blue-100 text-blue-800 border-blue-300', icono: '👍' };
    if (porcentaje >= 50) return { nivel: 'suficiente', texto: 'Suficiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icono: '⚠️' };
    return { nivel: 'insuficiente', texto: 'Insuficiente', color: 'bg-red-100 text-red-800 border-red-300', icono: '❌' };
  }, [puntuacion, porcentaje]);

  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };

  return (
    <div className={`inline-flex items-center gap-2 border rounded-md ${sizeClasses[tamaño]} ${color} ${className}`}>
      <span className="text-lg">{icono}</span>
      <div>
        <div className="font-bold">
          {mostrarPorcentaje ? `${porcentaje}%` : `${puntuacion}/${puntuacionMaxima}`}
        </div>
        <div className="text-xs">{texto}</div>
      </div>
      {mostrarTrend && trend !== null && (
        <div className="text-sm">{trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→'}</div>
      )}
    </div>
  );
};

interface BadgeRAProps {
  raId: string;
  rendimiento?: number | null;
  className?: string;
}

export const BadgeRA: React.FC<BadgeRAProps> = ({ raId, rendimiento = null, className = '' }) => {
  const { getRA, practicalExamEvaluations } = useAppContext();
  const ra = getRA(raId);

  const rendimientoActual = React.useMemo(() => {
    if (rendimiento !== null) return rendimiento;
    const raEvals = practicalExamEvaluations.filter(e => e.scores[raId]);
    if (raEvals.length === 0) return null;
    const raScores = raEvals.map(e => {
        const raScoreData = e.scores[raId];
        const criteriaScores = Object.values(raScoreData).map((s: PracticalExamCriterionScore) => s.score).filter(s => s !== null) as number[];
        if (criteriaScores.length === 0) return null;
        return criteriaScores.reduce((a, b) => a + b, 0) / criteriaScores.length;
    }).filter(s => s !== null) as number[];
    if(raScores.length === 0) return null;
    return raScores.reduce((a,b) => a+b, 0) / raScores.length;
  }, [rendimiento, raId, practicalExamEvaluations]);

  if (!ra) return null;

  return (
    <BadgeCompetencia
      puntuacion={rendimientoActual}
      puntuacionMaxima={10}
      tamaño="large"
      className={`w-full ${className}`}
    />
  );
};

export default BadgeCompetencia;
