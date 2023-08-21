import {MethodsBuilder} from '@coral-xyz/anchor/dist/cjs/program/namespace/methods';
// eslint-disable-next-line node/no-unpublished-import
import {WnftCollectionIdl} from 'wnftc-sdk';
import {AllInstructions} from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import {AnchorProvider} from '@coral-xyz/anchor';
import {serializeInstructionToBase64} from '@solana/spl-governance';
import {base64} from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {MessageV0, VersionedTransaction} from '@solana/web3.js';
import {simulateTransaction} from '@coral-xyz/anchor/dist/cjs/utils/rpc';

export async function executeTx({
  provider,
  builder,
  print,
  simulate,
}: {
  provider: AnchorProvider;
  builder: MethodsBuilder<
    WnftCollectionIdl,
    AllInstructions<WnftCollectionIdl>
  >;
  print?: string;
  simulate?: boolean;
}) {
  if (print) {
    const tx = await builder.transaction();
    const {blockhash, lastValidBlockHeight} =
      await provider.connection.getLatestBlockhash();
    switch (print) {
      case 'multisig':
        console.log('Instructions:\n');
        for (const ix of tx.instructions) {
          console.log(serializeInstructionToBase64(ix));
          console.log();
        }
        break;
      case 'legacy':
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.recentBlockhash = blockhash;
        tx.feePayer = provider.publicKey;
        console.log('Transaction:\n');
        console.log(base64.encode(tx.compileMessage().serialize()));
        break;
      case 'version0': {
        const txv0 = new VersionedTransaction(
          MessageV0.compile({
            payerKey: provider.publicKey,
            instructions: tx.instructions,
            recentBlockhash: blockhash,
          })
        );
        console.log('Transaction:\n');
        console.log(base64.encode(Buffer.from(txv0.serialize())));
        break;
      }
      default:
        throw new Error(`Unknown print format ${print}`);
    }
  }
  if (simulate) {
    // anchor's .simulate is not working for some stange reason
    // getting signers with prepare
    const {signers} = await builder.prepare();
    // and building tx again because prepare is returning only one ix
    const tx = await builder.transaction();

    // TODO

    for (const k of tx.instructions[0].keys) {
      console.log(`${k.pubkey.toBase58()} - ${k.isWritable}`);
    }

    const {blockhash, lastValidBlockHeight} =
      await provider.connection.getLatestBlockhash();
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.recentBlockhash = blockhash;
    tx.feePayer = provider.publicKey;
    provider.wallet.signTransaction(tx);
    if (signers.length > 0) {
      tx.sign(...signers);
    }
    console.log(
      JSON.stringify((await simulateTransaction(provider.connection, tx)).value)
    );
  }
  if (!print && !simulate) {
    await builder.rpc();
  }
}
