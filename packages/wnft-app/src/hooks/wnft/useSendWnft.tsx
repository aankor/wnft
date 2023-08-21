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

const useSendWnft = () => {
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
        wnft,
        target,
      }: {
        path: NftInfo[];
        wnft: NftInfo;
        target: PublicKey;
      }) => {
        const sendReciple = await axios.post(
          'https://aankor.space/shyft/sol/v1/nft/compressed/transfer',
          {
            network: 'devnet',
            nft_address: wnft.mint.toBase58(),
            sender: wnft.owner.toBase58(),
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
    onSuccess: ({signature}, {wnft, target}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(wnft.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(
        `wNFT "${
          wnft.name
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
        ['wallet', wnft.owner.toBase58(), 'wnfts'],
        (old?: NftInfo[]) => old && old.filter(w => !w.mint.equals(wnft.mint))
      );
      queryClient.setQueryData(
        ['wallet', target.toBase58(), 'wnfts'],
        (old?: NftInfo[]) => old && [wnft, ...old]
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', wnft.owner.toBase58(), 'wnfts'],
        });
        queryClient.invalidateQueries({
          queryKey: ['wallet', target.toBase58(), 'wnfts'],
        });
      }, 20000);
    },

    onError: (e: Error, {wnft}) => {
      enqueueSnackbar(
        `wNft "${wnft.name}" transfer error ${e.name}: ${e.message}`,
        {
          variant: 'error',
        }
      );
    },
  });
};

export default useSendWnft;
