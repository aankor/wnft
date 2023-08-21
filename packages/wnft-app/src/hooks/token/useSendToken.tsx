import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import NftInfo from '../NftInfo';
import useWnftSdk from '../useWnftSdk';
import axios from 'axios';
import {PublicKey, Transaction} from '@solana/web3.js';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import useWnftCollectionRoot from '../useWnftCollectionRoot';

import {useSnackbar} from 'notistack';
import {Link} from '@mui/joy';
import {executePath} from '../pathUtils';
import {shortPubkey, shortTxSignature} from '../../utils';
import {TokenInfo} from '../TokenInfo';

const useSendToken = () => {
  const wnftSdk = useWnftSdk();
  const {sendTransaction, publicKey} = useWallet();
  const {connection} = useConnection();
  const queryClient = useQueryClient();
  const rootData = useWnftCollectionRoot({});
  const {enqueueSnackbar} = useSnackbar();

  return useMutation({
    mutationFn: useCallback(
      async ({
        path,
        token,
        target,
        amount,
      }: {
        path: NftInfo[];
        token: TokenInfo;
        target: PublicKey;
        amount: number;
      }) => {
        const sendReciple = await axios.post(
          'https://aankor.space/shyft/sol/v1/token/transfer_detach',
          {
            network: 'devnet',
            token_address: token.mint.toBase58(),
            from_address: token.owner.toBase58(),
            to_address: target.toBase58(),
            amount,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const encodedSendTx: string =
          sendReciple.data.result.encoded_transaction;
        const sendTx = Transaction.from(Buffer.from(encodedSendTx, 'base64'));

        let signature;
        if (path.length === 0) {
          signature = await sendTransaction!(sendTx, connection);
        } else {
          const {preTxes, postTxes} = await executePath({
            tx: sendTx,
            path,
            wnftSdk,
            rootData: rootData.data!,
            feePayer: publicKey!,
          });
          await wnftSdk.provider.sendAll!(preTxes);
          for (const tx of postTxes) {
            // Ony the last signature will be returned
            signature = await wnftSdk.provider.sendAndConfirm!(tx);
          }
        }
        return {
          signature: signature!,
        };
      },
      [sendTransaction, connection, wnftSdk, rootData.data, publicKey]
    ),
    onSuccess: ({signature}, {token, target, amount}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(token.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(
        `The ${amount} of token "${
          token.name
        }" (${shortMint}) was transferred to the ${target.toBase58()} authority`,
        {
          variant: 'success',
          action: (
            <Link href={href} rel="noopener noreferrer" target="_blank">
              Tx: {shortTx}
            </Link>
          ),
        }
      );
      queryClient.setQueryData(
        ['wallet', token.owner.toBase58(), 'tokens'],
        (old?: TokenInfo[]) =>
          old &&
          old.map(w =>
            w.mint.equals(token.mint) ? {...w, balance: w.balance - amount} : w
          )
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', token.owner.toBase58(), 'tokens'],
        });
        queryClient.invalidateQueries({
          queryKey: ['wallet', target.toBase58(), 'tokens'],
        });
      }, 20000);
    },

    onError: (e: Error, {token}) => {
      enqueueSnackbar(
        `wNft "${token.name}" transfer error ${e.name}: ${e.message}`,
        {
          variant: 'error',
        }
      );
    },
  });
};

export default useSendToken;
