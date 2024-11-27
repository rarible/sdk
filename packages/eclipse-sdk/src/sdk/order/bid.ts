import type { Connection } from "@solana/web3.js"
import { ComputeBudgetProgram, Keypair, PublicKey, SystemProgram } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import type { BigNumber } from "@rarible/utils"
import { BN } from "@coral-xyz/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import {
  getAtaAddress,
  getEventAuthority,
  getMarketPda,
  getOrderAccount,
  getTokenProgramFromMint,
  toLamports,
} from "../utils"
import type { ITransactionPreparedInstructions } from "../../common/transactions"

export interface IBidRequest {
  connection: Connection
  marketIdentifier: PublicKey
  signer: SolanaSigner
  nftMint: PublicKey
  paymentMint: PublicKey // currency token address
  price: BigNumber // per item
  tokensAmount: number
}

export async function bid(request: IBidRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const market = getMarketPda(request.marketIdentifier.toString())
  const eventAuthority = getEventAuthority()

  const initializer = request.signer.publicKey.toString()

  const paymentTokenProgram = await getTokenProgramFromMint(request.connection, request.paymentMint.toString())
  if (!paymentTokenProgram) {
    throw new Error(`Can't find payment token program for payment mint ${request.paymentMint}`)
  }

  const nonceKp = Keypair.generate()
  const nonce = nonceKp.publicKey

  const order = getOrderAccount(nonce.toString(), market.toString(), initializer)

  const initializerPaymentTa = getAtaAddress(
    request.paymentMint.toString(),
    initializer,
    paymentTokenProgram.toString(),
  )
  const orderPaymentTa = getAtaAddress(request.paymentMint.toString(), order.toString(), paymentTokenProgram.toString())

  const instruction = await marketProgram.methods
    .bid({
      nonce,
      price: new BN(toLamports(request.price)),
      size: new BN(request.tokensAmount),
    })
    .accountsStrict({
      initializer: request.signer.publicKey,
      market,
      nftMint: request.nftMint ?? PublicKey.default,
      order,
      initializerPaymentTa,
      orderPaymentTa,
      paymentTokenProgram,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      program: marketProgram.programId,
      eventAuthority,
      paymentMint: request.paymentMint,
    })
    .instruction()

  const instructions = [instruction]

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 850_000,
    }),
  )

  return {
    instructions,
    signers: [],
    orderId: order,
  }
}
