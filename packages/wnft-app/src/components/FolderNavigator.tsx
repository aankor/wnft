import {Dispatch, FC, SetStateAction, useCallback} from 'react';
import {shortPubkey} from '../utils';
import {Link, Breadcrumbs, Typography} from '@mui/joy';
import {PublicKey} from '@solana/web3.js';
import NftInfo from '../hooks/NftInfo';

const FolderNavigator: FC<{
  wallet: PublicKey;
  path: NftInfo[];
  setPath: Dispatch<SetStateAction<NftInfo[]>>;
}> = ({path, setPath}) => {
  const handleRootClick = useCallback(() => {
    setPath([]);
  }, [setPath]);

  const handleBackClick = useCallback(
    (i: number) => {
      setPath(path.slice(0, i + 1));
    },
    [path, setPath]
  );

  return (
    <Breadcrumbs separator="›" aria-label="breadcrumbs">
      {path.length === 0 ? (
        <Typography key='root'>Wallet</Typography>
      ) : (
        <Link key='root-link' component="button" onClick={handleRootClick}>
          Wallet
        </Link>
      )}
      {path.map(({name, mint}, i) => {
        const shortMint = '(' + shortPubkey(mint) + ')';
        return i === path.length - 1 ? (
          <Typography key={mint.toBase58()}>
            {name} {shortMint}
          </Typography>
        ) : (
          <Link key={mint.toBase58()+'-link'} component="button" onClick={() => handleBackClick(i)}>
            {name} {shortMint}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default FolderNavigator;
