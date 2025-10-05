'use client';

import React from 'react';
import { SlideBlock, Theme, LiveWidget } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';
// import { LiveChart, Ticker, Countdown, Map, Iframe } from './live-widgets';

interface LiveBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function LiveBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: LiveBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Live') {
    return null;
  }

  const renderWidget = (widget: LiveWidget) => {
    // Temporary placeholder for live widgets
    return (
      <div className="flex items-center justify-center h-32 text-lg border-2 border-dashed rounded-lg" style={{ borderColor: themeConfig.colors.textSecondary }}>
        <span style={{ color: themeConfig.colors.textSecondary }}>
          Live Widget: {widget.kind}
        </span>
      </div>
    );
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
      <div className="w-full">
        {renderWidget(block.widget)}
      </div>
    </BaseBlock>
  );
}
