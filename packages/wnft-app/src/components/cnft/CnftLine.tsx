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
import SendCnftButton from './SendCnftButton';
import BurnCnftButton from './BurnCnftButton';

const CnftLine: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  cnftInfo: NftInfo;
}> = ({wallet, path, cnftInfo}) => {
  // possible don't know a mint
  const shortMint = cnftInfo.mint.equals(PublicKey.default)
    ? ''
    : '(' + shortPubkey(cnftInfo.mint) + ')';
  const infoHref = cnftInfo.mint.equals(PublicKey.default)
    ? ''
    : `https://translator.shyft.to/address/${cnftInfo.mint.toBase58()}?cluster=devnet&compressed=true`;

  return (
    <ListItem
      key={cnftInfo.mint.toBase58()}
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
          <img src={cnftInfo.imageUri} height="20em" width="auto" />
        </ListItemDecorator>
        <Typography>
          {cnftInfo.name}
          {shortMint}
        </Typography>
      </ListItemButton>

      <ListItemSecondaryAction>
        <SendCnftButton cnftInfo={cnftInfo} wallet={wallet} path={path} />
        <BurnCnftButton cnftInfo={cnftInfo} wallet={wallet} path={path} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default CnftLine;
