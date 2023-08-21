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

const useSendCnft = () => {
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
        cnft,
        target,
      }: {
        path: NftInfo[];
        cnft: NftInfo;
        target: PublicKey;
      }) => {
        const sendReciple = await axios.post(
          'https://aankor.space/shyft/sol/v1/nft/compressed/transfer',
          {
            network: 'devnet',
            nft_address: cnft.mint.toBase58(),
            sender: cnft.owner.toBase58(),
            receiver: target.toBase58(),
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
        }
      },
      [sendTransaction, connection, wnftSdk, rootData.data, publicKey]
    ),
    onSuccess: ({signature}, {cnft, target}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(cnft.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(
        `cNFT "${
          cnft.name
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
        ['wallet', cnft.owner.toBase58(), 'cnfts'],
        (old?: NftInfo[]) => old && old.filter(w => !w.mint.equals(cnft.mint))
      );
      queryClient.setQueryData(
        ['wallet', target.toBase58(), 'cnfts'],
        (old?: NftInfo[]) => old && [cnft, ...old]
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', cnft.owner.toBase58(), 'cnfts'],
        });
        queryClient.invalidateQueries({
          queryKey: ['wallet', target.toBase58(), 'cnfts'],
        });
      }, 20000);
    },

    onError: (e: Error, {cnft}) => {
      enqueueSnackbar(
        `wNft "${cnft.name}" transfer error ${e.name}: ${e.message}`,
        {
          variant: 'error',
        }
      );
    },
  });
};

export default useSendCnft;
