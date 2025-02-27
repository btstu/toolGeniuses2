'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, Loader2, Copy, Check, DownloadCloud, FileText, FileJson, Film, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SpeechToText() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        setError('File size must be less than 25MB');
        return;
      }
      setFile(file);
      setError(null);
    }
  };

  const transcribe = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to transcribe audio');
      }

      const data = await response.json();
      setTranscription(data.text);
    } catch (error) {
      console.error('Error transcribing:', error);
      setError(error instanceof Error ? error.message : 'Failed to transcribe audio');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTimeStamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const generateSRT = () => {
    // Simple SRT format with estimated timestamps (every 4 words)
    const words = transcription.split(' ');
    let srt = '';
    let counter = 1;
    let timeOffset = 0;

    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ');
      const startTime = formatTimeStamp(timeOffset);
      timeOffset += 2; // Assume 2 seconds per chunk
      const endTime = formatTimeStamp(timeOffset);

      srt += `${counter}\n${startTime} --> ${endTime}\n${chunk}\n\n`;
      counter++;
    }

    return srt;
  };

  const generateVTT = () => {
    // WebVTT format
    const words = transcription.split(' ');
    let vtt = 'WEBVTT\n\n';
    let timeOffset = 0;

    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ');
      const startTime = formatTimeStamp(timeOffset).replace(',', '.');
      timeOffset += 2;
      const endTime = formatTimeStamp(timeOffset).replace(',', '.');

      vtt += `${startTime} --> ${endTime}\n${chunk}\n\n`;
    }

    return vtt;
  };

  const generateJSON = () => {
    return JSON.stringify({
      transcription,
      metadata: {
        timestamp: new Date().toISOString(),
        wordCount: transcription.split(' ').length,
        characterCount: transcription.length,
      }
    }, null, 2);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFormats = [
    {
      name: 'Plain Text (.txt)',
      icon: <FileText className="w-4 h-4 mr-2" />,
      action: () => downloadFile(transcription, 'transcription.txt', 'text/plain'),
    },
    {
      name: 'Subtitles (.srt)',
      icon: <Film className="w-4 h-4 mr-2" />,
      action: () => downloadFile(generateSRT(), 'transcription.srt', 'text/plain'),
    },
    {
      name: 'WebVTT (.vtt)',
      icon: <Film className="w-4 h-4 mr-2" />,
      action: () => downloadFile(generateVTT(), 'transcription.vtt', 'text/plain'),
    },
    {
      name: 'JSON (.json)',
      icon: <FileJson className="w-4 h-4 mr-2" />,
      action: () => downloadFile(generateJSON(), 'transcription.json', 'application/json'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">🎙️</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Speech to</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Text</span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-up">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="animate-slide-up animation-delay-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Upload Audio/Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label
                htmlFor="file-upload"
                className="flex-1 border-2 border-dashed rounded-lg p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <span>Click to upload audio/video file</span>
                  <span className="text-xs">Max size: 25MB</span>
                </div>
              </Label>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-secondary/10 px-4 py-2 rounded-lg">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  onClick={transcribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    'Transcribe'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 animate-slide-up animation-delay-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Transcription</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {downloadFormats.map((format) => (
                    <DropdownMenuItem
                      key={format.name}
                      onClick={format.action}
                      className="cursor-pointer"
                    >
                      {format.icon}
                      {format.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcription}
              readOnly
              className="min-h-[400px] max-h-[600px] resize-y text-base leading-relaxed"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 