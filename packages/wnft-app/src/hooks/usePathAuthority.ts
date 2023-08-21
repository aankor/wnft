import NftInfo from './NftInfo';
import {useMemo} from 'react';
import useWnftSdk from './useWnftSdk';
import {PublicKey} from '@solana/web3.js';

const usePathAuthority = ({
  wallet,
  path,
}: {
  wallet?: PublicKey | null;
  path: NftInfo[];
}) => {
  const wnftSdk = useWnftSdk();

  return useMemo(() => {
    if (path.length === 0) {
      return wallet || null;
    }
    return wnftSdk.nftAuthorityPDA({mint: path[path.length - 1].mint});
  }, [wnftSdk, path, wallet]);
};

export default usePathAuthority;
