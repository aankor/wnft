import {AppBar, Toolbar, Typography} from '@mui/material';
import {WalletMultiButton} from '@solana/wallet-adapter-material-ui';
import {FC} from 'react';

const WnftAppBar: FC = () => {
  return (
    <AppBar position='fixed'>
      <Toolbar>
        <Typography>Wallet NFT</Typography>
        <WalletMultiButton color="secondary" sx={{marginLeft: 'auto'}} />
      </Toolbar>
    </AppBar>
  );
};

export default WnftAppBar;
