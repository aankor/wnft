use anchor_lang::prelude::*;
use mpl_bubblegum::state::leaf_schema::LeafSchema;
use spl_account_compression::program::SplAccountCompression;
use state::{InstructionModel, TransactionModel};

pub mod instructions;
pub mod state;
pub use instructions::*;
pub mod error;

declare_id!("wnftDJ4FRB46dVCPSkPejyCxuyhcCrVirnAAC4k757B");

#[constant]
pub const KEY_AUTHORITY_SEED: &[u8] = b"key";

#[constant]
pub const NFT_AUTHORITY_SEED: &[u8] = b"nft";

#[program]
pub mod wnft {
    use spl_account_compression::cpi::{accounts::VerifyLeaf, verify_leaf};

    use super::*;

    pub fn create_transaction_model<'info>(
        ctx: Context<CreateTransactionModel>,
        owner: Pubkey,
    ) -> Result<()> {
        ctx.accounts.process(owner)
    }

    pub fn insert_instruction(
        ctx: Context<InsertInstruction>,
        index: u32,
        instruction_model: InstructionModel,
    ) -> Result<()> {
        ctx.accounts.process(index, instruction_model)
    }

    pub fn delete_instruction(ctx: Context<DeleteInstruction>, index: u32) -> Result<()> {
        ctx.accounts.process(index)
    }

    pub fn execute_instructions<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecuteInstructions<'info>>,
        count: u32,
    ) -> Result<()> {
        ctx.accounts.process(count, ctx.remaining_accounts)
    }

    pub fn execute_transaction_model<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecuteTransactionModel<'info>>,
    ) -> Result<()> {
        ctx.accounts.process(ctx.remaining_accounts)
    }

    pub fn close_transaction_model(ctx: Context<CloseTransactionModel>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn approve_by_compressed_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, ApproveByCompressedNft<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
        authority_index: u32,
    ) -> Result<()> {
        ctx.accounts.process(
            root,
            data_hash,
            creator_hash,
            nonce,
            index,
            authority_index,
            ctx.remaining_accounts,
        )
    }
}
