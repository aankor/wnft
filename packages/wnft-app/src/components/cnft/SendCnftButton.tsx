import {FC, useState} from 'react';
import SendIcon from '@mui/icons-material/Send';
import {IconButton} from '@mui/joy';
import SendCnftDialog from './SendCnftDialog';
import NftInfo from '../../hooks/NftInfo';
import {PublicKey} from '@solana/web3.js';

const SendCnftButton: FC<{
  cnftInfo: NftInfo;
  wallet: PublicKey;
  path: NftInfo[];
}> = ({cnftInfo, wallet, path}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label="Send" size="sm" onClick={() => setOpen(true)}>
        <SendIcon />
      </IconButton>
      <SendCnftDialog
        open={open}
        setOpen={setOpen}
        cnftInfo={cnftInfo}
        wallet={wallet}
        path={path}
      />
    </>
  );
};

export default SendCnftButton;
