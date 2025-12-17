import { useState, useEffect } from "react";
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
import { AlertCircle, Wallet, CheckCircle2 } from "lucide-react";
import { STABLE_COIN_ADDRESSES } from "@/web3/contracts";
import { Market, MarketOutcome } from "@/data/mockMarkets";
import {
  buyPosition,
  redeem,
  getUserBalances,
  getMarketInfo,
  calculateProbabilities,
  Outcome,
  type UserBalances,
  type MarketInfo,
} from "@/web3/prediction";
import { getMarketContractAddress, DEFAULT_CONFIG } from "@/web3/marketConfig";
import { formatUnits } from "ethers";
import { toast } from "sonner";

interface TradingPanelProps {
  market: Market;
  selectedOutcome?: MarketOutcome;
  onSelectOutcome?: (outcome: MarketOutcome) => void;
  contractAddress?: string; // Adresse du contrat de prédiction (optionnel)
}

export function TradingPanel({ 
  market, 
  selectedOutcome: propSelectedOutcome, 
  onSelectOutcome,
  contractAddress: propContractAddress
}: TradingPanelProps) {
  const { address, chainId, isConnected, provider } = useWallet();
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<number | null>(
    propSelectedOutcome ? market.outcomes.findIndex(o => o.id === propSelectedOutcome.id) : null
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalances | null>(null);
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [probabilities, setProbabilities] = useState<{ yesProbability: number; noProbability: number } | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Récupérer l'adresse du contrat
  const contractAddress = propContractAddress || getMarketContractAddress(market.id);

  // Charger les données du marché
  useEffect(() => {
    if (!contractAddress || !provider || !isConnected || !address) return;

    const loadMarketData = async () => {
      setLoadingData(true);
      try {
        const [info, balances, probs] = await Promise.all([
          getMarketInfo(contractAddress, provider),
          getUserBalances(contractAddress, address, provider),
          calculateProbabilities(contractAddress, provider),
        ]);
        setMarketInfo(info);
        setUserBalances(balances);
        setProbabilities(probs);
      } catch (err) {
        console.error("Error loading market data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, 10000); // Rafraîchir toutes les 10 secondes
    return () => clearInterval(interval);
  }, [contractAddress, provider, isConnected, address, market.id]);

  const handleSelectOutcome = (index: number) => {
    setSelectedOutcomeIndex(index);
    if (onSelectOutcome) {
      onSelectOutcome(market.outcomes[index]);
    }
  };

  const handleBuyPosition = async () => {
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

    if (marketInfo?.resolved) {
      setError("Ce marché est déjà résolu");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // YES = index 0, NO = index 1 (ou autre selon votre structure)
      const isYes = selectedOutcomeIndex === 0;
      const tokenDecimals = DEFAULT_CONFIG.tokenDecimals;

      toast.loading("Envoi de la transaction...", { id: "buy-position" });
      const txHash = await buyPosition(contractAddress, isYes, amount, tokenDecimals);
      
      toast.success(`Position achetée avec succès! TX: ${txHash.substring(0, 10)}...`, { id: "buy-position" });
      setSuccess(`Position achetée avec succès! TX: ${txHash.substring(0, 10)}...`);
      setAmount("");
      setSelectedOutcomeIndex(null);

      // Recharger les données
      if (provider && address) {
        const [balances, probs] = await Promise.all([
          getUserBalances(contractAddress, address, provider),
          calculateProbabilities(contractAddress, provider),
        ]);
        setUserBalances(balances);
        setProbabilities(probs);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erreur lors de l'achat de position";
      toast.error(errorMsg, { id: "buy-position" });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (isYes: boolean) => {
    if (!isConnected || !address || !provider || !contractAddress) {
      setError("Veuillez connecter votre wallet");
      return;
    }

    if (!marketInfo?.resolved) {
      setError("Le marché n'est pas encore résolu");
      return;
    }

    if (!userBalances) {
      setError("Aucun solde à récupérer");
      return;
    }

    const balance = isYes ? userBalances.yesBalance : userBalances.noBalance;
    const winningOutcome = marketInfo.result === Outcome.YES;
    
    if ((isYes && !winningOutcome) || (!isYes && winningOutcome)) {
      setError("Vous ne pouvez récupérer que les tokens gagnants");
      return;
    }

    if (balance === 0n) {
      setError("Aucun solde à récupérer");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenDecimals = DEFAULT_CONFIG.tokenDecimals;
      const amountToRedeem = formatUnits(balance, tokenDecimals);

      toast.loading("Récupération des gains...", { id: "redeem" });
      const txHash = await redeem(contractAddress, amountToRedeem, tokenDecimals);
      
      toast.success(`Gains récupérés avec succès! TX: ${txHash.substring(0, 10)}...`, { id: "redeem" });
      setSuccess(`Gains récupérés avec succès!`);

      // Recharger les données
      if (provider && address) {
        const balances = await getUserBalances(contractAddress, address, provider);
        setUserBalances(balances);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erreur lors de la récupération des gains";
      toast.error(errorMsg, { id: "redeem" });
      setError(errorMsg);
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

        {/* Affichage des probabilités réelles si disponibles */}
        {probabilities && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span>YES:</span>
              <span className="font-semibold">{probabilities.yesProbability.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>NO:</span>
              <span className="font-semibold">{probabilities.noProbability.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Affichage des balances utilisateur */}
        {userBalances && (
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="mb-2 font-semibold">Vos positions</div>
            <div className="flex justify-between">
              <span>YES:</span>
              <span>{formatUnits(userBalances.yesBalance, DEFAULT_CONFIG.tokenDecimals)}</span>
            </div>
            <div className="flex justify-between">
              <span>NO:</span>
              <span>{formatUnits(userBalances.noBalance, DEFAULT_CONFIG.tokenDecimals)}</span>
            </div>
            {marketInfo?.resolved && (
              <div className="mt-2 space-y-1">
                {marketInfo.result === Outcome.YES && userBalances.yesBalance > 0n && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRedeem(true)}
                    disabled={loading}
                  >
                    Récupérer YES
                  </Button>
                )}
                {marketInfo.result === Outcome.NO && userBalances.noBalance > 0n && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleRedeem(false)}
                    disabled={loading}
                  >
                    Récupérer NO
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {marketInfo?.resolved && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Marché résolu: {marketInfo.result === Outcome.YES ? "YES" : "NO"}
            </AlertDescription>
          </Alert>
        )}

        {!marketInfo?.resolved && (
          <>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <div className="grid grid-cols-1 gap-2">
                {market.outcomes.map((outcome, index) => (
                  <Button
                    key={outcome.id}
                    variant={selectedOutcomeIndex === index ? "default" : "outline"}
                    onClick={() => handleSelectOutcome(index)}
                    disabled={loading || loadingData}
                    className="w-full justify-between"
                  >
                    <span>{outcome.name}</span>
                    {probabilities && (
                      <span className="text-xs opacity-75">
                        {index === 0 ? probabilities.yesProbability.toFixed(1) : probabilities.noProbability.toFixed(1)}%
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {!marketInfo?.resolved && (
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading || loadingData}
                step="0.01"
                min="0"
              />
              <div className="flex items-center text-sm text-muted-foreground">
                {stableCoins ? "USDC" : "Tokens"}
              </div>
            </div>
          </div>
        )}

        {chainId && (
          <div className="text-xs text-muted-foreground">
            Réseau: {chainId === 1 ? "Ethereum" : chainId === 137 ? "Polygon" : chainId === 42161 ? "Arbitrum" : chainId === 56 ? "BNB Chain" : chainId === 10 ? "Optimism" : `Chain ${chainId}`}
          </div>
        )}

        {!marketInfo?.resolved && (
          <Button
            onClick={handleBuyPosition}
            disabled={loading || loadingData || selectedOutcomeIndex === null || !amount}
            className="w-full"
          >
            {loading ? "Traitement..." : "Acheter position"}
          </Button>
        )}

        {!contractAddress && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Adresse du contrat non configurée. Ajoutez l&apos;adresse dans <code className="text-xs">src/web3/marketConfig.ts</code> pour le marché &quot;{market.id}&quot;
            </AlertDescription>
          </Alert>
        )}

        {loadingData && (
          <div className="text-xs text-muted-foreground text-center">
            Chargement des données...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
