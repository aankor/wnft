use anchor_lang::{prelude::*, system_program};

use crate::state::TransactionModel;

#[derive(Accounts)]
#[instruction(index: u32)]
pub struct DeleteInstruction<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub transaction_model: Account<'info, TransactionModel>,
    pub owner: Signer<'info>,

    #[account(
        mut,
        owner = system_program::ID,
    )]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> DeleteInstruction<'info> {
    pub fn process(&mut self, index: u32) -> Result<()> {
        self.transaction_model.instructions.remove(index as usize);
        Ok(())
    }
}
