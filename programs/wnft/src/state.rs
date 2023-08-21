use std::collections::{btree_map::Entry, BTreeMap, BTreeSet};

use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};

use crate::{error::WnftError, KEY_AUTHORITY_SEED, NFT_AUTHORITY_SEED};


#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone)]
pub struct AccountMetaModel {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

impl From<AccountMetaModel> for AccountMeta {
    fn from(
        AccountMetaModel {
            pubkey,
            is_signer,
            is_writable,
        }: AccountMetaModel,
    ) -> Self {
        Self {
            pubkey,
            is_signer,
            is_writable,
        }
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InstructionModel {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMetaModel>,
    pub data: Vec<u8>,
}

impl InstructionModel {
    pub fn size(&self) -> usize {
        self.try_to_vec().unwrap().len()
    }

    pub fn execute<'info>(
        self,
        remaining_accounts: &[AccountInfo<'info>],
        seeds_cache: &SeedsCache,
    ) -> Result<()> {
        let instruction: Instruction = self.into();
        let mut remaining_accounts_map = BTreeMap::new();
        for acc in remaining_accounts {
            remaining_accounts_map.insert(acc.key(), acc.clone());
        }

        let mut used_seeds = BTreeMap::new();
        let mut account_infos = BTreeMap::new();
        let program_info = remaining_accounts_map
            .get(&instruction.program_id)
            .ok_or_else(|| error!(WnftError::CanNotFindProgramInfoForInstruction))?;
        account_infos.insert(program_info.key(), program_info.clone());
        for account_meta in &instruction.accounts {
            let account_info = remaining_accounts_map
                .get(&account_meta.pubkey)
                .ok_or_else(|| error!(WnftError::CanNotFindAccountInfoForInstruction))?;
            if account_meta.is_signer && !account_info.is_signer {
                match used_seeds.entry(account_meta.pubkey) {
                    Entry::Vacant(vacant) => {
                        vacant.insert(
                            seeds_cache
                                .get(&account_meta.pubkey)
                                .ok_or_else(|| error!(WnftError::MissingApproval))?
                                .seeds(),
                        );
                    }
                    _ => {}
                }
            }
            account_infos.insert(account_info.key(), account_info.clone());
        }

        invoke_signed(
            &instruction,
            account_infos.into_values().collect::<Vec<_>>().as_slice(),
            used_seeds
                .values()
                .map(Vec::as_slice)
                .collect::<Vec<_>>()
                .as_slice(),
        )?;

        Ok(())
    }
}

impl From<InstructionModel> for Instruction {
    fn from(
        InstructionModel {
            program_id,
            accounts,
            data,
        }: InstructionModel,
    ) -> Self {
        Self {
            program_id,
            accounts: accounts.into_iter().map(Into::into).collect(),
            data,
        }
    }
}

pub struct ApprovalSeeds {
    pub prefix: &'static [u8],
    pub key: [u8; 32],
    pub index: [u8; 4],
    pub bump: [u8; 1],
}

impl ApprovalSeeds {
    pub fn seeds(&self) -> Vec<&[u8]> {
        vec![self.prefix, &self.key, &self.index, &self.bump]
    }
}

pub type SeedsCache<'a> = BTreeMap<Pubkey, ApprovalSeeds>;

#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct KeyApproval {
    pub key: Pubkey,
    pub authority_index: u32,
    pub bump: u8,
}

impl KeyApproval {
    pub fn new(key: Pubkey, authority_index: u32) -> (Self, Pubkey) {
        let (pda, bump) = Pubkey::find_program_address(
            &[
                KEY_AUTHORITY_SEED,
                &key.to_bytes(),
                &authority_index.to_le_bytes(),
            ],
            &crate::ID,
        );
        (
            Self {
                key,
                authority_index,
                bump,
            },
            pda,
        )
    }

    pub fn seeds(&self) -> ApprovalSeeds {
        ApprovalSeeds {
            prefix: KEY_AUTHORITY_SEED,
            key: self.key.to_bytes(),
            index: self.authority_index.to_le_bytes(),
            bump: [self.bump],
        }
    }

    pub fn authority(&self) -> Pubkey {
        Pubkey::create_program_address(
            &[
                KEY_AUTHORITY_SEED,
                &self.key.to_bytes(),
                &self.authority_index.to_le_bytes(),
                &[self.bump],
            ],
            &crate::ID,
        )
        .expect("Key approval must provide correct pubkey derivation")
    }

    pub fn size() -> usize {
        Self {
            key: Pubkey::default(),
            authority_index: 0,
            bump: 0,
        }
        .try_to_vec()
        .unwrap()
        .len()
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct NftApproval {
    pub mint: Pubkey,
    pub authority_index: u32,
    pub bump: u8,
}

impl NftApproval {
    pub fn new(mint: Pubkey, authority_index: u32) -> (Self, Pubkey) {
        let (pda, bump) = Pubkey::find_program_address(
            &[
                NFT_AUTHORITY_SEED,
                &mint.to_bytes(),
                &authority_index.to_le_bytes(),
            ],
            &crate::ID,
        );
        (
            Self {
                mint,
                authority_index,
                bump,
            },
            pda,
        )
    }

    pub fn seeds(&self) -> ApprovalSeeds {
        ApprovalSeeds {
            prefix: NFT_AUTHORITY_SEED,
            key: self.mint.to_bytes(),
            index: self.authority_index.to_le_bytes(),
            bump: [self.bump],
        }
    }

    pub fn authority(&self) -> Pubkey {
        Pubkey::create_program_address(
            &[
                NFT_AUTHORITY_SEED,
                &self.mint.to_bytes(),
                &self.authority_index.to_le_bytes(),
                &[self.bump],
            ],
            &crate::ID,
        )
        .expect("Nft approval must provide correct pubkey derivation")
    }

    pub fn size() -> usize {
        Self {
            mint: Pubkey::default(),
            authority_index: 0,
            bump: 0,
        }
        .try_to_vec()
        .unwrap()
        .len()
    }
}

#[account]
pub struct TransactionModel {
    pub owner: Pubkey,
    pub instructions: Vec<InstructionModel>,
    pub key_approvals: Vec<KeyApproval>,
    pub nft_approvals: Vec<NftApproval>,
}

impl TransactionModel {
    pub fn space() -> usize {
        Self {
            owner: Pubkey::default(),
            instructions: vec![],
            key_approvals: vec![],
            nft_approvals: vec![],
        }
        .size()
    }

    pub fn size(&self) -> usize {
        8 + self.try_to_vec().unwrap().len()
    }

    pub fn seeds_cache(&self) -> SeedsCache {
        let mut result = BTreeMap::new();
        for key_approval in &self.key_approvals {
            result.insert(key_approval.authority(), key_approval.seeds());
        }

        for nft_approval in &self.nft_approvals {
            result.insert(nft_approval.authority(), nft_approval.seeds());
        }
        result
    }
}
