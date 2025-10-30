"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";

interface VideoFileInputProps {
  onProcessVideo: (file: File) => void;
}

const VideoFileInput: React.FC<VideoFileInputProps> = ({ onProcessVideo }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setError(null);
        onProcessVideo(file);
      } else {
        setError("Invalid file type. Please select a video file.");
      }
    }
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        if (file.type.startsWith("video/")) {
          setError(null);
          onProcessVideo(file);
        } else {
          setError("Invalid file type. Please drop a video file.");
        }
      }
    },
    [onProcessVideo]
  );

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <Card
      className={`w-full max-w-2xl border-dashed transition-colors duration-300 ${
        isDragOver ? "border-primary bg-muted/50" : ""
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Upload a Product Video
        </CardTitle>
        <CardDescription>
          Drag & drop a video file here or click below to select one.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center py-6">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />

        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button asChild size="lg">
          <label htmlFor="video-upload" className="cursor-pointer">
            Select Video File
          </label>
        </Button>

        {error && (
          <Alert
            variant="destructive"
            className="mt-4 w-full max-w-sm text-left"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoFileInput;
