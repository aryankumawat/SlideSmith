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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    const { data, x, y, kind } = block;

    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const commonProps = {
      dataKey: y,
      stroke: themeConfig.colors.primary,
      fill: themeConfig.colors.primary,
      strokeWidth: 2,
    };

    switch (kind) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.colors.border} />
            <XAxis dataKey={x} stroke={themeConfig.colors.textSecondary} />
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
            <XAxis dataKey={x} stroke={themeConfig.colors.textSecondary} />
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
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.colors.border} />
            <XAxis dataKey={x} stroke={themeConfig.colors.textSecondary} />
            <YAxis stroke={themeConfig.colors.textSecondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: themeConfig.colors.surface,
                border: `1px solid ${themeConfig.colors.border}`,
                borderRadius: '8px',
                color: themeConfig.colors.text,
              }}
            />
            <Area {...commonProps} />
          </AreaChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-lg">
            <span style={{ color: themeConfig.colors.textSecondary }}>
              Unsupported chart type: {kind}
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
    >
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </BaseBlock>
  );
}

