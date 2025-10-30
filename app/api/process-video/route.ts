import { NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from "@google/genai";
import type { ProcessedData, GeneratedView } from '@/types';
import { blobToBase64 } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const frameBlobs: Blob[] = [];
        formData.forEach((value) => {
            if (value instanceof Blob) {
                frameBlobs.push(value);
            }
        });

        if (frameBlobs.length === 0) {
            return NextResponse.json({ error: 'No frames were uploaded.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set.");
        }

        const ai = new GoogleGenAI({ apiKey });

        const allFramesBase64 = await Promise.all(frameBlobs.map(blobToBase64));
        
        // Steps 1 & 2: Frame Selection & Product Identification
        const selectionModel = 'gemini-2.5-flash';
        const selectionPrompt = `Analyze all frames. Identify the main product. Select the 5 best frames showcasing it. Return JSON with "product_name" and "best_frame_indices" (an array of 5 zero-based indices). Criteria: product is focused, clear, well-lit; avoid people/distractions; varied angles.`;

        const imageParts = allFramesBase64.map((base64, i) => ({
            inlineData: { data: base64, mimeType: frameBlobs[i].type },
        }));
        
        let identifiedProduct = "Product";
        let selectedIndices: number[] = [0, 1, 2, 3, 4];

        const selectionResult = await ai.models.generateContent({
          model: selectionModel,
          contents: { parts: [{ text: selectionPrompt }, ...imageParts] },
          config: { responseMimeType: "application/json" },
        });

        const resultJson = JSON.parse(selectionResult.text);
        if (resultJson.product_name) identifiedProduct = resultJson.product_name;
        if (resultJson.best_frame_indices?.length > 0) {
            selectedIndices = resultJson.best_frame_indices.slice(0, 5);
        }

        const selectedFramesBase64 = selectedIndices.map(i => allFramesBase64[i]);
        const selectedFrameBlobs = selectedIndices.map(i => frameBlobs[i]);

        // Step 3: Segmentation
        const segmentationModel = 'gemini-2.5-flash-image';
        const segmentationPrompt = `This image features a '${identifiedProduct}'. Create a new image showing ONLY that product with a transparent background.`;

        const segmentationPromises = selectedFramesBase64.map((base64, index) => {
            const imagePart = { inlineData: { data: base64, mimeType: selectedFrameBlobs[index].type } };
            return ai.models.generateContent({
                model: segmentationModel,
                contents: { parts: [imagePart, { text: segmentationPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            }).catch(() => null);
        });
        const segmentationResults = await Promise.all(segmentationPromises);
        
        const successfulSegmentations = segmentationResults.map((result, index) => {
            const imagePart = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            return imagePart?.inlineData?.data ? {
                originalFrame: selectedFramesBase64[index],
                segmentedImage: imagePart.inlineData.data,
            } : null;
        }).filter(Boolean) as { originalFrame: string; segmentedImage: string; }[];
        
        if (successfulSegmentations.length === 0) throw new Error("AI failed to segment the product from any frames.");
        
        // Step 4: Enhancement
        const enhanceModel = 'gemini-2.5-flash-image';
        const enhancementPrompt = `Place this product on a clean, modern surface with soft, neutral studio lighting for a professional product shot.`;

        const enhancementPromises = successfulSegmentations.map(({ segmentedImage }) => {
            const segmentedImagePart = { inlineData: { data: segmentedImage, mimeType: 'image/png' } };
            return ai.models.generateContent({
                model: enhanceModel,
                contents: { parts: [segmentedImagePart, { text: enhancementPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            }).catch(() => null);
        });
        const enhancementResults = await Promise.all(enhancementPromises);

        // Step 5: Combine Results
        const generatedViews: GeneratedView[] = successfulSegmentations.map((data, index) => {
            const enhancementResult = enhancementResults[index];
            const part = enhancementResult?.candidates?.[0]?.content?.parts?.[0];
            const enhancedImage = part?.inlineData?.data || data.segmentedImage; // Fallback
            return { ...data, enhancedImage };
        });

        const finalData: ProcessedData = { identifiedProduct, generatedViews };
        return NextResponse.json(finalData);

    } catch (error) {
        console.error('Error processing video:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}