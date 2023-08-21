import {CircularProgress, IconButton} from '@mui/joy';
import {FC, useCallback} from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import NftInfo from '../../hooks/NftInfo';
import { PublicKey } from '@solana/web3.js';
import useBurnWnft from '../../hooks/wnft/useBurnWnft';

const BurnWnftButton: FC<{
  wnftInfo: NftInfo;
  wallet: PublicKey;
  path: NftInfo[];
}> = ({wnftInfo, path}) => {
  const burnWnft = useBurnWnft();

  const handleClick = useCallback(() => {
    burnWnft.mutate(
      {path, wnft: wnftInfo},
    );
  }, [path, burnWnft, wnftInfo]);

  return (
    <IconButton aria-label="Delete" size="sm" color="danger" onClick={handleClick}>
      {burnWnft.isLoading? <CircularProgress/>: <DeleteIcon />}
    </IconButton>
  );
};

export default BurnWnftButton;