use anchor_lang::{prelude::*, system_program};

use crate::state::TransactionModel;

#[derive(Accounts)]
pub struct ExecuteInstructions<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub transaction_model: Account<'info, TransactionModel>,
    pub owner: Signer<'info>,
}

impl<'info> ExecuteInstructions<'info> {
    pub fn process(&mut self, count: u32, remaining_accounts: &[AccountInfo<'info>]) -> Result<()> {
        let seeds_cache = self.transaction_model.seeds_cache();
        let instruction_models = self.transaction_model.instructions.drain(0..count as usize);
        for ix in instruction_models {
            ix.execute(remaining_accounts, &seeds_cache)?;
        }
        Ok(())
    }
}
