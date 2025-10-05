'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SlideBlock, Theme, AnimationType } from '@/lib/schema';
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
  animation?: AnimationType;
  delay?: number;
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
  animation = 'fadeIn',
  delay = 0,
}: BaseBlockProps) {
  const themeConfig = getThemeConfig(theme);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClasses = () => {
    if (!isVisible) {
      switch (animation) {
        case 'fadeIn':
          return 'opacity-0';
        case 'slideInFromTop':
          return 'opacity-0 transform -translate-y-8';
        case 'slideInFromBottom':
          return 'opacity-0 transform translate-y-8';
        case 'slideInFromLeft':
          return 'opacity-0 transform -translate-x-8';
        case 'slideInFromRight':
          return 'opacity-0 transform translate-x-8';
        case 'scaleIn':
          return 'opacity-0 transform scale-95';
        case 'bounceIn':
          return 'opacity-0 transform scale-75';
        case 'pulse':
          return 'opacity-0';
        default:
          return 'opacity-0';
      }
    }

    const baseClasses = 'transition-all duration-700 ease-out';
    switch (animation) {
      case 'fadeIn':
        return `${baseClasses} opacity-100`;
      case 'slideInFromTop':
        return `${baseClasses} opacity-100 transform translate-y-0`;
      case 'slideInFromBottom':
        return `${baseClasses} opacity-100 transform translate-y-0`;
      case 'slideInFromLeft':
        return `${baseClasses} opacity-100 transform translate-x-0`;
      case 'slideInFromRight':
        return `${baseClasses} opacity-100 transform translate-x-0`;
      case 'scaleIn':
        return `${baseClasses} opacity-100 transform scale-100`;
      case 'bounceIn':
        return `${baseClasses} opacity-100 transform scale-100 animate-bounce`;
      case 'pulse':
        return `${baseClasses} opacity-100 animate-pulse`;
      default:
        return `${baseClasses} opacity-100`;
    }
  };

  if (!isEditing) {
    return (
      <div 
        ref={elementRef}
        className={`${getAnimationClasses()} ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className={`relative group ${getAnimationClasses()} ${className}`}
    >
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

// Staggered animation component for bullet points
export function StaggeredBlock({
  children,
  className = '',
  staggerDelay = 100,
}: {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="opacity-0 transform translate-y-4 transition-all duration-500 ease-out"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animation: 'staggerIn 0.5s ease-out forwards',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
