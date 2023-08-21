"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const keyParser_1 = require("./keyParser");
const context_1 = require("./context");
const commands_1 = require("./commands");
const program = new commander_1.Command();
program
    .version('0.0.1')
    .allowExcessArguments(false)
    .option('-c, --cluster <cluster>', 'Solana cluster', 'https://api.devnet.rpcpool.com/82424375-773e-4bc1-8169-2053be5f5b5d')
    .option('--program-id <program-id>', 'program ID', 'wnfcodchjmiS96bd9pKCoUBir6V2C6ucGXWYCWHMXuF')
    .option('--commitment <commitment>', 'Commitment', 'confirmed')
    .option('-k, --keypair <keypair>', 'Wallet keypair', '~/.config/solana/id.json')
    .option('--skip-preflight', 'setting transaction execution flag "skip-preflight"', false)
    .hook('preAction', async (command, action) => {
    (0, context_1.setContext)({
        cluster: command.opts().cluster,
        programId: await (0, keyParser_1.parsePubkey)(command.opts().programId),
        walletKP: await (0, keyParser_1.parseKeypair)(command.opts().keypair),
        skipPreflight: Boolean(command.opts().skipPreflight),
        commitment: command.opts().commitment,
        command: action.name(),
    });
});
(0, commands_1.installCommands)(program);
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map