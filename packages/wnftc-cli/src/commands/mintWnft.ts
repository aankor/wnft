import {Command} from 'commander';
import {useContext} from '../context';
import {PublicKey, SystemProgram} from '@solana/web3.js';
import {parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';
import * as bg from '@metaplex-foundation/mpl-bubblegum';
import {WnftCollectionSdk} from 'wnftc-sdk';

export function installMintWnft(program: Command) {
  program
    .command('mint-wnft')
    .requiredOption('--root <pubkey>', 'root address')
    .requiredOption('--name <string>', 'Name')
    .requiredOption('--uri <string>', 'Uri')
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processMintWnft);
}

async function processMintWnft({
  root,
  name,
  uri,
  print,
  simulate = false,
}: {
  root: string;
  name: string;
  uri: string;
  print?: string;
  simulate?: boolean;
}) {
  const {sdk, provider} = useContext();

  const rootPk = await parsePubkey(root);
  const rootData = await sdk.program.account.root.fetch(rootPk);

  const builder = sdk.program.methods.mintWnft(name, uri).accountsStrict({
    root: rootPk,
    systemProgram: SystemProgram.programId,
    treeDelegate: sdk.treeCreatorPDA(rootPk),
    treeAuthority: WnftCollectionSdk.bgTreeAuthority(rootData.currentTree),
    bubblegumProgram: bg.PROGRAM_ID,
    logWrapper: 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
    compressionProgram: 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
    minter: sdk.minterPDA(rootPk),
    collection: rootData.collection,
    currentTree: rootData.currentTree,
    feeCollector: sdk.rentPayerPDA(rootPk),
    payer: provider.wallet.publicKey,
    leafOwner: provider.wallet.publicKey,
    leafDelegate: provider.wallet.publicKey,
    collectionAuthorityRecordPda: bg.PROGRAM_ID,
    collectionMetadata: PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata', 'utf-8'),
        mpl.PROGRAM_ID.toBuffer(),
        rootData.collection.toBuffer(),
      ],
      mpl.PROGRAM_ID
    )[0],
    editionAccount: PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata', 'utf-8'),
        mpl.PROGRAM_ID.toBuffer(),
        rootData.collection.toBuffer(),
        Buffer.from('edition', 'utf-8'),
      ],
      mpl.PROGRAM_ID
    )[0],
    bubblegumSigner: WnftCollectionSdk.bgSigner(),
    tokenMetadataProgram: mpl.PROGRAM_ID,
  });

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
