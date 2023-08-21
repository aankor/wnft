import {List, ListDivider} from '@mui/joy';
import {Dispatch, FC, SetStateAction, useCallback, useEffect} from 'react';
import useWalletWnfts, { loadWalletWnfts } from '../../hooks/wnft/useWalletWnfts';
import {CircularProgress, SxProps} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WnftLine from './WnftLine';
import usePathAuthority from '../../hooks/usePathAuthority';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../../hooks/NftInfo';
import {joinWithSeparator} from '../../utils';
import {useQueryClient} from '@tanstack/react-query';
import useWnftSdk from '../../hooks/useWnftSdk';
import useWnftCollectionRoot from '../../hooks/useWnftCollectionRoot';

const WnftList: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  setPath: Dispatch<SetStateAction<NftInfo[]>>;
  readonly?: boolean;
  sx?: SxProps;
}> = ({sx, wallet, path, setPath, readonly = false}) => {
  const authority = usePathAuthority({wallet, path});
  const wnfts = useWalletWnfts(authority);
  const queryClient = useQueryClient();
  const wnftSdk = useWnftSdk();
  const root = useWnftCollectionRoot({});

  const handleItemClick = useCallback(
    (wnftInfo: NftInfo) => {
      setPath(path => [...path, wnftInfo]);
    },
    [setPath]
  );

  useEffect(() => {
    if (wnfts.data && root.data) {
      for (const wnft of wnfts.data) {
        const innerWallet = wnftSdk.nftAuthorityPDA({mint: wnft.mint});
        queryClient.prefetchQuery([
          'wallet',
          innerWallet.toBase58(),
          'wnfts',
        ], {
          queryFn: () => loadWalletWnfts({
            wallet: innerWallet,
            rootData: root.data,
          }),
        });
      }
    }
  }, [authority, queryClient, root.data, wnftSdk, wnfts.data]);

  if (wnfts.isLoading) {
    return <CircularProgress />;
  }
  if (wnfts.isError) {
    return <ErrorIcon />;
  }

  return (
    <List variant="outlined" sx={{...sx, padding: 0}}>
      {joinWithSeparator(
        wnfts.data.map(wnft => (
          <WnftLine
            wnftInfo={wnft}
            onClick={handleItemClick}
            readonly={readonly}
            wallet={wallet}
            path={path}
            key={wnft.mint.toBase58()}
          />
        )),
        <ListDivider />
      )}
    </List>
  );
};

export default WnftList;
