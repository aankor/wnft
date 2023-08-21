import {AnchorProvider, IdlAccounts, Program} from '@coral-xyz/anchor';
import {WnftCollection, IDL} from '../generated/target/types/wnft_collection';
import {PublicKey, SystemProgram} from '@solana/web3.js';
import * as bg from '@metaplex-foundation/mpl-bubblegum';
import * as mpl from '@metaplex-foundation/mpl-token-metadata';

export type WnftCollectionProgram = Program<WnftCollection>;
export type WnftCollectionIdl = WnftCollection;
export type RootData = IdlAccounts<WnftCollection>['root'];

export class WnftCollectionSdk {
  static DEFAULT_PROGRAM_ID = new PublicKey(
    'wnfcodchjmiS96bd9pKCoUBir6V2C6ucGXWYCWHMXuF'
  );

  public program: WnftCollectionProgram;

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
    programId = WnftCollectionSdk.DEFAULT_PROGRAM_ID,
  }: {
    provider: AnchorProvider;
    programId?: PublicKey;
  }) {
    this.program = new Program(IDL, programId, provider);
  }

  minterPDA(root: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('minter', 'utf-8'), root.toBytes()],
      this.program.programId
    )[0];
  }

  treeCreatorPDA(root: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('trc', 'utf-8'), root.toBytes()],
      this.program.programId
    )[0];
  }

  rentPayerPDA(root: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('rent', 'utf-8'), root.toBytes()],
      this.program.programId
    )[0];
  }

  static bgTreeAuthority(tree: PublicKey) {
    return PublicKey.findProgramAddressSync([tree.toBytes()], bg.PROGRAM_ID)[0];
  }

  static bgSigner() {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('collection_cpi', 'utf8')],
      bg.PROGRAM_ID
    )[0];
  }

  mintWnft({
    root,
    rootData,
    name,
    uri,
    owner = this.walletKey,
  }: {
    root: PublicKey;
    rootData: RootData;
    name: string;
    uri: string;
    owner?: PublicKey;
  }) {
    return this.program.methods.mintWnft(name, uri).accountsStrict({
      root: root,
      systemProgram: SystemProgram.programId,
      treeDelegate: this.treeCreatorPDA(root),
      treeAuthority: WnftCollectionSdk.bgTreeAuthority(rootData.currentTree),
      bubblegumProgram: bg.PROGRAM_ID,
      logWrapper: 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
      compressionProgram: 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
      minter: this.minterPDA(root),
      collection: rootData.collection,
      currentTree: rootData.currentTree,
      feeCollector: this.rentPayerPDA(root),
      payer: this.walletKey,
      leafOwner: owner,
      leafDelegate: owner,
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
  }
}
