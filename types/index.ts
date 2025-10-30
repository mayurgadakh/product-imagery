export type ProcessState = 'idle' | 'loading' | 'success' | 'error';

export interface GeneratedView {
  originalFrame: string;
  segmentedImage: string;
  enhancedImage: string;
}

export interface ProcessedData {
  identifiedProduct: string;
  generatedViews: GeneratedView[];
}