use anchor_lang::{
    prelude::*,
    system_program::{self, transfer, Transfer},
};
use mpl_bubblegum::{
    cpi::{accounts::MintToCollectionV1, mint_to_collection_v1},
    program::Bubblegum,
    state::{
        metaplex_adapter::{Collection, Creator, MetadataArgs, TokenProgramVersion, TokenStandard},
        metaplex_anchor::{MplTokenMetadata, TokenMetadata},
        COLLECTION_CPI_PREFIX, TreeConfig, ASSET_PREFIX,
    },
};
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::{state::Root, MINTER_SEED, RENT_PAYER_SEED, TREE_CREATOR_SEED};

#[derive(Accounts)]
pub struct MintWnft<'info> {
    #[account(
        mut,
        constraint = root.collection != Pubkey::default(),
        constraint = root.mints_left > 0,
        has_one = collection,
        has_one = current_tree,
    )]
    pub root: Account<'info, Root>,
    #[account(
        mut,
        seeds = [
            RENT_PAYER_SEED,
            &root.key().to_bytes(),
        ],
        bump = root.bumps.rent_payer
    )]
    pub fee_collector: SystemAccount<'info>,
    #[account(
        owner = system_program::ID,
    )]
    pub payer: Signer<'info>,

    /// CHECK: CPI
    #[account(
        mut,
        seeds = [current_tree.key().as_ref()],
        bump,
        seeds::program = mpl_bubblegum::ID,
    )]
    pub tree_authority: Account<'info, TreeConfig>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_delegate: UncheckedAccount<'info>,
    /// CHECK: unsafe
    #[account(mut)]
    pub current_tree: UncheckedAccount<'info>,

    /// CHECK: PDA
    #[account(
        seeds = [
            TREE_CREATOR_SEED,
            &root.key().to_bytes(),
        ],
        bump = root.bumps.tree_creator,
    )]
    pub tree_delegate: UncheckedAccount<'info>,
    /// CHECK: PDA
    #[account(
        seeds = [
            MINTER_SEED,
            &root.key().to_bytes(),
        ],
        bump = root.bumps.minter,
    )]
    pub minter: UncheckedAccount<'info>,
    /// CHECK: Optional collection authority record PDA.
    /// If there is no collecton authority record PDA then
    /// this must be the Bubblegum program address.
    pub collection_authority_record_pda: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the instruction
    pub collection: UncheckedAccount<'info>,
    #[account(mut)]
    pub collection_metadata: Box<Account<'info, TokenMetadata>>,
    /// CHECK: This account is checked in the instruction
    pub edition_account: UncheckedAccount<'info>,
    /// CHECK: This is just used as a signing PDA.
    #[account(
        seeds = [COLLECTION_CPI_PREFIX.as_ref()],
        bump,
        seeds::program = mpl_bubblegum::ID,
    )]
    pub bubblegum_signer: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub token_metadata_program: Program<'info, MplTokenMetadata>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
}

impl<'info> MintWnft<'info> {
    pub fn process(&mut self, name: String, uri: String) -> Result<Pubkey> {
        if self.root.fees_per_nft > 0 {
            transfer(
                CpiContext::new(
                    self.system_program.to_account_info(),
                    Transfer {
                        from: self.payer.to_account_info(),
                        to: self.fee_collector.to_account_info(),
                    },
                ),
                self.root.fees_per_nft,
            )?;
        }

        let (mint, _) = Pubkey::find_program_address(
            &[
                ASSET_PREFIX.as_bytes(),
                &self.current_tree.key().to_bytes(),
                &self.tree_authority.num_minted.to_le_bytes(),
            ], &mpl_bubblegum::ID);

        mint_to_collection_v1(
            CpiContext::new_with_signer(
                self.bubblegum_program.to_account_info(),
                MintToCollectionV1 {
                    tree_authority: self.tree_authority.to_account_info(),
                    leaf_owner: self.leaf_owner.to_account_info(),
                    leaf_delegate: self.leaf_delegate.to_account_info(),
                    merkle_tree: self.current_tree.to_account_info(),
                    payer: self.minter.to_account_info(), // TODO?
                    tree_delegate: self.tree_delegate.to_account_info(),
                    collection_authority: self.minter.to_account_info(),
                    collection_authority_record_pda: self
                        .collection_authority_record_pda
                        .to_account_info(),
                    collection_mint: self.collection.to_account_info(),
                    collection_metadata: self.collection_metadata.to_account_info(),
                    edition_account: self.edition_account.to_account_info(),
                    bubblegum_signer: self.bubblegum_signer.to_account_info(),
                    log_wrapper: self.log_wrapper.to_account_info(),
                    compression_program: self.compression_program.to_account_info(),
                    token_metadata_program: self.token_metadata_program.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                },
                &[
                    &[
                        TREE_CREATOR_SEED,
                        &self.root.key().to_bytes(),
                        &[self.root.bumps.tree_creator],
                    ],
                    &[
                        MINTER_SEED,
                        &self.root.key().to_bytes(),
                        &[self.root.bumps.minter],
                    ],
                ],
            ),
            MetadataArgs {
                name,
                symbol: self.root.symbol.clone(),
                uri,
                seller_fee_basis_points: 0,
                primary_sale_happened: false,
                is_mutable: true,
                edition_nonce: None,
                token_standard: Some(TokenStandard::NonFungible),
                collection: Some(Collection {
                    verified: false,
                    key: self.root.collection,
                }),
                uses: None,
                token_program_version: TokenProgramVersion::Original,
                creators: vec![Creator {
                    address: self.minter.key(),
                    verified: true,
                    share: 100,
                }],
            },
        )?;
        self.root.mints_left -= 1;
        
        Ok(mint)
    }
}
