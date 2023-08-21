import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Input,
  Link,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';
import {Modal} from '@mui/joy';
import NftInfo from '../../hooks/NftInfo';
import {FormGroup, InputLabel} from '@mui/material';
import {PublicKey} from '@solana/web3.js';
import {LoadingButton} from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import {shortPubkey} from '../../utils';
import FolderNavigator from '../FolderNavigator';
import AuthorityInfo from '../AuthorityInfo';
import WnftList from '../wnft/WnftList';
import useSendCnft from '../../hooks/cnft/useSendCnft';
import usePathAuthority from '../../hooks/usePathAuthority';

const SendCnftDialog: FC<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  wallet: PublicKey;
  path: NftInfo[];
  cnftInfo: NftInfo;
}> = ({wallet, path, open, setOpen, cnftInfo}) => {
  const [newOwner, setNewOwner] = useState(wallet.toBase58());
  const [targetPath, setTargetPath] = useState<NftInfo[]>([]);
  const shortMint = shortPubkey(cnftInfo.mint);
  const infoHref = `https://translator.shyft.to/address/${cnftInfo.mint.toBase58()}?cluster=devnet&compressed=true`;

  const newOwnerPk = useMemo(() => {
    try {
      return new PublicKey(newOwner);
    } catch {
      return null;
    }
  }, [newOwner]);

  useEffect(() => {
    if (!open) {
      setNewOwner(wallet.toBase58());
      setTargetPath([]);
    }
  }, [open, wallet]);

  useEffect(() => {
    setTargetPath([]);
  }, [newOwner]);

  const targetAuthority = usePathAuthority({
    wallet: newOwnerPk,
    path: targetPath,
  });

  const sendCnft = useSendCnft();

  const handleSubmit = useCallback(() => {
    if (!targetAuthority) {
      throw new Error('Target must be known');
    }
    sendCnft.mutate(
      {path, cnft: cnftInfo, target: targetAuthority},
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  }, [path, sendCnft, targetAuthority, cnftInfo, setOpen]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{display: 'flex', flexDirection: 'column'}}>
        <ModalClose variant="outlined" />
        <form
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <Typography id="dialog-title" level="h3" sx={{textAlign: 'center'}}>
            Send cNFT
          </Typography>
          <Typography>
            {cnftInfo.name}{' '}
            <Link
              href={infoHref}
              component="a"
              rel="noopener noreferrer"
              target="_blank"
            >
              {shortMint}
            </Link>
          </Typography>
          <FormGroup sx={{flexShrink: 0}}>
            <InputLabel htmlFor="wallet">To wallet</InputLabel>
            <Input
              id="wallet"
              aria-describedby="wallet-text"
              value={newOwner}
              onChange={e => setNewOwner(e.target.value)}
              sx={{minWidth: '40em'}}
            />
          </FormGroup>
          {newOwnerPk ? (
            <Stack
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <Stack direction="row" sx={{flexShrink: 0}}>
                <FolderNavigator
                  wallet={newOwnerPk}
                  path={targetPath}
                  setPath={setTargetPath}
                />
                <AuthorityInfo
                  wallet={newOwnerPk}
                  path={targetPath}
                  sx={{marginLeft: 'auto'}}
                />
              </Stack>
              <WnftList
                wallet={newOwnerPk}
                path={targetPath}
                setPath={setTargetPath}
                readonly={true}
                sx={{flex: 1, overflowY: 'auto'}}
              />
            </Stack>
          ) : (
            <></>
          )}
          <LoadingButton
            loadingPosition="start"
            variant="outlined"
            loading={sendCnft.isLoading}
            onClick={handleSubmit}
            startIcon={<SendIcon />}
            disabled={
              !targetAuthority || targetAuthority.equals(cnftInfo.owner)
            }
            sx={{marginTop: '1em', flexShrink: 0}}
          >
            Send
          </LoadingButton>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default SendCnftDialog;
