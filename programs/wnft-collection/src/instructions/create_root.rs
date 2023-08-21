use std::mem::size_of;

use anchor_lang::{prelude::*, system_program};
use spl_account_compression::{
    state::{
        merkle_tree_get_size, ConcurrentMerkleTreeHeader, CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1,
    },
    Node,
};

use crate::{
    state::{Root, RootBumps},
    MINTER_SEED, RENT_PAYER_SEED, TREE_CREATOR_SEED,
};

#[derive(Accounts)]
pub struct CreateRoot<'info> {
    #[account(
        init,
        payer = payer,
        space = 1024
    )]
    pub root: Account<'info, Root>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateRoot<'info> {
    pub fn process(
        &mut self,
        admin: Pubkey,
        max_tree_depth: u32,
        max_tree_buffer_size: u32,
        tree_cannopy: u32,
    ) -> Result<()> {
        let (minter, minter_bump) =
            Pubkey::find_program_address(&[MINTER_SEED, &self.root.key().to_bytes()], &crate::ID);
        msg!("Minter {}", minter);

        let (tree_creator, tree_creator_bump) = Pubkey::find_program_address(
            &[TREE_CREATOR_SEED, &self.root.key().to_bytes()],
            &crate::ID,
        );
        msg!("Tree creator {}", tree_creator);

        let (rent_payer, rent_payer_bump) = Pubkey::find_program_address(
            &[RENT_PAYER_SEED, &self.root.key().to_bytes()],
            &crate::ID,
        );
        msg!("Rent payer {}", rent_payer);

        let mut header = ConcurrentMerkleTreeHeader::try_from_slice(&vec![
                0;
                CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1
            ])?;
        header.initialize(max_tree_depth, max_tree_buffer_size, &Pubkey::default(), 0);

        let tree_account_size = CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1
            + merkle_tree_get_size(&header)?
            + ((1 << (tree_cannopy + 1)) - 2) * size_of::<Node>();
        msg!("Tree size is {}", tree_account_size);

        self.root.set_inner(Root {
            admin,
            max_tree_depth,
            max_tree_buffer_size,
            tree_cannopy,
            tree_account_size: tree_account_size as u64,
            tree_count: 0,
            collection: Pubkey::default(),
            symbol: String::new(),
            mints_left: 0,
            bumps: RootBumps {
                minter: minter_bump,
                tree_creator: tree_creator_bump,
                rent_payer: rent_payer_bump,
            },
            fees_per_nft: 0,
            current_tree: Pubkey::default(),
        });
        Ok(())
    }
}
