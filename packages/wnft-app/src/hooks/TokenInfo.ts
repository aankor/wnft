import {PublicKey} from '@solana/web3.js';

export interface TokenInfo {
  owner: PublicKey;
  mint: PublicKey;
  balance: number;
  name: string;
  symbol: string;
  image: string;
}
