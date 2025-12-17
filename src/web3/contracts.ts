import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { WalletState } from "@/hooks/useWallet";

/**
 * Exemple d'interaction avec un contrat de prédiction
 * Adaptez cette interface selon votre contrat
 */
export interface PredictionMarket {
  marketId: string;
  question: string;
  outcomes: string[];
  endTime: number;
  resolved: boolean;
}

/**
 * Exemple de fonction pour placer un pari sur un marché de prédiction
 * @param provider - Le provider ethers
 * @param contractAddress - L'adresse du contrat de prédiction
 * @param marketId - L'ID du marché
 * @param outcome - L'outcome sur lequel parier (0, 1, 2, etc.)
 * @param amount - Le montant en tokens (ex: USDT/USDC)
 */
export async function placeBet(
  provider: BrowserProvider,
  contractAddress: string,
  marketId: string,
  outcome: number,
  amount: string // Montant en tokens (ex: "10.5" pour 10.5 USDT)
): Promise<string> {
  const signer = await provider.getSigner();
  
  // ABI simplifié pour un contrat de prédiction
  // Remplacez par l'ABI complet de votre contrat
  const contractABI = [
    "function placeBet(uint256 marketId, uint256 outcome, uint256 amount) external returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
  ];

  const contract = new Contract(contractAddress, contractABI, signer);
  
  // Convertir le montant en wei (ou en unités du token)
  // Pour USDT/USDC (6 décimales), utilisez parseUnits(amount, 6)
  // Pour ETH (18 décimales), utilisez parseUnits(amount, 18)
  const amountInWei = parseUnits(amount, 6); // 6 décimales pour USDT/USDC

  // Approuver le contrat pour dépenser les tokens (si nécessaire)
  // const tokenAddress = "0x..."; // Adresse du token (USDT/USDC)
  // const tokenContract = new Contract(tokenAddress, tokenABI, signer);
  // await tokenContract.approve(contractAddress, amountInWei);

  // Placer le pari
  const tx = await contract.placeBet(marketId, outcome, amountInWei);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Exemple de fonction pour récupérer les informations d'un marché
 */
export async function getMarketInfo(
  provider: BrowserProvider,
  contractAddress: string,
  marketId: string
): Promise<PredictionMarket | null> {
  try {
    const contractABI = [
      "function getMarket(uint256 marketId) external view returns (string question, string[] outcomes, uint256 endTime, bool resolved)",
    ];

    const contract = new Contract(contractAddress, contractABI, provider);
    const market = await contract.getMarket(marketId);

    return {
      marketId,
      question: market.question,
      outcomes: market.outcomes,
      endTime: Number(market.endTime),
      resolved: market.resolved,
    };
  } catch (error) {
    console.error("Error fetching market info:", error);
    return null;
  }
}

/**
 * Exemple de fonction pour récupérer le solde d'un token
 */
export async function getTokenBalance(
  provider: BrowserProvider,
  tokenAddress: string,
  userAddress: string
): Promise<string> {
  try {
    const tokenABI = [
      "function balanceOf(address owner) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
    ];

    const contract = new Contract(tokenAddress, tokenABI, provider);
    const [balance, decimals] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals(),
    ]);

    return formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
}

/**
 * Adresses de contrats USDT/USDC par chaîne (exemples)
 */
export const STABLE_COIN_ADDRESSES: Record<number, { USDT: string; USDC: string }> = {
  1: {
    // Ethereum Mainnet
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  137: {
    // Polygon
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  },
  56: {
    // BNB Chain
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  42161: {
    // Arbitrum
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  },
  10: {
    // Optimism
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  },
};

