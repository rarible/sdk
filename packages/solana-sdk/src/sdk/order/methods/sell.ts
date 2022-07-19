import BigNumber from "bignumber.js"
import type { Connection, PublicKey } from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
import { getMetadata, getAssociatedTokenAccountForMint, getPriceWithMantissa } from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import {
	getAuctionHouseProgramAsSigner,
	getAuctionHouseTradeState,
	loadAuctionHouseProgram,
} from "../../../common/auction-house-helpers"
import { bigNumToBn } from "../../../common/utils"

export interface IActionHouseSellRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: BigNumberValue
	// tokens amount to sell
	tokensAmount: BigNumberValue
}

export async function getAuctionHouseSellInstructions(
	request: IActionHouseSellRequest
): Promise<ITransactionPreparedInstructions> {
	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const buyPriceAdjusted = await getPriceWithMantissa(
		request.connection,
		new BigNumber(request.price),
		auctionHouseObj.treasuryMint,
		request.signer,
	)

	const tokenSizeAdjusted = await getPriceWithMantissa(
		request.connection,
		new BigNumber(request.tokensAmount),
		request.mint,
		request.signer,
	)

	const tokenAccountKey = (
		await getAssociatedTokenAccountForMint(request.mint, request.signer.publicKey)
	)[0]

	const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner()

	const [tradeState, tradeBump] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.signer.publicKey,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		buyPriceAdjusted
	)

	const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.signer.publicKey,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		new BigNumber(0),
	)

	const signers: any[] = []

	const instruction = AuctionHouseProgram.instructions.createSellInstruction({
		wallet: request.signer.publicKey,
		tokenAccount: tokenAccountKey,
		metadata: await getMetadata(request.mint),
		authority: auctionHouseObj.authority,
		auctionHouse: request.auctionHouse,
		auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
		sellerTradeState: tradeState,
		freeSellerTradeState: freeTradeState,
		programAsSigner: programAsSigner,
	}, {
		tradeStateBump: tradeBump,
		freeTradeStateBump: freeTradeBump,
		programAsSignerBump: programAsSignerBump,
		buyerPrice: bigNumToBn(buyPriceAdjusted),
		tokenSize: bigNumToBn(tokenSizeAdjusted),
	})

	instruction.keys
		.filter(k => k.pubkey.equals(request.signer.publicKey))
		.map(k => (k.isSigner = true))

	return { instructions: [instruction], signers }
}