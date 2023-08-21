import {Command} from 'commander';
import {useContext} from '../context';
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';
import {parseKeypair, parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
import {
  ASSOCIATED_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@coral-xyz/anchor/dist/cjs/utils/token';
import {getAssociatedTokenAddressSync} from '@solana/spl-token';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';

export function installSetCollection(program: Command) {
  program
    .command('set-collection')
    .option('--root <pubkey>', 'root address')
    .option('--admin <keypair>', 'Admin (default: wallet key)')
    .option(
      '--collection <keypair>',
      'Collection mint keypair (default: random)'
    )
    .requiredOption('--name <string>', 'Name')
    .requiredOption('--symbol <string>', 'Symbol')
    .requiredOption('--uri <string>', 'Uri')
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processSetCollection);
}

async function processSetCollection({
  root,
  admin,
  collection,
  name,
  symbol,
  uri,
  print,
  simulate = false,
}: {
  root: string;
  admin?: string;
  collection?: string;
  name: string;
  symbol: string;
  uri: string;
  print?: string;
  simulate?: boolean;
}) {
  const {sdk, provider} = useContext();

  const signers: Keypair[] = [];

  let adminPk = provider.wallet.publicKey;
  if (admin) {
    const adminKp = await parseKeypair(admin);
    signers.push(adminKp);
    adminPk = adminKp.publicKey;
  }

  const rootPk = await parsePubkey(root);

  let collectionKp: Keypair;
  if (collection) {
    collectionKp = await parseKeypair(root);
  } else {
    collectionKp = Keypair.generate();
    console.log(
      `Generating collection mint ${collectionKp.publicKey.toBase58()}`
    );
  }
  signers.push(collectionKp);

  const builder = sdk.program.methods
    .setCollection(name, symbol, uri)
    .accountsStrict({
      root: rootPk,
      minter: sdk.minterPDA(rootPk),
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      admin: adminPk,
      collectionMint: collectionKp.publicKey,
      collectionToken: getAssociatedTokenAddressSync(
        collectionKp.publicKey,
        adminPk
      ),
      metadata: PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata', 'utf-8'),
          mpl.PROGRAM_ID.toBuffer(),
          collectionKp.publicKey.toBuffer(),
        ],
        mpl.PROGRAM_ID
      )[0],
      masterEdition: PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata', 'utf-8'),
          mpl.PROGRAM_ID.toBuffer(),
          collectionKp.publicKey.toBuffer(),
          Buffer.from('edition', 'utf-8'),
        ],
        mpl.PROGRAM_ID
      )[0],
      rent: SYSVAR_RENT_PUBKEY,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      metadataProgram: mpl.PROGRAM_ID,
    })
    .signers(signers);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
