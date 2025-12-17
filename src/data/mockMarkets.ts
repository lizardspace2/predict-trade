export interface MarketOutcome {
  id: string;
  name: string;
  probability: number;
  change24h: number;
  volume: number;
  imageUrl?: string;
}

export interface Market {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  outcomes: MarketOutcome[];
  totalVolume: number;
  endDate: string;
  isLive?: boolean;
  isTrending?: boolean;
}

export interface PricePoint {
  date: string;
  [key: string]: number | string;
}

export const categories = [
  "All",
  "Politics",
  "Crypto",
  "Sports",
  "Tech",
  "Finance",
  "World",
  "Entertainment",
  "Science",
];

export const mockMarkets: Market[] = [
  {
    id: "fed-rates-jan",
    title: "Fed decision in January?",
    category: "Finance",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "50+ bps decrease", probability: 2, change24h: -0.5, volume: 8348652 },
      { id: "2", name: "25 bps decrease", probability: 21, change24h: 2.1, volume: 4129368 },
      { id: "3", name: "No change", probability: 77, change24h: -1.6, volume: 4266278 },
    ],
    totalVolume: 28469426,
    endDate: "2026-01-28",
  },
  {
    id: "trump-fed-chair",
    title: "Who will Trump nominate as Fed Chair?",
    category: "Politics",
    imageUrl: "https://images.unsplash.com/photo-1568658176326-4522a1454f67?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Kevin Hassett", probability: 55, change24h: 17, volume: 28000000 },
      { id: "2", name: "Kevin Warsh", probability: 26, change24h: -23, volume: 18000000 },
      { id: "3", name: "Christopher Waller", probability: 21, change24h: 13, volume: 12000000 },
    ],
    totalVolume: 68000000,
    endDate: "2026-03-15",
  },
  {
    id: "btc-100k",
    title: "Bitcoin above $100k by March?",
    category: "Crypto",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Yes", probability: 68, change24h: 5.2, volume: 45000000 },
      { id: "2", name: "No", probability: 32, change24h: -5.2, volume: 21000000 },
    ],
    totalVolume: 66000000,
    endDate: "2026-03-31",
    isTrending: true,
  },
  {
    id: "superbowl-winner",
    title: "Super Bowl LX Winner?",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Kansas City Chiefs", probability: 28, change24h: 3.1, volume: 12000000 },
      { id: "2", name: "Philadelphia Eagles", probability: 22, change24h: -1.2, volume: 8000000 },
      { id: "3", name: "Detroit Lions", probability: 18, change24h: 2.5, volume: 7500000 },
      { id: "4", name: "Buffalo Bills", probability: 15, change24h: 0.8, volume: 6000000 },
    ],
    totalVolume: 52000000,
    endDate: "2026-02-08",
    isLive: true,
  },
  {
    id: "ai-agi-2026",
    title: "AGI achieved by end of 2026?",
    category: "Tech",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Yes", probability: 12, change24h: 1.8, volume: 15000000 },
      { id: "2", name: "No", probability: 88, change24h: -1.8, volume: 125000000 },
    ],
    totalVolume: 140000000,
    endDate: "2026-12-31",
    isTrending: true,
  },
  {
    id: "tesla-stock",
    title: "Tesla stock above $500 by June?",
    category: "Finance",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Yes", probability: 35, change24h: -2.3, volume: 8500000 },
      { id: "2", name: "No", probability: 65, change24h: 2.3, volume: 15500000 },
    ],
    totalVolume: 24000000,
    endDate: "2026-06-30",
  },
  {
    id: "world-cup-host",
    title: "2030 World Cup primary host nation?",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Spain", probability: 42, change24h: 0.5, volume: 3200000 },
      { id: "2", name: "Morocco", probability: 35, change24h: -0.8, volume: 2800000 },
      { id: "3", name: "Portugal", probability: 23, change24h: 0.3, volume: 1800000 },
    ],
    totalVolume: 7800000,
    endDate: "2026-06-15",
  },
  {
    id: "spacex-starship",
    title: "SpaceX Starship successful Mars mission by 2028?",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=100&h=100&fit=crop",
    outcomes: [
      { id: "1", name: "Yes", probability: 8, change24h: 0.2, volume: 4200000 },
      { id: "2", name: "No", probability: 92, change24h: -0.2, volume: 48000000 },
    ],
    totalVolume: 52200000,
    endDate: "2028-12-31",
  },
];

export const generatePriceHistory = (market: Market): PricePoint[] => {
  const points: PricePoint[] = [];
  const numPoints = 90;
  const now = new Date();
  
  const baseValues: { [key: string]: number } = {};
  market.outcomes.forEach((outcome, idx) => {
    baseValues[outcome.name] = Math.random() * 30 + 20;
  });

  for (let i = numPoints; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const point: PricePoint = {
      date: date.toISOString().split('T')[0],
    };

    market.outcomes.forEach((outcome) => {
      const volatility = 0.08;
      const trend = (outcome.probability - baseValues[outcome.name]) / numPoints;
      baseValues[outcome.name] += trend + (Math.random() - 0.5) * volatility * baseValues[outcome.name];
      baseValues[outcome.name] = Math.max(1, Math.min(99, baseValues[outcome.name]));
      point[outcome.name] = Math.round(baseValues[outcome.name] * 10) / 10;
    });

    // Ensure final point matches current probability
    if (i === 0) {
      market.outcomes.forEach((outcome) => {
        point[outcome.name] = outcome.probability;
      });
    }

    points.push(point);
  }

  return points;
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(0)}K`;
  }
  return `$${volume}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
