import { BrowserProvider } from "ethers";

export interface WalletSession {
  provider: BrowserProvider;
  signer: any;
  address: string;
  chainId: number;
}

export async function getSigner(): Promise<WalletSession> {
  if (!window.ethereum) {
    throw new Error("Aucun wallet détecté");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId)
  };
}

export async function getAddress(): Promise<string | null> {
  try {
    if (!window.ethereum) return null;
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  } catch {
    return null;
  }
}

export async function getChainId(): Promise<number | null> {
  try {
    if (!window.ethereum) return null;
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch {
    return null;
  }
}

