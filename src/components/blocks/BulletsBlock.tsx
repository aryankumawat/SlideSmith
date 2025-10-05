'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock, StaggeredBlock } from './BaseBlock';

interface BulletsBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function BulletsBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: BulletsBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Bullets') {
    return null;
  }

  const bulletItems = block.items.map((item, index) => (
    <li
      key={index}
      className="flex items-start space-x-3"
      style={{ color: themeConfig.colors.text }}
    >
      <span
        className="flex-shrink-0 w-2 h-2 rounded-full mt-3"
        style={{ backgroundColor: themeConfig.colors.primary }}
      />
      <span className="leading-relaxed">{item}</span>
    </li>
  ));

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
      {block.animation === 'staggerIn' ? (
        <StaggeredBlock className="space-y-3 text-lg md:text-xl">
          {bulletItems}
        </StaggeredBlock>
      ) : (
        <ul
          className="space-y-3 text-lg md:text-xl"
          style={{
            color: themeConfig.colors.text,
            fontFamily: themeConfig.typography.fontFamily,
          }}
        >
          {bulletItems}
        </ul>
      )}
    </BaseBlock>
  );
}
