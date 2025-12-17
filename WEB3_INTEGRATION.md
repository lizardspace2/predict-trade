# Guide d'intégration Web3 - Prediction Markets

Ce guide explique comment utiliser l'intégration Web3 pour interagir avec des contrats de prédiction comme Polymarket ou Kalshi.

## 🚀 Configuration initiale

### 1. Obtenir un WalletConnect Project ID

1. Visitez [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Créez un compte gratuit
3. Créez un nouveau projet
4. Copiez votre Project ID

### 2. Configurer la variable d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_WALLETCONNECT_PROJECT_ID=votre_project_id_ici
```

Ou modifiez directement `src/web3/config.ts` (non recommandé pour la production).

## 📦 Structure du projet

```
src/
├── web3/
│   ├── config.ts          # Configuration Web3Modal
│   ├── chains.ts          # Chaînes EVM supportées
│   ├── connect.ts         # Fonctions de connexion wallet
│   └── contracts.ts       # Fonctions d'interaction avec les contrats
├── hooks/
│   └── useWallet.ts       # Hook React pour gérer l'état du wallet
└── components/
    ├── ConnectWallet.tsx  # Composant de connexion wallet
    └── TradingPanel.tsx   # Panneau de trading avec Web3
```

## 🔌 Utilisation du wallet

### Connexion wallet

Le composant `ConnectWallet` est déjà intégré dans le Header. Il permet de :
- Connecter MetaMask, Trust Wallet, Coinbase Wallet, etc.
- Connecter via WalletConnect (QR code mobile)
- Afficher l'adresse et le réseau connecté
- Déconnecter le wallet

### Hook useWallet

```typescript
import { useWallet } from "@/hooks/useWallet";

function MyComponent() {
  const { address, chainId, isConnected, provider } = useWallet();

  if (!isConnected) {
    return <div>Connectez votre wallet</div>;
  }

  return (
    <div>
      <p>Adresse: {address}</p>
      <p>Réseau: {chainId}</p>
    </div>
  );
}
```

## 📝 Interagir avec des contrats de prédiction

### Exemple : Placer un pari

```typescript
import { useWallet } from "@/hooks/useWallet";
import { placeBet } from "@/web3/contracts";

function BetComponent() {
  const { provider } = useWallet();
  
  const handleBet = async () => {
    if (!provider) return;
    
    const contractAddress = "0x..."; // Adresse de votre contrat
    const marketId = "market-123";
    const outcome = 0; // Index de l'outcome
    const amount = "10.5"; // Montant en USDT/USDC
    
    try {
      const txHash = await placeBet(
        provider,
        contractAddress,
        marketId,
        outcome,
        amount
      );
      console.log("Transaction:", txHash);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return <button onClick={handleBet}>Placer un pari</button>;
}
```

### Adresses des stablecoins par chaîne

Les adresses USDT/USDC sont disponibles dans `src/web3/contracts.ts` :

```typescript
import { STABLE_COIN_ADDRESSES } from "@/web3/contracts";

// Ethereum Mainnet
const usdtAddress = STABLE_COIN_ADDRESSES[1].USDT;
const usdcAddress = STABLE_COIN_ADDRESSES[1].USDC;

// Polygon
const polygonUsdt = STABLE_COIN_ADDRESSES[137].USDT;
```

## 🔗 Chaînes supportées

- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **BNB Chain** (Chain ID: 56)
- **Arbitrum** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)

Pour ajouter d'autres chaînes, modifiez `src/web3/chains.ts`.

## 🎯 Intégration avec TradingPanel

Le composant `TradingPanel` est déjà configuré pour utiliser Web3. Pour l'activer avec un contrat réel :

```typescript
<TradingPanel
  market={market}
  selectedOutcome={selectedOutcome}
  onSelectOutcome={setSelectedOutcome}
  contractAddress="0x..." // Adresse de votre contrat de prédiction
/>
```

## 📚 Fonctions disponibles

### `placeBet(provider, contractAddress, marketId, outcome, amount)`
Place un pari sur un marché de prédiction.

### `getMarketInfo(provider, contractAddress, marketId)`
Récupère les informations d'un marché.

### `getTokenBalance(provider, tokenAddress, userAddress)`
Récupère le solde d'un token pour une adresse.

## ⚠️ Important

1. **ABI des contrats** : Les fonctions dans `src/web3/contracts.ts` utilisent des ABI simplifiés. Vous devez adapter les ABI selon votre contrat spécifique.

2. **Approbation de tokens** : Avant de placer un pari avec des tokens (USDT/USDC), vous devez approuver le contrat pour dépenser vos tokens. Décommentez et adaptez le code d'approbation dans `placeBet()`.

3. **Gestion des erreurs** : Toujours gérer les erreurs lors des interactions avec la blockchain (rejet de transaction, réseau incorrect, etc.).

4. **Sécurité** : Ne commitez jamais votre Project ID WalletConnect dans le code. Utilisez toujours des variables d'environnement.

## 🔄 Exemple complet : Intégration avec un contrat Polymarket-like

```typescript
// 1. Définir l'ABI complet de votre contrat
const PREDICTION_MARKET_ABI = [
  "function placeBet(uint256 marketId, uint256 outcome, uint256 amount) external returns (uint256)",
  "function getMarket(uint256 marketId) external view returns (string, string[], uint256, bool)",
  "function getUserBet(uint256 marketId, address user) external view returns (uint256, uint256)",
  // ... autres fonctions
];

// 2. Créer une instance du contrat
const contract = new Contract(contractAddress, PREDICTION_MARKET_ABI, signer);

// 3. Interagir avec le contrat
const tx = await contract.placeBet(marketId, outcome, amount);
await tx.wait();
```

## 🐛 Dépannage

### Le wallet ne se connecte pas
- Vérifiez que votre Project ID est correct
- Assurez-vous que le wallet est installé (MetaMask, etc.)
- Vérifiez la console pour les erreurs

### Erreur "Network not supported"
- Vérifiez que la chaîne est dans `src/web3/chains.ts`
- Demandez à l'utilisateur de changer de réseau dans son wallet

### Transaction échoue
- Vérifiez que l'utilisateur a assez de tokens
- Vérifiez que le contrat est approuvé pour dépenser les tokens
- Vérifiez que le réseau est correct

## 📖 Ressources

- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal)
- [ethers.js Documentation](https://docs.ethers.org/)
- [WalletConnect Cloud](https://cloud.walletconnect.com)

