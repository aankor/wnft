import {List, ListDivider} from '@mui/joy';
import {FC} from 'react';
import useWalletTokens from '../../hooks/token/useWalletTokens';
import {CircularProgress, SxProps} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import TokenLine from '../token/TokenLine';
import usePathAuthority from '../../hooks/usePathAuthority';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../../hooks/NftInfo';
import {joinWithSeparator} from '../../utils';

const TokenList: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  sx?: SxProps;
}> = ({sx, wallet, path}) => {
  const authority = usePathAuthority({wallet, path});
  const tokens = useWalletTokens(authority);

  if (tokens.isLoading) {
    return <CircularProgress />;
  }
  if (tokens.isError) {
    return <ErrorIcon />;
  }

  return (
    <List variant="outlined" sx={{...sx, padding: 0}}>
      {joinWithSeparator(
        tokens.data.map(token => (
          <TokenLine
            tokenInfo={token}
            wallet={wallet}
            path={path}
            key={token.mint.toBase58()}
          />
        )),
        <ListDivider />
      )}
    </List>
  );
};

export default TokenList;
