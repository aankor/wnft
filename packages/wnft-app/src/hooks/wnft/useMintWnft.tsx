import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import useWnftCollectionSdk from '../useWnftCollectionSdk';
import useWnftCollectionRoot from '../useWnftCollectionRoot';
import axios from 'axios';
import {wnftCollectionRoot} from '../../keys';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../NftInfo';
import {useSnackbar} from 'notistack';
import {Link} from '@mui/joy';
import { shortPubkey, shortTxSignature } from '../../utils';

const useMintWnft = () => {
  const wnftCollectionSdk = useWnftCollectionSdk();

  const root = useWnftCollectionRoot({});
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation({
    mutationFn: useCallback(
      async ({name, owner}: {name: string; owner: PublicKey}) => {
        if (!root.data) {
          throw new Error('Root must be known');
        }
        const imageUri =
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNl26Cc2JJ8-mcWFbR-t7sq6v4kzzKEj9csgCvY0Z7xa58tLtPOFugBQ5MgO2L0GVC_YM&usqp=CAU';
        const metadata = {
          name,
          symbol: root.data.symbol,
          description: 'NFT Wallet',
          royalty: 0,
          image: imageUri,
          attributes: [],
          creator: '5chRAL4VyX6Sn3EHSqtDzxvVcS1xa5GkFx6B4hgsCDXj',
          share: 100,
        };

        const metadataStatus = await axios.post(
          'https://aankor.space/shyft/sol/v1/metadata/create',
          metadata,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const signature = await wnftCollectionSdk
          .mintWnft({
            root: wnftCollectionRoot,
            rootData: root.data,
            name,
            uri: metadataStatus.data.result.uri,
            owner,
          })
          .rpc();

        console.log(`Tx: ${signature}`);
        let mint;
        {
          let tx;
          while (!tx) {
            tx = await wnftCollectionSdk.provider.connection.getTransaction(
              signature,
              {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: undefined,
              }
            );
          }
          const prefix = 'Program return: ';
          const logs = tx
            .meta!.logMessages!.filter(log => log.startsWith(prefix))
            .map(log => {
              const [key, data] = log.slice(prefix.length).split(' ', 2);
              return {
                key: new PublicKey(key),
                data,
              };
            })
            .filter(({key}) => key.equals(wnftCollectionSdk.programId));
          if (logs.length !== 1) {
            throw new Error('Can not find return value in the mint logs');
          }
          mint = new PublicKey(Buffer.from(logs[0].data, 'base64'));
          console.log(`Mint ${mint}`);
        }

        return {
          wnft: {
            name,
            imageUri,
            owner,
            mint,
          },
          signature,
        };
      },
      [root.data, wnftCollectionSdk]
    ),
    onSuccess: ({wnft, signature}, {owner}) => {
      const href = `https://translator.shyft.to/tx/${signature}?cluster=devnet`;
      const shortMint = shortPubkey(wnft.mint);
      const shortTx = shortTxSignature(signature);
      enqueueSnackbar(`wNFT "${wnft.name}" (${shortMint}) was minted`, {
        variant: 'success',
        action: (
          <Link href={href} rel="noopener noreferrer" target="_blank">
            Tx: {shortTx}
          </Link>
        ),
      });
      queryClient.setQueryData(
        ['wallet', owner.toBase58(), 'wnfts'],
        (old?: NftInfo[]) => old && [wnft, ...old]
      );
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['wallet', owner.toBase58(), 'wnfts'],
        });
      }, 20000);
    },
    onError: (e: Error, {name}) => {
      enqueueSnackbar(`wNft "${name}" mint error ${e.name}: ${e.message}`, {
        variant: 'error',
      });
    },
  });
};

export default useMintWnft;
