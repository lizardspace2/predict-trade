import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { MarketCard } from "@/components/MarketCard";
import { mockMarkets } from "@/data/mockMarkets";
import { TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredMarkets = useMemo(() => {
    if (selectedCategory === "All") return mockMarkets;
    return mockMarkets.filter((market) => market.category === selectedCategory);
  }, [selectedCategory]);

  const trendingMarkets = mockMarkets.filter((m) => m.isTrending);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* Hero Section */}
        <section className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Predict the Future
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Trade on real-world events. Get rewarded for being right.
          </p>
        </section>

        {/* Trending Banner */}
        {trendingMarkets.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Trending Now
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {trendingMarkets.slice(0, 2).map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        {/* Markets Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {selectedCategory === "All" ? "All Markets" : selectedCategory}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredMarkets.length} markets
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMarkets.map((market, index) => (
              <div
                key={market.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MarketCard market={market} />
              </div>
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No markets found in this category
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try selecting a different category
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">PredictX</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 PredictX. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
