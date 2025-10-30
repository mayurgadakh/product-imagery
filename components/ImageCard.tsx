"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  title: string;
  imageBase64: string;
  isOriginal?: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({
  title,
  imageBase64,
  isOriginal = false,
}) => {
  const mimeType = isOriginal ? "image/jpeg" : "image/png";
  const imageUrl = `data:${mimeType};base64,${imageBase64}`;

  return (
    <Card
      className={cn(
        "transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg",
        "bg-card border-border overflow-hidden"
      )}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-center text-base font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2 bg-muted/40 rounded-b-lg flex items-center justify-center">
        <AspectRatio ratio={1}>
          <img
            src={imageUrl}
            alt={title}
            className="object-contain w-full h-full rounded-md"
          />
        </AspectRatio>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
