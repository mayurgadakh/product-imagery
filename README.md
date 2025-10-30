# AI Product Shot Extractor

An intelligent web application that transforms product videos into professional product photography using Google's Gemini AI. Simply upload a video of your product, and the AI will automatically extract, segment, and enhance the best shots with professional studio lighting.

## 🎬 Video Demo

Watch the demo on YouTube: [AI Product Shot Extractor Demo](https://www.youtube.com/watch?v=mAQP1Cca4Vs)

[![Watch the Demo](https://img.youtube.com/vi/mAQP1Cca4Vs/0.jpg)](https://www.youtube.com/watch?v=mAQP1Cca4Vs)

## Features

- **Smart Frame Selection**: Extracts 30 frames from your video and intelligently selects the 5 best shots
- **AI Product Identification**: Automatically identifies and names the product in the video
- **Background Removal**: Segments the product from its background using advanced AI
- **Professional Enhancement**: Applies studio lighting and clean surfaces for professional product shots
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **AI**: [Google Generative AI (Gemini 2.5)](https://ai.google.dev)
- **Icons**: [Lucide React](https://lucide.dev)

## Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- Google Gemini API key ([Get one here](https://ai.google.dev))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mayurgadakh/product-imagery.git
cd product-imagery
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

## Usage

1. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Upload a product video (any common format: MP4, MOV, etc.)

4. Wait for AI processing (typically 30-60 seconds)

5. View your professional product shots!

## How It Works

1. **Frame Extraction**: The app extracts 30 evenly-spaced frames from the uploaded video
2. **AI Analysis**: Gemini AI analyzes all frames to identify the product and select the 5 best shots based on:
   - Focus and clarity
   - Lighting quality
   - Product prominence
   - Angle variety
   - Minimal distractions
3. **Segmentation**: Each selected frame is processed to remove the background
4. **Enhancement**: Segmented products are placed on professional surfaces with studio lighting
5. **Results**: Original, segmented, and enhanced versions are displayed for comparison

## Project Structure

```
product-imagery/
 app/
    api/
       process-video/
           route.ts          # API endpoint for video processing
    page.tsx                   # Main application page
    layout.tsx                 # Root layout
 components/
    ui/                        # Reusable UI components
    VideoFileInput.tsx         # Video upload component
    ResultsDisplay.tsx         # Results display component
 types/
    index.ts                   # TypeScript type definitions
 lib/
    utils.ts                   # Utility functions
 public/                        # Static assets
```

## API Reference

### POST `/api/process-video`

Processes uploaded video frames to generate product shots.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Multiple frame images as `frame_0`, `frame_1`, etc.

**Response:**
```typescript
{
  identifiedProduct: string;
  generatedViews: Array<{
    originalFrame: string;      // Base64 encoded
    segmentedImage: string;     // Base64 encoded
    enhancedImage: string;      // Base64 encoded
  }>;
}
```

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Run linter:
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## Limitations

- Videos must be at least 1 second long
- Maximum video size depends on browser memory
- Processing time varies with video length (typically 30-60 seconds)
- Requires stable internet connection for AI processing

## Future Enhancements

- Support for Youtube Video URL
- Support for multiple product videos in batch
- Custom background selection for enhanced images
- Export options (PNG, JPG, various resolutions)
- Video trimming before processing
- Side-by-side comparison view
- Product metadata extraction
- Cloud storage integration