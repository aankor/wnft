import {useAnchorWallet, useConnection} from '@solana/wallet-adapter-react';
import {WnftSdk} from 'wnft-sdk';
import {AnchorProvider} from '@coral-xyz/anchor';
import {useMemo} from 'react';
import {PublicKey} from '@solana/web3.js';

const useWnftSdk = () => {
  const {connection} = useConnection();
  const wallet = useAnchorWallet();
  return useMemo(
    () =>
      new WnftSdk({
        provider: new AnchorProvider(
          connection,
          wallet || {
            publicKey: PublicKey.default,
            signTransaction() {
              throw new Error('Null wallet');
            },
            signAllTransactions() {
              throw new Error('Null wallet');
            },
          },
          {
            commitment: 'confirmed',
          }
        ),
      }),
    [connection, wallet]
  );
};

export default useWnftSdk;
