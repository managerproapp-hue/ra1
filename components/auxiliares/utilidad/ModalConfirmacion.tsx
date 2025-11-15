import React, { useEffect, FC, ReactNode, useState } from 'react';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo?: string;
  mensaje?: string;
  confirmacionTexto?: string;
  cancelacionTexto?: string;
  tipo?: 'info' | 'warning' | 'danger' | 'success';
  onConfirmacion: () => void;
  onCancelacion: () => void;
  children?: ReactNode;
}

const ModalConfirmacion: FC<ModalConfirmacionProps> = ({ 
  abierto,
  titulo = 'Confirmar Acción',
  mensaje = '¿Estás seguro?',
  confirmacionTexto = 'Confirmar',
  cancelacionTexto = 'Cancelar',
  tipo = 'info',
  onConfirmacion,
  onCancelacion,
  children
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelacion();
    };
    if (abierto) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [abierto, onCancelacion]);

  if (!abierto) return null;

  const typeClasses = {
    info: { bg: 'bg-blue-100', text: 'text-blue-800', button: 'bg-blue-600 hover:bg-blue-700' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', button: 'bg-yellow-600 hover:bg-yellow-700' },
    danger: { bg: 'bg-red-100', text: 'text-red-800', button: 'bg-red-600 hover:bg-red-700' },
    success: { bg: 'bg-green-100', text: 'text-green-800', button: 'bg-green-600 hover:bg-green-700' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancelacion}>
      <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-md ${typeClasses[tipo].bg}`} onClick={e => e.stopPropagation()}>
        <h3 className={`text-xl font-bold ${typeClasses[tipo].text}`}>{titulo}</h3>
        <p className="mt-2 text-gray-700">{mensaje}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onCancelacion} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">{cancelacionTexto}</button>
          <button onClick={onConfirmacion} className={`px-4 py-2 text-white rounded-md font-semibold ${typeClasses[tipo].button}`}>{confirmacionTexto}</button>
        </div>
      </div>
    </div>
  );
};

export const useModalConfirmacion = () => {
    const [modalState, setModalState] = useState<{ abierto: boolean; config: Partial<ModalConfirmacionProps> }>({ abierto: false, config: {} });
    const mostrarModal = (config: Partial<ModalConfirmacionProps>) => setModalState({ abierto: true, config });
    const ocultarModal = () => setModalState({ abierto: false, config: {} });
    
    const ModalComponent = () => (
        <ModalConfirmacion
            abierto={modalState.abierto}
            onConfirmacion={() => { modalState.config.onConfirmacion?.(); ocultarModal(); }}
            onCancelacion={() => { modalState.config.onCancelacion?.(); ocultarModal(); }}
            {...modalState.config}
        />
    );
    return { mostrarModal, ModalComponent };
};

export const ModalConfirmacionProvider: FC<{ children: (args: { mostrarModal: (config: Partial<ModalConfirmacionProps>) => void }) => ReactNode }> = ({ children }) => {
    const { mostrarModal, ModalComponent } = useModalConfirmacion();
    return <>{children({ mostrarModal })}<ModalComponent /></>;
};


export default ModalConfirmacion;
