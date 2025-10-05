'use client';

import React, { useState, useEffect } from 'react';
import { LiveWidget, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LiveChartProps {
  widget: LiveWidget;
  theme: Theme;
}

function LiveChart({ widget, theme }: LiveChartProps) {
  const themeConfig = getThemeConfig(theme);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (widget.kind !== 'LiveChart') return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/live-proxy?url=${encodeURIComponent(widget.apiUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different data formats
      let chartData = result;
      if (result.data) {
        chartData = result.data;
      } else if (Array.isArray(result)) {
        chartData = result;
      }
      
      setData(chartData);
      setError(null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (widget.kind !== 'LiveChart') return;
    
    fetchData();
    
    const interval = setInterval(fetchData, widget.refreshMs);
    return () => clearInterval(interval);
  }, [widget.kind, widget.kind === 'LiveChart' ? widget.apiUrl : '', widget.kind === 'LiveChart' ? widget.refreshMs : 0]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeConfig.colors.primary }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <span>No data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeConfig.colors.border} />
          <XAxis 
            dataKey={widget.kind === 'LiveChart' ? widget.xKey : 'x'} 
            stroke={themeConfig.colors.textSecondary}
            fontSize={12}
          />
          <YAxis 
            dataKey={widget.kind === 'LiveChart' ? widget.yKey : 'y'} 
            stroke={themeConfig.colors.textSecondary}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: themeConfig.colors.surface,
              border: `1px solid ${themeConfig.colors.border}`,
              borderRadius: '8px',
              color: themeConfig.colors.text,
            }}
          />
          <Line
            type="monotone"
            dataKey={widget.kind === 'LiveChart' ? widget.yKey : 'y'}
            stroke={themeConfig.colors.primary}
            strokeWidth={2}
            dot={{ fill: themeConfig.colors.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: themeConfig.colors.primary, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { LiveChart };
