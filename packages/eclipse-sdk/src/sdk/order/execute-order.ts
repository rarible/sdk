import type { AccountMeta, Connection } from "@solana/web3.js"
import { ComputeBudgetProgram, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { BN } from "@coral-xyz/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import type { WnsAccountParams } from "../utils"
import {
  fetchMarketByAddress,
  fetchOrderByAddress,
  getAtaAddress,
  getEventAuthority,
  getNftProgramFromMint,
  getRemainingAccountsForMint,
  getTokenProgramFromMint,
} from "../utils"
import { ITransactionPreparedInstructions } from "../../common/transactions"

export interface IFillOrderRequest {
  connection: Connection
  signer: SolanaSigner
  orderAddress: PublicKey
  extraAccountParams?: WnsAccountParams
  amountToFill: number
  nftMint: PublicKey
}

export async function executeOrder(request: IFillOrderRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const eventAuthority = getEventAuthority()

  const taker = request.signer.publicKey

  const orderAddress = request.orderAddress
  const nftMint = new PublicKey(request.nftMint)
  const extraAccountParams = request.extraAccountParams

  const order = await fetchOrderByAddress(request.connection, orderAddress.toString())
  if (!order) {
    throw new Error(`Order not found ${orderAddress.toString()}`)
  }

  const market = await fetchMarketByAddress(request.connection, order.market.toString())
  if (!market) {
    throw new Error(`Market not found ${order.market.toString()}`)
  }

  const nftTokenProgram = await getTokenProgramFromMint(request.connection, nftMint.toString())
  const paymentTokenProgram = await getTokenProgramFromMint(request.connection, order.paymentMint.toString())
  if (!paymentTokenProgram || !nftTokenProgram) {
    throw new Error(
      `Token programs not found. Nft mint: ${nftMint.toString()}, payment mint: ${order.paymentMint.toString()}`,
    )
  }

  const nftProgram = await getNftProgramFromMint(request.connection, nftMint.toBase58())

  const isBuy = order.side === 0 // Assuming 0 represents Buy

  const nftRecipient = isBuy ? order.owner : taker
  const nftFunder = isBuy ? taker : order.owner
  const paymentFunder = isBuy ? new PublicKey(orderAddress) : taker
  const paymentRecipient = isBuy ? taker : order.owner

  const buyerPaymentTa = getAtaAddress(
    order.paymentMint.toBase58(),
    paymentFunder.toBase58(),
    paymentTokenProgram.toBase58(),
  )
  const sellerPaymentTa = getAtaAddress(
    order.paymentMint.toBase58(),
    paymentRecipient.toBase58(),
    paymentTokenProgram.toBase58(),
  )
  const buyerNftTa = getAtaAddress(nftMint.toBase58(), nftRecipient.toBase58(), nftTokenProgram.toBase58())
  const sellerNftTa = getAtaAddress(nftMint.toBase58(), nftFunder.toBase58(), nftTokenProgram.toBase58())

  const feeRecipient = market.feeRecipient
  const feeRecipientTa = getAtaAddress(
    order.paymentMint.toBase58(),
    feeRecipient.toBase58(),
    paymentTokenProgram.toBase58(),
  )

  const remainingAccounts: AccountMeta[] = await getRemainingAccountsForMint(
    request.connection,
    nftMint.toBase58(),
    extraAccountParams,
  )

  const instruction = await marketProgram.methods
    .fillOrder(new BN(request.amountToFill))
    .accountsStrict({
      taker: taker,
      maker: order.owner,
      market: order.market,
      order: new PublicKey(orderAddress),
      buyerNftTa,
      buyerPaymentTa,
      sellerNftTa,
      sellerPaymentTa,
      nftTokenProgram,
      paymentTokenProgram,
      nftProgram: nftProgram ?? PublicKey.default,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      program: marketProgram.programId,
      eventAuthority,
      paymentMint: order.paymentMint,
      nftMint,
      sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      feeRecipient,
      feeRecipientTa,
    })
    .remainingAccounts(remainingAccounts)
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
  }
}
