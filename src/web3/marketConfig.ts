/**
 * Configuration des adresses de contrats déployés
 * 
 * Pour chaque marché, vous devez déployer un contrat PredictionMarketChainlink
 * et ajouter son adresse ici.
 * 
 * Format: marketId -> contractAddress
 */

export const MARKET_CONTRACTS: Record<string, string> = {
  // Exemple: "market-1": "0x1234567890123456789012345678901234567890",
  // Ajoutez vos adresses de contrats ici après déploiement
};

/**
 * Configuration par défaut pour les nouveaux marchés
 */
export const DEFAULT_CONFIG = {
  // Adresses des tokens de collateral par chaîne
  collateralTokens: {
    137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon USDC
    42161: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // Arbitrum USDC
    56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // BNB Chain USDC
    1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum USDC
    10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // Optimism USDC
  },
  // Décimales des tokens (USDC/USDT = 6)
  tokenDecimals: 6,
};

/**
 * Obtenir l'adresse du contrat pour un marché
 */
export function getMarketContractAddress(marketId: string): string | null {
  return MARKET_CONTRACTS[marketId] || null;
}
