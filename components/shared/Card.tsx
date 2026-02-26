'use client';

import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Card({
  title,
  children,
  footer,
  className = '',
}: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}
