use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use mpl_bubblegum::{
    cpi::{accounts::CreateTree, create_tree},
    program::Bubblegum,
};
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::state::Root;
use crate::{RENT_PAYER_SEED, TREE_CREATOR_SEED};

#[derive(Accounts)]
pub struct CreateWnftcTree<'info> {
    #[account(
        mut,
        constraint = root.mints_left == 0,
    )]
    pub root: Account<'info, Root>,
    // will be initialized
    #[account(
        mut,
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = mpl_bubblegum::ID,
    )]
    pub tree_authority: SystemAccount<'info>,
    /// CHECK: This account must be all zeros
    #[account(
        zero,
        constraint = merkle_tree.data_len() == root.tree_account_size as usize,
        owner = spl_account_compression::ID,
    )]
    pub merkle_tree: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
            RENT_PAYER_SEED,
            &root.key().to_bytes(),
        ],
        bump = root.bumps.rent_payer
    )]
    pub rent_payer: SystemAccount<'info>,
    #[account(mut)]
    pub rent_return: SystemAccount<'info>,
    /// CHECK: PDA
    #[account(
        seeds = [
            TREE_CREATOR_SEED,
            &root.key().to_bytes(),
        ],
        bump = root.bumps.tree_creator,
    )]
    pub tree_creator: UncheckedAccount<'info>,

    pub bubblegum_program: Program<'info, Bubblegum>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateWnftcTree<'info> {
    pub fn process(&mut self) -> Result<()> {
        create_tree(
            CpiContext::new_with_signer(
                self.bubblegum_program.to_account_info(),
                CreateTree {
                    tree_authority: self.tree_authority.to_account_info(),
                    merkle_tree: self.merkle_tree.to_account_info(),
                    payer: self.rent_payer.to_account_info(),
                    tree_creator: self.tree_creator.to_account_info(),
                    log_wrapper: self.log_wrapper.to_account_info(),
                    compression_program: self.compression_program.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                },
                &[
                    &[
                        TREE_CREATOR_SEED,
                        &self.root.key().to_bytes(),
                        &[self.root.bumps.tree_creator],
                    ],
                    &[
                        RENT_PAYER_SEED,
                        &self.root.key().to_bytes(),
                        &[self.root.bumps.rent_payer],
                    ],
                ],
            ),
            self.root.max_tree_depth,
            self.root.max_tree_buffer_size,
            Some(true),
        )?;
        if self.rent_return.key() != Pubkey::default()
            && self.rent_return.key() != self.rent_payer.key()
        {
            transfer(
                CpiContext::new_with_signer(
                    self.system_program.to_account_info(),
                    Transfer {
                        from: self.rent_payer.to_account_info(),
                        to: self.rent_return.to_account_info(),
                    },
                    &[&[
                        RENT_PAYER_SEED,
                        &self.root.key().to_bytes(),
                        &[self.root.bumps.rent_payer],
                    ]],
                ),
                Rent::get()?.minimum_balance(self.root.tree_account_size as usize),
            )?;
        }
        self.root.tree_count += 1;
        self.root.current_tree = self.merkle_tree.key();
        self.root.mints_left = 1 << self.root.max_tree_depth;
        Ok(())
    }
}
