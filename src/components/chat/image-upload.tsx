'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X, Loader2, Upload, Scan, Calculator, FileSearch, Wand2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  userId: string;
  onImageUploaded: (payload: {
    url: string;
    path: string;
    imageDataUri: string;
    contentType?: string;
    analysisType?: string;
  }) => void;
  onCancel?: () => void;
}

const ANALYSIS_TYPES = [
  {
    id: 'general',
    label: 'General Analysis',
    description: 'Describe and analyze anything in the image',
    icon: Eye,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'math',
    label: 'Solve Math',
    description: 'Solve equations, formulas, or math problems',
    icon: Calculator,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'ocr',
    label: 'Extract Text',
    description: 'Read and extract all text from the image',
    icon: Scan,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  {
    id: 'document',
    label: 'Analyze Document',
    description: 'Summarize or explain a document or screenshot',
    icon: FileSearch,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  {
    id: 'creative',
    label: 'Creative Prompt',
    description: 'Get creative ideas or descriptions from the image',
    icon: Wand2,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
  },
] as const;

type AnalysisTypeId = typeof ANALYSIS_TYPES[number]['id'];

export function ImageUpload({ userId, onImageUploaded, onCancel }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisTypeId>('general');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file (JPG, PNG, WebP, GIF)', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Image must be under 20MB', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId);
      formData.append('autoDelete', 'true');

      const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await response.json();

      if (!data.success) throw new Error(data.error || 'Upload failed');

      onImageUploaded({
        url: data.url,
        path: data.path,
        imageDataUri: preview,
        contentType: data.contentType,
        analysisType,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onCancel?.();
  };

  const selectedType = ANALYSIS_TYPES.find(t => t.id === analysisType)!;

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      {!preview ? (
        /* ── Drop zone ── */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
        >
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl transition-colors', isDragging ? 'bg-primary/15' : 'bg-muted')}>
            <Upload className={cn('h-5 w-5 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{isDragging ? 'Drop image here' : 'Drop image or click to browse'}</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF · Max 20MB</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-1" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            <ImageIcon className="mr-2 h-3.5 w-3.5" />
            Choose Image
          </Button>
        </div>
      ) : (
        /* ── Preview + options ── */
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative rounded-xl overflow-hidden border bg-muted/20">
            <img src={preview} alt="Preview" className="w-full h-auto max-h-52 object-contain" />
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white font-medium">
              {selectedFile?.name}
            </div>
          </div>

          {/* Analysis type selector */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              What should SOHAM do with this image?
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ANALYSIS_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = analysisType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAnalysisType(type.id)}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
                      isSelected
                        ? `${type.border} ${type.bg}`
                        : 'border-border hover:border-border/80 hover:bg-muted/30'
                    )}
                  >
                    <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', isSelected ? type.bg : 'bg-muted')}>
                      <Icon className={cn('h-3.5 w-3.5', isSelected ? type.color : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold leading-tight', isSelected ? 'text-foreground' : 'text-foreground/80')}>
                        {type.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected type info */}
          <div className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2.5', selectedType.border, selectedType.bg)}>
            <selectedType.icon className={cn('h-4 w-4 shrink-0', selectedType.color)} />
            <p className="text-xs text-muted-foreground">
              <span className={cn('font-semibold', selectedType.color)}>{selectedType.label}:</span>{' '}
              {selectedType.description}. Powered by Gemini 2.5 Flash.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isUploading} className="flex-1">
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleUpload} disabled={isUploading} className="flex-1 gap-2">
              {isUploading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
              ) : (
                <><selectedType.icon className="h-3.5 w-3.5" /> {selectedType.label}</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
