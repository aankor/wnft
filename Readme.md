The wNFT project is a sophisticated system designed to leverage the power of NFTs for asset control and management. It comprises two primary contracts: `wnft-collection` and `wnft`, and a frontend application `wnft-app`.

## Table of Contents

- [Contracts](#contracts)
  - [wnft-collection](#wnft-collection)
  - [wnft](#wnft)
- [Frontend Application](#frontend-application)
- [Features](#features)
- [Usage](#usage)
- [Integration](#integration)
- [Resources](#resources)

## Contracts

### wnft-collection

This contract is responsible for minting compressed NFTs, termed as wNFTs. These wNFTs act as keys, providing a unique, efficient, and secure mechanism to control and manage various blockchain assets.

**Instructions:**

- `create_root`: Creates an account with settings controlled by the admin pubkey. All PDAs depend on the address of this account. Corresponds to the single wNFT collection
- `set_collection`: Creates and records a collection NFT. Requires admin's signature
- `create_wnftc_tree`: Creates a concurrent Merkle tree and pays back rent costs from the fees account. Permissionless but can be called only when there are no trees or the last one is full
- `mint_wnft`: Mints a new wNFT.

### wnft

The `wnft` contract is a versatile tool that allows any NFT or wallet to control assets. While it's designed to work seamlessly with wNFTs minted by the `wnft-collection` contract, its architecture supports integration with any NFT or even other contracts.

**Functions:**

- `create_transaction_model`: Create an account for recording transaction
- `insert_instruction`: Inserts instruction into a transaction account
- `delete_instruction`: Deletes instruction from the transaction account
- `execute_instructions`: Executes specified count of instructions removing it from the beginning of the instruction list so the caller may decide how to split the transaction into parts
- `execute_transaction_model`: Executes a whole transaction closing an account
- `close_transaction_model`: Closes an empty transaction model account
- `approve_by_compressed_nft`: Records an approval of the transaction by validating NFT ownership. This action will let the contract to sign by the PDA authority dependent on the NFT mint when executing this transaction
- `approve_by_nft`: TODO
- `approve_by_key`: TODO

### wnft-app

The `wnft-app` is a front-end application developed using TypeScript, Vite, and React. It offers a user-friendly interface that mimics a file manager, allowing users to interact with and manage their compressed NFTs seamlessly.

**Features:**

- **Shyft.to API integration**: The app integrates with the shyft.to API, enabling users to read and manipulate compressed NFTs with ease. However, functionalities like minting and processing nested wNFTs are handled by the `wnft` contract so can not use the API yet.

- **Blockchain explorer**: The application utilizes `translator.shyft.to` to provide detailed information about blockchain addresses and transactions, enhancing transparency and user understanding of the compressed NFT assets.


## Features

- **Cross Program Call Depth Solution**: The `wnft` contract addresses the limitation of recursion depth in cross-program calls, providing a more efficient mechanism for nested contract interactions.
  
- **Separation of Signing and Execution**: The design of the `wnft` contract allows for the separation of signing from execution. This is particularly beneficial when multiple contract signatures are required, offering a streamlined approach akin to multi-sig contracts. However, it's tailored to be more user-friendly than traditional multi-sig solutions for this specific use case.

## Usage

1. **Set up wNFT collection**: Use the `create_root`, `set_collection`, and `create_wnftc_tree` instructions of the `wnft-collection` to prepare for minting wNFTs
1. **Minting wNFTs**: Use the `mint_wnft` function in the `wnft-collection` contract to create a new wNFT.
2. **Transfer or create assets under wNFT control**: Use associated authority to control your assets
3. **Asset Management**: Transfer your assets by sending wNFT. Control your assets using the wNFT as a key through the transaction creation, approving, and executing using `wnft` contract instructions.
4. **Frontend Interaction**: Use the `wnft-app` for a graphical interface to manage your wNFT hierarchy, leveraging the power of the shyft.to API.

## Integration

Developers looking to integrate the `wnft` contract into their projects can do so with ease. The contract's design not only supports wNFTs but is also compatible with any NFT or other contract PDAs. This flexibility, combined with its solutions for recursion depth and signature management, makes it a valuable tool for a wide range of blockchain applications.

## Resources

- **Solana compressed NFT standard**: [Alchemy.com overview](https://www.alchemy.com/overviews/compressed-nfts)
- **Shyft.to**: Web3 APIs for streamlined Solana development. [Visit shyft.to](https://www.shyft.to)
- **translator.shyft.to**: A blockchain explorer adept at interpreting compressed NFTs and their transactions. [Visit translator.shyft.to](https://translator.shyft.to)
