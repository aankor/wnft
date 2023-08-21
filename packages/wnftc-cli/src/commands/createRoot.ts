import {Command} from 'commander';
import {useContext} from '../context';
import {Keypair, SystemProgram} from '@solana/web3.js';
import {parseKeypair, parsePubkey} from '../keyParser';
import {executeTx} from '../executeTx';
//import {minterAddress} from '../pdas';
//import {TOKEN_PROGRAM_ID} from '@coral-xyz/anchor/dist/cjs/utils/token';

export function installCreateRoot(program: Command) {
  program
    .command('create-root')
    .option('--root <keypair>', 'Root address keypair (default: random)')
    .option('--admin <pubkey>', 'Admin (default: wallet key)')
    .option(
      '--max-tree-depth <number>',
      'Max depth of the tree (default: 15)',
      parseFloat,
      15
    )
    .option(
      '--max-tree-buffer-size <number>',
      'Max buffer size of the tree (default: 64)',
      parseFloat,
      64
    )
    .option('--tree-cannopy <number>', 'Cannopy (defaut: 12)', parseFloat, 12)
    .option('-s, --simulate', 'Simulate')
    .option(
      '--print <format>',
      'Prints tx in base64 in multisig (for creating proposals) or legacy/version0 (for explorers) formats'
    )
    .action(processCreateRoot);
}

async function processCreateRoot({
  root,
  admin,
  maxTreeDepth,
  maxTreeBufferSize,
  treeCannopy,
  print,
  simulate = false,
}: {
  root?: string;
  admin?: string;
  maxTreeDepth: number;
  maxTreeBufferSize: number;
  treeCannopy: number;
  print?: string;
  simulate?: boolean;
}) {
  const {sdk, provider} = useContext();

  let rootKp: Keypair;
  if (root) {
    rootKp = await parseKeypair(root);
  } else {
    rootKp = Keypair.generate();
    console.log(`Generating root address ${rootKp.publicKey.toBase58()}`);
  }

  const adminPk = admin ? await parsePubkey(admin) : provider.wallet.publicKey;

  const builder = sdk.program.methods
    .createRoot(adminPk, maxTreeDepth, maxTreeBufferSize, treeCannopy)
    .accountsStrict({
      root: rootKp.publicKey,
      payer: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      // tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([rootKp]);

  await executeTx({
    provider,
    builder,
    print,
    simulate,
  });
}
