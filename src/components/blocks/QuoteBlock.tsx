'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function QuoteBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: QuoteBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Quote') {
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
      <div className="space-y-6">
        <div className="flex justify-center">
          <Quote
            className="w-12 h-12 opacity-50"
            style={{ color: themeConfig.colors.primary }}
          />
        </div>
        
        <blockquote
          className="text-2xl md:text-3xl lg:text-4xl font-medium italic text-center leading-relaxed"
          style={{
            color: themeConfig.colors.text,
            fontFamily: themeConfig.typography.fontFamily,
          }}
        >
          "{block.text}"
        </blockquote>
        
        {block.author && (
          <div className="text-center">
            <p
              className="text-lg md:text-xl font-medium"
              style={{ color: themeConfig.colors.textSecondary }}
            >
              — {block.author}
            </p>
          </div>
        )}
      </div>
    </BaseBlock>
  );
}

