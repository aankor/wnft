import {Command} from 'commander';
import {useContext} from '../context';
import {Keypair, SystemProgram} from '@solana/web3.js';
import {parseKeypair, parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
import * as bg from '@metaplex-foundation/mpl-bubblegum';
import {createAllocTreeIx} from '@solana/spl-account-compression';
import {WnftCollectionSdk} from 'wnftc-sdk';

export function installCreateTree(program: Command) {
  program
    .command('create-tree')
    .requiredOption('--root <pubkey>', 'root address')
    .option('--tree <keypair>', 'Merkle tree')
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processCreateTree);
}

async function processCreateTree({
  root,
  tree,
  print,
  simulate = false,
}: {
  root: string;
  tree?: string;
  print?: string;
  simulate?: boolean;
}) {
  const {sdk, provider} = useContext();

  const rootPk = await parsePubkey(root);
  const rootData = await sdk.program.account.root.fetch(rootPk);

  const treeKp = tree ? await parseKeypair(tree) : Keypair.generate();
  if (!tree) {
    console.log(
      `Creating tree ${treeKp.publicKey.toBase58()}: [${Array.from(
        treeKp.secretKey
      )}]`
    );
  }

  const tx = await createAllocTreeIx(
    sdk.program.provider.connection,
    treeKp.publicKey,
    sdk.program.provider.publicKey!,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      maxDepth: rootData.maxTreeDepth as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      maxBufferSize: rootData.maxTreeBufferSize as any,
    },
    rootData.treeCannopy
  );

  const builder = sdk.program.methods
    .createWnftcTree()
    .accountsStrict({
      root: rootPk,
      systemProgram: SystemProgram.programId,
      treeCreator: sdk.treeCreatorPDA(rootPk),
      rentPayer: sdk.rentPayerPDA(rootPk),
      rentReturn: sdk.program.provider.publicKey!,
      treeAuthority: WnftCollectionSdk.bgTreeAuthority(treeKp.publicKey),
      merkleTree: treeKp.publicKey,
      bubblegumProgram: bg.PROGRAM_ID,
      logWrapper: 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
      compressionProgram: 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
    })
    .preInstructions([tx])
    .signers([treeKp]);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
