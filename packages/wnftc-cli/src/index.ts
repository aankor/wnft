import {Command} from 'commander';
import {parseKeypair, parsePubkey} from './keyParser';
import {setContext} from './context';
import {installCommands} from './commands';

const program = new Command();

program
  .version('0.0.1')
  .allowExcessArguments(false)
  .option(
    '-c, --cluster <cluster>',
    'Solana cluster',
    'https://aankor.space/rpcpool_devnet'
  )
  .option(
    '--program-id <program-id>',
    'program ID',
    'wnfcodchjmiS96bd9pKCoUBir6V2C6ucGXWYCWHMXuF'
  )
  .option('--commitment <commitment>', 'Commitment', 'confirmed')
  .option(
    '-k, --keypair <keypair>',
    'Wallet keypair',
    '~/.config/solana/id.json'
  )
  .option(
    '--skip-preflight',
    'setting transaction execution flag "skip-preflight"',
    false
  )
  .hook('preAction', async (command: Command, action: Command) => {
    setContext({
      cluster: command.opts().cluster,
      programId: await parsePubkey(command.opts().programId),
      walletKP: await parseKeypair(command.opts().keypair),
      skipPreflight: Boolean(command.opts().skipPreflight),
      commitment: command.opts().commitment,
      command: action.name(),
    });
  });

installCommands(program);

program.parseAsync(process.argv);
