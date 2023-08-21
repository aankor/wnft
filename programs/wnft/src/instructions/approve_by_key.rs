use anchor_lang::{prelude::*, system_program};

use crate::{state::{TransactionModel, KeyApproval}, error::WnftError};

#[derive(Accounts)]
pub struct ApproveByKey<'info> {
    #[account(
        mut,
        realloc = transaction_model.size() + KeyApproval::size(),
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

    pub key: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> ApproveByKey<'info> {
    pub fn process(&mut self, authority_index: u32) -> Result<()> {
        let (approval, _pda) = KeyApproval::new(self.key.key(), authority_index);
        /*require!(
            self.transaction_model.key_approvals.insert(approval),
            WnftError::DoubleApproving,
        );*/
        Ok(())
    }
}
