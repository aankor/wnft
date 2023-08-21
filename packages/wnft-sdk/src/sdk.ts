import {AnchorProvider, BN, IdlTypes, Program} from '@coral-xyz/anchor';
import {Wnft, IDL} from '../generated/target/types/wnft';
import {
  AccountMeta,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

export type WnftProgram = Program<Wnft>;
export type WnftIdl = Wnft;
export type InstructionModel = IdlTypes<Wnft>['InstructionModel'];

export class WnftSdk {
  static DEFAULT_PROGRAM_ID = new PublicKey(
    'wnftDJ4FRB46dVCPSkPejyCxuyhcCrVirnAAC4k757B'
  );

  public program: WnftProgram;

  get provider() {
    return this.program.provider;
  }

  get programId() {
    return this.program.programId;
  }

  get walletKey() {
    if (!this.provider.publicKey) {
      throw new Error('No wallet connected');
    }
    return this.provider.publicKey;
  }

  constructor({
    provider,
    programId = WnftSdk.DEFAULT_PROGRAM_ID,
  }: {
    provider: AnchorProvider;
    programId?: PublicKey;
  }) {
    this.program = new Program(IDL, programId, provider);
  }

  nftAuthorityPDA({mint, index = 0}: {mint: PublicKey; index?: number}) {
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32LE(index);
    return PublicKey.findProgramAddressSync(
      [Buffer.from('nft', 'utf-8'), mint.toBytes(), indexBuffer],
      this.program.programId
    )[0];
  }

  createTxModel({transactionModel}: {transactionModel: Keypair}) {
    return this.program.methods
      .createTransactionModel(this.walletKey)
      .accountsStrict({
        transactionModel: transactionModel.publicKey,
        payer: this.walletKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([transactionModel]);
  }

  insertInstruction({
    transactionModel,
    index,
    instructionModel,
  }: {
    transactionModel: PublicKey;
    index: number;
    instructionModel: InstructionModel;
  }) {
    return this.program.methods
      .insertInstruction(index, instructionModel)
      .accountsStrict({
        transactionModel,
        owner: this.walletKey,
        payer: this.walletKey,
        systemProgram: SystemProgram.programId,
      });
  }

  executeTransaction({
    transactionModel,
    tx,
    pdas,
  }: {
    transactionModel: PublicKey;
    tx: Transaction;
    pdas: PublicKey[];
  }) {
    const rest: AccountMeta[] = [];
    tx.recentBlockhash = 'A3JG1ERZqGVEsYA6k8xDHNaRGFiMy5r4aMjL7RWetmQi'; // dummy
    const message = tx.compileMessage();
    for (
      let i = 0;
      i <
      message.header.numRequiredSignatures -
        message.header.numReadonlySignedAccounts;
      i++
    ) {
      rest.push({
        pubkey: message.accountKeys[i],
        isSigner: !pdas.find(p => p.equals(message.accountKeys[i])),
        isWritable: true,
      });
    }
    for (
      let i =
        message.header.numRequiredSignatures -
        message.header.numReadonlySignedAccounts;
      i < message.header.numRequiredSignatures;
      i++
    ) {
      rest.push({
        pubkey: message.accountKeys[i],
        isSigner: !pdas.find(p => p.equals(message.accountKeys[i])),
        isWritable: false,
      });
    }
    for (
      let i = message.header.numRequiredSignatures;
      i <
      message.accountKeys.length - message.header.numReadonlyUnsignedAccounts;
      i++
    ) {
      rest.push({
        pubkey: message.accountKeys[i],
        isSigner: false,
        isWritable: true,
      });
    }
    for (
      let i =
        message.accountKeys.length - message.header.numReadonlyUnsignedAccounts;
      i < message.accountKeys.length;
      i++
    ) {
      rest.push({
        pubkey: message.accountKeys[i],
        isSigner: false,
        isWritable: false,
      });
    }
    return this.program.methods
      .executeTransactionModel()
      .accountsStrict({
        transactionModel,
        owner: this.walletKey,
        rentCollector: this.walletKey,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(rest);
  }

  async approveByCompressedNft({
    treeRoot,
    dataHash,
    creatorHash,
    nonce,
    leafId,
    authorityIndex,
    transactionModel,
    merkleTree,
    leafOwner,
    leafDelegate,
    proofs,
    delegatedSign = false,
  }: {
    treeRoot: PublicKey;
    dataHash: PublicKey;
    creatorHash: PublicKey;
    nonce: BN;
    leafId: number;
    authorityIndex: number;
    transactionModel: PublicKey;
    merkleTree: PublicKey;
    leafOwner: PublicKey;
    leafDelegate: PublicKey;
    proofs: PublicKey[];
    delegatedSign?: boolean;
  }) {
    const builder = this.program.methods
      .approveByCompressedNft(
        Array.from(treeRoot.toBytes()),
        Array.from(dataHash.toBytes()),
        Array.from(creatorHash.toBytes()),
        nonce,
        leafId,
        authorityIndex
      )
      .accountsStrict({
        transactionModel,
        payer: this.walletKey,
        systemProgram: SystemProgram.programId,
        owner: this.walletKey,
        merkleTree,
        leafOwner,
        leafDelegate,
        compressionProgram: 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
      })
      .remainingAccounts(
        proofs.map(p => ({
          pubkey: p,
          isSigner: false,
          isWritable: false,
        }))
      );
    const tx = await builder.transaction();
    if (delegatedSign) {
      tx.instructions[0].keys[5].isSigner = true;
    } else {
      tx.instructions[0].keys[4].isSigner = true;
    }
    return tx;
  }
}
