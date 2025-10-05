'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ExtractedContent } from '@/lib/pdf-processor';

interface PDFUploadProps {
  onPDFProcessed: (content: ExtractedContent, outline: any) => void;
  onError: (error: string) => void;
}

export function PDFUpload({ onPDFProcessed, onError }: PDFUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      const data = await response.json();
      setStatus('success');
      
      // Call the callback with processed data
      onPDFProcessed(data.content, data.outline);
      
    } catch (error) {
      console.error('PDF processing error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process PDF');
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onPDFProcessed, onError, errorMessage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      default:
        return <Upload className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading PDF...';
      case 'processing':
        return 'Processing content...';
      case 'success':
        return 'PDF processed successfully!';
      case 'error':
        return 'Processing failed';
      default:
        return 'Drop a PDF file here or click to browse';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Research Paper
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload a PDF research paper to automatically generate an academic presentation
        </p>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            {getStatusIcon()}
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {getStatusText()}
              </p>
              {status === 'idle' && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supports PDF files up to 10MB
                </p>
              )}
            </div>

            {status === 'error' && errorMessage && (
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  {errorMessage}
                </Badge>
              </div>
            )}

            {isProcessing && (
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress}% complete
                </p>
              </div>
            )}

            {status === 'idle' && (
              <Button variant="outline" size="sm">
                Choose PDF File
              </Button>
            )}

            {status === 'success' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setErrorMessage('');
                }}
              >
                Upload Another
              </Button>
            )}

            {status === 'error' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatus('idle');
                  setProgress(0);
                  setErrorMessage('');
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            What happens when you upload a PDF?
          </h4>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• Extracts text, figures, and tables from your research paper</li>
            <li>• Identifies key sections and academic structure</li>
            <li>• Generates an optimized presentation outline</li>
            <li>• Creates slides with proper academic formatting</li>
            <li>• Applies appropriate academic themes and styling</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

