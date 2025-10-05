'use client';

import React, { useState, useEffect } from 'react';
import { LiveWidget, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';

interface MapProps {
  widget: LiveWidget;
  theme: Theme;
}

function Map({ widget, theme }: MapProps) {
  const themeConfig = getThemeConfig(theme);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (widget.kind !== 'Map') return;
    
    // In a real implementation, you would load a map library like Leaflet or Mapbox
    // For now, we'll use a placeholder
    setMapLoaded(true);
  }, [widget.kind]);

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeConfig.colors.primary }} />
      </div>
    );
  }

  // For demo purposes, show a placeholder map
  return (
    <div className="w-full h-64 relative rounded-lg overflow-hidden">
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor: themeConfig.colors.surface,
          border: `2px solid ${themeConfig.colors.border}`,
        }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <div className="text-lg font-medium" style={{ color: themeConfig.colors.text }}>
            Map Location
          </div>
          <div className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
            {widget.kind === 'Map' ? `${widget.lat.toFixed(4)}, ${widget.lng.toFixed(4)}` : '0.0000, 0.0000'}
          </div>
          <div className="text-xs mt-2" style={{ color: themeConfig.colors.textSecondary }}>
            Zoom: {widget.kind === 'Map' ? (widget.zoom || 10) : 10}
          </div>
        </div>
      </div>
      
      {/* Map marker */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2"
        style={{
          backgroundColor: themeConfig.colors.primary,
          borderColor: themeConfig.colors.text,
        }}
      />
    </div>
  );
}

export { Map };
