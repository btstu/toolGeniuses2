'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Copy, Check, FileText } from "lucide-react";

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError('File size must be less than 20MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text from this image. Return only the extracted text, nothing else.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to extract text');
      }

      setText(data.choices[0].message.content);
    } catch (err) {
      console.error('Error extracting text:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract text');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <FileText className="w-5 h-5" />
        <span>Image to Text - Extract text from image</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 animate-slide-up animation-delay-200">
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
                  <span className="text-xs">Max size: 20MB</span>
                </div>
              </Label>
            </div>

            {image && (
              <>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Uploaded"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
                <Button
                  onClick={extractText}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    'Extract Text'
                  )}
                </Button>
              </>
            )}

            {error && (
              <div className="text-sm text-red-500 animate-slide-up">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 animate-slide-up animation-delay-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Extracted Text</CardTitle>
            {text && (
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              readOnly
              placeholder="Extracted text will appear here..."
              className="min-h-[300px] resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 