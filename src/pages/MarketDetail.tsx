import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2, Calendar, Zap, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { PriceChart } from "@/components/PriceChart";
import { TradingPanel } from "@/components/TradingPanel";
import { OutcomeTable } from "@/components/OutcomeTable";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  mockMarkets,
  generatePriceHistory,
  formatVolume,
  MarketOutcome,
} from "@/data/mockMarkets";
import { useMarketData } from "@/hooks/useMarketData";
import { useWallet } from "@/hooks/useWallet";
import { getMarketContractAddress } from "@/web3/marketConfig";
import { Outcome } from "@/web3/prediction";
import { formatUnits } from "ethers";
import { DEFAULT_CONFIG } from "@/web3/marketConfig";

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const market = mockMarkets.find((m) => m.id === id);
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | undefined>();
  const { provider, address, isConnected } = useWallet();
  const contractAddress = id ? getMarketContractAddress(id) : null;
  
  const {
    marketInfo,
    userBalances,
    probabilities,
    currentPrice,
    loading: marketDataLoading,
    error: marketDataError,
  } = useMarketData(id || "", provider, address);

  const priceHistory = useMemo(() => {
    if (!market) return [];
    return generatePriceHistory(market);
  }, [market]);

  // Utiliser les données réelles si disponibles, sinon les données mock
  const displayMarket = useMemo(() => {
    if (!market) return null;
    
    if (marketInfo && probabilities) {
      return {
        ...market,
        outcomes: [
          {
            ...market.outcomes[0],
            probability: probabilities.yesProbability,
          },
          {
            ...market.outcomes[1],
            probability: probabilities.noProbability,
          },
        ],
        totalVolume: marketInfo.totalCollateral
          ? parseFloat(formatUnits(marketInfo.totalCollateral, DEFAULT_CONFIG.tokenDecimals))
          : market.totalVolume,
        endDate: new Date(marketInfo.endTime * 1000).toISOString(),
        resolved: marketInfo.resolved,
        result: marketInfo.result === Outcome.YES ? "YES" : marketInfo.result === Outcome.NO ? "NO" : undefined,
      };
    }
    return market;
  }, [market, marketInfo, probabilities]);

  if (!market) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Market not found
          </h1>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Back to markets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to markets
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Market Header */}
            <div className="flex items-start gap-4">
              <img
                src={market.imageUrl}
                alt=""
                className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
              />
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {displayMarket?.title || market.title}
                </h1>
                {marketInfo && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {marketInfo.question}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4" />
                    {formatVolume(displayMarket?.totalVolume || market.totalVolume)} Volume
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Ends{" "}
                    {marketInfo
                      ? new Date(marketInfo.endTime * 1000).toLocaleDateString()
                      : new Date(market.endDate).toLocaleDateString()}
                  </div>
                  {marketInfo?.resolved && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <AlertCircle className="h-4 w-4" />
                      Résolu: {marketInfo.result === Outcome.YES ? "YES" : "NO"}
                    </div>
                  )}
                  {currentPrice && (
                    <div className="flex items-center gap-1.5">
                      Prix actuel: ${(Number(currentPrice) / 1e8).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Price Chart */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <PriceChart data={priceHistory} market={market} />
            </div>

            {/* Market Data Error */}
            {marketDataError && contractAddress && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{marketDataError}</AlertDescription>
              </Alert>
            )}

            {/* User Positions */}
            {isConnected && userBalances && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                  Vos positions
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>YES:</span>
                    <span className="font-semibold">
                      {formatUnits(userBalances.yesBalance, DEFAULT_CONFIG.tokenDecimals)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>NO:</span>
                    <span className="font-semibold">
                      {formatUnits(userBalances.noBalance, DEFAULT_CONFIG.tokenDecimals)} USDC
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Outcome Table */}
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                Outcomes
              </h2>
              <OutcomeTable
                market={displayMarket || market}
                selectedOutcome={selectedOutcome}
                onSelectOutcome={setSelectedOutcome}
              />
            </div>

            {/* Market Rules */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
                Resolution Rules
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This market will resolve based on official announcements and
                credible news sources. Resolution will occur when the outcome is
                definitively determined. In case of ambiguity, the resolution
                committee will make the final decision based on the spirit of the
                market question.
              </p>
            </div>
          </div>

          {/* Trading Panel - Sticky on Desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TradingPanel
              market={displayMarket || market}
              selectedOutcome={selectedOutcome}
              onSelectOutcome={setSelectedOutcome}
              contractAddress={contractAddress || undefined}
            />

            {/* Related Markets */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-display font-semibold text-foreground">
                Related Markets
              </h3>
              <div className="space-y-3">
                {mockMarkets
                  .filter((m) => m.id !== market.id && m.category === market.category)
                  .slice(0, 3)
                  .map((relatedMarket) => (
                    <Link
                      key={relatedMarket.id}
                      to={`/market/${relatedMarket.id}`}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                    >
                      <img
                        src={relatedMarket.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {relatedMarket.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {relatedMarket.outcomes[0]?.probability}% Yes
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDetail;
