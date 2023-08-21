import {FC, ReactElement, useCallback, useMemo} from 'react';
// import './App.css';
import {Adapter, WalletAdapterNetwork, WalletError} from '@solana/wallet-adapter-base';
import {clusterApiUrl} from '@solana/web3.js';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletDialogProvider} from '@solana/wallet-adapter-material-ui';
import WnftAppBar from './components/WnftAppBar';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
// import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {CssBaseline, Toolbar, useScrollTrigger} from '@mui/material';
import React from 'react';
import UserContents from './components/UserContents';
import { useSnackbar } from 'notistack';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
});

const ElevationScroll: FC<{
  children: ReactElement;
}> = ({children}) => {
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the dsemo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
};

function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError, adapter?: Adapter) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error, adapter);
        },
        [enqueueSnackbar]
    );


  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} onError={onError} autoConnect>
          <WalletDialogProvider>
            <ElevationScroll>
              <WnftAppBar />
            </ElevationScroll>
            <Toolbar />
            <UserContents />
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default App;
