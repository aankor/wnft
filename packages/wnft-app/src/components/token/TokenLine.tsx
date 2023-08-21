import {ListItemSecondaryAction, Typography} from '@mui/material';
import {FC} from 'react';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemButton from '@mui/joy/ListItemButton';
import OpenInNew from '@mui/icons-material/OpenInNew';
import ListItem from '@mui/joy/ListItem';
import IconButton from '@mui/joy/IconButton';
import NftInfo from '../../hooks/NftInfo';
import {shortPubkey} from '../../utils';
import {PublicKey} from '@solana/web3.js';
import SendTokenButton from './SendTokenButton';
import { TokenInfo } from '../../hooks/TokenInfo';

const TokenLine: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  tokenInfo: TokenInfo;
}> = ({wallet, path, tokenInfo}) => {
  // possible don't know a mint
  const shortMint = tokenInfo.mint.equals(PublicKey.default)
    ? ''
    : '(' + shortPubkey(tokenInfo.mint) + ')';
  const infoHref = tokenInfo.mint.equals(PublicKey.default)
    ? ''
    : `https://translator.shyft.to/address/${tokenInfo.mint.toBase58()}?cluster=devnet`;

  return (
    <ListItem
      key={tokenInfo.mint.toBase58()}
      startAction={
        <IconButton
          aria-label="Info"
          size="sm"
          href={infoHref}
          component="a"
          rel="noopener noreferrer"
          target="_blank"
        >
          <OpenInNew />
        </IconButton>
      }
    >
      <ListItemButton>
        <ListItemDecorator>
          <img src={tokenInfo.image} height="20em" width="auto" />
        </ListItemDecorator>
        <Typography>
          {tokenInfo.name}
          {shortMint}
        </Typography>
        <Typography sx={{marginLeft: 'auto', marginRight: '3em'}}>
          {tokenInfo.balance}
        </Typography>
      </ListItemButton>

      <ListItemSecondaryAction>
        <SendTokenButton tokenInfo={tokenInfo} wallet={wallet} path={path} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default TokenLine;
