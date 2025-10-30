"use client";

import React from "react";
import type { ProcessedData } from "@/types";
import ImageCard from "./ImageCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, Repeat } from "lucide-react";

interface ResultsDisplayProps {
  processedData: ProcessedData;
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  processedData,
  onReset,
}) => {
  const { identifiedProduct, generatedViews } = processedData;

  return (
    <div className="w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 animate-fade-in">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Camera className="h-7 w-7 text-primary" />
          Identified Product
        </h2>
        <Badge variant="outline" className="text-lg px-4 py-1">
          {identifiedProduct}
        </Badge>
      </div>

      <Separator className="my-6" />

      {/* Generated Views */}
      {generatedViews.map((view, index) => (
        <Card
          key={index}
          className="animate-fade-in-up border-border bg-card/70 backdrop-blur-sm"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: "backwards",
          }}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              Best Shot {index + 1}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageCard
                title="Original Frame"
                imageBase64={view.originalFrame}
                isOriginal
              />
              <ImageCard
                title="Segmented Product"
                imageBase64={view.segmentedImage}
              />
              <ImageCard
                title="Enhanced Shot"
                imageBase64={view.enhancedImage}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reset Button */}
      <div
        className="text-center mt-10 animate-fade-in"
        style={{
          animationDelay: `${generatedViews.length * 150}ms`,
          animationFillMode: "backwards",
        }}
      >
        <Button size="lg" onClick={onReset} className="gap-2">
          <Repeat className="h-5 w-5" />
          Process Another Video
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
