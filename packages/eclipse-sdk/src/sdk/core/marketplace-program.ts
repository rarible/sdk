import { AnchorProvider, Program } from "@coral-xyz/anchor"
import type { Connection } from "@solana/web3.js"
import { Keypair, PublicKey } from "@solana/web3.js"

import RaribleMarketplaceIdlJson from "./idl/marketplace.json"
import type { Marketplace as RaribleMarketplace } from "./types/marketplace"
import { PrivateKeyWallet } from "./private-key-wallet"

export const RaribleMarketplaceIdl: RaribleMarketplace = JSON.parse(JSON.stringify(RaribleMarketplaceIdlJson))

export const PROGRAM_ID_MARKETPLACE = new PublicKey(RaribleMarketplaceIdl.address)

export function getRaribleMarketplaceProgram(connection: Connection): Program<RaribleMarketplace> {
  const provider = new AnchorProvider(
    connection,
    new PrivateKeyWallet(Keypair.generate()),
    AnchorProvider.defaultOptions(),
  )

  return new Program<RaribleMarketplace>(RaribleMarketplaceIdl, provider)
}

export function getProgramInstanceRaribleMarketplace(connection: Connection): Program<RaribleMarketplace> {
  const provider = new AnchorProvider(
    connection,
    new PrivateKeyWallet(Keypair.generate()),
    AnchorProvider.defaultOptions(),
  )
  const idl = RaribleMarketplaceIdl
  const program = new Program<RaribleMarketplace>(idl, provider)!

  return program
}
