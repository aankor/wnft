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

const useBurnWnft = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const {sendTransaction, publicKey} = useWallet();
  const {connection} = useConnection();
  const wnftSdk = useWnftSdk();
  const rootData = useWnftCollectionRoot({});

  return useMutation({
    mutationFn: useCallback(
      async ({path, wnft}: {path: NftInfo[]; wnft: NftInfo}) => {
        const burnReciple = await axios.delete(
          'https://aankor.space/shyft/sol/v1/nft/compressed/burn',
          {
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              network: 'devnet',
              nft_address: wnft.mint.toBase58(),
              wallet_address: wnft.owner.toBase58(),
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
    onSuccess: ({signature}, {wnft}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(wnft.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(`wNFT "${wnft.name}" (${shortMint}) was burnt`, {
        variant: 'success',
        action: (
          <Link href={href} rel="noopener noreferrer" target="_blank">
            Tx: {shortTx}
          </Link>
        ),
      });
      queryClient.setQueryData(
        ['wallet', wnft.owner.toBase58(), 'wnfts'],
        (old?: NftInfo[]) => old && old.filter(w => !w.mint.equals(wnft.mint))
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', wnft.owner.toBase58(), 'wnfts'],
        });
      }, 20000);
    },

    onError: (e: Error, {wnft}) => {
      enqueueSnackbar(`wNft "${wnft.name}" (${wnft.mint.toBase58()}) burn error ${e.name}: ${e.message}`, {
        variant: 'error',
      });
    }
  });
};

export default useBurnWnft;
