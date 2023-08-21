import {PublicKey, TransactionSignature} from '@solana/web3.js';
import {ReactElement, cloneElement} from 'react';

export const shortPubkey = (p: PublicKey) =>
  p.toBase58().slice(0, 4) + '..' + p.toBase58().slice(-4);

export const shortTxSignature = (s: TransactionSignature) =>
  s.slice(0, 8) + '..' + s.slice(-4);

export const joinWithSeparator = (
  items: ReactElement[],
  separatorComponent: ReactElement
) => {
  return items.reduce((acc: ReactElement[], item, index) => {
    if (index !== 0) {
      acc.push(cloneElement(separatorComponent, {key: `separator-${index}`}));
    }
    acc.push(item);
    return acc;
  }, []);
};
