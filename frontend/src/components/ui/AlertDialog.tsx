import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  confirmText?: string;
}

export const AlertDialog = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = '확인'
}: AlertDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          type === 'success' ? 'bg-emerald-50 text-emerald-600' :
          type === 'error' ? 'bg-rose-50 text-rose-600' :
          'bg-gray-100 text-gray-900'
        }`}>
          {type === 'success' && <CheckCircle2 size={24} className="stroke-[2.5]" />}
          {type === 'error' && <AlertCircle size={24} className="stroke-[2.5]" />}
          {type === 'info' && <Info size={24} className="stroke-[2.5]" />}
        </div>
        <h4 className="font-extrabold text-base text-gray-950 mb-1.5">{title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed mb-5 whitespace-pre-line">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-950 hover:bg-black active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition shadow-xs"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
