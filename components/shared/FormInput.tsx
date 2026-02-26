'use client';

import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({
  label,
  error,
  helperText,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {helperText && <span className="text-xs text-gray-500">{helperText}</span>}
    </div>
  );
}
