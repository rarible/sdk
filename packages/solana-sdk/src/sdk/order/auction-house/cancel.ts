import type { Connection, PublicKey } from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { BN } from "@project-serum/anchor"
import { AuctionHouseProgram } from "@metaplex-foundation/mpl-auction-house"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import {
	getAuctionHouseTradeState,
	getPriceWithMantissa,
	loadAuctionHouseProgram,
} from "./helpers"

export interface IActionHouseCancelRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	mint: PublicKey
	price: number
	tokensAmount: number
}

export async function getAuctionHouseCancelInstructions(
	request: IActionHouseCancelRequest
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
		buyPriceAdjusted
	)

	const instruction = AuctionHouseProgram.instructions.createCancelInstruction({
		wallet: request.signer.publicKey,
		tokenAccount: tokenAccountKey,
		tokenMint: request.mint,
		authority: auctionHouseObj.authority,
		auctionHouse: request.auctionHouse,
		auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
		tradeState,
	}, {
		buyerPrice: buyPriceAdjusted,
		tokenSize: tokenSizeAdjusted,
	})

	return { instructions: [instruction], signers: [] }
}