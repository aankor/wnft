use std::collections::BTreeSet;

use anchor_lang::{prelude::*, system_program};

use crate::state::TransactionModel;

#[derive(Accounts)]
pub struct CreateTransactionModel<'info> {
    #[account(
        init,
        space = TransactionModel::space(),
        payer = payer,
    )]
    pub transaction_model: Account<'info, TransactionModel>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateTransactionModel<'info> {
    pub fn process(&mut self, owner: Pubkey) -> Result<()> {
        self.transaction_model.set_inner(TransactionModel {
            owner,
            instructions: vec![],
            key_approvals: vec![],
            nft_approvals: vec![],
        });
        Ok(())
    }
}
