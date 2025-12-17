import { useState, useEffect } from "react";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider } from "ethers";
import { getAddress, getChainId } from "@/web3/connect";

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
}

export function useWallet() {
  const { address: wcAddress, chainId: wcChainId, isConnected: wcConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    provider: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      // Si WalletConnect est connecté
      if (wcConnected && wcAddress && walletProvider) {
        try {
          const provider = new BrowserProvider(walletProvider);
          setState({
            address: wcAddress,
            chainId: wcChainId || null,
            isConnected: true,
            provider
          });
        } catch (error) {
          console.error("Error creating provider:", error);
        }
      } 
      // Sinon, vérifier MetaMask ou autres wallets injectés
      else if (window.ethereum) {
        try {
          const address = await getAddress();
          const chainId = await getChainId();
          if (address) {
            const provider = new BrowserProvider(window.ethereum);
            setState({
              address,
              chainId,
              isConnected: true,
              provider
            });
          } else {
            setState({
              address: null,
              chainId: null,
              isConnected: false,
              provider: null
            });
          }
        } catch {
          setState({
            address: null,
            chainId: null,
            isConnected: false,
            provider: null
          });
        }
      } else {
        setState({
          address: null,
          chainId: null,
          isConnected: false,
          provider: null
        });
      }
    };

    checkConnection();

    // Écouter les changements de compte/réseau
    if (window.ethereum) {
      const handleAccountsChanged = () => checkConnection();
      const handleChainChanged = () => checkConnection();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [wcAddress, wcChainId, wcConnected, walletProvider]);

  return state;
}

