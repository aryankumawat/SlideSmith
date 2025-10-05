'use client';

import React from 'react';
import { Slide, SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { HeadingBlock } from './blocks/HeadingBlock';
import { SubheadingBlock } from './blocks/SubheadingBlock';
import { MarkdownBlock } from './blocks/MarkdownBlock';
import { BulletsBlock } from './blocks/BulletsBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ChartBlock } from './blocks/ChartBlock';
import { LiveBlock } from './blocks/LiveBlock';

interface SlideViewProps {
  slide: Slide;
  theme: Theme;
  isEditing?: boolean;
  onBlockEdit?: (blockIndex: number, block: SlideBlock) => void;
  onBlockDelete?: (blockIndex: number) => void;
  onBlockAdd?: (blockIndex: number, block: SlideBlock) => void;
  className?: string;
}

export function SlideView({
  slide,
  theme,
  isEditing = false,
  onBlockEdit,
  onBlockDelete,
  onBlockAdd,
  className = '',
}: SlideViewProps) {
  const themeConfig = getThemeConfig(theme);

  const renderBlock = (block: SlideBlock, index: number) => {
    const commonProps = {
      block,
      theme,
      isEditing,
      onEdit: (updatedBlock: SlideBlock) => onBlockEdit?.(index, updatedBlock),
      onDelete: () => onBlockDelete?.(index),
      onAdd: (newBlock: SlideBlock) => onBlockAdd?.(index, newBlock),
    };

    switch (block.type) {
      case 'Heading':
        return <HeadingBlock {...commonProps} />;
      case 'Subheading':
        return <SubheadingBlock {...commonProps} />;
      case 'Markdown':
        return <MarkdownBlock {...commonProps} />;
      case 'Bullets':
        return <BulletsBlock {...commonProps} />;
      case 'Image':
        return <ImageBlock {...commonProps} />;
      case 'Quote':
        return <QuoteBlock {...commonProps} />;
      case 'Code':
        return <CodeBlock {...commonProps} />;
      case 'Chart':
        return <ChartBlock {...commonProps} />;
      case 'Live':
        return <LiveBlock {...commonProps} />;
      default:
        return null;
    }
  };

  const getLayoutClasses = () => {
    switch (slide.layout) {
      case 'title':
        return 'flex flex-col items-center justify-center text-center';
      case 'title+bullets':
        return 'flex flex-col space-y-6';
      case 'two-col':
        return 'grid grid-cols-2 gap-8';
      case 'media-left':
        return 'grid grid-cols-2 gap-8';
      case 'media-right':
        return 'grid grid-cols-2 gap-8';
      case 'quote':
        return 'flex flex-col items-center justify-center text-center space-y-4';
      case 'chart':
        return 'flex flex-col space-y-6';
      case 'end':
        return 'flex flex-col items-center justify-center text-center';
      default:
        return 'flex flex-col space-y-6';
    }
  };

  const getSlideDimensions = () => {
    return 'w-full h-full min-h-[600px] max-w-4xl mx-auto';
  };

  return (
    <div
      className={`
        ${getSlideDimensions()}
        ${getLayoutClasses()}
        p-8
        rounded-lg
        ${className}
      `}
      style={{
        backgroundColor: themeConfig.colors.background,
        color: themeConfig.colors.text,
        fontFamily: themeConfig.typography.fontFamily,
      }}
    >
      {slide.blocks.map((block, index) => (
        <div key={`${slide.id}-block-${index}`}>
          {renderBlock(block, index)}
        </div>
      ))}
    </div>
  );
}

interface SlidePreviewProps {
  slide: Slide;
  theme: Theme;
  className?: string;
}

export function SlidePreview({ slide, theme, className = '' }: SlidePreviewProps) {
  return (
    <div className={`aspect-video ${className}`}>
      <SlideView slide={slide} theme={theme} />
    </div>
  );
}

