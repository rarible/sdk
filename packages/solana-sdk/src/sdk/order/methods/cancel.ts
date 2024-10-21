import type { Connection, PublicKey } from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
import type { SolanaSigner } from "@rarible/solana-common"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { getAuctionHouseTradeState, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"
import { getPriceWithMantissa } from "../../../common/helpers"
import { toSerumBn } from "../../../common/utils"

export interface IActionHouseCancelRequest {
  connection: Connection
  auctionHouse: PublicKey
  signer: SolanaSigner
  mint: PublicKey
  price: BigNumberValue
  tokensAmount: BigNumberValue
}

export async function getAuctionHouseCancelInstructions(
  request: IActionHouseCancelRequest,
): Promise<ITransactionPreparedInstructions> {
  const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
  const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

  const buyPriceAdjusted = await getPriceWithMantissa(
    request.connection,
    toBn(request.price),
    auctionHouseObj.treasuryMint,
    request.signer,
  )

  const tokenSizeAdjusted = await getPriceWithMantissa(
    request.connection,
    toBn(request.tokensAmount),
    request.mint,
    request.signer,
  )

  const tla = await anchorProgram.provider.connection.getTokenLargestAccounts(request.mint)
  if (tla.value.length === 0) {
    throw new Error(
      "The Mint(NFT, Tokens) largest token account can't be found, this could be " +
        "network instability or you have the wrong mint address.",
    )
  }
  const tokenAccountKey = tla.value[0].address

  const [tradeState] = await getAuctionHouseTradeState(
    request.auctionHouse,
    request.signer.publicKey,
    tokenAccountKey,
    auctionHouseObj.treasuryMint,
    request.mint,
    tokenSizeAdjusted,
    buyPriceAdjusted,
  )

  const instruction = AuctionHouseProgram.instructions.createCancelInstruction(
    {
      wallet: request.signer.publicKey,
      tokenAccount: tokenAccountKey,
      tokenMint: request.mint,
      authority: auctionHouseObj.authority,
      auctionHouse: request.auctionHouse,
      auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
      tradeState,
    },
    {
      buyerPrice: toSerumBn(buyPriceAdjusted),
      tokenSize: toSerumBn(tokenSizeAdjusted),
    },
  )

  return { instructions: [instruction], signers: [] }
}
