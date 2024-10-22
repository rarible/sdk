import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { SolanaSigner } from "@rarible/solana-common"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getPriceWithMantissa } from "../../../common/helpers"
import { getAuctionHouseBuyerEscrow, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"
import { toSerumBn } from "../../../common/utils"

export interface IActionHouseEscrowDepositRequest {
  connection: Connection
  auctionHouse: PublicKey
  signer: SolanaSigner
  amount: BigNumberValue
}

export async function getActionHouseEscrowDepositInstructions(
  request: IActionHouseEscrowDepositRequest,
): Promise<ITransactionPreparedInstructions> {
  const walletKeyPair = request.signer

  const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)
  const treasuryMintPublicKey = auctionHouseObj.treasuryMint as PublicKey

  const amountAdjusted = toSerumBn(
    await getPriceWithMantissa(request.connection, toBn(request.amount), treasuryMintPublicKey, walletKeyPair),
  )

  const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
    request.auctionHouse,
    walletKeyPair.publicKey,
  )

  const isNative = treasuryMintPublicKey.equals(WRAPPED_SOL_MINT)
  const [ata] = await getAssociatedTokenAccountForMint(treasuryMintPublicKey, walletKeyPair.publicKey)

  const transferAuthority = SolanaKeypairWallet.fromSeed(undefined)
  const signers = isNative ? [] : [transferAuthority]

  const instruction = await anchorProgram.instruction.deposit(escrowBump, amountAdjusted, {
    accounts: {
      wallet: walletKeyPair.publicKey,
      paymentAccount: isNative ? walletKeyPair.publicKey : ata,
      transferAuthority: isNative ? web3.SystemProgram.programId : transferAuthority.publicKey,
      escrowPaymentAccount,
      treasuryMint: auctionHouseObj.treasuryMint,
      authority: auctionHouseObj.authority,
      auctionHouse: request.auctionHouse,
      auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    },
  })

  if (!isNative) {
    instruction.keys.filter(k => k.pubkey.equals(transferAuthority.publicKey)).map(k => (k.isSigner = true))
  }

  const instructions = [
    ...(isNative
      ? []
      : [
          Token.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            ata,
            transferAuthority.publicKey,
            walletKeyPair.publicKey,
            [],
            amountAdjusted,
          ),
        ]),

    instruction,
    ...(isNative ? [] : [Token.createRevokeInstruction(TOKEN_PROGRAM_ID, ata, walletKeyPair.publicKey, [])]),
  ]

  return { instructions, signers }
}
