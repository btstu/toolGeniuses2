'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CryptoData = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  changePercent24Hr: string;
};

export default function CryptoTools() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [amount, setAmount] = useState<string>('1');
  const [loading, setLoading] = useState(true);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch('https://api.coincap.io/v2/assets');
      const data = await response.json();
      setCryptoData(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(price));
  };

  const formatMarketCap = (marketCap: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(parseFloat(marketCap));
  };

  const getSelectedCryptoPrice = () => {
    const crypto = cryptoData.find(c => c.id === selectedCrypto);
    return crypto ? parseFloat(crypto.priceUsd) : 0;
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">💰</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Crypto</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Tools</span>
      </h2>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cryptoData.slice(0, 6).map((crypto, index) => (
                <Card 
                  key={crypto.id}
                  className={cn(
                    "opacity-0 animate-slide-up transition-all duration-300 hover:shadow-md",
                    `animation-delay-${index * 100}`
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{crypto.name} ({crypto.symbol})</span>
                      <span className="text-xs text-muted-foreground">#{crypto.rank}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(crypto.priceUsd)}</div>
                    <div className={cn(
                      "text-sm mt-1 flex items-center gap-1 transition-colors",
                      parseFloat(crypto.changePercent24Hr) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    )}>
                      <TrendingUp className={cn(
                        "w-4 h-4 transition-transform",
                        parseFloat(crypto.changePercent24Hr) < 0 && "rotate-180"
                      )} />
                      {parseFloat(crypto.changePercent24Hr).toFixed(2)}% (24h)
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="converter" className="space-y-4">
          <Card className="animate-fade-in">
            <CardContent className="pt-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-slide-up animation-delay-100">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="transition-all duration-300 hover:border-primary/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2 animate-slide-up animation-delay-200">
                  <label className="text-sm font-medium">Cryptocurrency</label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger className="transition-all duration-300 hover:border-primary/50">
                      <SelectValue placeholder="Select crypto" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.map((crypto) => (
                        <SelectItem key={crypto.id} value={crypto.id}>
                          {crypto.name} ({crypto.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 p-4 bg-secondary/10 rounded-xl animate-slide-up animation-delay-300">
                <div className="text-sm text-muted-foreground">Converted Amount (USD)</div>
                <div className="text-2xl font-bold flex items-center gap-2">

                  {formatPrice((parseFloat(amount || '0') * getSelectedCryptoPrice()).toString())}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card className="animate-fade-in">
            <CardContent className="pt-6 bg-card">
              <div className="space-y-4">
                {cryptoData.slice(0, 10).map((crypto, index) => (
                  <div
                    key={crypto.id}
                    className={cn(
                      "flex items-center justify-between p-4 bg-secondary/10 rounded-lg",
                      "opacity-0 animate-slide-up transition-all duration-300 hover:bg-secondary/20",
                      `animation-delay-${index * 100}`
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-muted-foreground w-8">
                        #{crypto.rank}
                      </div>
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(crypto.priceUsd)}</div>
                      <div className="text-sm text-muted-foreground">
                        MC: {formatMarketCap(crypto.marketCapUsd)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 