import {FC, useState} from 'react';
import SendIcon from '@mui/icons-material/Send';
import {IconButton} from '@mui/joy';
import SendWnftDialog from './SendWnftDialog';
import NftInfo from '../../hooks/NftInfo';
import {PublicKey} from '@solana/web3.js';

const SendWnftButton: FC<{
  wnftInfo: NftInfo;
  wallet: PublicKey;
  path: NftInfo[];
}> = ({wnftInfo, wallet, path}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label="Send" size="sm" onClick={() => setOpen(true)}>
        <SendIcon />
      </IconButton>
      <SendWnftDialog
        open={open}
        setOpen={setOpen}
        wnftInfo={wnftInfo}
        wallet={wallet}
        path={path}
      />
    </>
  );
};

export default SendWnftButton;
