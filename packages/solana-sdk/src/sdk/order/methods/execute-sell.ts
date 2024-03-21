import type { Connection } from "@solana/web3.js"
import { PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import { toBn } from "@rarible/utils"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { SolanaSigner } from "@rarible/solana-common"
import type { Metadata } from "../../../common/schema"
import { decodeMetadata } from "../../../common/schema"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getMetadata, getPriceWithMantissa } from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import { getAuctionHouseBuyerEscrow, getAuctionHouseProgramAsSigner, getAuctionHouseTradeState, loadAuctionHouseProgram } from "../../../common/auction-house-helpers"
import { toSerumBn } from "../../../common/utils"

export interface IActionHouseExecuteSellRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: SolanaSigner
	buyerWallet: PublicKey
	sellerWallet: PublicKey
	mint: PublicKey
	tokenAccount?: PublicKey
	price: BigNumberValue
	// tokens amount to purchase
	tokensAmount: BigNumberValue
}

export async function getAuctionHouseExecuteSellInstructions(
	request: IActionHouseExecuteSellRequest
): Promise<ITransactionPreparedInstructions> {
	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT)
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

	const tokenAccountKey = (await getAssociatedTokenAccountForMint(request.mint, request.sellerWallet))[0]

	const [buyerTradeState] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.buyerWallet,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		buyPriceAdjusted,
	)

	const [sellerTradeState] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.sellerWallet,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		buyPriceAdjusted,
	)

	const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.sellerWallet,
		tokenAccountKey,
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		toBn(0),
	)

	const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
		request.auctionHouse,
		request.buyerWallet,
	)
	const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner()
	const metadata = await getMetadata(request.mint)

	const metadataObj = await anchorProgram.provider.connection.getAccountInfo(metadata)
	if (!metadataObj) throw new Error("Account info doesn't fetched")

	const metadataDecoded: Metadata = decodeMetadata(Buffer.from(metadataObj.data))
	const remainingAccounts = []

	if (metadataDecoded.data.creators) {
		for (let i = 0; i < metadataDecoded.data.creators.length; i++) {
			remainingAccounts.push({
				pubkey: new PublicKey(metadataDecoded.data.creators[i].address),
				isWritable: true,
				isSigner: false,
			})
			if (!isNative) {
				remainingAccounts.push({
					pubkey: (
						await getAssociatedTokenAccountForMint(
							auctionHouseObj.treasuryMint,
							remainingAccounts[remainingAccounts.length - 1].pubkey,
						)
					)[0],
					isWritable: true,
					isSigner: false,
				})
			}
		}
	}
	const signers: any[] = []

	const tMint = auctionHouseObj.treasuryMint

	const instruction = anchorProgram.instruction.executeSale(
		escrowBump,
		freeTradeStateBump,
		programAsSignerBump,
		toSerumBn(buyPriceAdjusted),
		toSerumBn(tokenSizeAdjusted),
		{
			accounts: {
				buyer: request.buyerWallet,
				seller: request.sellerWallet,
				metadata,
				tokenAccount: tokenAccountKey,
				tokenMint: request.mint,
				escrowPaymentAccount,
				treasuryMint: tMint,
				sellerPaymentReceiptAccount: isNative
					? request.sellerWallet
					: (await getAssociatedTokenAccountForMint(tMint, request.sellerWallet))[0],
				buyerReceiptTokenAccount: (await getAssociatedTokenAccountForMint(request.mint, request.buyerWallet))[0],
				authority: auctionHouseObj.authority,
				auctionHouse: request.auctionHouse,
				auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
				auctionHouseTreasury: auctionHouseObj.auctionHouseTreasury,
				sellerTradeState,
				buyerTradeState,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				programAsSigner,
				rent: SYSVAR_RENT_PUBKEY,
				freeTradeState,
			},
			remainingAccounts,
			signers,
		}
	)

	instruction.keys
		.filter(k => k.pubkey.equals(request.signer.publicKey))
		.map(k => (k.isSigner = true))

	return { instructions: [instruction], signers }
}