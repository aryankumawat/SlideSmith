'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';

interface HeadingBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function HeadingBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: HeadingBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Heading') {
    return null;
  }

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
      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
        style={{
          color: themeConfig.colors.text,
          fontFamily: themeConfig.typography.fontFamily,
          fontWeight: themeConfig.typography.fontWeight.bold,
        }}
      >
        {block.text}
      </h1>
    </BaseBlock>
  );
}

