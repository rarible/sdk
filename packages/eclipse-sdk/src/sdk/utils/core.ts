import { utils } from "@coral-xyz/anchor"
import type { Connection } from "@solana/web3.js"
import { type AccountMeta, PublicKey } from "@solana/web3.js"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"

import type { BigNumber } from "@rarible/utils"
import { METADATA_SEED, METAPLEX_METADATA_PROGRAM_ID, WNS_DISTRIBUTION_PROGRAM_ID, WNS_PROGRAM_ID } from "../utils"
import { PROGRAM_ID_MARKETPLACE } from "../core/marketplace-program"

export const getTokenProgramFromMint = async (connection: Connection, mint: string) => {
  const mintPubkey = new PublicKey(mint)
  try {
    await getMint(connection, mintPubkey, undefined, TOKEN_PROGRAM_ID)
    return TOKEN_PROGRAM_ID
  } catch (e) {
    try {
      await getMint(connection, mintPubkey, undefined, TOKEN_2022_PROGRAM_ID)
      return TOKEN_2022_PROGRAM_ID
    } catch (e) {
      return undefined
    }
  }
}

export const getNftProgramFromMint = async (connection: Connection, nftMint: string) => {
  const mintProgram = await getTokenProgramFromMint(connection, nftMint)
  if (!mintProgram) {
    return undefined
  }

  if (mintProgram === TOKEN_PROGRAM_ID) {
    const isMetaplex = await isMetaplexMetadataAccount(connection, nftMint)
    if (isMetaplex) {
      return METAPLEX_METADATA_PROGRAM_ID
    }
  }

  if (mintProgram === TOKEN_2022_PROGRAM_ID) {
    const isWns = await isWnsNft(connection, nftMint)
    if (isWns) {
      return WNS_PROGRAM_ID
    }
  }

  return undefined
}

export const isMetaplexMetadataAccount = async (connection: Connection, mint: string) => {
  const mintPubkey = new PublicKey(mint)
  const metadataAccount = getProgramAddress(
    [Buffer.from(METADATA_SEED), METAPLEX_METADATA_PROGRAM_ID.toBytes(), mintPubkey.toBytes()],
    METAPLEX_METADATA_PROGRAM_ID,
  )

  try {
    await connection.getAccountInfo(metadataAccount)
    return true
  } catch (e) {
    return false
  }
}

export const isWnsNft = async (connection: Connection, mint: string) => {
  const mintPubkey = new PublicKey(mint)
  const metadata = await getTokenMetadata(connection, mintPubkey)

  if (metadata === null) {
    return false
  }

  const extraMeta = metadata.additionalMetadata
  const royalties = extraMeta.filter(m => m[0] === "royalty_basis_points")
  // TODO : check differently
  if (royalties.length > 0) {
    return false
  }

  return false
}

export type WnsAccountParams = {
  groupMint: string
  paymentMint: string
}

export const getRemainingAccountsForMint = async (
  connection: Connection,
  mint: string,
  wnsParams: WnsAccountParams | undefined,
) => {
  const remainingAccounts: AccountMeta[] = []

  const nftProgram = await getNftProgramFromMint(connection, mint)

  if (nftProgram === WNS_PROGRAM_ID) {
    if (!wnsParams) {
      return []
    }

    const extraMetaPda = getExtraMetasAccountPda(mint)
    const approveAccount = getApproveAccountPda(mint)
    const distributionAccount = getDistributionAccountPda(wnsParams.groupMint, wnsParams.paymentMint)
    const paymentTokenProgram = await getTokenProgramFromMint(connection, wnsParams.paymentMint)
    const groupMemberAccount = getGroupMemberAccount(mint)
    const distributionTokenAccount =
      paymentTokenProgram &&
      getAtaAddress(wnsParams.paymentMint, distributionAccount.toString(), paymentTokenProgram.toString())

    remainingAccounts.push(
      ...[
        {
          pubkey: approveAccount,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: distributionAccount,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: distributionTokenAccount ?? distributionAccount,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: WNS_DISTRIBUTION_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: groupMemberAccount,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: new PublicKey(wnsParams.paymentMint),
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: extraMetaPda,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: approveAccount,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: WNS_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
      ],
    )
    return remainingAccounts
  }

  // Need todo metaplex pNFT accounts
  return []
}

export const getProgramAddress = (seeds: Uint8Array[], programId: PublicKey) => {
  const [key] = PublicKey.findProgramAddressSync(seeds, programId)
  return key
}

export const getAtaAddress = (mint: string, owner: string, tokenProgram: string): PublicKey =>
  getProgramAddress(
    [new PublicKey(owner).toBuffer(), new PublicKey(tokenProgram).toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

// MARKET ACCOUNTS
export const getMarketPda = (marketIdentifier: string) => {
  const [marketAccount] = PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode("market"), new PublicKey(marketIdentifier).toBuffer()],
    PROGRAM_ID_MARKETPLACE,
  )

  return marketAccount
}

export const getVerificationPda = (marketAddress: string, nftMint: string) => {
  const [marketAccount] = PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode("verification"),
      new PublicKey(nftMint).toBuffer(),
      new PublicKey(marketAddress).toBuffer(),
    ],
    PROGRAM_ID_MARKETPLACE,
  )

  return marketAccount
}

export const getOrderAccount = (nonce: string, marketAddress: string, user: string) => {
  const [marketAccount] = PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode("order"),
      new PublicKey(nonce).toBuffer(),
      new PublicKey(marketAddress).toBuffer(),
      new PublicKey(user).toBuffer(),
    ],
    PROGRAM_ID_MARKETPLACE,
  )

  return marketAccount
}

export const getEventAuthority = () => {
  const [eventAuthority] = PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode("__event_authority")],
    PROGRAM_ID_MARKETPLACE,
  )

  return eventAuthority
}

export const getExtraMetasAccountPda = (mint: string) => {
  const [extraMetasAccount] = PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode("extra-account-metas"), new PublicKey(mint).toBuffer()],
    WNS_PROGRAM_ID,
  )

  return extraMetasAccount
}

export const getApproveAccountPda = (mint: string) => {
  const [approveAccount] = PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode("approve-account"), new PublicKey(mint).toBuffer()],
    WNS_PROGRAM_ID,
  )

  return approveAccount
}

export const getDistributionAccountPda = (groupMint: string, paymentMint: string) => {
  const [distributionAccount] = PublicKey.findProgramAddressSync(
    [new PublicKey(groupMint).toBuffer(), new PublicKey(paymentMint).toBuffer()],
    WNS_DISTRIBUTION_PROGRAM_ID,
  )

  return distributionAccount
}

export const getGroupMemberAccount = (nftMint: string) => {
  const [groupMemberAccount] = PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode("member"), new PublicKey(nftMint).toBuffer()],
    WNS_PROGRAM_ID,
  )

  return groupMemberAccount
}

export function toLamports(value: BigNumber) {
  return value.toNumber() * 1000000000
}
