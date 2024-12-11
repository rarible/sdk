import type { AccountMeta, Connection } from "@solana/web3.js"
import { ComputeBudgetProgram } from "@solana/web3.js"
import { PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import type { WnsAccountParams } from "../utils"
import {
  fetchOrderByAddress,
  getAtaAddress,
  getEventAuthority,
  getNftProgramFromMint,
  getRemainingAccountsForMint,
  getTokenProgramFromMint,
  MARKETPLACE_PROGRAM_ID,
} from "../utils"
import type { ITransactionPreparedInstructions } from "../../common/transactions"

export interface ICancelSellRequest {
  connection: Connection
  signer: SolanaSigner
  orderAddress: PublicKey
  extraAccountParams?: WnsAccountParams
}

export async function cancelSell(request: ICancelSellRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const initializer = request.signer.publicKey.toString()

  const order = await fetchOrderByAddress(request.connection, request.orderAddress.toString())
  if (!order) {
    throw new Error(`Can't find order by given address: ${request.orderAddress.toString()}`)
  }

  const { nftMint } = order
  const nftTokenProgram = await getTokenProgramFromMint(request.connection, nftMint.toString())
  if (!nftTokenProgram) {
    throw new Error(`Can't find token program for mint ${nftMint}`)
  }

  const initializerNftTa = getAtaAddress(nftMint.toString(), initializer, nftTokenProgram.toString())

  const nftProgram = await getNftProgramFromMint(request.connection, nftMint.toString())

  const eventAuthority = getEventAuthority()
  const remainingAccounts: AccountMeta[] = await getRemainingAccountsForMint(
    request.connection,
    nftMint.toString(),
    request.extraAccountParams,
  )

  const instruction = await marketProgram.methods
    .cancelListing()
    .accountsStrict({
      initializer: request.signer.publicKey,
      market: order.market,
      nftMint,
      order: request.orderAddress,
      initializerNftTa,
      nftProgram: nftProgram ?? PublicKey.default,
      nftTokenProgram,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      program: MARKETPLACE_PROGRAM_ID,
      eventAuthority,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()

  const instructions = []

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 850_000,
    }),
  )

  instructions.push(instruction)

  return {
    instructions,
    signers: [],
  }
}
