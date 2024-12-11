import type { Connection } from "@solana/web3.js"
import { ComputeBudgetProgram, PublicKey, SystemProgram } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import {
  fetchMarketByAddress,
  fetchOrderByAddress,
  getAtaAddress,
  getEventAuthority,
  getTokenProgramFromMint,
} from "../utils"
import type { ITransactionPreparedInstructions } from "../../common/transactions"

export interface ICancelSellRequest {
  connection: Connection
  signer: SolanaSigner
  orderAddress: PublicKey
}

export async function cancelBid(request: ICancelSellRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const initializer = request.signer.publicKey.toString()

  const order = await fetchOrderByAddress(request.connection, request.orderAddress.toString())
  if (!order) {
    throw new Error(`Can't find order by given address: ${request.orderAddress.toString()}`)
  }

  const eventAuthority = getEventAuthority()

  const nftMint = new PublicKey(order.nftMint)

  const market = await fetchMarketByAddress(request.connection, order.market.toString())
  if (!market) {
    throw new Error("Market not found")
  }

  const paymentTokenProgram = await getTokenProgramFromMint(request.connection, order.paymentMint.toBase58())

  if (!paymentTokenProgram) {
    throw new Error(
      `Payment Token program not found. Nft mint: ${nftMint.toString()}, payment mint: ${order.paymentMint.toString()}`,
    )
  }

  const initializerPaymentTa = getAtaAddress(order.paymentMint.toBase58(), initializer, paymentTokenProgram.toString())
  const orderPaymentTa = getAtaAddress(
    order.paymentMint.toBase58(),
    request.orderAddress.toString(),
    paymentTokenProgram.toString(),
  )

  const instruction = await marketProgram.methods
    .cancelBid()
    .accountsStrict({
      initializer,
      market: order.market,
      order: request.orderAddress,
      initializerPaymentTa,
      orderPaymentTa,
      paymentTokenProgram,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      program: marketProgram.programId,
      eventAuthority,
      paymentMint: order.paymentMint,
    })
    .instruction()

  const instructions = []

  instructions.push(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 850_000,
    }),
  )

  instructions.push(instruction)

  return {
    instructions: instructions,
    signers: [],
  }
}
