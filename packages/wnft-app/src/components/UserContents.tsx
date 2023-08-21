import {Grid} from '@mui/material';
import {FC, useEffect, useState} from 'react';
import MintForm from './wnft/MintWnftForm';
import {useWallet} from '@solana/wallet-adapter-react';
import CnftList from './cnft/CnftList';
import NftInfo from '../hooks/NftInfo';
import FolderNavigator from './FolderNavigator';
import AuthorityInfo from './AuthorityInfo';
import WnftList from './wnft/WnftList';
import Welcome from './Welcome';
import {Tab, TabList, TabPanel, Tabs} from '@mui/joy';
import TokenList from './token/TokenList';
import {useQueryClient} from '@tanstack/react-query';
import usePathAuthority from '../hooks/usePathAuthority';
import {loadWalletCnfts} from '../hooks/cnft/useWalletCnfts';
import useWnftCollectionRoot from '../hooks/useWnftCollectionRoot';

const UserContents: FC = () => {
  const {publicKey} = useWallet();

  const [path, setPath] = useState<NftInfo[]>([]);
  const queryClient = useQueryClient();
  const authority = usePathAuthority({wallet: publicKey, path});
  const root = useWnftCollectionRoot({});

  useEffect(() => {
    if (authority && root.data) {
      queryClient.prefetchQuery(['wallet', authority.toBase58(), 'cnfts'], {
        queryFn: () =>
          loadWalletCnfts({wallet: authority, rootData: root.data}),
      });
      queryClient.prefetchQuery(['wallet', authority.toBase58(), 'tokens'], {
        queryFn: () =>
          loadWalletCnfts({wallet: authority, rootData: root.data}),
      });
    }
  }, [authority, queryClient, root.data]);

  if (!publicKey) {
    return <Welcome />;
  }

  return (
    <Grid container spacing={2} padding={4}>
      <Grid item xs={8}>
        <FolderNavigator wallet={publicKey} path={path} setPath={setPath} />
      </Grid>
      <Grid item xs={4}>
        <AuthorityInfo
          wallet={publicKey}
          path={path}
          sx={{marginLeft: 'auto'}}
        />
      </Grid>
      <Grid item xs={8}>
        <WnftList
          wallet={publicKey}
          path={path}
          setPath={setPath}
          sx={{maxHeight: '23em', overflowY: 'auto'}}
        />
      </Grid>
      <Grid item xs={4}>
        <MintForm wallet={publicKey} path={path} />
      </Grid>
      <Grid item xs={6}>
        <Tabs defaultValue={'cNFTs'}>
          <TabList>
            <Tab value="cNFTs">Compressed Nfts</Tab>
            <Tab value="Tokens">Tokens</Tab>
          </TabList>
          <TabPanel value="cNFTs">
            <CnftList wallet={publicKey} path={path} />
          </TabPanel>
          <TabPanel value="Tokens">
            <TokenList wallet={publicKey} path={path} />
          </TabPanel>
        </Tabs>
      </Grid>
    </Grid>
  );
};

export default UserContents;
