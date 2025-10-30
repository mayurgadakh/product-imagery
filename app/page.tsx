"use client";

import React, { useState, useCallback, useRef } from "react";
import type { ProcessState, ProcessedData } from "@/types";
import VideoFileInput from "@/components/VideoFileInput";
import ResultsDisplay from "@/components/ResultsDisplay";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const App: React.FC = () => {
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractFrame = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    timestamp: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available"));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to extract frame."));
          },
          "image/jpeg",
          0.95
        );
      };

      const onError = (e: Event) => {
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        reject(new Error(`Video seeking failed: ${e}`));
      };

      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);
      video.currentTime = timestamp;
    });
  };

  const handleProcessVideo = useCallback(async (videoFile: File) => {
    setProcessState("loading");
    setError(null);
    setProcessedData(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setError("Internal error: video or canvas not ready.");
      setProcessState("error");
      return;
    }

    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;

    const onLoadedMetadata = async () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      try {
        const duration = video.duration;
        if (isNaN(duration) || duration <= 1) {
          throw new Error("Video duration invalid or too short.");
        }

        const NUM_CANDIDATE_FRAMES = 30;
        const frameTimestamps = Array.from({ length: NUM_CANDIDATE_FRAMES }, (_, i) =>
          (duration / (NUM_CANDIDATE_FRAMES + 1)) * (i + 1)
        );

        const frameBlobs: Blob[] = [];
        for (const timestamp of frameTimestamps) {
          const blob = await extractFrame(video, canvas, timestamp);
          frameBlobs.push(blob);
        }

        const formData = new FormData();
        frameBlobs.forEach((blob, i) =>
          formData.append(`frame_${i}`, blob, `frame_${i}.jpg`)
        );

        const response = await fetch("/api/process-video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Server error during processing.");
        }

        const result = await response.json();
        setProcessedData(result);
        setProcessState("success");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unknown error occurred.");
        setProcessState("error");
      } finally {
        URL.revokeObjectURL(videoUrl);
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
  }, []);

  const handleReset = useCallback(() => {
    setProcessState("idle");
    setProcessedData(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (processState) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing video, please wait…</p>
          </div>
        );

      case "success":
        return (
          processedData && (
            <ResultsDisplay processedData={processedData} onReset={handleReset} />
          )
        );

      case "error":
        return (
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={handleReset} className="mt-4">
              Try Again
            </Button>
          </Alert>
        );

      case "idle":
      default:
        return <VideoFileInput onProcessVideo={handleProcessVideo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <video ref={videoRef} hidden muted playsInline />
      <canvas ref={canvasRef} hidden />
      <Card className="w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            AI Product Shot Extractor
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Upload a product video. Our AI analyzes it to extract and enhance the
            best product shots.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex p-6 items-center justify-center w-full mx-auto">{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default App;
