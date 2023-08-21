import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {useCallback} from 'react';
import NftInfo from '../NftInfo';
import axios from 'axios';
import {Transaction} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import useWnftSdk from '../useWnftSdk';
import { executePath } from '../pathUtils';
import useWnftCollectionRoot from '../useWnftCollectionRoot';
import { shortPubkey, shortTxSignature } from '../../utils';
import { Link } from '@mui/joy';
import { TokenInfo } from '../TokenInfo';

const useBurnToken = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const {sendTransaction, publicKey} = useWallet();
  const {connection} = useConnection();
  const wnftSdk = useWnftSdk();
  const rootData = useWnftCollectionRoot({});

  return useMutation({
    mutationFn: useCallback(
      async ({path, token, amount}: {path: NftInfo[]; token: TokenInfo, amount: number}) => {
        const burnReciple = await axios.delete(
          'https://aankor.space/shyft/sol/v1/token/burn_detach',
          {
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              network: 'devnet',
              token_address: token.mint.toBase58(),
              wallet: token.owner.toBase58(),
              amount,
              fee_payer: publicKey!.toBase58(),
            },
          }
        );
        const encodedBurnTx: string = burnReciple.data.result.encoded_transaction;
        const burnTx = Transaction.from(Buffer.from(encodedBurnTx, 'base64'));
        let signature;
        if (path.length === 0) {
          signature = await sendTransaction!(burnTx, connection);
        } else {
          const {preTxes, postTxes} = await executePath({
            tx: burnTx,
            path,
            wnftSdk,
            rootData: rootData.data!,
            feePayer: publicKey!,
          });
          await wnftSdk.provider.sendAll!(preTxes);
          for (const tx of postTxes) {
            signature = await wnftSdk.provider.sendAndConfirm!(tx);
          }
        }

        return {
          signature: signature!,
        }
      },
      [connection, publicKey, rootData.data, sendTransaction, wnftSdk]
    ),
    onSuccess: ({signature}, {token, amount}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(token.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(`The ${amount} of "${token.name}" (${shortMint}) was burnt`, {
        variant: 'success',
        action: (
          <Link href={href} rel="noopener noreferrer" target="_blank">
            Tx: {shortTx}
          </Link>
        ),
      });
      queryClient.setQueryData(
        ['wallet', token.owner.toBase58(), 'tokens'],
        (old?: TokenInfo[]) => old && old.filter(w => !w.mint.equals(token.mint))
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', token.owner.toBase58(), 'tokens'],
        });
      }, 20000);
    },

    onError: (e: Error, {token}) => {
      enqueueSnackbar(`Token "${token.name}" (${token.mint.toBase58()}) burn error ${e.name}: ${e.message}`, {
        variant: 'error',
      });
    }
  });
};

export default useBurnToken;
