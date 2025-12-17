import { Link } from "react-router-dom";
import { Bookmark, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Market, formatVolume } from "@/data/mockMarkets";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: Market;
}

export const MarketCard = ({ market }: MarketCardProps) => {
  const mainOutcomes = market.outcomes.slice(0, 2);
  const hasMoreOutcomes = market.outcomes.length > 2;

  return (
    <Link
      to={`/market/${market.id}`}
      className="group block animate-fade-in"
    >
      <div className="h-full rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        {/* Header */}
        <div className="mb-3 flex items-start gap-3">
          <img
            src={market.imageUrl}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-sm font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {market.title}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              {market.isLive && (
                <span className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-danger" />
                  LIVE
                </span>
              )}
              {market.isTrending && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-2">
          {mainOutcomes.map((outcome) => (
            <div
              key={outcome.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex-1 truncate text-sm text-muted-foreground">
                {outcome.name}
              </span>
              <span className="font-display text-lg font-bold text-foreground">
                {outcome.probability}%
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="yes-outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => e.preventDefault()}
                >
                  Yes
                </Button>
                <Button
                  variant="no-outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => e.preventDefault()}
                >
                  No
                </Button>
              </div>
            </div>
          ))}
          {hasMoreOutcomes && (
            <p className="text-xs text-muted-foreground">
              +{market.outcomes.length - 2} more outcomes
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            {formatVolume(market.totalVolume)} Vol.
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
};
