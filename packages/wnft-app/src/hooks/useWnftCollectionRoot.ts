import {PublicKey} from '@solana/web3.js';
import {useQuery} from '@tanstack/react-query';
import {useCallback} from 'react';
import useWnftCollectionSdk from './useWnftCollectionSdk';
import {wnftCollectionRoot} from '../keys';

const useWnftCollectionRoot = ({
  root = wnftCollectionRoot,
}: {
  root?: PublicKey;
}) => {
  const sdk = useWnftCollectionSdk();

  return useQuery({
    queryKey: ['root', root.toBase58()],
    queryFn: useCallback(async () => {
      return await sdk.program.account.root.fetch(root);
    }, [sdk, root]),
    staleTime: Infinity, // TODO
  });
};

export default useWnftCollectionRoot;
