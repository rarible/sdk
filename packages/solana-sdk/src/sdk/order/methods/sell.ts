// import type { Connection, PublicKey } from "@solana/web3.js"
// import type { BigNumberValue } from "@rarible/utils"
// import { toBn } from "@rarible/utils"
// import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
// import type { SolanaSigner } from "@rarible/solana-common"
// import { getMetadata, getAssociatedTokenAccountForMint, getPriceWithMantissa } from "../../../common/helpers"
// import type { ITransactionPreparedInstructions } from "../../../common/transactions"
// import {
//   getAuctionHouseProgramAsSigner,
//   getAuctionHouseTradeState,
//   loadAuctionHouseProgram,
// } from "../../../common/auction-house-helpers"
// import { toSerumBn } from "../../../common/utils"
//
// export interface IActionHouseSellRequest {
//   connection: Connection
//   auctionHouse: PublicKey
//   signer: SolanaSigner
//   mint: PublicKey
//   price: BigNumberValue
//   // tokens amount to sell
//   tokensAmount: BigNumberValue
// }
//
// export async function getAuctionHouseSellInstructions(
//   request: IActionHouseSellRequest,
// ): Promise<ITransactionPreparedInstructions> {
//   const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
//   const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)
//
//   const buyPriceAdjusted = await getPriceWithMantissa(
//     request.connection,
//     toBn(request.price),
//     auctionHouseObj.treasuryMint,
//     request.signer,
//   )
//
//   const tokenSizeAdjusted = await getPriceWithMantissa(
//     request.connection,
//     toBn(request.tokensAmount),
//     request.mint,
//     request.signer,
//   )
//
//   const [tokenAccountKey] = await getAssociatedTokenAccountForMint(request.mint, request.signer.publicKey)
//   const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner()
//
//   const [tradeState, tradeBump] = await getAuctionHouseTradeState(
//     request.auctionHouse,
//     request.signer.publicKey,
//     tokenAccountKey,
//     auctionHouseObj.treasuryMint,
//     request.mint,
//     tokenSizeAdjusted,
//     buyPriceAdjusted,
//   )
//
//   const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
//     request.auctionHouse,
//     request.signer.publicKey,
//     tokenAccountKey,
//     auctionHouseObj.treasuryMint,
//     request.mint,
//     tokenSizeAdjusted,
//     toBn(0),
//   )
//
//   const instruction = AuctionHouseProgram.instructions.createSellInstruction(
//     {
//       wallet: request.signer.publicKey,
//       tokenAccount: tokenAccountKey,
//       metadata: await getMetadata(request.mint),
//       authority: auctionHouseObj.authority,
//       auctionHouse: request.auctionHouse,
//       auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
//       sellerTradeState: tradeState,
//       freeSellerTradeState: freeTradeState,
//       programAsSigner: programAsSigner,
//     },
//     {
//       tradeStateBump: tradeBump,
//       freeTradeStateBump: freeTradeBump,
//       programAsSignerBump: programAsSignerBump,
//       buyerPrice: toSerumBn(buyPriceAdjusted),
//       tokenSize: toSerumBn(tokenSizeAdjusted),
//     },
//   )
//
//   instruction.keys.filter(k => k.pubkey.equals(request.signer.publicKey)).map(k => (k.isSigner = true))
//
//   return { instructions: [instruction], signers: [] }
// }
