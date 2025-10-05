'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Edit3 } from 'lucide-react';

interface BaseBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
  children: React.ReactNode;
  className?: string;
}

export function BaseBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
  children,
  className = '',
}: BaseBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (!isEditing) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {children}
      
      {/* Edit controls */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(block)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          {onAdd && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAdd(block)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

