import {List, ListDivider} from '@mui/joy';
import {FC} from 'react';
import useWalletCnfts from '../../hooks/cnft/useWalletCnfts';
import {CircularProgress, SxProps} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import CnftLine from './CnftLine';
import usePathAuthority from '../../hooks/usePathAuthority';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../../hooks/NftInfo';
import {joinWithSeparator} from '../../utils';

const CnftList: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  sx?: SxProps;
}> = ({sx, wallet, path}) => {
  const authority = usePathAuthority({wallet, path});
  const cnfts = useWalletCnfts(authority);

  if (cnfts.isLoading) {
    return <CircularProgress />;
  }
  if (cnfts.isError) {
    return <ErrorIcon />;
  }

  return (
    <List variant="outlined" sx={{...sx, padding: 0}}>
      {joinWithSeparator(
        cnfts.data.map(cnft => (
          <CnftLine
            cnftInfo={cnft}
            wallet={wallet}
            path={path}
            key={cnft.mint.toBase58()}
          />
        )),
        <ListDivider />
      )}{' '}
    </List>
  );
};

export default CnftList;
