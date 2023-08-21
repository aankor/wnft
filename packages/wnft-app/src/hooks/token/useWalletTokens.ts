import {PublicKey} from '@solana/web3.js';
import {useQuery} from '@tanstack/react-query';
import {useCallback} from 'react';
import axios from 'axios';
import {TokenInfo} from '../TokenInfo';

export const loadWalletTokens = async ({wallet}: {wallet: PublicKey}) => {
  const tokens = await axios({
    url: `https://aankor.space/shyft/sol/v1/wallet/all_tokens?network=devnet&wallet=${wallet.toBase58()}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result: TokenInfo[] = [];
  for (const {
    address,
    balance,
    info: {name, symbol, image},
  } of tokens.data.result) {
    result.push({
      owner: wallet,
      mint: new PublicKey(address),
      balance,
      name,
      symbol,
      image,
    });
  }
  return result;
};

const useWalletTokens = (wallet?: PublicKey | null) => {
  return useQuery({
    queryKey: ['wallet', wallet?.toBase58(), 'tokens'],
    queryFn: useCallback(() => loadWalletTokens({wallet: wallet!}), [wallet]),
    enabled: Boolean(wallet),
  });
};
export default useWalletTokens;
