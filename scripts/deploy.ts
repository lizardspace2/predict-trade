import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// Adresses des feeds Chainlink sur testnet
const CHAINLINK_FEEDS_TESTNET: Record<string, Record<string, string>> = {
  mumbai: {
    // Polygon Mumbai Testnet
    ETH_USD: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    BTC_USD: "0x007A22900a3B98143368Bd5906f8E17e98648fba",
    MATIC_USD: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  },
  arbitrumGoerli: {
    // Arbitrum Goerli Testnet
    ETH_USD: "0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08",
    BTC_USD: "0x6550bc2301936011c1334555e62A87705A81C12C",
  },
  bnbTestnet: {
    // BNB Chain Testnet
    ETH_USD: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba9BAe8F",
    BTC_USD: "0x5741306c21795FdCBf9b87D40b39002cCE12bE5",
  },
  sepolia: {
    // Sepolia Testnet
    ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    BTC_USD: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
  },
};

// Adresses des tokens de test sur testnet
const TEST_TOKENS: Record<string, Record<string, string>> = {
  mumbai: {
    USDC: "0x0FA8781a83E468266206b803EC9D0B0b0Fb0C0C0", // Test USDC (vérifier l'adresse actuelle)
    USDT: "0xBD21A10F619BE90d6066c941b04e340841F1F989", // Test USDT
  },
  arbitrumGoerli: {
    USDC: "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63", // Test USDC
  },
  bnbTestnet: {
    USDC: "0x64544969ed7EBf5f083679233325356EbE738930", // Test USDC
  },
  sepolia: {
    USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // Test USDC
  },
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name;
  
  console.log(`\n🚀 Déploiement sur ${networkName} (Chain ID: ${network.chainId})\n`);

  // Vérifier que la clé privée est configurée
  const [deployer] = await ethers.getSigners();
  console.log("📝 Déploiement avec l'adresse:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ ERREUR: Votre wallet n'a pas de fonds!");
    console.error("   Obtenez des tokens de test sur:");
    console.error("   - Polygon Mumbai: https://faucet.polygon.technology/");
    console.error("   - Arbitrum Goerli: https://faucet.quicknode.com/arbitrum/goerli");
    console.error("   - BNB Testnet: https://testnet.bnbchain.org/faucet-smart");
    process.exit(1);
  }

  // Paramètres du marché (à modifier selon vos besoins)
  const question = process.env.MARKET_QUESTION || "Will BTC reach $100k before 2025-12-31?";
  const endTime = process.env.MARKET_END_TIME 
    ? BigInt(process.env.MARKET_END_TIME)
    : BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 3600); // 7 jours par défaut
  
  // Sélectionner le feed Chainlink et le token selon le réseau
  const feeds = CHAINLINK_FEEDS_TESTNET[networkName as keyof typeof CHAINLINK_FEEDS_TESTNET];
  const tokens = TEST_TOKENS[networkName as keyof typeof TEST_TOKENS];
  
  if (!feeds || !tokens) {
    console.error(`❌ Réseau ${networkName} non supporté pour le déploiement automatique`);
    console.error("   Utilisez: mumbai, arbitrumGoerli, bnbTestnet, ou sepolia");
    process.exit(1);
  }

  // Utiliser ETH/USD par défaut, ou BTC/USD si spécifié
  const priceFeedType = (process.env.PRICE_FEED_TYPE || "ETH_USD").toUpperCase() as keyof typeof feeds;
  const priceFeed = feeds[priceFeedType];
  
  if (!priceFeed) {
    console.error(`❌ Feed ${priceFeedType} non disponible sur ${networkName}`);
    process.exit(1);
  }

  const collateral = process.env.COLLATERAL_TOKEN || tokens.USDC;
  const targetPrice = process.env.TARGET_PRICE 
    ? BigInt(process.env.TARGET_PRICE)
    : BigInt(2000e8); // 2000 USD par défaut (en unités 1e8 pour Chainlink)

  console.log("📋 Paramètres du marché:");
  console.log("   Question:", question);
  console.log("   End Time:", new Date(Number(endTime) * 1000).toLocaleString());
  console.log("   Collateral:", collateral);
  console.log("   Price Feed:", priceFeed, `(${priceFeedType})`);
  console.log("   Target Price:", Number(targetPrice) / 1e8, "USD\n");

  // Déployer OutcomeToken d'abord (sera fait automatiquement par le constructeur)
  console.log("📦 Déploiement du contrat PredictionMarketChainlink...\n");

  const PredictionMarket = await ethers.getContractFactory("PredictionMarketChainlink");
  const market = await PredictionMarket.deploy(
    question,
    endTime,
    collateral,
    priceFeed,
    targetPrice
  );

  await market.waitForDeployment();
  const marketAddress = await market.getAddress();

  console.log("✅ Contrat déployé avec succès!\n");
  console.log("📍 Adresse du marché:", marketAddress);
  
  const yesTokenAddress = await market.yesToken();
  const noTokenAddress = await market.noToken();
  
  console.log("📍 Adresse du token YES:", yesTokenAddress);
  console.log("📍 Adresse du token NO:", noTokenAddress);
  console.log("\n");

  // Vérifier sur l'explorateur
  const explorerUrls: Record<string, string> = {
    mumbai: `https://mumbai.polygonscan.com/address/${marketAddress}`,
    arbitrumGoerli: `https://goerli.arbiscan.io/address/${marketAddress}`,
    bnbTestnet: `https://testnet.bscscan.com/address/${marketAddress}`,
    sepolia: `https://sepolia.etherscan.io/address/${marketAddress}`,
  };

  const explorerUrl = explorerUrls[networkName as keyof typeof explorerUrls];
  if (explorerUrl) {
    console.log("🔍 Vérifier sur l'explorateur:", explorerUrl);
  }

  console.log("\n📝 Ajoutez ces adresses dans src/web3/marketConfig.ts:\n");
  console.log(`  "${process.env.MARKET_ID || "market-1"}": "${marketAddress}",\n`);

  // Sauvegarder dans un fichier
  const fs = require("fs");
  const deploymentInfo = {
    network: networkName,
    chainId: Number(network.chainId),
    marketAddress,
    yesTokenAddress,
    noTokenAddress,
    question,
    endTime: endTime.toString(),
    collateral,
    priceFeed,
    targetPrice: targetPrice.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/${networkName}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Informations sauvegardées dans: ${filename}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
