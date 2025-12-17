import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import {
  getMarketInfo,
  getUserBalances,
  calculateProbabilities,
  getCurrentPrice,
  type MarketInfo,
  type UserBalances,
} from "@/web3/prediction";
import { getMarketContractAddress } from "@/web3/marketConfig";

export interface MarketData {
  marketInfo: MarketInfo | null;
  userBalances: UserBalances | null;
  probabilities: { yesProbability: number; noProbability: number } | null;
  currentPrice: bigint | null;
  loading: boolean;
  error: string | null;
}

export function useMarketData(
  marketId: string,
  provider: BrowserProvider | null,
  userAddress: string | null
): MarketData {
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalances | null>(null);
  const [probabilities, setProbabilities] = useState<{
    yesProbability: number;
    noProbability: number;
  } | null>(null);
  const [currentPrice, setCurrentPrice] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) {
      setMarketInfo(null);
      setUserBalances(null);
      setProbabilities(null);
      setCurrentPrice(null);
      return;
    }

    const contractAddress = getMarketContractAddress(marketId);
    if (!contractAddress) {
      setError("Contrat non configuré pour ce marché");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [info, probs, price] = await Promise.all([
          getMarketInfo(contractAddress, provider),
          calculateProbabilities(contractAddress, provider).catch(() => null),
          getCurrentPrice(contractAddress, provider).catch(() => null),
        ]);

        setMarketInfo(info);
        setProbabilities(probs);
        setCurrentPrice(price);

        if (userAddress) {
          const balances = await getUserBalances(
            contractAddress,
            userAddress,
            provider
          );
          setUserBalances(balances);
        } else {
          setUserBalances(null);
        }
      } catch (err: any) {
        console.error("Error loading market data:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [marketId, provider, userAddress]);

  return {
    marketInfo,
    userBalances,
    probabilities,
    currentPrice,
    loading,
    error,
  };
}
