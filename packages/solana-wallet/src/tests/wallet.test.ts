import base58 from "bs58"
import { SolanaKeypairWallet } from "../wallet/keypair-wallet"

export const testWallet = {
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
}

export function getSolanaTestWallet() {
	return SolanaKeypairWallet.createFrom(testWallet.privateKeyString)
}

describe("solana wallet", () => {
	test("should generate new keypair", () => {
		const wallet = SolanaKeypairWallet.generate()
		expect(wallet.keyPair.secretKey).toBeTruthy()
	})

	test("Should create wallet from string private key", () => {
		const wallet = getSolanaTestWallet()

		expect(wallet.keyPair.secretKey).toEqual(testWallet.privateKeyArray)
		expect(wallet.keyPair.publicKey.toBase58()).toEqual(testWallet.publicKeyString)
	})

	test("Should create wallet from array private key", () => {
		const wallet = getSolanaTestWallet()

		expect(base58.encode(wallet.keyPair.secretKey)).toEqual(testWallet.privateKeyString)
		expect(wallet.keyPair.publicKey.toBase58()).toEqual(testWallet.publicKeyString)
	})

	test("Should sign message", async () => {
		const wallet = getSolanaTestWallet()
		console.log(await wallet.signMessage("Hello"))
	})
})