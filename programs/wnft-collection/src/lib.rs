use anchor_lang::prelude::*;

pub mod state;

pub mod instructions;
use instructions::*;
use state::Root;

declare_id!("wnfcodchjmiS96bd9pKCoUBir6V2C6ucGXWYCWHMXuF");

#[constant]
pub const MINTER_SEED: &'static [u8] = b"minter";

#[constant]
pub const TREE_CREATOR_SEED: &'static [u8] = b"trc";

#[constant]
pub const RENT_PAYER_SEED: &'static [u8] = b"rent";

#[program]
pub mod wnft_collection {
    use super::*;

    pub fn create_root(
        ctx: Context<CreateRoot>,
        admin: Pubkey,
        max_tree_depth: u32,
        max_tree_buffer_size: u32,
        tree_cannopy: u32,
    ) -> Result<()> {
        ctx.accounts
            .process(admin, max_tree_depth, max_tree_buffer_size, tree_cannopy)?;
        Ok(())
    }

    pub fn set_collection(
        ctx: Context<SetCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.process(name, symbol, uri)
    }

    pub fn create_wnftc_tree(ctx: Context<CreateWnftcTree>) -> Result<()> {
        ctx.accounts.process()
    }

    pub fn mint_wnft(ctx: Context<MintWnft>, name: String, uri: String) -> Result<Pubkey> {
        ctx.accounts.process(name, uri)
    }

    /*
    pub fn fix(ctx: Context<Fix>) -> Result<()> {
        Ok(())
    }*/
}
/*
#[derive(Accounts)]
pub struct Fix<'info> {
    #[account(mut)]
    pub root: Account<'info, Root>,
}
*/