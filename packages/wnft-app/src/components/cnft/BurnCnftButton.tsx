import {CircularProgress, IconButton} from '@mui/joy';
import {FC, useCallback} from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import NftInfo from '../../hooks/NftInfo';
import { PublicKey } from '@solana/web3.js';
import useBurnCnft from '../../hooks/cnft/useBurnCnft';

const BurnCnftButton: FC<{
  cnftInfo: NftInfo;
  wallet: PublicKey;
  path: NftInfo[];
}> = ({cnftInfo, path}) => {
  const burnCnft = useBurnCnft();

  const handleClick = useCallback(() => {
    burnCnft.mutate(
      {path, cnft: cnftInfo},
    );
  }, [path, burnCnft, cnftInfo]);

  return (
    <IconButton aria-label="Delete" size="sm" color="danger" onClick={handleClick}>
      {burnCnft.isLoading? <CircularProgress/>: <DeleteIcon />}
    </IconButton>
  );
};

export default BurnCnftButton;