import React from 'react';
import { Modal } from './Modal';
import { HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  isDestructive = false
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
          isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-900'
        }`}>
          <HelpCircle size={24} className="stroke-[2.5]" />
        </div>
        <h4 className="font-extrabold text-base text-gray-950 mb-1.5">{title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed mb-5 whitespace-pre-line">{message}</p>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:bg-gray-50 active:scale-[0.98] text-gray-700 py-3 rounded-xl font-bold text-sm transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition shadow-xs ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gray-950 hover:bg-black'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
