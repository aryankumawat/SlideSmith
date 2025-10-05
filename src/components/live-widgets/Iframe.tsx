'use client';

import React, { useState } from 'react';
import { LiveWidget, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';

interface IframeProps {
  widget: LiveWidget;
  theme: Theme;
}

function Iframe({ widget, theme }: IframeProps) {
  const themeConfig = getThemeConfig(theme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load iframe content');
  };

  if (widget.kind !== 'Iframe') {
    return null;
  }

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeConfig.colors.primary }} />
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-32 text-red-500">
          <span>Error: {error}</span>
        </div>
      )}
      
      <iframe
        src={widget.src}
        width="100%"
        height={widget.height || 300}
        className="rounded-lg border-0"
        style={{
          border: `1px solid ${themeConfig.colors.border}`,
        }}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        title="Live Widget"
      />
    </div>
  );
}

export { Iframe };
