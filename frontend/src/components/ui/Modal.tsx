import React, { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  showCloseButton = true
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard ESC listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg'
  }[maxWidth];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label={title || '팝업 창'}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-2xl w-full ${widthClasses} shadow-2xl overflow-hidden animate-scaleUp border border-gray-100/80`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-950 tracking-tight">{title}</h3>
            {showCloseButton && (
              <button 
                type="button" 
                onClick={onClose}
                aria-label="닫기"
                className="text-gray-400 hover:text-gray-900 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
