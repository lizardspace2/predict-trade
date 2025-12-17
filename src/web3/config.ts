import { createWeb3Modal } from "@web3modal/ethers/react";
import { chains } from "./chains";
import { BrowserProvider } from "ethers";

// ⚠️ IMPORTANT: Remplacez par votre Project ID depuis https://cloud.walletconnect.com
export const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID_HERE";

createWeb3Modal({
  ethersConfig: {
    metadata: {
      name: "PredictX",
      description: "Prediction Markets Platform",
      url: window.location.origin,
      icons: ["https://avatars.githubusercontent.com/u/37784886"]
    }
  },
  chains,
  projectId,
  enableAnalytics: false,
  enableOnramp: false
});

export type Web3Provider = BrowserProvider;

