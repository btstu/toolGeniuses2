'use client';

import { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeUnit = 'standard' | 'fun';

const standardUnits = {
  years: (ms: number) => Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)),
  months: (ms: number) => Math.floor(ms / (30.44 * 24 * 60 * 60 * 1000)),
  days: (ms: number) => Math.floor(ms / (24 * 60 * 60 * 1000)),
  hours: (ms: number) => Math.floor(ms / (60 * 60 * 1000)),
  minutes: (ms: number) => Math.floor(ms / (60 * 1000)),
  seconds: (ms: number) => Math.floor(ms / 1000)
};

const funCalculations = {
  breaths: (days: number) => Math.floor(days * 1440 * 16),
  heartbeats: (days: number) => Math.floor(days * 1440 * 72),
  blinks: (days: number) => Math.floor(days * 1440 * 15),
  earthDistance: (days: number) => Math.floor(days * 24 * 107000)
};

export default function DateDifferenceCalculator() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1));
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [activeTab, setActiveTab] = useState<TimeUnit>('standard');
  const [difference, setDifference] = useState<Record<string, number>>({});

  useEffect(() => {
    calculateDifference();
  }, [startDate, endDate, startTime, endTime]);

  const calculateDifference = () => {
    const start = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    start.setHours(parseInt(startHours), parseInt(startMinutes));

    const end = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    end.setHours(parseInt(endHours), parseInt(endMinutes));

    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);

    const results: Record<string, number> = {};

    Object.entries(standardUnits).forEach(([unit, calculator]) => {
      results[unit] = calculator(diffMs);
    });

    Object.entries(funCalculations).forEach(([unit, calculator]) => {
      results[unit] = calculator(diffDays);
    });

    setDifference(results);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">⏰</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Date</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Calculator</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 animate-slide-up animation-delay-100">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-300",
                    "hover:border-primary/50 hover:bg-secondary/5",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 hover:border-primary/50 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-300",
                    "hover:border-primary/50 hover:bg-secondary/5",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 hover:border-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TimeUnit)} className="w-full animate-slide-up animation-delay-200">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Units</TabsTrigger>
          <TabsTrigger value="fun">Fun Facts</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-secondary/5 p-4 rounded-xl">
            {Object.entries(standardUnits).map(([unit], index) => (
              <div 
                key={unit} 
                className={cn(
                  "p-4 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
                  "opacity-0 animate-slide-up",
                  `animation-delay-${(index + 3) * 100}`
                )}
              >
                <div className="text-sm text-muted-foreground capitalize">{unit}</div>
                <div className="text-2xl font-bold">{formatNumber(difference[unit] || 0)}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fun" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 bg-secondary/5 p-4 rounded-xl">
            {[
              { key: 'breaths', icon: '💨', label: 'Breaths Taken', desc: 'Based on 16 breaths per minute' },
              { key: 'heartbeats', icon: '💗', label: 'Heartbeats', desc: 'Based on 72 beats per minute' },
              { key: 'blinks', icon: '👁️', label: 'Eye Blinks', desc: 'Based on 15 blinks per minute' },
              { key: 'earthDistance', icon: '🌍', label: "Earth's Travel Distance", desc: 'Earth travels at ~107,000 km/h' }
            ].map((item, index) => (
              <div 
                key={item.key}
                className={cn(
                  "p-4 bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-md",
                  "opacity-0 animate-slide-up",
                  `animation-delay-${(index + 3) * 100}`
                )}
              >
                <div className="text-sm font-medium flex items-center gap-2">
                  {item.icon} {item.label}
                </div>
                <div className="text-2xl font-bold">
                  {formatNumber(difference[item.key] || 0)}
                  {item.key === 'earthDistance' ? ' km' : ''}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 