import { Button } from "@/components/ui/button";
import { Market, MarketOutcome, formatVolume } from "@/data/mockMarkets";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface OutcomeTableProps {
  market: Market;
  selectedOutcome?: MarketOutcome;
  onSelectOutcome: (outcome: MarketOutcome) => void;
}

export const OutcomeTable = ({
  market,
  selectedOutcome,
  onSelectOutcome,
}: OutcomeTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_140px] gap-4 border-b border-border bg-secondary/50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>Outcome</span>
        <span className="text-center">Chance</span>
        <span className="text-center">Trade</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {market.outcomes.map((outcome) => {
          const yesPrice = outcome.probability;
          const noPrice = 100 - outcome.probability;
          const isSelected = selectedOutcome?.id === outcome.id;

          return (
            <div
              key={outcome.id}
              onClick={() => onSelectOutcome(outcome)}
              className={cn(
                "grid grid-cols-[1fr_100px_140px] gap-4 px-4 py-4 transition-colors cursor-pointer",
                isSelected
                  ? "bg-primary/5"
                  : "hover:bg-accent"
              )}
            >
              {/* Outcome Name */}
              <div className="flex items-center gap-3">
                {outcome.imageUrl && (
                  <img
                    src={outcome.imageUrl}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-foreground">{outcome.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatVolume(outcome.volume)} Vol.
                  </p>
                </div>
              </div>

              {/* Probability */}
              <div className="flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-foreground">
                  {outcome.probability}%
                </span>
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    outcome.change24h >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {outcome.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(outcome.change24h)}
                </div>
              </div>

              {/* Trade Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="yes"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Yes {yesPrice}¢
                </Button>
                <Button
                  variant="no"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  No {noPrice}¢
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
