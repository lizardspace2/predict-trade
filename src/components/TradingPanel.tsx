import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Market, MarketOutcome } from "@/data/mockMarkets";
import { cn } from "@/lib/utils";

interface TradingPanelProps {
  market: Market;
  selectedOutcome?: MarketOutcome;
  onSelectOutcome: (outcome: MarketOutcome) => void;
}

export const TradingPanel = ({
  market,
  selectedOutcome,
  onSelectOutcome,
}: TradingPanelProps) => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");

  const outcome = selectedOutcome || market.outcomes[0];
  const yesPrice = outcome.probability;
  const noPrice = 100 - outcome.probability;

  const currentPrice = side === "yes" ? yesPrice : noPrice;
  const shares = amount ? (parseFloat(amount) / currentPrice) * 100 : 0;
  const potentialPayout = shares;

  const quickAmounts = [1, 20, 100];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Selected Outcome */}
      <div className="mb-4 flex items-center gap-3">
        <img
          src={market.imageUrl}
          alt=""
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground line-clamp-1">
            {market.title}
          </p>
          <p className="font-display font-semibold text-foreground">
            {outcome.name}
          </p>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="mb-4 flex rounded-lg bg-secondary p-1">
        <button
          onClick={() => setMode("buy")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-all",
            mode === "buy"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-all",
            mode === "sell"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sell
        </button>
      </div>

      {/* Yes/No Selection */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button
          variant={side === "yes" ? "yes" : "yes-outline"}
          onClick={() => setSide("yes")}
          className="h-12 text-base"
        >
          Yes {yesPrice}¢
        </Button>
        <Button
          variant={side === "no" ? "no" : "no-outline"}
          onClick={() => setSide("no")}
          className={cn(
            "h-12 text-base",
            side === "no" && "bg-danger text-danger-foreground"
          )}
        >
          No {noPrice}¢
        </Button>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <label className="mb-2 block text-sm text-muted-foreground">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="h-14 pl-8 pr-4 text-right text-2xl font-display font-bold"
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="mb-4 flex gap-2">
        {quickAmounts.map((value) => (
          <button
            key={value}
            onClick={() => setAmount(String(parseFloat(amount || "0") + value))}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            +${value}
          </button>
        ))}
        <button
          onClick={() => setAmount("1000")}
          className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Max
        </button>
      </div>

      {/* Summary */}
      {amount && parseFloat(amount) > 0 && (
        <div className="mb-4 space-y-2 rounded-lg bg-secondary/50 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shares</span>
            <span className="font-medium">{shares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Potential payout</span>
            <span className="font-semibold text-success">
              ${potentialPayout.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Trade Button */}
      <Button variant="trade" size="xl" className="w-full">
        {mode === "buy" ? "Trade" : "Sell"}
      </Button>

      {/* Terms */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        By trading, you agree to the{" "}
        <a href="#" className="underline hover:text-foreground">
          Terms of Use
        </a>
      </p>
    </div>
  );
};
