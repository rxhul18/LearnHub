"use client";

import * as React from "react";
import { Film, Loader2, Upload, X, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/hooks/use-file-upload";
import { useS3Upload } from "@/hooks/use-s3-upload";

const ACCEPT = "video/mp4,video/quicktime,video/webm";
const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

type VideoUploadProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

export function VideoUpload({ value, onChange }: VideoUploadProps) {
  const { upload, cancel, reset, progress, uploading, error } = useS3Upload("video");
  const [isDragging, setIsDragging] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE) {
      toast.error(`Video must be under ${formatBytes(MAX_SIZE)}.`);
      return;
    }

    setFileName(file.name);
    const url = await upload(file);
    if (url) {
      onChange(url);
      toast.success("Video uploaded!");
    } else {
      setFileName(null);
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
    setFileName(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasVideo = Boolean(value);

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

      {hasVideo ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <video
            src={value!}
            controls
            className="aspect-video w-full bg-black object-contain"
          />
          <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-2">
            <span className="truncate text-xs text-muted-foreground">
              {uploading ? `Uploading ${progress}%…` : fileName || "Course video"}
            </span>
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
          {uploading && (
            <div className="h-1 bg-muted">
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
              <Film className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? `Uploading… ${progress}%` : "Drop course video here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              MP4, MOV, WEBM · max {formatBytes(MAX_SIZE)}
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
