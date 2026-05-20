"use client";

import * as React from "react";
import { ImageIcon, Loader2, Upload, X, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/hooks/use-file-upload";
import { useS3Upload } from "@/hooks/use-s3-upload";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

type ThumbnailUploadProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

export function ThumbnailUpload({ value, onChange }: ThumbnailUploadProps) {
  const { upload, cancel, reset, progress, uploading, error } = useS3Upload("image");
  const [isDragging, setIsDragging] = React.useState(false);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const preview = localPreview || value || null;

  React.useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE) {
      toast.error(`Image must be under ${formatBytes(MAX_SIZE)}.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    const url = await upload(file);
    if (url) {
      onChange(url);
      toast.success("Thumbnail uploaded!");
    } else {
      setLocalPreview(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onRemove() {
    cancel();
    reset();
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Thumbnail preview"
            className="aspect-video w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex w-full items-center justify-between gap-2">
              {uploading ? (
                <span className="text-xs text-white">Uploading {progress}%</span>
              ) : (
                <span className="truncate text-xs text-white/90">
                  Thumbnail ready
                </span>
              )}
              <div className="flex gap-1">
                {!uploading && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="size-7"
                    onClick={() => inputRef.current?.click()}
                  >
                    <RefreshCcw className="size-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-7"
                  onClick={onRemove}
                  disabled={uploading}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          {uploading ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <ImageIcon className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? `Uploading… ${progress}%` : "Drop thumbnail here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, WEBP · max {formatBytes(MAX_SIZE)}
            </p>
          </div>
          {!uploading && (
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <Upload className="size-3.5" />
              Browse files
            </Button>
          )}
          {uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
