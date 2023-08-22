import { Stack } from '@mui/joy';
import {AppBar, Toolbar, Typography} from '@mui/material';
import {WalletMultiButton} from '@solana/wallet-adapter-material-ui';
import {FC} from 'react';

const WnftAppBar: FC = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography>Wallet NFT</Typography>
        <Stack direction='row' sx={{marginLeft: 'auto'}}>
          <Typography sx={{paddingTop: '0.3em', marginRight: '1em'}}>Network: Devnet</Typography>
          <WalletMultiButton color="secondary" sx={{marginLeft: 'auto'}} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default WnftAppBar;
