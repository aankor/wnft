use anchor_lang::{prelude::*, system_program};

use crate::state::{TransactionModel, InstructionModel};

#[derive(Accounts)]
#[instruction(index: u32, instruction_model: InstructionModel)]
pub struct InsertInstruction<'info> {
    #[account(
        mut,
        realloc = transaction_model.size() + instruction_model.size(),
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

    pub system_program: Program<'info, System>,
}

impl<'info> InsertInstruction<'info> {
    pub fn process(&mut self, index: u32, instruction_model: InstructionModel) -> Result<()> {
        self.transaction_model.instructions.insert(index as usize, instruction_model);
        Ok(())
    }
}
