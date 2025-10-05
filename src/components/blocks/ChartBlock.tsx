'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function ChartBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: ChartBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Chart') {
    return null;
  }

  const renderChart = () => {
    const { data, chartType, title } = block;

    const chartProps = {
      data: data.labels.map((label, index) => ({
        name: label,
        value: data.datasets[0]?.data[index] || 0,
        fill: data.datasets[0]?.backgroundColor?.[index] || themeConfig.colors.primary,
      })),
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const commonProps = {
      dataKey: 'value',
      stroke: themeConfig.colors.primary,
      fill: themeConfig.colors.primary,
      strokeWidth: 2,
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.colors.border} />
            <XAxis dataKey="name" stroke={themeConfig.colors.textSecondary} />
            <YAxis stroke={themeConfig.colors.textSecondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: themeConfig.colors.surface,
                border: `1px solid ${themeConfig.colors.border}`,
                borderRadius: '8px',
                color: themeConfig.colors.text,
              }}
            />
            <Line {...commonProps} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.colors.border} />
            <XAxis dataKey="name" stroke={themeConfig.colors.textSecondary} />
            <YAxis stroke={themeConfig.colors.textSecondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: themeConfig.colors.surface,
                border: `1px solid ${themeConfig.colors.border}`,
                borderRadius: '8px',
                color: themeConfig.colors.text,
              }}
            />
            <Bar {...commonProps} />
          </BarChart>
        );
      case 'pie':
      case 'doughnut':
        return (
          <PieChart>
            <Pie
              data={chartProps.data}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'doughnut' ? 60 : 0}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {chartProps.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: themeConfig.colors.surface,
                border: `1px solid ${themeConfig.colors.border}`,
                borderRadius: '8px',
                color: themeConfig.colors.text,
              }}
            />
            <Legend />
          </PieChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-lg">
            <span style={{ color: themeConfig.colors.textSecondary }}>
              Unsupported chart type: {chartType}
            </span>
          </div>
        );
    }
  };

  return (
    <BaseBlock
      block={block}
      theme={theme}
      isEditing={isEditing}
      onEdit={onEdit}
      onDelete={onDelete}
      onAdd={onAdd}
      className="w-full"
      animation={block.animation}
    >
      <div className="w-full">
        {block.title && (
          <h3 
            className="text-lg font-semibold mb-4 text-center"
            style={{ color: themeConfig.colors.text }}
          >
            {block.title}
          </h3>
        )}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    </BaseBlock>
  );
}
