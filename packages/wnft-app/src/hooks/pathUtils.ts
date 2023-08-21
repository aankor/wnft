import {BN} from '@coral-xyz/anchor';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {WnftSdk} from 'wnft-sdk';
import {RootData} from 'wnftc-sdk';
import NftInfo from './NftInfo';
import axios from 'axios';

async function executeFolder({
  tx,
  pathWnft,
  wnftSdk,
  rootData,
  feePayer,
}: {
  tx: Transaction;
  pathWnft: NftInfo;
  wnftSdk: WnftSdk;
  rootData: RootData;
  feePayer: PublicKey;
}): Promise<{
  preSigners: Keypair[];
  preTx: Transaction;
  approveTx: Transaction;
  postTx: Transaction;
}> {
  tx.feePayer = feePayer;
  const assetInfo = await axios.post(
    'https://aankor.space/rpcpool_devnet',
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: {
        id: pathWnft.mint.toBase58(),
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (assetInfo.data.error) {
    throw new Error(`getAsset error: ${assetInfo.data.error.message}`);
  }

  const proofsInfo = await axios.post(
    'https://aankor.space/rpcpool_devnet',
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAssetProof',
      params: {
        id: pathWnft.mint.toBase58(),
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (proofsInfo.data.error) {
    throw new Error(`getAssetProof error: ${proofsInfo.data.error.message}`);
  }
  const proof: string[] = proofsInfo.data.result.proof;

  const transactionModel = Keypair.generate();

  const preTx = await wnftSdk
    .createTxModel({
      transactionModel,
    })
    .transaction();

  for (let index = 0; index < tx.instructions.length; index++) {
    preTx.add(
      await wnftSdk
        .insertInstruction({
          transactionModel: transactionModel.publicKey,
          index,
          instructionModel: {
            programId: tx.instructions[index].programId,
            accounts: tx.instructions[index].keys,
            data: tx.instructions[index].data,
          },
        })
        .transaction()
    );
  }

  const approveTx = await wnftSdk.approveByCompressedNft({
    treeRoot: new PublicKey(proofsInfo.data.result.root),
    dataHash: new PublicKey(assetInfo.data.result.compression.data_hash),
    creatorHash: new PublicKey(assetInfo.data.result.compression.creator_hash),
    nonce: new BN(assetInfo.data.result.compression.leaf_id),
    leafId: assetInfo.data.result.compression.leaf_id,
    authorityIndex: 0,
    transactionModel: transactionModel.publicKey,
    merkleTree: new PublicKey(proofsInfo.data.result.tree_id),
    leafOwner: new PublicKey(assetInfo.data.result.ownership.owner),
    leafDelegate: new PublicKey(
      assetInfo.data.result.ownership.delegate ||
        assetInfo.data.result.ownership.owner
    ),
    proofs: proof
      .slice(0, proof.length - rootData.treeCannopy)
      .map(p => new PublicKey(p)),
  });

  const postTx = await wnftSdk
    .executeTransaction({
      transactionModel: transactionModel.publicKey,
      tx,
      pdas: [
        wnftSdk.nftAuthorityPDA({
          mint: pathWnft.mint,
        }),
      ],
    })
    .transaction();

  return {preSigners: [transactionModel], preTx, approveTx, postTx};
}

export async function executePath({
  tx,
  path,
  wnftSdk,
  rootData,
  feePayer,
}: {
  tx: Transaction;
  path: NftInfo[];
  wnftSdk: WnftSdk;
  rootData: RootData;
  feePayer: PublicKey;
}): Promise<{
  preTxes: {tx: Transaction; signers: Keypair[]}[];
  postTxes: Transaction[];
}> {
  switch (path.length) {
    case 0:
      throw new Error('Just run in');
    case 1: {
      const {preSigners, preTx, approveTx, postTx} = await executeFolder({
        tx,
        pathWnft: path[0],
        wnftSdk,
        rootData,
        feePayer,
      });
      return {
        preTxes: [{tx: preTx.add(approveTx), signers: preSigners}],
        postTxes: [postTx],
      };
    }
    default: {
      const {
        preSigners: innerPreSigners,
        preTx: innerPreTx,
        approveTx: innerApproveTx,
        postTx: innerPostTx,
      } = await executeFolder({
        tx,
        pathWnft: path[path.length - 1],
        wnftSdk,
        rootData,
        feePayer,
      });
      const {preTxes: outerPreTxes, postTxes: outerPostTxes} =
        await executePath({
          tx: innerApproveTx,
          path: path.slice(0, -1),
          wnftSdk,
          rootData,
          feePayer,
        });
      return {
        preTxes: outerPreTxes.concat([
          {tx: innerPreTx, signers: innerPreSigners},
        ]),
        postTxes: outerPostTxes.concat([innerPostTx]),
      };
    }
  }
}