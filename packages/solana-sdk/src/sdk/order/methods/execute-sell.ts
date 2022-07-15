import BigNumber from "bignumber.js"
import type { Connection, PublicKey } from "@solana/web3.js"
import * as web3 from "@solana/web3.js"
import type { BigNumberValue } from "@rarible/utils"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import type { Metadata } from "../../../common/schema"
import { decodeMetadata } from "../../../common/schema"
import { WRAPPED_SOL_MINT } from "../../../common/contracts"
import { getAssociatedTokenAccountForMint, getMetadata, getPriceWithMantissa } from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"
import {
	getAuctionHouseBuyerEscrow,
	getAuctionHouseProgramAsSigner,
	getAuctionHouseTradeState,
	loadAuctionHouseProgram,
} from "../../../common/auction-house-helpers"
import { bigNumToBn } from "../../../common/utils"

export interface IActionHouseExecuteSellRequest {
	connection: Connection
	auctionHouse: PublicKey
	signer: IWalletSigner
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
		new BigNumber(0),
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

	const instruction = await anchorProgram.instruction.executeSale(
		escrowBump,
		freeTradeStateBump,
		programAsSignerBump,
		bigNumToBn(buyPriceAdjusted),
		bigNumToBn(tokenSizeAdjusted),
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