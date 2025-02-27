'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ASCII_CHARS = {
  'Standard': '@%#*+=-:. ',
  'Complex': '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  'Simple': '█▓▒░ ',
  'Minimal': '10 '
};

export default function AsciiConverter() {
  const [image, setImage] = useState<string | null>(null);
  const [ascii, setAscii] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(10);
  const [charSet, setCharSet] = useState<keyof typeof ASCII_CHARS>('Standard');
  const [width, setWidth] = useState<number>(100);
  const [color, setColor] = useState<string>('#000000');
  const [preserveColor, setPreserveColor] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPixelBrightness = (r: number, g: number, b: number) => {
    return (r + g + b) / 3;
  };

  const convertToAscii = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate height while maintaining aspect ratio
      const aspectRatio = img.height / img.width;
      const height = Math.floor(width * aspectRatio);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      let asciiArt = '';
      const chars = ASCII_CHARS[charSet];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const brightness = getPixelBrightness(
            pixels[idx],
            pixels[idx + 1],
            pixels[idx + 2]
          );
          
          const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
          
          if (preserveColor) {
            asciiArt += `<span style="color: rgb(${pixels[idx]}, ${pixels[idx + 1]}, ${pixels[idx + 2]})">${chars[charIndex]}</span>`;
          } else {
            asciiArt += chars[charIndex];
          }
        }
        asciiArt += '\n';
      }

      setAscii(asciiArt);
    };
    img.src = image;
  };

  useEffect(() => {
    if (image) {
      convertToAscii();
    }
  }, [image, width, charSet, preserveColor]);

  const downloadAscii = () => {
    const element = document.createElement('a');
    const file = new Blob([ascii.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ascii-art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">🎨</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">ASCII Art</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Generator</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upload Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="flex-1 border-2 border-dashed rounded-lg p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span>Click to upload image</span>
                </div>
              </Label>
            </div>

            {image && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
                <img
                  src={image}
                  alt="Preview"
                  className="object-contain w-full h-full"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Character Set</Label>
                <select
                  value={charSet}
                  onChange={(e) => setCharSet(e.target.value as keyof typeof ASCII_CHARS)}
                  className="w-full p-2 rounded-md border"
                >
                  {Object.keys(ASCII_CHARS).map((set) => (
                    <option key={set} value={set}>{set}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Width (characters)</Label>
                <Slider
                  value={[width]}
                  onValueChange={(value) => setWidth(value[0])}
                  min={20}
                  max={200}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {width} characters
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  min={6}
                  max={24}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {fontSize}px
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Preserve Colors</Label>
                <Switch
                  checked={preserveColor}
                  onCheckedChange={setPreserveColor}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-slide-up animation-delay-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">ASCII Output</CardTitle>
            {ascii && (
              <Button variant="outline" size="icon" onClick={downloadAscii}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div 
              className="font-mono whitespace-pre overflow-auto bg-secondary/10 rounded-lg p-4 min-h-[400px] max-h-[600px]"
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: '1',
                color: preserveColor ? 'inherit' : color
              }}
              dangerouslySetInnerHTML={{ __html: ascii }}
            />
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 