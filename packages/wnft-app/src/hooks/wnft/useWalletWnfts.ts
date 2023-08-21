import {PublicKey} from '@solana/web3.js';
import {useQuery} from '@tanstack/react-query';
import {useCallback} from 'react';
import axios from 'axios';
import useWnftCollectionRoot from '../useWnftCollectionRoot';
import NftInfo from '../NftInfo';
import {RootData} from 'wnftc-sdk';

export const loadWalletWnfts = async ({
  wallet,
  rootData,
}: {
  wallet: PublicKey;
  rootData: RootData;
}) => {
  const wnfts = await axios({
    url: `https://aankor.space/shyft/sol/v2/nft/compressed/read_all?network=devnet&wallet_address=${wallet.toBase58()}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result: NftInfo[] = [];
  for (const {
    name,
    image_uri,
    cached_image_uri,
    mint,
    owner,
    collection,
  } of wnfts.data.result.nfts) {
    if (
      collection?.address &&
      new PublicKey(collection.address).equals(rootData.collection)
    ) {
      result.push({
        name,
        imageUri: cached_image_uri || image_uri,
        mint: new PublicKey(mint),
        owner: new PublicKey(owner),
      });
    }
  }
  return result;
};

const useWalletWnfts = (wallet?: PublicKey | null) => {
  const root = useWnftCollectionRoot({});

  return useQuery({
    queryKey: ['wallet', wallet?.toBase58(), 'wnfts'],
    queryFn: useCallback(
      () => loadWalletWnfts({wallet: wallet!, rootData: root.data!}),
      [wallet, root.data]
    ),
    enabled: Boolean(wallet && root.data),
  });
};
export default useWalletWnfts;
