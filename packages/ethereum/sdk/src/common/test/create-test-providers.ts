import type Wallet from "ethereumjs-wallet"
import { ethers } from "ethers"
import { Web3Ethereum, Web3 } from "@rarible/web3-ethereum"
import { Web3v4Ethereum, Web3 as Web3v4 } from "@rarible/web3-v4-ethereum"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"

export function createTestProviders(provider: any, wallet: Wallet) {
	const web3 = new Web3(provider)
	const web3v4 = new Web3v4(provider)
	web3v4.setConfig({ defaultTransactionType: "0x0" })
	const ethersWeb3Provider = new ethers.providers.Web3Provider(provider)

	return {
		web3,
		web3v4,
		providers: [
			new Web3Ethereum({ web3, from: wallet.getAddressString(), gas: 8000000 }),
			new Web3v4Ethereum({ web3: web3v4, from: wallet.getAddressString(), gas: 8000000 }),
			new EthersEthereum(new ethers.Wallet(wallet.getPrivateKeyString(), ethersWeb3Provider)),
			new EthersWeb3ProviderEthereum(ethersWeb3Provider),
		],
	}
}

export function createBuyerSellerProviders(provider: any, wallets: Wallet[]) {
	const [buyerWallet, sellerWallet] = wallets
	const buyer = createTestProviders(provider, buyerWallet)
	const seller = createTestProviders(provider, sellerWallet)

	return {
		web3Seller: buyer.web3,
		web3v4Seller: buyer.web3v4,
		web3Buyer: seller.web3,
		web3v4Buyer: seller.web3v4,
		buyerAddress: buyerWallet.getAddressString(),
		sellerAddress: buyerWallet.getAddressString(),
		providers: concatBuyerSellerProviders(buyer.providers, seller.providers),
	}
}

export function concatBuyerSellerProviders(
	buyer: ReturnType<typeof createTestProviders>["providers"],
	seller: ReturnType<typeof createTestProviders>["providers"]
) {
	return buyer.map((buyerProvider, i) => {
		return [buyerProvider, seller[i] as typeof buyerProvider]
	})
}
