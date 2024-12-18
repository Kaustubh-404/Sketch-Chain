// // src/pages/_app.tsx
// import '@/styles/globals.css';
// import type { AppProps } from 'next/app';
// import { WagmiConfig } from 'wagmi';
// import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
// import { Toaster } from 'react-hot-toast';
// import { wagmiConfig, chains } from '@/config/web3';
// import { Layout } from '@/components/Layout';
// import { ErrorBoundary } from '@/components/ErrorBoundary';
// import { ConnectionGuard } from '@/components/ConnectionGaurd';

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <ErrorBoundary>
//       <WagmiConfig config={wagmiConfig}>
//         <RainbowKitProvider chains={chains}>
//           <ConnectionGuard>
//             <Layout>
//               <Component {...pageProps} />
//               <Toaster position="top-right" />
//             </Layout>
//           </ConnectionGuard>
//         </RainbowKitProvider>
//       </WagmiConfig>
//     </ErrorBoundary>
//   );
// }

import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit'; 
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/web3';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConnectionGuard } from '@/components/ConnectionGaurd';
import { ClientOnly } from '@/components/ClientOnly'

// Create a client for react-query
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ClientOnly>
            <ConnectionGuard>
              <Layout>
                <Component {...pageProps} />
                <Toaster position="top-right" />
              </Layout>
            </ConnectionGuard>
            </ClientOnly>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}