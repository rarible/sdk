import type { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js"
import { SystemProgram } from "@solana/web3.js"
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN } from "@project-serum/anchor"
import {
	DataV2,
	Collection,
	Creator,
	CreateMetadataV2,
	CreateMasterEditionV3,
} from "@metaplex-foundation/mpl-token-metadata"
import type { Uses } from "@metaplex-foundation/mpl-token-metadata"
import fetch from "node-fetch"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import {
	createAssociatedTokenAccountInstruction,
	getMasterEdition,
	getMetadata,
	getTokenWallet,
} from "../../../common/helpers"
import type { ITransactionPreparedInstructions } from "../../../common/transactions"

async function fetchMetadata(url: string): Promise<any> {
	try {
		return await (await fetch(url, { method: "GET" })).json()
	} catch (e) {
		console.log(e)
		throw new Error(`Metadata fetch failed ${url}`)
	}
}

function validateMetadata(metadata: any) {
	if (
		!metadata.name ||
		!metadata.image ||
		isNaN(metadata.seller_fee_basis_points) ||
		!metadata.properties ||
		!Array.isArray(metadata.properties.creators)
	) {
		throw new Error("Invalid metadata file")
	}

	// Validate creators
	const metaCreators = metadata.properties.creators
	if (
		metaCreators.some((creator: Creator) => !creator.address) ||
		metaCreators.reduce((sum: number, creator: Creator) => creator.share + sum, 0) !== 100
	) {
		throw new Error("Invalid creators")
	}
}

export async function createMetadata(
	metadataLink: string,
	collection: PublicKey | null,
	verifyCreators: Record<string, boolean> = {},
	uses: Uses | null = null,
): Promise<DataV2> {
	// Metadata
	const metadata = await fetchMetadata(metadataLink)
	// Validate metadata
	validateMetadata(metadata)
	const metaCreators = metadata.properties.creators

	const creators = metaCreators.map(
		(creator: Creator) => {
			return new Creator({
				address: creator.address,
				share: creator.share,
				verified: verifyCreators?.[creator.address] ?? false,
			})
		},
	)

	return new DataV2({
		symbol: metadata.symbol,
		name: metadata.name,
		uri: metadataLink,
		sellerFeeBasisPoints: metadata.seller_fee_basis_points,
		creators: creators,
		collection: collection
			? new Collection({ key: collection.toBase58(), verified: false })
			: null,
		uses,
	})
}

export async function getMintNftInstructions(
	connection: Connection,
	signer: IWalletSigner,
	params: {
		metadataLink: string,
		//mutableMetadata: boolean,
		collection: PublicKey | null,
		verifyCreators: boolean,
		use?: Uses,
		masterEditionSupply: number | undefined, // for master edition
		amount: number, // for multiple items
	}
): Promise<ITransactionPreparedInstructions & { mint: PublicKey }> {
	// Retrieve metadata
	const data = await createMetadata(
		params.metadataLink,
		params.collection,
		params.verifyCreators ? { [signer.publicKey.toString()]: true } : undefined,
		params.use,
	)

	if (!data) {
		throw new Error("Empty metadata")
	}

	// Allocate memory for the account
	const mintRent = await connection.getMinimumBalanceForRentExemption(
		MintLayout.span,
	)

	// Generate a mint
	const mint = SolanaKeypairWallet.generate()
	const instructions: TransactionInstruction[] = []
	const signers: IWalletSigner[] = [mint, signer]

	instructions.push(
		SystemProgram.createAccount({
			fromPubkey: signer.publicKey,
			// eslint-disable-next-line unicorn/no-keyword-prefix
			newAccountPubkey: mint.publicKey,
			lamports: mintRent,
			space: MintLayout.span,
			programId: TOKEN_PROGRAM_ID,
		}),
	)
	instructions.push(
		Token.createInitMintInstruction(
			TOKEN_PROGRAM_ID,
			mint.publicKey,
			0,
			signer.publicKey,
			signer.publicKey,
		),
	)

	const userTokenAccoutAddress = await getTokenWallet(
		signer.publicKey,
		mint.publicKey,
	)
	instructions.push(
		createAssociatedTokenAccountInstruction(
			userTokenAccoutAddress,
			signer.publicKey,
			signer.publicKey,
			mint.publicKey,
		),
	)

	// Create metadata
	const metadataAccount = await getMetadata(mint.publicKey)

	instructions.push(
		...new CreateMetadataV2(
			{ feePayer: signer.publicKey },
			{
				metadata: metadataAccount,
				metadataData: data,
				updateAuthority: signer.publicKey,
				mint: mint.publicKey,
				mintAuthority: signer.publicKey,
			},
		).instructions,
	)

	instructions.push(
		Token.createMintToInstruction(
			TOKEN_PROGRAM_ID,
			mint.publicKey,
			userTokenAccoutAddress,
			signer.publicKey,
			[],
			params.amount,
		),
	)

	if (params.masterEditionSupply !== undefined) {
		if (params.amount !== 1) {
			throw new Error("For create master edition token amount of tokens should be equal 1")
		}

		// Create master edition
		const editionAccount = await getMasterEdition(mint.publicKey)
		instructions.push(
			...new CreateMasterEditionV3(
				{
					feePayer: signer.publicKey,
				},
				{
					edition: editionAccount,
					metadata: metadataAccount,
					mint: mint.publicKey,
					mintAuthority: signer.publicKey,
					updateAuthority: signer.publicKey,
					maxSupply: new BN(params.masterEditionSupply),
				},
			).instructions,
		)
	}

	/*
	// not working with current mpl-token-metadata version

	if (params.mutableMetadata === false) {
		instructions.push(
			...new UpdateMetadataV2(
				{},
				{
					metadata: metadataAccount,
					metadataData: data,
					updateAuthority: signer.publicKey,
					primarySaleHappened: null,
					isMutable: false,
				},
			).instructions,
		)
	}*/

	return { instructions, signers, mint: mint.publicKey }
}