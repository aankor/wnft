use anchor_lang::{prelude::*, system_program};

use crate::state::{TransactionModel, InstructionModel};

#[derive(Accounts)]
#[instruction(index: u32, instruction_model: InstructionModel)]
pub struct CloseTransactionModel<'info> {
    #[account(
        mut,
        constraint = transaction_model.instructions.is_empty(),
        has_one = owner,
        close = rent_collector,
    )]
    pub transaction_model: Account<'info, TransactionModel>,
    pub owner: Signer<'info>,

    #[account(mut)]
    pub rent_collector: SystemAccount<'info>,
}

impl<'info> CloseTransactionModel<'info> {
    pub fn process(&mut self) -> Result<()> {
        Ok(())
    }
}
