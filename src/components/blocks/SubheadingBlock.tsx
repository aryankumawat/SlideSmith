'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';

interface SubheadingBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function SubheadingBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: SubheadingBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Subheading') {
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
      <h2
        className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed"
        style={{
          color: themeConfig.colors.textSecondary,
          fontFamily: themeConfig.typography.fontFamily,
          fontWeight: themeConfig.typography.fontWeight.medium,
        }}
      >
        {block.text}
      </h2>
    </BaseBlock>
  );
}

