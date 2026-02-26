'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {children}
        </div>

        {actions && (
          <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
