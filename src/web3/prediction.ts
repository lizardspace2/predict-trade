import { Contract, BrowserProvider, formatUnits, parseUnits } from "ethers";
import { getSigner } from "./connect";
import PredictionMarketAbi from "./abi/PredictionMarketChainlink.json";
import OutcomeTokenAbi from "./abi/OutcomeToken.json";
import { STABLE_COIN_ADDRESSES } from "./contracts";

export enum Outcome {
  UNRESOLVED = 0,
  YES = 1,
  NO = 2,
}

export interface MarketInfo {
  question: string;
  endTime: number;
  totalCollateral: bigint;
  result: Outcome;
  resolved: boolean;
  yesToken: string;
  noToken: string;
}

export interface UserBalances {
  yesBalance: bigint;
  noBalance: bigint;
}

/**
 * Obtenir une instance du contrat PredictionMarket
 */
export function getMarketContract(
  contractAddress: string,
  provider: BrowserProvider
): Contract {
  return new Contract(contractAddress, PredictionMarketAbi, provider);
}

/**
 * Obtenir une instance du contrat OutcomeToken (YES ou NO)
 */
export function getOutcomeTokenContract(
  tokenAddress: string,
  provider: BrowserProvider
): Contract {
  return new Contract(tokenAddress, OutcomeTokenAbi, provider);
}

/**
 * Acheter des tokens YES ou NO
 * @param contractAddress Adresse du contrat PredictionMarket
 * @param yes true pour YES, false pour NO
 * @param amount Montant en tokens (ex: "100" pour 100 USDC)
 * @param tokenDecimals Nombre de décimales du token (6 pour USDC/USDT)
 */
