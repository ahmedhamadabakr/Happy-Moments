'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'} {trend.value}%</span>
            </div>
          )}
        </div>
        {icon && <div className="text-3xl text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
