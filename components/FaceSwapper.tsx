'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FaceSwapper() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'target') => {
    setError(null); // Clear any previous errors
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'source') {
          setSourceImage(result);
        } else {
          setTargetImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const swapFaces = async () => {
    if (!sourceImage || !targetImage) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.segmind.com/v1/face-swap', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_SEGMIND_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_image: sourceImage.split(',')[1],
          target_image: targetImage.split(',')[1],
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          console.log('Full error response:', errorData);
          throw new Error(`Authentication failed: ${errorData.message || 'Invalid API key'}`);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      setResultImage(`data:image/jpeg;base64,${data.image}`);
    } catch (error) {
      console.error('Error swapping faces:', error);
      setError(error instanceof Error ? error.message : 'Failed to swap faces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'face-swap-result.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">👥</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Face</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Swapper</span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-up">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Image Upload */}
        <Card className="animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Source Face</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'source')}
                className="hidden"
                id="source-upload"
              />
              <Label
                htmlFor="source-upload"
                className="flex-1 border-2 border-dashed rounded-lg p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span>Upload source face</span>
                </div>
              </Label>
            </div>
            {sourceImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
                <img
                  src={sourceImage}
                  alt="Source"
                  className="object-contain w-full h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Image Upload */}
        <Card className="animate-slide-up animation-delay-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'target')}
                className="hidden"
                id="target-upload"
              />
              <Label
                htmlFor="target-upload"
                className="flex-1 border-2 border-dashed rounded-lg p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span>Upload target image</span>
                </div>
              </Label>
            </div>
            {targetImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
                <img
                  src={targetImage}
                  alt="Target"
                  className="object-contain w-full h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={swapFaces}
        disabled={!sourceImage || !targetImage || loading}
        className="w-full mt-4 animate-slide-up animation-delay-400"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Swapping Faces...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4 mr-2" />
            Swap Faces
          </>
        )}
      </Button>

      {resultImage && (
        <Card className="animate-slide-up animation-delay-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Result</CardTitle>
            <Button variant="outline" size="icon" onClick={downloadImage}>
              <Download className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
              <img
                src={resultImage}
                alt="Result"
                className="object-contain w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 