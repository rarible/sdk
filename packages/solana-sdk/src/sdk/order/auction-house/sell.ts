import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { BN } from "@project-serum/anchor"
import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
import { getMetadata } from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import {
	getAssociatedTokenAccountForMint,
	getAuctionHouseProgramAsSigner,
	getAuctionHouseTradeState,
	getPriceWithMantissa,
	loadAuctionHouseProgram,
} from "./helpers"

export interface IActionHouseSellRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: number
	// tokens amount to sell
	tokensAmount: number
}

export async function getAuctionHouseSellInstructions(
	request: IActionHouseSellRequest
): Promise<ITransactionPreparedInstructions> {
	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const buyPriceAdjusted = new BN(
		await getPriceWithMantissa(
			request.price,
			auctionHouseObj.treasuryMint,
			request.signer,
			anchorProgram,
		)
	)

	const tokenSizeAdjusted = new BN(
		await getPriceWithMantissa(
			request.tokensAmount,
			request.mint,
			request.signer,
			anchorProgram,
		)
	)

	const tokenAccountKey = (
		await getAssociatedTokenAccountForMint(request.mint, request.signer.publicKey)
	)[0]

	const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner()

	// const metadata = await getMetadata(request.mint);

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
		new BN(0),
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
		buyerPrice: buyPriceAdjusted,
		tokenSize: tokenSizeAdjusted,
	})

	instruction.keys
		.filter(k => k.pubkey.equals(request.signer.publicKey))
		.map(k => (k.isSigner = true))

	return { instructions: [instruction], signers }
}