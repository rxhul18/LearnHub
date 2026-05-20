"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";

type UploadType = "image" | "video";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3050";

const ENDPOINTS: Record<UploadType, string> = {
  image: "/api/upload/image",
  video: "/api/upload/video",
};

export function useS3Upload(type: UploadType) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          `${API_URL}${ENDPOINTS[type]}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
            onUploadProgress: (event) => {
              if (event.total) {
                setProgress(Math.round((event.loaded * 100) / event.total));
              }
            },
          }
        );

        const url = res.data?.fileUrl as string | undefined;
        if (!url) throw new Error("Server did not return a file URL.");

        setFileUrl(url);
        return url;
      } catch (err) {
        if (axios.isCancel(err)) {
          setError("Upload cancelled.");
        } else if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Upload failed.");
        } else {
          setError(err instanceof Error ? err.message : "Upload failed.");
        }
        return null;
      } finally {
        setUploading(false);
        abortRef.current = null;
      }
    },
    [type]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFileUrl(null);
    setProgress(0);
    setError(null);
    setUploading(false);
  }, []);

  return {
    upload,
    cancel,
    reset,
    progress,
    uploading,
    fileUrl,
    setFileUrl,
    error,
  };
}
