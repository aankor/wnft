use anchor_lang::prelude::*;

use crate::state::TransactionModel;

#[derive(Accounts)]
pub struct ExecuteTransactionModel<'info> {
    #[account(
        mut,
        has_one = owner,
        close = rent_collector,
    )]
    pub transaction_model: Account<'info, TransactionModel>,
    pub owner: Signer<'info>,

    #[account(mut)]
    pub rent_collector: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ExecuteTransactionModel<'info> {
    pub fn process(&mut self, remaining_accounts: &[AccountInfo<'info>]) -> Result<()> {
        let seeds_cache = self.transaction_model.seeds_cache();
        for ix in self.transaction_model.instructions.drain(..) {
            ix.execute(remaining_accounts, &seeds_cache)?;
        }
        Ok(())
    }
}
