use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RootBumps {
    pub minter: u8,
    pub tree_creator: u8,
    pub rent_payer: u8,
}

#[account]
pub struct Root {
    pub admin: Pubkey,
    pub max_tree_depth: u32,
    pub max_tree_buffer_size: u32,
    pub tree_cannopy: u32,
    pub tree_account_size: u64,
    pub tree_count: u32,
    pub mints_left: u32,
    pub collection: Pubkey,
    pub symbol: String,
    pub bumps: RootBumps,
    pub fees_per_nft: u64,
    pub current_tree: Pubkey,
}
