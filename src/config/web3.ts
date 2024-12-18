import { http } from 'wagmi';
import { mantleTestnet } from 'viem/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Define Mantle Sepolia chain
const mantleSepolia = {
  ...mantleTestnet,
  id: 5003,
  name: 'Mantle Sepolia',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
    public: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
  testnet: true,
} as const;

// Create wagmi config with RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'Web3 Scribble',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  chains: [mantleSepolia],
  transports: {
    [mantleSepolia.id]: http(),
  },
});

// Export chains if needed elsewhere in your app
export const chains = [mantleSepolia];