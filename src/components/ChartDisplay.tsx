'use client';

import React from 'react';

interface ChartDisplayProps {
  chartSpec: {
    type?: string;
    kind?: string;
    data?: any;
    title?: string;
  };
  className?: string;
}

export function ChartDisplay({ chartSpec, className = '' }: ChartDisplayProps) {
  const chartType = chartSpec.type || chartSpec.kind || 'bar';
  const title = chartSpec.title || 'Chart';

  // Simple visual representation of charts
  // In a full implementation, this would use a library like Chart.js or Recharts
  
  const getChartIcon = () => {
    switch (chartType.toLowerCase()) {
      case 'line':
        return (
          <svg className="w-full h-32" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 80 L50 40 L90 60 L130 20 L170 35 L190 15" stroke="#3b82f6" strokeWidth="3" fill="none"/>
            <circle cx="10" cy="80" r="4" fill="#3b82f6"/>
            <circle cx="50" cy="40" r="4" fill="#3b82f6"/>
            <circle cx="90" cy="60" r="4" fill="#3b82f6"/>
            <circle cx="130" cy="20" r="4" fill="#3b82f6"/>
            <circle cx="170" cy="35" r="4" fill="#3b82f6"/>
            <circle cx="190" cy="15" r="4" fill="#3b82f6"/>
          </svg>
        );
      case 'bar':
        return (
          <svg className="w-full h-32" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="50" width="25" height="40" fill="#3b82f6" opacity="0.8"/>
            <rect x="60" y="30" width="25" height="60" fill="#3b82f6" opacity="0.8"/>
            <rect x="100" y="40" width="25" height="50" fill="#3b82f6" opacity="0.8"/>
            <rect x="140" y="20" width="25" height="70" fill="#3b82f6" opacity="0.8"/>
          </svg>
        );
      case 'pie':
        return (
          <svg className="w-full h-32" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="50" r="35" fill="#3b82f6" opacity="0.3"/>
            <path d="M100 50 L100 15 A35 35 0 0 1 125 70 Z" fill="#3b82f6" opacity="0.6"/>
            <path d="M100 50 L125 70 A35 35 0 0 1 75 70 Z" fill="#3b82f6" opacity="0.8"/>
            <path d="M100 50 L75 70 A35 35 0 0 1 100 15 Z" fill="#3b82f6"/>
          </svg>
        );
      case 'area':
        return (
          <svg className="w-full h-32" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 80 L50 40 L90 60 L130 20 L170 35 L190 15 L190 90 L10 90 Z" fill="#3b82f6" opacity="0.3"/>
            <path d="M10 80 L50 40 L90 60 L130 20 L170 35 L190 15" stroke="#3b82f6" strokeWidth="2" fill="none"/>
          </svg>
        );
      default:
        return (
          <div className="flex items-center justify-center h-32 bg-blue-50 rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm text-gray-600">Data Visualization</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span>
        {title} ({chartType} chart)
      </div>
      <div className="bg-white rounded-lg p-4">
        {getChartIcon()}
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">
        Interactive chart visualization
      </div>
    </div>
  );
}

