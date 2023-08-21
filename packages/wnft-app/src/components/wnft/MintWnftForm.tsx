import {FC, useCallback, useState} from 'react';
import {
  FormControl,
  FormGroup,
  FormHelperText,
  Input,
  InputLabel,
  Typography,
} from '@mui/material';
import useMintWnft from '../../hooks/wnft/useMintWnft';
import LoadingButton from '@mui/lab/LoadingButton';
import AddBoxIcon from '@mui/icons-material/AddBox';
import usePathAuthority from '../../hooks/usePathAuthority';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../../hooks/NftInfo';

const MintForm: FC<{wallet: PublicKey; path: NftInfo[]}> = ({
  wallet,
  path,
}) => {
  const [name, setName] = useState('');

  const owner = usePathAuthority({wallet, path})!;

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setName(event.target.value);
    },
    [setName]
  );

  const mintWnft = useMintWnft();

  const handleSubmit = useCallback(() => {
    mintWnft.mutate(
      {name, owner},
      {
        onSuccess: () => {
          setName('');
        },
      }
    );
  }, [mintWnft, name, owner]);

  return (
    <form>
      <Typography id="mint-wnft-lablel">Mint a new wallet NFT</Typography>
      <FormGroup aria-labelledby="mint-wnft-lablel">
        <FormControl>
          <InputLabel htmlFor="name">Name</InputLabel>
          <Input
            id="name"
            aria-describedby="name-text"
            value={name}
            onChange={handleNameChange}
          />
          <FormHelperText id="name-text">NFT name</FormHelperText>
        </FormControl>
        <LoadingButton
          loadingPosition="start"
          variant="outlined"
          loading={mintWnft.isLoading}
          onClick={handleSubmit}
          startIcon={<AddBoxIcon />}
        >
          Mint
        </LoadingButton>
      </FormGroup>
    </form>
  );
};

export default MintForm;
