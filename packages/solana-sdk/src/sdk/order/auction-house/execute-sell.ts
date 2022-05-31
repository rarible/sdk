import { BN } from "@project-serum/anchor"
import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { decodeMetadata } from "../../../common/schema"
import type { Metadata } from "../../../common/schema"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getMetadata } from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import {
	getAssociatedTokenAccountForMint,
	getAuctionHouseBuyerEscrow,
	getAuctionHouseProgramAsSigner,
	getAuctionHouseTradeState,
	getPriceWithMantissa,
	loadAuctionHouseProgram,
} from "./helpers"

export interface IActionHouseExecuteSellRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
	buyerWallet: PublicKey
	sellerWallet: PublicKey
	mint: PublicKey
	tokenAccount?: PublicKey
	price: number
	// tokens amount to purchase
	tokensAmount: number
}

export async function getAuctionHouseExecuteSellInstructions(
	request: IActionHouseExecuteSellRequest
): Promise<ITransactionPreparedInstructions> {
	const anchorProgram = await loadAuctionHouseProgram(request.connection, request.signer)
	const auctionHouseObj = await anchorProgram.account.auctionHouse.fetch(request.auctionHouse)

	const isNative = auctionHouseObj.treasuryMint.equals(WRAPPED_SOL_MINT)
	const buyPriceAdjusted = new BN(
		await getPriceWithMantissa(
			request.price,
			auctionHouseObj.treasuryMint,
			request.signer,
			anchorProgram,
		),
	)

	const tokenSizeAdjusted = new BN(
		await getPriceWithMantissa(
			request.tokensAmount,
			request.mint,
			request.signer,
			anchorProgram,
		),
	)

	const tokenAccountKey = (await getAssociatedTokenAccountForMint(request.mint, request.sellerWallet))[0]

	const buyerTradeState = (
		await getAuctionHouseTradeState(
			request.auctionHouse,
			request.buyerWallet,
			tokenAccountKey,
			//@ts-ignore
			auctionHouseObj.treasuryMint,
			request.mint,
			tokenSizeAdjusted,
			buyPriceAdjusted,
		)
	)[0]

	const sellerTradeState = (
		await getAuctionHouseTradeState(
			request.auctionHouse,
			request.sellerWallet,
			tokenAccountKey,
			//@ts-ignore
			auctionHouseObj.treasuryMint,
			request.mint,
			tokenSizeAdjusted,
			buyPriceAdjusted,
		)
	)[0]

	const [freeTradeState, freeTradeStateBump] = await getAuctionHouseTradeState(
		request.auctionHouse,
		request.sellerWallet,
		tokenAccountKey,
		//@ts-ignore
		auctionHouseObj.treasuryMint,
		request.mint,
		tokenSizeAdjusted,
		new BN(0),
	)

	const [escrowPaymentAccount, escrowBump] = await getAuctionHouseBuyerEscrow(
		request.auctionHouse,
		request.buyerWallet,
	)
	const [programAsSigner, programAsSignerBump] = await getAuctionHouseProgramAsSigner()
	const metadata = await getMetadata(request.mint)

	const metadataObj = await anchorProgram.provider.connection.getAccountInfo(
		metadata,
	)

	if (!metadataObj) {
		throw new Error("Account info doesn't fetched")
	}
	const metadataDecoded: Metadata = decodeMetadata(
		Buffer.from(metadataObj.data),
	)

	const remainingAccounts = []

	if (metadataDecoded.data.creators) {
		for (let i = 0; i < metadataDecoded.data.creators.length; i++) {
			remainingAccounts.push({
				pubkey: new web3.PublicKey(metadataDecoded.data.creators[i].address),
				isWritable: true,
				isSigner: false,
			})
			if (!isNative) {
				remainingAccounts.push({
					pubkey: (
						await getAssociatedTokenAccountForMint(
							//@ts-ignore
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

	/*const instruction = AuctionHouseProgram.instructions.createExecuteSaleInstruction(
		{
			buyer: request.buyerWallet,
			seller: request.sellerWallet,
			tokenAccount: tokenAccountKey,
			tokenMint: request.mint,
			metadata: metadata,
			treasuryMint: tMint,
			escrowPaymentAccount: escrowPaymentAccount,
			sellerPaymentReceiptAccount: isNative ? request.sellerWallet :
			(await getAssociatedTokenAccountForMint(tMint, request.sellerWallet))[0],
			buyerReceiptTokenAccount: (await getAssociatedTokenAccountForMint(request.mint, request.buyerWallet))[0],
			authority: auctionHouseObj.authority,
			auctionHouse: request.auctionHouse,
			auctionHouseFeeAccount: auctionHouseObj.auctionHouseFeeAccount,
			auctionHouseTreasury: auctionHouseObj.auctionHouseTreasury,
			buyerTradeState: buyerTradeState,
			sellerTradeState: sellerTradeState,
			freeTradeState: freeTradeState,
			programAsSigner: programAsSigner,
		},
		{
			escrowPaymentBump: escrowBump,
			freeTradeStateBump: freeTradeStateBump,
			programAsSignerBump: programAsSignerBump,
			buyerPrice: buyPriceAdjusted,
			tokenSize: tokenSizeAdjusted,
		}
	)*/

	const instruction = await anchorProgram.instruction.executeSale(
		escrowBump,
		freeTradeStateBump,
		programAsSignerBump,
		buyPriceAdjusted,
		tokenSizeAdjusted,
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
				systemProgram: web3.SystemProgram.programId,
				ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
				programAsSigner,
				rent: web3.SYSVAR_RENT_PUBKEY,
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