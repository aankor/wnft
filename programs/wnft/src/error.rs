use anchor_lang::prelude::*;

#[error_code]
pub enum WnftError {
    DoubleApproving,
    CanNotFindProgramInfoForInstruction,
    CanNotFindAccountInfoForInstruction,
    MissingApproval,
    OwnerOrDelegateSignatureRequired,
}