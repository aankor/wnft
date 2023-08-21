import {
  Cluster,
  clusterApiUrl,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import {WnftCollectionSdk} from 'wnftc-sdk';
import {AnchorProvider} from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

export interface Context {
  provider: AnchorProvider;
  sdk: WnftCollectionSdk;
  command: string;
}

let context: Context | null = null;

export const setContext = ({
  cluster,
  programId,
  walletKP,
  skipPreflight,
  commitment = 'confirmed',
  command,
}: {
  cluster: string;
  programId: PublicKey;
  walletKP: Keypair;
  skipPreflight: boolean;
  commitment?: Commitment;
  command: string;
}) => {
  try {
    cluster = clusterApiUrl(cluster as Cluster);
  } catch (e) {
    // ignore
  }

  const wallet = new NodeWallet(walletKP);

  const provider = new AnchorProvider(
    new Connection(cluster, {
      commitment,
    }),
    wallet,
    {
      skipPreflight,
      commitment,
    }
  );

  const sdk = new WnftCollectionSdk({provider, programId});

  context = {
    provider,
    sdk,
    command,
  };
};

export const useContext = () => {
  if (!context) {
    throw new Error('Set context before using it');
  }
  return context!;
};
