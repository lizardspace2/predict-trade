import { useWeb3Modal } from "@web3modal/ethers/react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/utils";

export function ConnectWallet() {
  const { open, close } = useWeb3Modal();
  const { address, chainId, isConnected } = useWallet();

  const handleConnect = async () => {
    await open();
  };

  const handleDisconnect = async () => {
    // Pour les wallets injectés (MetaMask, etc.), on ne peut pas vraiment "déconnecter"
    // On peut juste réinitialiser l'état. Pour WalletConnect, la déconnexion se fait via la modal.
    // Ouvrir la modal pour permettre la déconnexion WalletConnect
    await open();
  };

  const getChainName = (chainId: number | null): string => {
    if (!chainId) return "Unknown";
    const chainMap: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BNB Chain",
      42161: "Arbitrum",
      10: "Optimism",
    };
    return chainMap[chainId] || `Chain ${chainId}`;
  };

  if (!isConnected || !address) {
    return (
      <Button onClick={handleConnect} size="sm" className="font-semibold">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{formatAddress(address)}</span>
          <span className="sm:hidden">{formatAddress(address, 4)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Address</span>
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Network</span>
          <span className="text-sm">{getChainName(chainId)}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

