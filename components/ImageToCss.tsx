'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Upload, Copy, Check, Loader2, Link, Code } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

interface GeneratedCode {
  html: string;
  css: string;
}

export default function ImageToCss() {
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [copied, setCopied] = useState<'html' | 'css' | null>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      setImage(imageUrl);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImage(e.target?.result as string);
              setImageUrl('');
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCode = async () => {
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
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Generate HTML and CSS code to recreate this image as closely as possible. Focus on layout, colors, shapes, and positioning. Return only the code, split into HTML and CSS sections."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          max_tokens: 4096
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract HTML and CSS from the response
      const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
      const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);

      if (htmlMatch && cssMatch) {
        setGeneratedCode({
          html: htmlMatch[1],
          css: cssMatch[1]
        });
        updatePreview(htmlMatch[1], cssMatch[1]);
      } else {
        throw new Error('Failed to parse generated code');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = (html: string, css: string) => {
    if (previewIframeRef.current) {
      const iframe = previewIframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>${html}</body>
          </html>
        `);
        doc.close();
      }
    }
  };

  const copyToClipboard = async (type: 'html' | 'css') => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode[type]);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">🎨</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Image to</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">CSS</span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-up">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Upload Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onPaste={handlePaste}
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 text-muted-foreground"
                >
                  <Upload className="w-8 h-8" />
                  <span>Drop image here, or click to upload</span>
                  <span className="text-xs">You can also paste an image</span>
                </Label>
              </div>

              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button onClick={handleImageUrlSubmit} variant="secondary">
                  <Link className="w-4 h-4 mr-2" />
                  Load
                </Button>
              </div>

              {image && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/10">
                  <Image
                    src={image}
                    alt="Image preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <Button
                    onClick={generateCode}
                    disabled={loading}
                    className="absolute bottom-4 right-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4 mr-2" />
                        Generate CSS
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {generatedCode && (
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Generated Code</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="html">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard('html')}
                    >
                      {copied === 'html' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <pre className="p-4 rounded-lg bg-muted overflow-auto text-foreground">
                      <code>{generatedCode.html}</code>
                    </pre>
                  </TabsContent>
                  <TabsContent value="css" className="relative">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard('css')}
                    >
                      {copied === 'css' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <pre className="p-4 rounded-lg bg-secondary/10 overflow-auto">
                      <code>{generatedCode.css}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:row-span-2 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video bg-card rounded-lg overflow-hidden border">
              <iframe
                ref={previewIframeRef}
                className="w-full h-full"
                title="Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 