'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type CryptoData = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  priceUsd: string;
  marketCapUsd: string;
  changePercent24Hr: string;
};

type PriceHistory = {
  timestamp: number;
  price: number;
}[];

export default function CryptoTools() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [amount, setAmount] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('24h');
  const [priceHistory, setPriceHistory] = useState<PriceHistory>([]);
  const [priceHistories, setPriceHistories] = useState<{ [key: string]: PriceHistory }>({});

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

  const fetchPriceHistory = async (id: string, interval: string) => {
    try {
      const now = Date.now();
      const start = {
        '24h': now - 24 * 60 * 60 * 1000,
        '7d': now - 7 * 24 * 60 * 60 * 1000,
        '30d': now - 30 * 24 * 60 * 60 * 1000,
        '1y': now - 365 * 24 * 60 * 60 * 1000,
      }[interval];

      const response = await fetch(
        `https://api.coincap.io/v2/assets/${id}/history?interval=h1&start=${start}&end=${now}`
      );
      const data = await response.json();
      setPriceHistory(data.data.map((point: any) => ({
        timestamp: point.time,
        price: parseFloat(point.priceUsd),
      })));
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const fetchMultiplePriceHistories = async (ids: string[]) => {
    const histories: { [key: string]: PriceHistory } = {};
    for (const id of ids) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const now = Date.now();
        const start = now - 24 * 60 * 60 * 1000;
        const response = await fetch(
          `https://api.coincap.io/v2/assets/${id}/history?interval=h1&start=${start}&end=${now}`
        );
        
        if (!response.ok) {
          console.warn(`Skipping ${id}: API returned ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (!data || !data.data || !Array.isArray(data.data)) {
          console.warn(`Skipping ${id}: Invalid data format`);
          continue;
        }

        if (data.data.length === 0) {
          console.warn(`Skipping ${id}: No price data available`);
          continue;
        }

        histories[id] = data.data.map((point: any) => ({
          timestamp: point.time,
          price: parseFloat(point.priceUsd),
        }));
      } catch (error) {
        console.warn(`Error fetching history for ${id}:`, error);
      }
    }
    setPriceHistories(histories);
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchPriceHistory(selectedCrypto, timeframe);
    }
  }, [selectedCrypto, timeframe]);

  useEffect(() => {
    if (cryptoData.length > 0) {
      const visibleCryptos = cryptoData.slice(0, showAllPrices ? 20 : 8);
      fetchMultiplePriceHistories(visibleCryptos.map(c => c.id));
    }
  }, [cryptoData, showAllPrices]);

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

  const calculateMarketMetrics = () => {
    if (!cryptoData.length) return null;
    
    const totalMarketCap = cryptoData.reduce((sum, crypto) => 
      sum + parseFloat(crypto.marketCapUsd), 0);
    
    const btcDominance = (parseFloat(cryptoData[0]?.marketCapUsd || '0') / totalMarketCap) * 100;
    
    const top10MarketCap = cryptoData.slice(0, 10).reduce((sum, crypto) => 
      sum + parseFloat(crypto.marketCapUsd), 0);
    
    const gainers = [...cryptoData]
      .sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))
      .slice(0, 5);
    
    const losers = [...cryptoData]
      .sort((a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr))
      .slice(0, 5);

    return {
      totalMarketCap,
      btcDominance,
      top10MarketCap,
      gainers,
      losers
    };
  };

  return (
    <div className="max-w-8xl mx-auto flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="opacity-0 animate-fade-in">💰</span>
        <span className="opacity-0 animate-fade-in animation-delay-100">Crypto</span>
        <span className="opacity-0 animate-fade-in animation-delay-200">Tools</span>
      </h2>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="rankings">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cryptoData.slice(0, 8).map((crypto, index) => (
                  <Card 
                    key={crypto.id}
                    className={cn(
                      "opacity-0 animate-slide-up transition-all duration-300 hover:shadow-md",
                      `animation-delay-${Math.min(index * 100, 1000)}`
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
                      <div className="h-[60px] mt-2">
                        {priceHistories[crypto.id] && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistories[crypto.id]}>
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke={parseFloat(crypto.changePercent24Hr) >= 0 ? "#16a34a" : "#dc2626"}
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {showAllPrices && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {cryptoData.slice(8, 20).map((crypto, index) => (
                    <Card 
                      key={crypto.id}
                      className={cn(
                        "opacity-0 animate-slide-up transition-all duration-300 hover:shadow-md",
                        `animation-delay-${Math.min(index * 100, 1000)}`
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
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllPrices(!showAllPrices)}
                  className="animate-slide-up"
                >
                  {showAllPrices ? (
                    <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Show More <ChevronDown className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="converter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cryptocurrency Converter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg space-y-2">
                  <div className="text-sm text-muted-foreground">Converted to USD</div>
                  <div className="text-2xl font-bold">
                    {formatPrice((parseFloat(amount || '0') * getSelectedCryptoPrice()).toString())}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCrypto && cryptoData.find(c => c.id === selectedCrypto) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                        <div className="text-lg font-semibold">
                          {formatMarketCap(cryptoData.find(c => c.id === selectedCrypto)!.marketCapUsd)}
                        </div>
                      </div>
                      <div className="p-4 bg-secondary/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">24h Change</div>
                        <div className={cn(
                          "text-lg font-semibold",
                          parseFloat(cryptoData.find(c => c.id === selectedCrypto)!.changePercent24Hr) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        )}>
                          {parseFloat(cryptoData.find(c => c.id === selectedCrypto)!.changePercent24Hr).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Price History</div>
                        <Select value={timeframe} onValueChange={(value: '24h' | '7d' | '30d' | '1y') => setTimeframe(value)}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="24h">24h</SelectItem>
                            <SelectItem value="7d">7d</SelectItem>
                            <SelectItem value="30d">30d</SelectItem>
                            <SelectItem value="1y">1y</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 border rounded-lg h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceHistory}>
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(timestamp) => {
                                const date = new Date(timestamp);
                                return timeframe === '24h'
                                  ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                              }}
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              domain={['auto', 'auto']}
                              tickFormatter={(value) => `$${value.toLocaleString()}`}
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const date = new Date(payload[0].payload.timestamp);
                                  const value = Number(payload[0].value);
                                  return (
                                    <div className="bg-popover p-2 rounded-lg border shadow-sm">
                                      <div className="text-sm font-medium">
                                        ${value.toFixed(2)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {date.toLocaleString()}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4 h-full">
                <Card className="animate-fade-in h-[calc(50%-0.5rem)]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Market Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Market Cap</div>
                      <div className="text-lg font-semibold">
                        {formatMarketCap(calculateMarketMetrics()?.totalMarketCap.toString() || '0')}
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <div className="text-sm text-muted-foreground">BTC Dominance</div>
                      <div className="text-lg font-semibold">
                        {calculateMarketMetrics()?.btcDominance.toFixed(2)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in animation-delay-200 h-[calc(50%-0.5rem)]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Gainers (24h)</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto max-h-[200px]">
                    <div className="space-y-2">
                      {calculateMarketMetrics()?.gainers.map((crypto) => (
                        <div key={crypto.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/10">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{crypto.symbol}</div>
                            <div className="text-sm text-muted-foreground">{formatPrice(crypto.priceUsd)}</div>
                          </div>
                          <div className="text-green-600">
                            +{parseFloat(crypto.changePercent24Hr).toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 h-full">
                <Card className="animate-fade-in animation-delay-100 h-[calc(50%-0.5rem)]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Market Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={cryptoData.slice(0, 10)}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <XAxis dataKey="symbol" fontSize={12} />
                          <YAxis
                            tickFormatter={(value) => `${(value / 1e9).toFixed(0)}B`}
                            fontSize={12}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length && payload[0].value) {
                                return (
                                  <div className="bg-popover p-2 rounded-lg border shadow-sm">
                                    <div className="text-sm font-medium">
                                      {payload[0].payload.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatMarketCap(payload[0].value.toString())}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="marketCapUsd"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in animation-delay-300 h-[calc(50%-0.5rem)]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Top Losers (24h)</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto max-h-[200px]">
                    <div className="space-y-2">
                      {calculateMarketMetrics()?.losers.map((crypto) => (
                        <div key={crypto.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/10">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{crypto.symbol}</div>
                            <div className="text-sm text-muted-foreground">{formatPrice(crypto.priceUsd)}</div>
                          </div>
                          <div className="text-red-600">
                            {parseFloat(crypto.changePercent24Hr).toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 