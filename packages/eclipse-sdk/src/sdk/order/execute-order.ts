import type { AccountMeta, Connection } from "@solana/web3.js"
import { ComputeBudgetProgram, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { BN } from "@coral-xyz/anchor"
import { ASSOCIATED_TOKEN_PROGRAM_ID, getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
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
import type { ITransactionPreparedInstructions } from "../../common/transactions"
import type { DebugLogger } from "../../logger/debug-logger"

export interface IFillOrderRequest {
  connection: Connection
  signer: SolanaSigner
  orderAddress: PublicKey
  extraAccountParams?: WnsAccountParams
  amountToFill: number
  nftMint: PublicKey
}

export async function executeOrder(
  request: IFillOrderRequest,
  logger: DebugLogger,
): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const eventAuthority = getEventAuthority()

  const taker = request.signer.publicKey

  const orderAddress = request.orderAddress
  const nftMint = request.nftMint
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

  await fillRemainingAccountWithRoyalties(request, remainingAccounts, paymentTokenProgram, order.paymentMint, logger)

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

function parseCreatorInfo(
  key: string,
  value: string,
  creatorsInfo: {
    pubkey: PublicKey
    percentage: number
  }[],
  logger: DebugLogger,
) {
  try {
    const creatorPubkey = new PublicKey(key)
    const percentage = parseInt(value, 10)
    if (percentage > 0 && percentage <= 100) {
      creatorsInfo.push({
        pubkey: creatorPubkey,
        percentage: percentage,
      })
    } else {
      logger.log(`Invalid percentage for creator ${key}: ${value}`)
    }
  } catch (e) {
    logger.log(`Invalid public key for creator in additionalMetadata: ${key}`)
  }
}

async function fillRemainingAccountWithRoyalties(
  request: IFillOrderRequest,
  remainingAccounts: AccountMeta[],
  paymentTokenProgram: PublicKey,
  paymentMint: PublicKey,
  logger: DebugLogger,
) {
  const metadata = await getTokenMetadata(request.connection, request.nftMint, "confirmed", TOKEN_2022_PROGRAM_ID)

  if (!metadata) {
    logger.log("Try to fill remaining accounts with royalties. No metadata found for the NFT mint")
    return
  }

  let hasRoyalties = false
  const creatorsInfo: { pubkey: PublicKey; percentage: number }[] = []
  let royaltyBasisPoints = 0

  const additionalMetadata = metadata?.additionalMetadata
  if (additionalMetadata && additionalMetadata.length > 0) {
    for (const [key, value] of additionalMetadata) {
      if (key === "royalty_basis_points") {
        royaltyBasisPoints = parseInt(value, 10)
        if (royaltyBasisPoints > 0) {
          hasRoyalties = true
        }
      } else {
        parseCreatorInfo(key, value, creatorsInfo, logger)
      }
    }
  }

  // Validate that total percentages add up to 100
  const totalPercentage = creatorsInfo.reduce((acc, creator) => acc + creator.percentage, 0)
  if (totalPercentage > 100) {
    logger.log("Total royalties percentages exceed 100%, skipping the royalties")
    hasRoyalties = false
  }

  if (hasRoyalties) {
    for (const creatorInfo of creatorsInfo) {
      remainingAccounts.push({
        pubkey: creatorInfo.pubkey,
        isSigner: false,
        isWritable: true,
      })

      const creatorPaymentTa = getAtaAddress(
        paymentMint.toBase58(),
        creatorInfo.pubkey.toBase58(),
        paymentTokenProgram.toBase58(),
      )

      remainingAccounts.push({
        pubkey: creatorPaymentTa,
        isSigner: false,
        isWritable: true,
      })
    }
  }
}
