import {ListItemSecondaryAction, Typography} from '@mui/material';
import {FC, useCallback} from 'react';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemButton from '@mui/joy/ListItemButton';
import OpenInNew from '@mui/icons-material/OpenInNew';
import ListItem from '@mui/joy/ListItem';
import IconButton from '@mui/joy/IconButton';
import NftInfo from '../../hooks/NftInfo';
import {shortPubkey} from '../../utils';
import {PublicKey} from '@solana/web3.js';
import SendWnftButton from './SendWnftButton';
import BurnWnftButton from './BurnWnftButton';

const WnftLine: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  wnftInfo: NftInfo;
  onClick: (wnft: NftInfo) => void;
  readonly: boolean;
}> = ({wallet, path, wnftInfo, onClick, readonly}) => {
  // possible don't know a mint
  const shortMint = wnftInfo.mint.equals(PublicKey.default)
    ? ''
    : '(' + shortPubkey(wnftInfo.mint) + ')';
  const infoHref = wnftInfo.mint.equals(PublicKey.default)
    ? ''
    : `https://translator.shyft.to/address/${wnftInfo.mint.toBase58()}?cluster=devnet&compressed=true`;

  const handleClick = useCallback(() => {
    onClick(wnftInfo);
  }, [wnftInfo, onClick]);

  return (
    <ListItem
      key={wnftInfo.mint.toBase58()}
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
      <ListItemButton onClick={handleClick}>
        <ListItemDecorator>
          <img src={wnftInfo.imageUri} height="20em" width="auto" />
        </ListItemDecorator>
        <Typography>
          {wnftInfo.name}
          {shortMint}
        </Typography>
      </ListItemButton>

      {readonly ? (
        <></>
      ) : (
        <ListItemSecondaryAction>
          <SendWnftButton wnftInfo={wnftInfo} wallet={wallet} path={path} />
          <BurnWnftButton wnftInfo={wnftInfo} wallet={wallet} path={path} />
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default WnftLine;
