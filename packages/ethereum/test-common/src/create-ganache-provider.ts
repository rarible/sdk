import Wallet from "ethereumjs-wallet"
import ganache from "ganache"
import { randomWord, toAddress } from "@rarible/types"
import Web3v4 from "web3-v4"

export function createGanacheProvider(...pk: string[]) {
	let wallets: Wallet[]
	if (pk.length > 0) {
		wallets = pk.map(single => new Wallet(Buffer.from(single, "hex")))
	} else {
		wallets = Array.from(new Array(10).keys()).map(() => new Wallet(Buffer.from(randomWord().substring(2), "hex")))
	}
	const accounts = wallets.map(wallet => ({
		secretKey: wallet.getPrivateKeyString(),
		balance: "0x1000000000000000000000000000",
	}))

	const provider = ganache.provider({
		chain: {
			hardfork: "shanghai",
		  chainId: 300500,
		},
		wallet: {
			accounts,
		},
		logging: {
			quiet: true,
		},
	})

	return {
		provider: provider as any,
		wallets,
		addresses: wallets.map(w => toAddress(w.getAddressString())),
		accounts,
		web3: new Web3v4(provider),
	}
}
