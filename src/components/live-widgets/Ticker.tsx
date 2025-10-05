'use client';

import React, { useState, useEffect } from 'react';
import { LiveWidget, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';

interface TickerProps {
  widget: LiveWidget;
  theme: Theme;
}

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

function Ticker({ widget, theme }: TickerProps) {
  const themeConfig = getThemeConfig(theme);
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (widget.kind !== 'Ticker') return;
    
    try {
      setLoading(true);
      
      // For demo purposes, use mock data
      if (widget.symbols.includes('BTC') || widget.symbols.includes('ETH')) {
        const mockData: TickerData[] = widget.symbols.map((symbol: string) => ({
          symbol,
          price: Math.random() * 50000 + 20000,
          change: (Math.random() - 0.5) * 1000,
          changePercent: (Math.random() - 0.5) * 10,
        }));
        setData(mockData);
        setError(null);
        return;
      }
      
      // In production, you would fetch real data from an API
      const response = await fetch(`/api/live-proxy?url=${encodeURIComponent(`https://api.coingecko.com/api/v3/simple/price?ids=${widget.symbols.join(',')}&vs_currencies=usd&include_24hr_change=true`)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const result = await response.json();
      const tickerData: TickerData[] = Object.entries(result).map(([symbol, data]: [string, any]) => ({
        symbol: symbol.toUpperCase(),
        price: data.usd,
        change: data.usd_24h_change,
        changePercent: data.usd_24h_change,
      }));
      
      setData(tickerData);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticker data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (widget.kind !== 'Ticker') return;
    
    fetchData();
    
    const interval = setInterval(fetchData, widget.refreshMs);
    return () => clearInterval(interval);
  }, [widget.kind, widget.kind === 'Ticker' ? widget.symbols : [], widget.kind === 'Ticker' ? widget.refreshMs : 0]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: themeConfig.colors.primary }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-16 text-red-500">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex space-x-8 overflow-x-auto">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center space-x-3 px-4 py-2 rounded-lg"
            style={{
              backgroundColor: themeConfig.colors.surface,
              border: `1px solid ${themeConfig.colors.border}`,
            }}
          >
            <div className="text-lg font-semibold" style={{ color: themeConfig.colors.text }}>
              {item.symbol}
            </div>
            <div className="text-lg font-medium" style={{ color: themeConfig.colors.text }}>
              ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className={`text-sm font-medium ${
                item.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Ticker };

