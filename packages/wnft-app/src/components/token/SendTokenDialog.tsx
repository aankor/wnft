import {
  ChangeEvent,
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
import {FormGroup, InputLabel, TextField} from '@mui/material';
import {PublicKey} from '@solana/web3.js';
import {LoadingButton} from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import {shortPubkey} from '../../utils';
import FolderNavigator from '../FolderNavigator';
import AuthorityInfo from '../AuthorityInfo';
import WnftList from '../wnft/WnftList';
import useSendToken from '../../hooks/token/useSendToken';
import usePathAuthority from '../../hooks/usePathAuthority';
import {TokenInfo} from '../../hooks/TokenInfo';

const SendTokenDialog: FC<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  wallet: PublicKey;
  path: NftInfo[];
  tokenInfo: TokenInfo;
}> = ({wallet, path, open, setOpen, tokenInfo}) => {
  const [newOwner, setNewOwner] = useState(wallet.toBase58());
  const [targetPath, setTargetPath] = useState<NftInfo[]>([]);
  const shortMint = shortPubkey(tokenInfo.mint);
  const infoHref = `https://translator.shyft.to/address/${tokenInfo.mint.toBase58()}?cluster=devnet`;

  const [amount, setAmount] = useState('0');

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
      setAmount('0');
    }
  }, [open, wallet]);

  useEffect(() => {
    setTargetPath([]);
  }, [newOwner]);

  const targetAuthority = usePathAuthority({
    wallet: newOwnerPk,
    path: targetPath,
  });

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (/^\d*\.?\d*$/.test(v)) {
        setAmount(v);
      }
    },
    [setAmount]
  );

  const sendToken = useSendToken();

  const handleSubmit = useCallback(() => {
    if (!targetAuthority) {
      throw new Error('Target must be known');
    }
    sendToken.mutate(
      {
        path,
        token: tokenInfo,
        target: targetAuthority,
        amount: parseFloat(amount),
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  }, [targetAuthority, sendToken, path, tokenInfo, amount, setOpen]);

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
            Send token
          </Typography>
          <Stack direction="row">
            <Typography>
              {tokenInfo.name}{' '}
              <Link
                href={infoHref}
                component="a"
                rel="noopener noreferrer"
                target="_blank"
              >
                {shortMint}
              </Link>
            </Typography>
            <Typography sx={{marginLeft: 'auto', marginRight: '3em'}}>
              {tokenInfo.balance}
            </Typography>
          </Stack>
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
                <AuthorityInfo wallet={newOwnerPk} path={targetPath} sx={{marginLeft: 'auto'}}/>
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
          <Stack
            direction="row"
            sx={{
              flexShrink: 0,
              paddingTop: '1em',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <TextField
              id="outlined-basic"
              label="Amount"
              variant="outlined"
              type="number"
              value={amount}
              onChange={handleAmountChange}
            />
            <LoadingButton
              loadingPosition="start"
              variant="outlined"
              loading={sendToken.isLoading}
              onClick={handleSubmit}
              startIcon={<SendIcon />}
              disabled={
                !targetAuthority ||
                targetAuthority.equals(tokenInfo.owner) ||
                Number.isNaN(parseFloat(amount)) ||
                parseFloat(amount) <= 0.000000001 ||
                parseFloat(amount) > tokenInfo.balance
              }
              sx={{flex: 1, overflowY: 'auto', marginLeft: '1em'}}
            >
              Send
            </LoadingButton>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default SendTokenDialog;
