import {Link, Typography} from '@mui/joy';
import {Paper} from '@mui/material';
import {FC} from 'react';

const Welcome: FC = () => {
  return (
    <Paper sx={{paddingTop: '1em', paddingBottom: '1em'}}>
      <Typography level="h2" sx={{textAlign: 'center', marginBottom: '1em'}}>
        The Wallet NFT protocol
      </Typography>
      <Typography level="h4" sx={{textAlign: 'center', marginBottom: '1.5em'}}>
        <Link
          href="https://youtu.be/vwW975wrTzc"
          rel="noopener noreferrer"
          target="_blank"
        >
          Demo video
        </Link>
      </Typography>
      <Typography sx={{textIndent: '1.5em', marginBottom: '2em'}}>
        In the vast digital landscape, blockchain assets of all kinds – from
        tokens to NFTs, and from admin rights to escrows – were rapidly becoming
        the backbone of the digital economy. With the blockchain boom came the
        rise of Compressed NFTs (cNFTs). These smaller, more efficient, and
        cheaper versions of NFTs proliferated at an unprecedented rate. Their
        affordability and compact nature made them ideal for a revolutionary
        purpose: replacing traditional private keys.
      </Typography>
      <Typography sx={{textIndent: '1.5em', marginBottom: '2em'}}>
        Participants found themselves inundated with thousands of cNFTs, making
        asset management increasingly complex. Yet, as these assets multiplied,
        so did the challenges of managing them. Traditional private keys,
        integral for security, presented a significant dilemma: they couldn't be
        safely transferred or sold to another individual without compromising
        the original owner's access. This conundrum paved the way for a
        groundbreaking solution: the use of cheap cNFTs as functional keys named
        wNFTs (wallet NFTs).
      </Typography>
      <Typography level="h3" sx={{textAlign: 'center', marginBottom: '2em'}}>
        The Key to Unlocking Blockchain Assets
      </Typography>
      <Typography sx={{textIndent: '1.5em', marginBottom: '2em'}}>
        Imagine a world where every blockchain asset you possess, be it a token,
        an NFT, admin rights, or an escrow account, is safeguarded behind a
        cryptographic barrier. Instead of a conventional private key, you're
        equipped with a compressed wallet NFT. This wNFT isn't merely a badge of
        ownership; it's a functional key, bestowing you with exclusive access
        and control over your blockchain asset. Transfer the wNFT, and you've
        securely handed over the keys, a feat unattainable with traditional
        private keys.
      </Typography>
      <Typography level="h3" sx={{textAlign: 'center', marginBottom: '2em'}}>
        Bulk Management with wNFTs
      </Typography>
      <Typography sx={{textIndent: '1.5em', marginBottom: '2em'}}>
        As the digital economy burgeoned, so did the assets of its stakeholders.
        Many held extensive portfolios of tokens, NFTs, and other blockchain
        assets. The act of transferring or selling these assets individually
        became a cumbersome task. An NFT is designed to function as a master
        key, capable of controlling a multitude of blockchain assets
        simultaneously. This innovation means that bulk transfers and sales will
        be streamlined. Instead of laboriously transferring numerous tokens one
        by one, a user could effortlessly transfer the master wNFT, and all
        linked assets would obediently follow.
      </Typography>
      <Typography level="h3" sx={{textAlign: 'center', marginBottom: '2em'}}>
        Hierarchy: wNFTs controlling another wNFTs
      </Typography>
      <Typography sx={{textIndent: '1.5em', marginBottom: '2em'}}>
        In the intricate tapestry of the digital domain, certain assets held
        greater value, and some NFTs wielded more power. This observation
        birthed the concept of a hierarchy, reminiscent of a traditional file
        system. Just as files are organized within folders and subfolders in a
        computer's directory, wNFTs could be structured in a similar manner.
        What if a wNFT, acting as a supreme key or a "parent folder," could
        exert control over other wNFTs, akin to "child folders"? This vision
        materialized, establishing a chain of command. One wNFT could be
        governed by another, which could, in turn, be overseen by yet another,
        crafting intricate layers of access and control, much like the nested
        folders in a file system.
      </Typography>
    </Paper>
  );
};

export default Welcome;