export async function buyPosition(
  contractAddress: string,
  yes: boolean,
  amount: string,
  tokenDecimals: number = 6
): Promise<string> {
  const { signer } = await getSigner();
  const contract = getMarketContract(contractAddress, signer.provider);
  const contractWithSigner = contract.connect(signer);

  const amountInWei = parseUnits(amount, tokenDecimals);

  // Approuver le contrat pour dépenser les tokens si nécessaire
  const marketInfo = await getMarketInfo(contractAddress, signer.provider);
  const collateralAddress = await contract.collateral();
  
  // Vérifier l'approbation
  const collateralContract = new Contract(
    collateralAddress,
    [
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );

  const allowance = await collateralContract.allowance(
    await signer.getAddress(),
    contractAddress
  );

  if (allowance < amountInWei) {
    // Approuver une grande quantité pour éviter de multiples approbations
    const maxApproval = parseUnits("1000000", tokenDecimals); // 1M tokens max
    const approveTx = await collateralContract.approve(contractAddress, maxApproval);
    await approveTx.wait();
  }

  // Acheter la position
  const tx = await contractWithSigner.buy(yes, amountInWei);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Résoudre le marché automatiquement via Chainlink
 */
export async function resolveMarket(contractAddress: string): Promise<string> {
  const { signer } = await getSigner();
  const contract = getMarketContract(contractAddress, signer.provider);
  const contractWithSigner = contract.connect(signer);

  const tx = await contractWithSigner.resolve();
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Résoudre le marché manuellement (fallback)
 */
export async function resolveMarketManually(
  contractAddress: string,
  result: Outcome
): Promise<string> {
  const { signer } = await getSigner();
  const contract = getMarketContract(contractAddress, signer.provider);
  const contractWithSigner = contract.connect(signer);

  const tx = await contractWithSigner.resolveManually(result);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Récupérer le collateral en échangeant les tokens gagnants
 */
export async function redeem(
  contractAddress: string,
  amount: string,
  tokenDecimals: number = 6
): Promise<string> {
  const { signer } = await getSigner();
  const contract = getMarketContract(contractAddress, signer.provider);
  const contractWithSigner = contract.connect(signer);

  const amountInWei = parseUnits(amount, tokenDecimals);

  const tx = await contractWithSigner.redeem(amountInWei);
  const receipt = await tx.wait();

  return receipt.hash;
}

/**
 * Obtenir les informations du marché
 */
export async function getMarketInfo(
  contractAddress: string,
  provider: BrowserProvider
): Promise<MarketInfo> {
  const contract = getMarketContract(contractAddress, provider);
  const info = await contract.getMarketInfo();

  return {
    question: info._question,
    endTime: Number(info._endTime),
    totalCollateral: info._totalCollateral,
    result: Number(info._result) as Outcome,
    resolved: info._resolved,
    yesToken: info._yesToken,
    noToken: info._noToken,
  };
}

/**
 * Obtenir les balances YES et NO d'un utilisateur
 */
export async function getUserBalances(
  contractAddress: string,
  userAddress: string,
  provider: BrowserProvider
): Promise<UserBalances> {
  const contract = getMarketContract(contractAddress, provider);
  const balances = await contract.getUserBalances(userAddress);

  return {
    yesBalance: balances.yesBalance,
    noBalance: balances.noBalance,
  };
}

/**
 * Obtenir le prix actuel depuis Chainlink
 */
export async function getCurrentPrice(
  contractAddress: string,
  provider: BrowserProvider
): Promise<bigint> {
  const contract = getMarketContract(contractAddress, provider);
  return await contract.getCurrentPrice();
}

/**
 * Obtenir le solde d'un token ERC20
 */
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: BrowserProvider
): Promise<string> {
  try {
    const tokenContract = getOutcomeTokenContract(tokenAddress, provider);
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(userAddress),
      tokenContract.decimals(),
    ]);

    return formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
}

/**
 * Obtenir le total supply d'un token (pour calculer les odds)
 */
export async function getTokenTotalSupply(
  tokenAddress: string,
  provider: BrowserProvider
): Promise<string> {
  try {
    const tokenContract = getOutcomeTokenContract(tokenAddress, provider);
    const [totalSupply, decimals] = await Promise.all([
      tokenContract.totalSupply(),
      tokenContract.decimals(),
    ]);

    return formatUnits(totalSupply, decimals);
  } catch (error) {
    console.error("Error fetching total supply:", error);
    return "0";
  }
}

/**
 * Calculer les probabilités implicites basées sur les pools
 */
export async function calculateProbabilities(
  contractAddress: string,
  provider: BrowserProvider
): Promise<{ yesProbability: number; noProbability: number }> {
  try {
    const marketInfo = await getMarketInfo(contractAddress, provider);
    
    const yesSupply = await getTokenTotalSupply(marketInfo.yesToken, provider);
    const noSupply = await getTokenTotalSupply(marketInfo.noToken, provider);

    const yesAmount = parseFloat(yesSupply);
    const noAmount = parseFloat(noSupply);
    const total = yesAmount + noAmount;

    if (total === 0) {
      return { yesProbability: 50, noProbability: 50 };
    }

    const yesProbability = (yesAmount / total) * 100;
    const noProbability = (noAmount / total) * 100;

    return { yesProbability, noProbability };
  } catch (error) {
    console.error("Error calculating probabilities:", error);
    return { yesProbability: 50, noProbability: 50 };
  }
}

/**
 * Adresses des feeds Chainlink par chaîne (exemples)
 * À adapter selon vos besoins
 */
export const CHAINLINK_FEEDS: Record<number, Record<string, string>> = {
  137: {
    // Polygon Mainnet
    ETH_USD: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    BTC_USD: "0xc907E116054Ad103354f0D350FFb7B7C5d1D6738",
    MATIC_USD: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
  },
  42161: {
    // Arbitrum
    ETH_USD: "0x639Fe6ab55C9217474C7CD7a7a6d5d40f41b5E1c",
    BTC_USD: "0x6ce185860a4963106506C7653350F137a38C1566",
  },
  56: {
    // BNB Chain
    ETH_USD: "0x9ef1B8c0E4F7dc8bF5719Ea4968838E540Ee098b",
    BTC_USD: "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf",
  },
  1: {
    // Ethereum Mainnet
    ETH_USD: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    BTC_USD: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
  },
  10: {
    // Optimism
    ETH_USD: "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
    BTC_USD: "0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593",
  },
};
