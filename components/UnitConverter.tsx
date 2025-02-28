'use client';

import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UnitType = 'length' | 'weight' | 'temperature' | 'volume';

const conversions = {
  length: {
    meters: 1,
    feet: 3.28084,
    inches: 39.3701,
    kilometers: 0.001,
    miles: 0.000621371
  },
  weight: {
    kilograms: 1,
    pounds: 2.20462,
    ounces: 35.274,
    grams: 1000,
    elephants: 1/6000,
    titanics: 1/46328,
    burgers: 1/0.15,
    'blue-whales': 1/200000,
    ants: 1000/0.003,
    smartphones: 1/0.2,
    'your-mom': 1/500
  },
  temperature: {
    celsius: (val: number) => val,
    fahrenheit: (val: number) => (val * 9/5) + 32,
    kelvin: (val: number) => val + 273.15
  },
  volume: {
    liters: 1,
    gallons: 0.264172,
    milliliters: 1000,
    'cubic-meters': 0.001
  }
};

const unitLabels = {
  kilograms: '⚖️ Kilograms',
  pounds: '⚖️ Pounds',
  ounces: '⚖️ Ounces',
  grams: '⚖️ Grams',
  elephants: '🐘 Elephants',
  titanics: '🚢 Titanics',
  burgers: '🍔 Burgers',
  'blue-whales': '🐋 Blue Whales',
  ants: '🐜 Ants',
  smartphones: '📱 Smartphones',
  'your-mom': '👩 Your Mom™'
};

export default function UnitConverter() {
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');

  const handleUnitTypeChange = (newType: UnitType) => {
    setUnitType(newType);
    setFromUnit('');
    setToUnit('');
    setValue('');
    setResult('');
  };

  const convert = useCallback(() => {
    if (!fromUnit || !toUnit || !value) {
      setResult('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setResult('Invalid input');
      return;
    }

    if (unitType === 'temperature') {
      // First convert to Celsius
      let celsius;
      if (fromUnit === 'fahrenheit') {
        celsius = (numValue - 32) * 5/9;
      } else if (fromUnit === 'kelvin') {
        celsius = numValue - 273.15;
      } else {
        celsius = numValue;
      }

      // Then convert from Celsius to target unit
      const result = conversions.temperature[toUnit as keyof typeof conversions.temperature](celsius);
      setResult(result.toFixed(2));
    } else {
      const conversionRates = conversions[unitType];
      const baseValue = numValue / conversionRates[fromUnit as keyof typeof conversionRates];
      const result = baseValue * conversionRates[toUnit as keyof typeof conversionRates];
      
      // Format result based on unit type
      const formattedResult = unitType === 'weight' 
        ? result.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : result.toFixed(2);
      
      setResult(formattedResult);
    }
  }, [value, fromUnit, toUnit, unitType]);

  useEffect(() => {
    convert();
  }, [convert]);

  const formatUnitLabel = (unit: string) => {
    if (unitLabels[unit as keyof typeof unitLabels]) {
      return unitLabels[unit as keyof typeof unitLabels];
    }
    return unit.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold">📏 Unit Converter</h2>
      
      <Select value={unitType} onValueChange={handleUnitTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="length">Length</SelectItem>
          <SelectItem value="weight">Weight</SelectItem>
          <SelectItem value="temperature">Temperature</SelectItem>
          <SelectItem value="volume">Volume</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger>
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(unitType === 'temperature' 
                ? conversions.temperature 
                : conversions[unitType]).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {formatUnitLabel(unit)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="p-2 border rounded"
            placeholder="Enter value"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger>
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(unitType === 'temperature' 
                ? conversions.temperature 
                : conversions[unitType]).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {formatUnitLabel(unit)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-2 border rounded bg-secondary/20 min-h-[41px] flex items-center">
            {result && `${result} ${formatUnitLabel(toUnit)}`}
          </div>
        </div>
      </div>

      {unitType === 'weight' && (
        <div className="text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg">
          <p className="font-medium mb-2">Fun Weight Facts:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>An adult African elephant weighs about 6,000 kg</li>
            <li>The Titanic had a weight of 46,328 tons</li>
            <li>A standard hamburger weighs around 0.15 kg 🍔</li>
            <li>A Blue Whale can weigh up to 200,000 kg</li>
            <li>A common ant weighs about 3 mg</li>
            <li>An average smartphone weighs 0.2 kg 📱</li>
            <li>Your Mom™ weighs... well, you know 👩</li>
          </ul>
        </div>
      )}
    </div>
  );
} 
