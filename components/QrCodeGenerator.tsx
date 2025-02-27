'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Link as LinkIcon, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function QrCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const generateQRCode = async (inputUrl: string) => {
    if (!inputUrl) {
      setQrCode('');
      return;
    }

    try {
      const encodedUrl = encodeURIComponent(inputUrl);
      const colorParam = color.replace('#', '').toUpperCase();
      const bgColorParam = bgColor.replace('#', '').toUpperCase();
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=200x200&format=png&qzone=1&color=${colorParam}&bgcolor=${bgColorParam}`;
      setQrCode(qrUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCode) {
      setError('Please enter a URL first');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(qrCode);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download QR code');
      console.error('Error downloading QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      generateQRCode(url);
    }, 500);
    return () => clearTimeout(debounce);
  }, [url, color, bgColor]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">📱</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">QR Code</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Generator</span>
      </h2>

      <div className="flex gap-2 animate-slide-up animation-delay-200">
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL or text"
            className="pl-9 transition-all duration-300 hover:border-primary/50 focus:border-primary"
          />
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">QR Code Color</h4>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Background Color</h4>
                <div className="flex gap-2">
                  <div 
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: bgColor }}
                  />
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          onClick={downloadQRCode} 
          className="shrink-0"
          disabled={loading || !qrCode}
        >
          <Download className={cn(
            "w-4 h-4 mr-2 transition-all",
            loading && "animate-spin"
          )} />
          Save QR
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500 animate-slide-up">
          {error}
        </div>
      )}

      {qrCode && (
        <Card className="overflow-hidden animate-slide-up animation-delay-300">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src={qrCode} 
                alt="QR Code"
                className="rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                width={200}
                height={200}
                style={{ backgroundColor: bgColor }}
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Click the Save QR button to download the image
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 