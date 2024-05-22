import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { SolanaSigner } from "@rarible/solana-common"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getPriceWithMantissa } from "../../../common/helpers"
import { getAuctionHouseBuyerEscrow, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"
import { toSerumBn } from "../../../common/utils"

export interface IActionHouseEscrowWithdrawRequest {
  connection: Connection
  auctionHouse: PublicKey
  signer: SolanaSigner
  amount: BigNumberValue
}

export async function getActionHouseEscrowWithdrawInstructions(
  request: IActionHouseEscrowWithdrawRequest,
): Promise<ITransactionPreparedInstructions> {
  const walletKeyPair = request.signer

  const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

  const amountAdjusted = toSerumBn(
    await getPriceWithMantissa(request.connection, toBn(request.amount), auctionHouseObj.treasuryMint, walletKeyPair),
  )

  const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
    request.auctionHouse,
    walletKeyPair.publicKey,
  )

  const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT)
  const ata = (await getAssociatedTokenAccountForMint(auctionHouseObj.treasuryMint, walletKeyPair.publicKey))[0]

  const signers: any[] = []
  const instruction = await anchorProgram.instruction.withdraw(escrowBump, amountAdjusted, {
    accounts: {
      wallet: walletKeyPair.publicKey,
      receiptAccount: isNative ? walletKeyPair.publicKey : ata,
      escrowPaymentAccount,
      treasuryMint: auctionHouseObj.treasuryMint,
      authority: auctionHouseObj.authority,
      auctionHouse: request.auctionHouse,
      auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    },
    signers,
  })

  instruction.keys.filter(k => k.pubkey.equals(walletKeyPair.publicKey)).map(k => (k.isSigner = true))

  return { instructions: [instruction], signers }
}
