import type { AccountMeta, Connection } from "@solana/web3.js"
import { ComputeBudgetProgram, Keypair, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import type { BigNumber } from "@rarible/utils"
import { BN } from "@coral-xyz/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import type { WnsAccountParams } from "../utils"
import {
  getAtaAddress,
  getEventAuthority,
  getMarketPda,
  getNftProgramFromMint,
  getOrderAccount,
  getRemainingAccountsForMint,
  getTokenProgramFromMint,
  toLamports,
} from "../utils"
import type { ITransactionPreparedInstructions } from "../../common/transactions"

export interface ISellRequest {
  connection: Connection
  marketIdentifier: PublicKey
  signer: SolanaSigner
  extraAccountParams?: WnsAccountParams
  nftMint: PublicKey
  paymentMint: PublicKey
  price: BigNumber // per item
  tokensAmount: number
}

export async function sell(request: ISellRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const market = getMarketPda(request.marketIdentifier.toString())
  const eventAuthority = getEventAuthority()

  const initializer = request.signer.publicKey.toString()

  const nftMint = request.nftMint.toString()
  const nftTokenProgram = await getTokenProgramFromMint(request.connection, nftMint)
  if (!nftTokenProgram) {
    throw new Error(`Can't find token program for mint ${nftMint}`)
  }

  const nonceKp = Keypair.generate()
  const nonce = nonceKp.publicKey

  const nftProgram = await getNftProgramFromMint(request.connection, nftMint)

  const order = getOrderAccount(nonce.toString(), market.toString(), initializer)
  const initializerNftTa = getAtaAddress(nftMint, initializer, nftTokenProgram.toString())

  const remainingAccounts: AccountMeta[] = await getRemainingAccountsForMint(
    request.connection,
    nftMint,
    request.extraAccountParams,
  )

  const instruction = await marketProgram.methods
    .list({
      nonce,
      paymentMint: request.paymentMint,
      price: new BN(toLamports(request.price)),
      size: new BN(request.tokensAmount),
    })
    .accountsStrict({
      initializer: request.signer.publicKey,
      market,
      nftMint,
      order,
      initializerNftTa,
      nftProgram: nftProgram ?? PublicKey.default,
      nftTokenProgram,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      program: marketProgram.programId,
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
    orderId: order,
  }
}
