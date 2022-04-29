import type { Connection, PublicKey } from "@solana/web3.js"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { SolanaKeypairWallet } from "@rarible/solana-wallet"
import type { SolanaSdk } from "../sdk/sdk"

export const testWallets = [{
	privateKeyString: "2zCVNyb3KhunreVgamvMPDiFZpkHKHnhNeuyoanQcPaN5yHzKBM8f9PF2h6zSaBm2UUDYf98yBGNS7iRbRHGvYrm",
	privateKeyArray: Uint8Array.from([
		99, 87, 171, 135, 138, 126, 92, 128, 190, 64, 22,
		156, 36, 13, 155, 14, 214, 77, 78, 101, 109, 150,
		94, 234, 196, 21, 218, 230, 47, 10, 188, 156, 22,
		203, 117, 122, 86, 152, 247, 27, 69, 100, 69, 12,
		18, 49, 12, 192, 255, 53, 207, 73, 136, 97, 31,
		162, 159, 106, 115, 88, 189, 176, 183, 218,
	]),
	publicKeyString: "2XyukL1KvwDkfNcdBpfXbj6UtPqF7zcUdTDURNjLFAMo",
}, {
	privateKeyString: "2uCT82XZqTxbpVL7AoQCPi4jPxQD5zNU7PT9dYdXGeTbyzrgTRPnCKFXTSUfgMRk3Sahyhwd29YggDQHEdkWve61",
	privateKeyArray: Uint8Array.from([
		95, 7, 178, 206, 40, 211, 26, 11, 231, 5, 170,
		238, 66, 255, 253, 120, 206, 37, 238, 179, 226, 149,
		152, 249, 70, 149, 165, 216, 57, 48, 186, 183, 37,
		133, 254, 50, 205, 43, 152, 131, 54, 75, 66, 244,
		110, 229, 101, 18, 38, 62, 201, 39, 245, 109, 226,
		73, 236, 37, 143, 180, 126, 229, 117, 206,
	]),
	publicKeyString: "3XUb9y7Z3ADxptxgfMJHcBTxxyCpfcuLDkaTfvW2DGwf",
}]

export function getTestWallet(walletIndex: number = 0): SolanaKeypairWallet {
	return SolanaKeypairWallet.createFrom(testWallets[walletIndex].privateKeyString)
}

export function genTestWallet(seed?: Uint8Array): SolanaKeypairWallet {
	return SolanaKeypairWallet.generate(seed)
}

export async function requestSol(connection: Connection, publicKey: PublicKey, sol: number = 2): Promise<number> {
	const fromAirdropSignature = await connection.requestAirdrop(
		publicKey,
		sol * LAMPORTS_PER_SOL,
	)
	await connection.confirmTransaction(fromAirdropSignature)
	return await connection.getBalance(publicKey)
}

export async function checkTokenBalance(
	connection: Connection,
	owner: PublicKey,
	mint: PublicKey,
	expectedValue: number,
	// eslint-disable-next-line no-undef
): Promise<Awaited<ReturnType<typeof connection.getTokenAccountsByOwner>>> {
	const balance = await connection.getTokenAccountsByOwner(owner, { mint })
	expect(balance.value?.length).toBeGreaterThanOrEqual(expectedValue)
	return balance
}

export async function mintToken({ sdk, wallet }: { sdk: SolanaSdk, wallet: SolanaKeypairWallet }) {
	const mintPrepare = await sdk.nft.mint({
		signer: wallet,
		metadataUrl: "https://arweave.net/Vt0uj2ql0ck-U5dLWDWJnwQaZPrvqkfxils8agrTiOc",
		maxSupply: 1,
		collection: null,
	})

	const mintTx = await mintPrepare.tx.submit("max")

	expect(mintTx.txId).toBeTruthy()
	expect(mintPrepare.mint).toBeTruthy()

	// required confirmation
	await sdk.connection.confirmTransaction(mintTx.txId, "finalized")
	const balance = await checkTokenBalance(sdk.connection, wallet.publicKey, mintPrepare.mint, 1)

	return { mintTx, mint: mintPrepare.mint, balance }
}