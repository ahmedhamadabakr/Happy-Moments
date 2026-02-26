'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-4 py-3 text-sm text-gray-700 ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(row[column.key as keyof T], row)
                    : row[column.key as keyof T]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
