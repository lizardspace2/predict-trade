import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet } from "lucide-react";
import { placeBet, STABLE_COIN_ADDRESSES } from "@/web3/contracts";
import { Market, MarketOutcome } from "@/data/mockMarkets";

interface TradingPanelProps {
  market: Market;
  selectedOutcome?: MarketOutcome;
  onSelectOutcome?: (outcome: MarketOutcome) => void;
  contractAddress?: string; // Adresse du contrat de prédiction (optionnel pour l'instant)
}

export function TradingPanel({ 
  market, 
  selectedOutcome: propSelectedOutcome, 
  onSelectOutcome,
  contractAddress 
}: TradingPanelProps) {
  const { address, chainId, isConnected, provider } = useWallet();
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<number | null>(
    propSelectedOutcome ? market.outcomes.findIndex(o => o.id === propSelectedOutcome.id) : null
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSelectOutcome = (index: number) => {
    setSelectedOutcomeIndex(index);
    if (onSelectOutcome) {
      onSelectOutcome(market.outcomes[index]);
    }
  };

  const handlePlaceBet = async () => {
    if (!isConnected || !address || !provider) {
      setError("Veuillez connecter votre wallet");
      return;
    }

    if (!contractAddress) {
      setError("Adresse du contrat non configurée. Cette fonctionnalité nécessite un contrat déployé.");
      return;
    }

    if (selectedOutcomeIndex === null) {
      setError("Veuillez sélectionner un outcome");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txHash = await placeBet(
        provider, 
        contractAddress, 
        market.id, 
        selectedOutcomeIndex, 
        amount
      );
      setSuccess(`Pari placé avec succès! TX: ${txHash}`);
      setAmount("");
      setSelectedOutcomeIndex(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors du placement du pari");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connecter votre wallet</CardTitle>
          <CardDescription>
            Connectez votre wallet pour placer des paris sur ce marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Veuillez connecter votre wallet pour continuer
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const stableCoins = chainId ? STABLE_COIN_ADDRESSES[chainId] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Placer un pari</CardTitle>
        <CardDescription>
          Sélectionnez un outcome et le montant à parier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Outcome</Label>
          <div className="grid grid-cols-1 gap-2">
            {market.outcomes.map((outcome, index) => (
              <Button
                key={outcome.id}
                variant={selectedOutcomeIndex === index ? "default" : "outline"}
                onClick={() => handleSelectOutcome(index)}
                disabled={loading}
                className="w-full justify-between"
              >
                <span>{outcome.name}</span>
                <span className="text-xs opacity-75">{outcome.probability}%</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Montant</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              step="0.01"
              min="0"
            />
            <div className="flex items-center text-sm text-muted-foreground">
              {stableCoins ? "USDT/USDC" : "Tokens"}
            </div>
          </div>
        </div>

        {chainId && (
          <div className="text-xs text-muted-foreground">
            Réseau: {chainId === 1 ? "Ethereum" : chainId === 137 ? "Polygon" : `Chain ${chainId}`}
          </div>
        )}

        <Button
          onClick={handlePlaceBet}
          disabled={loading || selectedOutcomeIndex === null || !amount}
          className="w-full"
        >
          {loading ? "Traitement..." : "Placer le pari"}
        </Button>

        {!contractAddress && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Adresse du contrat non configurée. Configurez-la dans le composant.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
