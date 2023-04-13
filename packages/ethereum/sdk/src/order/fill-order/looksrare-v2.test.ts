import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { ethers } from "ethers"
import { EthersEthereum, EthersWeb3ProviderEthereum } from "@rarible/ethers-ethereum"
import { toAddress } from "@rarible/types"
import type { EthereumNetwork } from "../../types"
import { createRaribleSdk } from "../../index"
import { DEV_PK_1, DEV_PK_2, getTestContract, GOERLI_CONFIG } from "../../common/test/test-credentials"
import { getEthereumConfig } from "../../config"
import { checkChainId } from "../check-chain-id"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import type { EthereumConfig } from "../../config/type"
import { testnetEthereumConfig } from "../../config/testnet"
import { LooksrareOrderHandler } from "./looksrare-v2"

describe("looksrare fill", () => {
	const { provider: providerBuyer } = createE2eProvider(
		DEV_PK_1,
		GOERLI_CONFIG
	)
	const { provider: providerSeller } = createE2eProvider(
		DEV_PK_2,
		GOERLI_CONFIG
	)
	const { wallet: feeWallet } = createE2eProvider(undefined, GOERLI_CONFIG)
	const web3Seller = new Web3(providerSeller as any)
	const ethereumSeller = new Web3Ethereum({
		web3: web3Seller,
		gas: 3000000,
	})
	const web3 = new Web3(providerBuyer as any)
	const ethereum = new Web3Ethereum({
		web3,
		gas: 3000000,
	})

	const buyerWeb3 = new Web3Ethereum({
		web3: new Web3(providerBuyer as any),
		gas: 3000000,
	})
	const buyerEthersWeb3Provider = new ethers.providers.Web3Provider(providerBuyer as any)

	const buyerEthersWeb3ProviderEthereum = new EthersWeb3ProviderEthereum(buyerEthersWeb3Provider)
	const buyerEthersEthereum = new EthersEthereum(
		new ethers.Wallet(DEV_PK_1, buyerEthersWeb3Provider)
	)

	const env: EthereumNetwork = "testnet"
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)
	const sdkSeller = createRaribleSdk(ethereumSeller, env)

	const goerliErc721V3ContractAddress = getTestContract(env, "erc721V3")
	const goerliErc1155V2ContractAddress = getTestContract(env, "erc1155V2")
	const originFeeAddress = toAddress(feeWallet.getAddressString())

	const testnetConfig = getEthereumConfig("testnet")
	const config: EthereumConfig = {
		...testnetConfig,
		exchange: {
			...testnetConfig.exchange,
			looksrareV2: toAddress("0x35C2215F2FFe8917B06454eEEaba189877F200cf"),
		},
	}

	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSimpleSendWithInjects().bind(null, checkWalletChainId)

	/*
	const handler = new LooksrareOrderHandler(
		ethereum,
		send,
		config,
	)

	test("buy", async () => {
		const tx = await handler.prepareTransaction()
		console.log("tx", tx)
		await tx.wait()
		console.log("wait tx")
	})

	 */
})
