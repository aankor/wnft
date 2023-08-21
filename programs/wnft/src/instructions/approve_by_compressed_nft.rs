use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::Mint;
use mpl_bubblegum::state::{leaf_schema::LeafSchema, ASSET_PREFIX};
use spl_account_compression::{
    cpi::{accounts::VerifyLeaf, verify_leaf},
    program::SplAccountCompression,
};

use crate::{
    error::WnftError,
    state::{NftApproval, TransactionModel},
};

#[derive(Accounts)]
pub struct ApproveByCompressedNft<'info> {
    #[account(
        mut,
        realloc = transaction_model.size() + NftApproval::size(),
        realloc::payer = payer,
        realloc::zero = false,
        has_one = owner
    )]
    pub transaction_model: Account<'info, TransactionModel>,
    pub owner: Signer<'info>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    pub payer: Signer<'info>,

    /// CHECK: CPI
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the instruction
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: This account is chekced in the instruction
    pub leaf_delegate: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub compression_program: Program<'info, SplAccountCompression>,
}

impl<'info> ApproveByCompressedNft<'info> {
    pub fn process(
        &mut self,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
        authority_index: u32,
        remaining_accounts: &[AccountInfo<'info>],
    ) -> Result<()> {
        let asset_id = mpl_bubblegum::utils::get_asset_id(&self.merkle_tree.key(), nonce);
        let owner = self.leaf_owner.key();
        let delegate = self.leaf_delegate.key();
        let leaf = LeafSchema::new_v0(asset_id, owner, delegate, nonce, data_hash, creator_hash);
        require!(
            self.leaf_owner.is_signer || self.leaf_delegate.is_signer,
            WnftError::OwnerOrDelegateSignatureRequired
        );
        verify_leaf(
            CpiContext::new(
                self.compression_program.to_account_info(),
                VerifyLeaf {
                    merkle_tree: self.merkle_tree.to_account_info(),
                },
            )
            .with_remaining_accounts(remaining_accounts.to_vec()),
            root,
            leaf.to_node(),
            index,
        )?;

        let (mint, _) = Pubkey::find_program_address(
            &[
                ASSET_PREFIX.as_bytes(),
                &self.merkle_tree.key().to_bytes(),
                &leaf.nonce().to_le_bytes(),
            ],
            &mpl_bubblegum::ID,
        );

        let (approval, pda) = NftApproval::new(mint, authority_index);
        require!(
            !self.transaction_model.nft_approvals.contains(&approval),
            WnftError::DoubleApproving
        );
        msg!("Signing by mint {}:{} authority {}", mint, authority_index, pda);
        self.transaction_model.nft_approvals.push(approval);
        Ok(())
    }
}
