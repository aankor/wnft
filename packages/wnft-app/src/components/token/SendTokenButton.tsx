import {FC, useState} from 'react';
import SendIcon from '@mui/icons-material/Send';
import {IconButton} from '@mui/joy';
import SendTokenDialog from './SendTokenDialog';
import NftInfo from '../../hooks/NftInfo';
import {PublicKey} from '@solana/web3.js';
import {TokenInfo} from '../../hooks/TokenInfo';

const SendTokenButton: FC<{
  tokenInfo: TokenInfo;
  wallet: PublicKey;
  path: NftInfo[];
}> = ({tokenInfo, wallet, path}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label="Send" size="sm" onClick={() => setOpen(true)}>
        <SendIcon />
      </IconButton>
      <SendTokenDialog
        open={open}
        setOpen={setOpen}
        tokenInfo={tokenInfo}
        wallet={wallet}
        path={path}
      />
    </>
  );
};

export default SendTokenButton;
