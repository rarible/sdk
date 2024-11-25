import type { Connection, PublicKey } from "@solana/web3.js"
import { SystemProgram } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import type { BigNumberValue } from "@rarible/utils"
import { BN } from "@coral-xyz/anchor"
import { getProgramInstanceRaribleMarketplace } from "../core/marketplace-program"
import { getEventAuthority, getMarketPda, MARKETPLACE_PROGRAM_ID } from "../utils"
import type { ITransactionPreparedInstructions } from "../../common/transactions"

export interface IInitializeMarketRequest {
  connection: Connection
  signer: SolanaSigner
  marketIdentifier: PublicKey
  feeRecipient: PublicKey
  feeBps: BigNumberValue
}

export async function initializeMarket(request: IInitializeMarketRequest): Promise<ITransactionPreparedInstructions> {
  const marketProgram = getProgramInstanceRaribleMarketplace(request.connection)
  const market = getMarketPda(request.marketIdentifier.toString())
  const eventAuthority = getEventAuthority()

  const instruction = await marketProgram.methods
    .initMarket({ feeBps: new BN(request.feeBps.toString()), feeRecipient: request.feeRecipient })
    .accountsStrict({
      initializer: request.signer.publicKey,
      marketIdentifier: request.marketIdentifier,
      market,
      systemProgram: SystemProgram.programId,
      program: MARKETPLACE_PROGRAM_ID,
      eventAuthority,
    })
    .instruction()

  const instructions = [instruction]

  return {
    instructions,
    signers: [],
  }
}
