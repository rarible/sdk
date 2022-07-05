import type { RequestCurrency } from "@rarible/sdk/build/common/domain"
import type { BlockchainWallet } from "@rarible/sdk-wallet"
import { EthereumWallet, FlowWallet, SolanaWallet, TezosWallet } from "@rarible/sdk-wallet"
import { toContractAddress } from "@rarible/types"
import { deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import { getWalletAddressFull } from "./wallet"
import { testsConfig } from "./config"
import { Logger } from "./logger"


export async function getCurrency(wallets: { seller: BlockchainWallet, buyer: BlockchainWallet },
	currency: string): Promise<RequestCurrency> {
	Logger.log(`Get currency for=${currency}`)
	if (wallets.seller instanceof EthereumWallet && wallets.buyer instanceof EthereumWallet) {
		if (currency === "ERC20") {
			const testErc20 = await deployTestErc20((wallets.seller.ethereum as any).config.web3, "test erc20", "TST20")
			const addressBuyer = await getWalletAddressFull(wallets.buyer)
			const addressSeller = await getWalletAddressFull(wallets.seller)
			await testErc20.methods.mint(addressBuyer.address, 1000).send({
				from: addressSeller.address,
				gas: 200000,
			})
			return {
				"@type": "ERC20",
				contract: toContractAddress(`ETHEREUM:${testErc20.options.address}`),
			}
		}
		if (currency === "ETH") {
			return {
				"@type": "ETH",
			}
		}
		throw new Error(`Wrong currency provided=${currency}`)
	} else if (wallets.seller instanceof TezosWallet && wallets.buyer instanceof TezosWallet) {
		if (currency === "XTZ") {
			return {
				"@type": "XTZ",
			}
		}
		throw new Error(`Wrong currency provided=${currency}`)
	} else if (wallets.seller instanceof FlowWallet && wallets.buyer instanceof FlowWallet) {
		if (currency === "FLOW_FT") {
			return {
				"@type": "FLOW_FT",
				contract: toContractAddress(`FLOW:${testsConfig.variables.FLOW_FT_CONTRACT_ADDRESS}`),
			}
		}
		throw new Error(`Wrong currency provided=${currency}`)
	} else if (wallets.seller instanceof SolanaWallet && wallets.buyer instanceof SolanaWallet) {
		if (currency === "SOLANA_SOL") {
			return {
				"@type": "SOLANA_SOL",
			}
		}
		throw new Error(`Wrong currency provided=${currency}`)
	}
	throw new Error(`Incorrect wallet provided, seller=${wallets.seller}, buyer=${wallets.buyer}`)
}
