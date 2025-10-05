'use client';

import React from 'react';
import { SlideBlock, Theme } from '@/lib/schema';
import { getThemeConfig } from '@/lib/theming';
import { BaseBlock } from './BaseBlock';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface MarkdownBlockProps {
  block: SlideBlock;
  theme: Theme;
  isEditing?: boolean;
  onEdit?: (block: SlideBlock) => void;
  onDelete?: () => void;
  onAdd?: (block: SlideBlock) => void;
}

export function MarkdownBlock({
  block,
  theme,
  isEditing = false,
  onEdit,
  onDelete,
  onAdd,
}: MarkdownBlockProps) {
  const themeConfig = getThemeConfig(theme);

  if (block.type !== 'Markdown') {
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
      className="w-full prose prose-lg max-w-none"
    >
      <div
        className="markdown-content"
        style={{
          color: themeConfig.colors.text,
          fontFamily: themeConfig.typography.fontFamily,
        }}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1
                className="text-3xl font-bold mb-4"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className="text-2xl font-semibold mb-3"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className="text-xl font-medium mb-2"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p
                className="mb-4 leading-relaxed"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong
                className="font-semibold"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em
                className="italic"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                {children}
              </em>
            ),
            code: ({ children }) => (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  color: themeConfig.colors.text,
                }}
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto"
                style={{
                  backgroundColor: themeConfig.colors.surface,
                  color: themeConfig.colors.text,
                }}
              >
                {children}
              </pre>
            ),
            ul: ({ children }) => (
              <ul
                className="list-disc list-inside mb-4 space-y-1"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol
                className="list-decimal list-inside mb-4 space-y-1"
                style={{ color: themeConfig.colors.text }}
              >
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li style={{ color: themeConfig.colors.text }}>
                {children}
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="border-l-4 pl-4 italic my-4"
                style={{
                  borderColor: themeConfig.colors.primary,
                  color: themeConfig.colors.textSecondary,
                }}
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {block.md}
        </ReactMarkdown>
      </div>
    </BaseBlock>
  );
}

