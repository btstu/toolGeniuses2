'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shuffle, Copy, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function RgbToHexConverter() {
  // RGB to Hex state
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState('#000000');
  const [copied, setCopied] = useState(false);

  // Gradient state
  const [gradientColors, setGradientColors] = useState({
    start: '#FF0000',
    end: '#0000FF'
  });
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState(90);

  const handleChange = (color: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.min(255, Math.max(0, Number(value) || 0));
    const newRgb = { ...rgb, [color]: numValue };
    setRgb(newRgb);
    setHex(
      '#' +
      newRgb.r.toString(16).padStart(2, '0') +
      newRgb.g.toString(16).padStart(2, '0') +
      newRgb.b.toString(16).padStart(2, '0')
    );
  };

  const randomizeGradient = () => {
    const randomHex = () => 
      '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    setGradientColors({
      start: randomHex(),
      end: randomHex()
    });
  };

  const getGradientCSS = () => {
    if (gradientType === 'linear') {
      return `background: linear-gradient(${gradientAngle}deg, ${gradientColors.start}, ${gradientColors.end});`;
    }
    return `background: radial-gradient(circle, ${gradientColors.start}, ${gradientColors.end});`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">🎨</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Color</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Tools</span>
      </h2>
      
      <Tabs defaultValue="rgb" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rgb">RGB to Hex</TabsTrigger>
          <TabsTrigger value="gradient">Gradient Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="rgb" className="space-y-4">
          <div className="flex gap-4 animate-slide-up animation-delay-100">
            {['r', 'g', 'b'].map((color, index) => (
              <div key={color} className="flex-1 space-y-2">
                <label className="text-sm font-medium capitalize">{color}</label>
                <input
                  type="number"
                  value={rgb[color as keyof typeof rgb]}
                  onChange={(e) => handleChange(color as keyof typeof rgb, e.target.value)}
                  className={cn(
                    "w-full p-2 border rounded transition-all duration-300",
                    "hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20",
                    "animate-slide-up",
                    `animation-delay-${(index + 1) * 100}`
                  )}
                  min="0"
                  max="255"
                />
              </div>
            ))}
          </div>
          <div 
            className="w-full h-32 rounded-lg flex items-center justify-center font-mono text-lg relative group animate-slide-up animation-delay-400"
            style={{ 
              backgroundColor: hex,
              color: (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) > 186 ? '#000' : '#fff'
            }}
          >
            <div className="flex items-center gap-2">
              {hex}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(hex)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up animation-delay-100">
            {['start', 'end'].map((position, index) => (
              <div key={position} className="space-y-2">
                <label className="text-sm font-medium capitalize">{position} Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={gradientColors[position as keyof typeof gradientColors]}
                    onChange={(e) => setGradientColors(prev => ({ ...prev, [position]: e.target.value }))}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={gradientColors[position as keyof typeof gradientColors]}
                    onChange={(e) => setGradientColors(prev => ({ ...prev, [position]: e.target.value }))}
                    className="w-full p-2 border rounded font-mono transition-all duration-300 hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 items-center animate-slide-up animation-delay-200">
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')}
              className="p-2 border rounded transition-all duration-300 hover:border-primary/50 focus:border-primary"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>
            
            {gradientType === 'linear' && (
              <input
                type="number"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-20 p-2 border rounded transition-all duration-300 hover:border-primary/50 focus:border-primary"
                placeholder="Angle"
                min="0"
                max="360"
              />
            )}

            <Button 
              onClick={randomizeGradient}
              className="ml-auto group"
              variant="outline"
            >
              <Shuffle className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
              Randomize
            </Button>
          </div>

          <div 
            className="w-full h-32 rounded-lg animate-slide-up animation-delay-300 transition-all duration-500"
            style={{ 
              background: gradientType === 'linear' 
                ? `linear-gradient(${gradientAngle}deg, ${gradientColors.start}, ${gradientColors.end})`
                : `radial-gradient(circle, ${gradientColors.start}, ${gradientColors.end})`
            }}
          />

          <div className="p-4 bg-secondary/10 rounded-lg relative group animate-slide-up animation-delay-400">
            <code className="text-sm font-mono break-all block">
              {getGradientCSS()}
            </code>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => copyToClipboard(getGradientCSS())}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
