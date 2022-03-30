import type { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js"
import { SystemProgram } from "@solana/web3.js"
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN } from "@project-serum/anchor"
import {
	CreateMetadataV2Args,
	CreateMasterEditionV3Args,
	DataV2,
	Collection,
	Creator,
} from "@metaplex-foundation/mpl-token-metadata"
import type { Uses } from "@metaplex-foundation/mpl-token-metadata"
import { serialize } from "borsh"
import fetch from "node-fetch"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import {
	createAssociatedTokenAccountInstruction,
	createMasterEditionInstruction,
	createMetadataInstruction,
	getMasterEdition,
	getMetadata,
	getTokenWallet,
} from "../../../common/helpers"
import { METADATA_SCHEMA } from "../../../common/schema"
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
		throw new Error(`Invalid metadata file ${metadata}`)
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
	verifyCreators: boolean,
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
				verified: verifyCreators ? true : false, //todo: (?) remove condition
			})
		}
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
	metadataLink: string,
	mutableMetadata: boolean = true,
	collection: PublicKey | null = null,
	maxSupply: number = 0,
	verifyCreators: boolean = false,
	use?: Uses,
): Promise<ITransactionPreparedInstructions & { mint: PublicKey }> {
	// Retrieve metadata
	const data = await createMetadata(
		metadataLink,
		collection,
		verifyCreators,
		use,
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
	let txnData = Buffer.from(
		serialize(
			new Map([
				DataV2.SCHEMA,
				...METADATA_SCHEMA,
				...CreateMetadataV2Args.SCHEMA,
			]),
			new CreateMetadataV2Args({ data, isMutable: mutableMetadata }),
		),
	)

	instructions.push(
		createMetadataInstruction(
			metadataAccount,
			mint.publicKey,
			signer.publicKey,
			signer.publicKey,
			signer.publicKey,
			txnData,
		),
	)

	instructions.push(
		Token.createMintToInstruction(
			TOKEN_PROGRAM_ID,
			mint.publicKey,
			userTokenAccoutAddress,
			signer.publicKey,
			[],
			1,
		),
	)

	// Create master edition
	const editionAccount = await getMasterEdition(mint.publicKey)
	txnData = Buffer.from(
		serialize(
			new Map([
				DataV2.SCHEMA,
				...Array.from(METADATA_SCHEMA),
				...CreateMasterEditionV3Args.SCHEMA,
			]),
			new CreateMasterEditionV3Args({ maxSupply: new BN(maxSupply) }),
		),
	)

	instructions.push(
		createMasterEditionInstruction(
			metadataAccount,
			editionAccount,
			mint.publicKey,
			signer.publicKey,
			signer.publicKey,
			signer.publicKey,
			txnData,
		),
	)

	return { instructions, signers, mint: mint.publicKey }
}