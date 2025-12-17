# 🎯 PredictX - Prediction Market Platform

Plateforme de marchés de prédiction décentralisés avec tokens YES/NO tradables et résolution automatique via Chainlink Oracle.

## 📋 Table des matières

- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration Web3](#-configuration-web3)
- [Smart Contracts](#-smart-contracts)
- [Déploiement](#-déploiement)
- [Intégration Frontend](#-intégration-frontend)
- [Utilisation](#-utilisation)
- [Dépannage](#-dépannage)
- [Ressources](#-ressources)

## 🛠 Technologies

### Frontend
- **React** + **TypeScript** + **Vite**
- **shadcn-ui** + **Tailwind CSS**
- **Web3Modal v3** + **WalletConnect** (connexion multi-chaînes)
- **ethers v6** (interactions blockchain)

### Smart Contracts
- **Solidity ^0.8.20**
- **OpenZeppelin Contracts** (ERC20)
- **Chainlink Contracts** (Oracle)

### Fonctionnalités
- ✅ **Tokens YES/NO tradables** - ERC20 standards, échangeables sur DEX
- ✅ **Résolution automatique** - Via Chainlink Oracle après `endTime`
- ✅ **Multi-chaînes** - Polygon, Arbitrum, BNB Chain, Optimism, Ethereum
- ✅ **Probabilités en temps réel** - Calculées depuis les pools de tokens
- ✅ **Trading intégré** - Achat, vente et récupération des gains depuis le frontend

## 🚀 Installation

### Prérequis

- Node.js 18+ et npm
- Un wallet crypto (MetaMask, Trust Wallet, etc.)
- Un Project ID WalletConnect (gratuit)

### Installation des dépendances

```bash
# Cloner le projet
git clone <YOUR_GIT_URL>
cd predict-trade

# Installer les dépendances frontend
npm install

# Installer les dépendances pour le déploiement (optionnel)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts @chainlink/contracts dotenv
```

### Démarrer le serveur de développement

```bash
npm run dev
```

## 🔐 Configuration Web3

### 1. Obtenir un WalletConnect Project ID

1. Visitez [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez votre Project ID

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet:

```env
# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=votre_project_id_ici

# Pour le déploiement (optionnel)
PRIVATE_KEY=0x...votre_clé_privée_de_test...
```

**⚠️ SÉCURITÉ**: Ne commitez JAMAIS le fichier `.env`! Il est déjà dans `.gitignore`.

### 3. Wallets supportés

- MetaMask
- Trust Wallet
- Coinbase Wallet
- Rainbow Wallet
- WalletConnect (QR code mobile)
- Et 300+ autres wallets

### 4. Chaînes supportées

- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)
- BNB Chain (Chain ID: 56)
- Arbitrum (Chain ID: 42161)
- Optimism (Chain ID: 10)

## 📜 Smart Contracts

### Structure

Les contrats sont dans le dossier `contracts/`:

- **`OutcomeToken.sol`** - Token ERC20 pour les positions YES/NO
- **`PredictionMarketChainlink.sol`** - Contrat principal avec résolution Chainlink

### Fonctionnalités

1. **Création de marché** - Définit une question, une date de fin, un feed Chainlink et un prix cible
2. **Achat de positions** - Les utilisateurs déposent du collateral (USDC/USDT) et reçoivent des tokens YES ou NO
3. **Trading** - Les tokens YES/NO sont des ERC20 standards, tradables sur n'importe quel DEX
4. **Résolution** - Après `endTime`, le contrat interroge Chainlink et résout automatiquement
5. **Récupération** - Les détenteurs de tokens gagnants peuvent les échanger 1:1 contre le collateral

### Adresses Chainlink (Mainnet)

#### Polygon
- ETH/USD: `0xF9680D99D6C9589e2a93a78A04A279e509205945`
- BTC/USD: `0xc907E116054Ad103354f0D350FFb7B7C5d1D6738`
- MATIC/USD: `0xAB594600376Ec9fD91F8e885dADF0CE036862dE0`

#### Arbitrum
- ETH/USD: `0x639Fe6ab55C9217474C7CD7a7a6d5d40f41b5E1c`
- BTC/USD: `0x6ce185860a4963106506C7653350F137a38C1566`

#### BNB Chain
- ETH/USD: `0x9ef1B8c0E4F7dc8bF5719Ea4968838E540Ee098b`
- BTC/USD: `0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5E1c`

#### Ethereum
- ETH/USD: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- BTC/USD: `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`

### Adresses des tokens de collateral (Mainnet)

#### Polygon
- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

#### Arbitrum
- USDC: `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`
- USDT: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`

## 🚀 Déploiement

### Prérequis pour le déploiement

1. **Wallet de test** avec des fonds (obtenez-en sur les faucets)
2. **Clé privée** du wallet de test (jamais votre wallet principal!)
3. **Tokens de test** pour payer le gas

### Faucets de testnet

- **Polygon Mumbai**: https://faucet.polygon.technology/
- **Arbitrum Goerli**: https://faucet.quicknode.com/arbitrum/goerli
- **BNB Testnet**: https://testnet.bnbchain.org/faucet-smart
- **Sepolia**: https://sepoliafaucet.com/

### Configuration pour le déploiement

Ajoutez dans votre `.env`:

```env
# Clé privée du wallet de test (NE JAMAIS PARTAGER!)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Paramètres du marché (optionnel)
MARKET_QUESTION=Will BTC reach $100k before 2025-12-31?
MARKET_END_TIME=1767139200
MARKET_ID=market-1
PRICE_FEED_TYPE=BTC_USD
TARGET_PRICE=100000000000  # 100k USD * 1e8
```

### Déploiement sur testnet

```bash
# Polygon Mumbai (recommandé, frais très bas)
npm run deploy:mumbai

# Arbitrum Goerli
npm run deploy:arbitrum

# BNB Testnet
npm run deploy:bnb

# Sepolia
npm run deploy:sepolia
```

Ou avec Hardhat directement:

```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

### Adresses Chainlink (Testnet)

Le script de déploiement inclut automatiquement les bonnes adresses selon le réseau. Voir `scripts/deploy.ts` pour les détails.

### Après le déploiement

Le script va:
1. ✅ Déployer le contrat `PredictionMarketChainlink`
2. ✅ Créer automatiquement les tokens YES et NO
3. ✅ Afficher toutes les adresses
4. ✅ Sauvegarder les informations dans `deployments/`

**Ajoutez l'adresse dans le frontend:**

Ouvrez `src/web3/marketConfig.ts` et ajoutez:

```typescript
export const MARKET_CONTRACTS: Record<string, string> = {
  "market-1": "0x1234567890123456789012345678901234567890", // Votre adresse
};
```

### Vérification

Vérifiez le contrat sur l'explorateur:
- **Polygon Mumbai**: https://mumbai.polygonscan.com
- **Arbitrum Goerli**: https://goerli.arbiscan.io
- **BNB Testnet**: https://testnet.bscscan.com
- **Sepolia**: https://sepolia.etherscan.io

## 💻 Intégration Frontend

### Structure des fichiers

```
src/
├── web3/
│   ├── config.ts              # Configuration Web3Modal
│   ├── connect.ts             # Utilitaires de connexion
│   ├── chains.ts               # Chaînes supportées
│   ├── contracts.ts            # Adresses des tokens
│   ├── prediction.ts           # ⭐ Interactions avec les contrats
│   ├── marketConfig.ts         # ⭐ Configuration des adresses de contrats
│   └── abi/
│       ├── OutcomeToken.json
│       └── PredictionMarketChainlink.json
├── hooks/
│   ├── useWallet.ts            # Hook pour le wallet
│   └── useMarketData.ts        # ⭐ Hook pour charger les données du marché
├── components/
│   └── TradingPanel.tsx        # ⭐ Panel de trading
└── pages/
    └── MarketDetail.tsx        # ⭐ Page de détail avec données réelles
```

### Utilisation dans les composants

#### Exemple: Acheter une position

```typescript
import { buyPosition } from "@/web3/prediction";
import { DEFAULT_CONFIG } from "@/web3/marketConfig";

// Acheter 100 USDC de YES
const txHash = await buyPosition(
  contractAddress,
  true, // YES
  "100", // Montant
  DEFAULT_CONFIG.tokenDecimals // 6 pour USDC
);
```

#### Exemple: Charger les données d'un marché

```typescript
import { useMarketData } from "@/hooks/useMarketData";
import { useWallet } from "@/hooks/useWallet";

function MyComponent() {
  const { provider, address } = useWallet();
  const { marketInfo, probabilities, userBalances, loading } = useMarketData(
    "market-1",
    provider,
    address
  );

  if (loading) return <div>Chargement...</div>;
  
  return (
    <div>
      <p>Question: {marketInfo?.question}</p>
      <p>YES: {probabilities?.yesProbability}%</p>
      <p>NO: {probabilities?.noProbability}%</p>
    </div>
  );
}
```

### Fonctions disponibles (`prediction.ts`)

- `buyPosition()` - Acheter des tokens YES ou NO
- `redeem()` - Récupérer le collateral après résolution
- `resolveMarket()` - Résoudre automatiquement via Chainlink
- `getMarketInfo()` - Obtenir les informations du marché
- `getUserBalances()` - Obtenir les balances YES/NO d'un utilisateur
- `calculateProbabilities()` - Calculer les probabilités implicites
- `getCurrentPrice()` - Obtenir le prix actuel depuis Chainlink

### Hook `useMarketData`

Charge automatiquement et rafraîchit toutes les 10 secondes:
- Informations du marché
- Balances utilisateur
- Probabilités
- Prix Chainlink actuel

## 📖 Utilisation

### Flux utilisateur

#### 1. Achat d'une position

1. L'utilisateur connecte son wallet
2. Sélectionne YES ou NO
3. Entre un montant (ex: 100 USDC)
4. Clique sur "Acheter position"
5. Le contrat demande l'approbation (automatique)
6. L'utilisateur reçoit des tokens YES ou NO
7. Les tokens sont tradables sur DEX

#### 2. Résolution

1. Après `endTime`, n'importe qui peut appeler `resolve()`
2. Le contrat interroge Chainlink pour le prix actuel
3. Si prix >= targetPrice → YES, sinon → NO
4. Le marché est marqué comme résolu

#### 3. Récupération des gains

1. L'utilisateur clique sur "Récupérer YES" ou "Récupérer NO"
2. Le contrat brûle les tokens gagnants
3. L'utilisateur reçoit le collateral (1:1)

### Calcul des probabilités

Les probabilités sont calculées en temps réel basées sur les pools:

```typescript
yesProbability = (totalSupply(YES) / (totalSupply(YES) + totalSupply(NO))) * 100
noProbability = (totalSupply(NO) / (totalSupply(YES) + totalSupply(NO))) * 100
```

## 🐛 Dépannage

### Erreurs de déploiement

**"insufficient funds"**
- ➡️ Obtenez des tokens de test sur le faucet du testnet

**"nonce too high"**
- ➡️ Réinitialisez votre wallet ou attendez quelques minutes

**"execution reverted"**
- ➡️ Vérifiez que:
  - Le `endTime` est dans le futur
  - L'adresse du `collateral` est correcte
  - L'adresse du `priceFeed` est correcte pour le réseau

**Le contrat ne se déploie pas**
- ➡️ Vérifiez:
  - Votre clé privée est correcte dans `.env`
  - Vous avez assez de fonds pour le gas
  - Le réseau RPC est accessible

### Erreurs frontend

**"Contrat non configuré"**
- ➡️ Ajoutez l'adresse du contrat dans `src/web3/marketConfig.ts` pour le marché correspondant

**"Erreur d'approbation"**
- ➡️ Le contrat demande automatiquement l'approbation. Si ça échoue, vérifiez que vous avez assez de tokens

**"Market not ended"**
- ➡️ La résolution automatique nécessite que `block.timestamp >= endTime`

**"Nothing to claim"**
- ➡️ Vous n'avez pas de tokens gagnants à récupérer, ou le marché n'est pas encore résolu

**Le wallet ne se connecte pas**
- ➡️ Vérifiez que votre Project ID est correct
- ➡️ Assurez-vous que le wallet est installé (MetaMask, etc.)
- ➡️ Vérifiez la console pour les erreurs

**"Network not supported"**
- ➡️ Vérifiez que la chaîne est dans `src/web3/chains.ts`
- ➡️ Demandez à l'utilisateur de changer de réseau dans son wallet

## 🔐 Sécurité

### Bonnes pratiques

- ✅ Les tokens sont des ERC20 standards (tradables)
- ✅ Résolution automatique via Chainlink (décentralisée)
- ✅ Fallback manuel pour l'owner si Chainlink échoue
- ✅ Pas de reentrancy (SafeERC20)
- ✅ Vérification des conditions avant chaque action

### ⚠️ Avertissements

- ⚠️ Le contrat utilise `onlyOwner` pour la résolution manuelle (fallback)
- ⚠️ Assurez-vous que le `targetPrice` est correct (en unités du feed Chainlink, généralement 1e8)
- ⚠️ Vérifiez que le `endTime` est dans le futur au moment du déploiement
- ⚠️ Testez sur testnet avant de déployer sur mainnet
- ⚠️ Ne commitez JAMAIS votre clé privée ou votre Project ID
- ⚠️ Utilisez uniquement un wallet de test pour le déploiement

## 📝 Notes importantes

- Les tokens YES/NO sont **librement tradables** sur n'importe quel DEX
- Après résolution, seuls les tokens gagnants peuvent être échangés
- Les tokens perdants ne valent plus rien après résolution
- Les probabilités sont mises à jour en temps réel selon les achats/ventes
- Les utilisateurs doivent approuver le contrat avant d'acheter (géré automatiquement dans le frontend)

## 🔗 Ressources

### Documentation
- [Chainlink Documentation](https://docs.chain.link/)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal)
- [ethers.js v6](https://docs.ethers.org/v6/)
- [Hardhat Documentation](https://hardhat.org/docs)

### Liens utiles
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/goerli)

## 📞 Support

Pour toute question ou problème:
1. Vérifiez la section [Dépannage](#-dépannage)
2. Consultez les commentaires dans le code
3. Vérifiez les logs de la console

---

**⚠️ IMPORTANT**: Ne partagez jamais votre clé privée ou votre Project ID WalletConnect publiquement!
