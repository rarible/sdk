import type { Connection, PublicKey } from "@solana/web3.js"
import { VerifyCollection } from "@metaplex-foundation/mpl-token-metadata"
import type { IWalletSigner } from "@rarible/solana-wallet"
import { getMasterEdition, getMetadata } from "../../../common/helpers"

export async function getVerifyCollectionInstructions(
	request: {
		connection: Connection,
		signer: IWalletSigner,
		mint: PublicKey,
		collection: PublicKey
	},
) {
	const metadataAccount = await getMetadata(request.mint)
	const collectionMetadataAccount = await getMetadata(request.collection)
	const collectionMasterEdition = await getMasterEdition(request.collection)
	const signers: IWalletSigner[] = [request.signer]

	const tx = new VerifyCollection(
		{ feePayer: request.signer.publicKey },
		{
			metadata: metadataAccount,
			collectionAuthority: request.signer.publicKey,
			collectionMint: request.collection,
			collectionMetadata: collectionMetadataAccount,
			collectionMasterEdition: collectionMasterEdition,
		},
	)

	return { instructions: tx.instructions, signers }
}