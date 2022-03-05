import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toUnionAddress } from "@rarible/types"
import { awaitAll, deployTestErc20 } from "@rarible/ethereum-sdk-test-common"
import type { AssetType } from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "./common"

describe("get balance", () => {
	const { web31, wallet1 } = initProviders({
		pk1: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum = new Web3Ethereum({
		web3: web31,
		from: wallet1.getAddressString(),
	})
	const sdk = createRaribleSdk(new EthereumWallet(ethereum, Blockchain.ETHEREUM), "e2e", { logs: LogsLevel.DISABLED })

	const it = awaitAll({
		testErc20: deployTestErc20(web31, "Test1", "TST1"),
	})

	test("get ETH balance with wallet", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get ETH balance without wallet", async () => {
		const sdk = createRaribleSdk(undefined, "e2e", { logs: LogsLevel.DISABLED })
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get balance erc-20", async () => {
		expect.assertions(1)
		const senderRaw = wallet1.getAddressString()
		const sender = toUnionAddress(`ETHEREUM:${senderRaw}`)
		await it.testErc20.methods.mint(senderRaw, 1).send({
			from: senderRaw,
			gas: 200000,
		})

		const contract = toContractAddress(`ETHEREUM:${it.testErc20.options.address}`)
		const nextBalance = "0.000000000000000001"
		const balance = await retry(5, 1000, async () => {
			const balance = await sdk.balances.getBalance(sender, {
				"@type": "ERC20",
				contract,
			})
			if (balance.toString() !== nextBalance) {
				throw new Error("Unequal balances")
			}
			return balance
		})

		expect(balance.toString()).toEqual(nextBalance)
	})

	test("convert from eth to wETH", async () => {
		const senderRaw = wallet1.getAddressString()
		const wethE2eAssetType: AssetType = {
			"@type": "ERC20",
			contract: convertEthereumContractAddress("0xc6f33b62a94939e52e1b074c4ac1a801b869fdb2", Blockchain.ETHEREUM),
		}
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const initWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)
		const convertTx = await sdk.balances.convert({
			blockchain: Blockchain.ETHEREUM,
			isWrap: true,
			value: "0.00000000000035",
		})
		await convertTx.wait()

		await retry(5, 2000, async () => {
			const finishWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)

			expect(finishWethBalance.toString()).toBe(
				new BigNumber(initWethBalance).plus("0.00000000000035").toString()
			)
		})
	})

	test("convert from wETH to eth", async () => {
		const senderRaw = wallet1.getAddressString()
		const wethE2eAssetType: AssetType = {
			"@type": "ERC20",
			contract: convertEthereumContractAddress("0xc6f33b62a94939e52e1b074c4ac1a801b869fdb2", Blockchain.ETHEREUM),
		}
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const balanceWithoutWeth = await sdk.balances.getBalance(sender, wethE2eAssetType)
		const prepareConvertTx = await sdk.balances.convert({
			blockchain: Blockchain.ETHEREUM,
			isWrap: true,
			value: "0.00000000000071",
		})
		await prepareConvertTx.wait()

		const initWethBalance = await retry(5, 2000, async () => {
			const initWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)
			if (new BigNumber(balanceWithoutWeth).isEqualTo(initWethBalance)) {
				throw new Error("Balance was not updated after init convert operation")
			}
			return initWethBalance
		})

		const convertTx = await sdk.balances.convert({
			blockchain: Blockchain.ETHEREUM,
			isWrap: false,
			value: "0.00000000000039",
		})
		await convertTx.wait()

		await retry(5, 2000, async () => {
			const finishWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)

			expect(finishWethBalance.toString()).toBe(
				new BigNumber(initWethBalance).minus("0.00000000000039").toString()
			)
		})
	})

})

describe("get polygon balance", () => {
	const sdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })

	test("get Matic balance", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
			blockchain: Blockchain.POLYGON,
		})
		expect(balance.toString()).toEqual("0.009145")
	})

})
