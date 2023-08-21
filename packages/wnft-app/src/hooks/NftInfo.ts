import { PublicKey } from "@solana/web3.js";

export default interface NftInfo {
  name: string;
  imageUri: string;
  mint: PublicKey;
  owner: PublicKey;
}