import {IconButton, Link, Typography} from '@mui/joy';
import {FC, useCallback} from 'react';
import usePathAuthority from '../hooks/usePathAuthority';
import {shortPubkey} from '../utils';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../hooks/NftInfo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useSnackbar} from 'notistack';
import { SxProps } from '@mui/material';

const AuthorityInfo: FC<{wallet: PublicKey; path: NftInfo[]
  sx?: SxProps;}> = ({
  wallet,
  path,
  sx
}) => {
  const authority = usePathAuthority({wallet, path})!;
  const shortAuthority = shortPubkey(authority);
  const {enqueueSnackbar} = useSnackbar();
  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(authority.toBase58());
    enqueueSnackbar(`Authority ${authority.toBase58()} is copied`, {
      variant: 'info'
    });
  }, [authority, enqueueSnackbar]);
  const authorityHref = `https://translator.shyft.to/address/${authority.toBase58()}?cluster=devnet`;

  return (
    <Typography sx={sx}>
      Authority:
      <IconButton onClick={handleCopyClick} sx={{marginLeft: '1em'}}>
        <ContentCopyIcon />
      </IconButton>
      <Link
        href={authorityHref}
        rel="noopener noreferrer"
        target="_blank"
        component="a"
      >
        {shortAuthority}
      </Link>
    </Typography>
  );
};

export default AuthorityInfo;
