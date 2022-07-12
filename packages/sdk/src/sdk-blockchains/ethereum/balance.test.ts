import { Web3Ethereum } from "@rarible/web3-ethereum"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { toContractAddress, toCurrencyId, toUnionAddress, ZERO_ADDRESS } from "@rarible/types"
import type { AssetType } from "@rarible/api-client"
import type { BigNumberValue } from "@rarible/utils"
import { Blockchain } from "@rarible/api-client"
import BigNumber from "bignumber.js"
import { createRaribleSdk } from "../../index"
import { retry } from "../../common/retry"
import { LogsLevel } from "../../domain"
import { initProviders } from "./test/init-providers"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "./common"

describe.skip("get balance", () => {
	const { web31, wallet1 } = initProviders({
		pk1: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum = new Web3Ethereum({
		web3: web31,
		from: wallet1.getAddressString(),
	})
	const sdk = createRaribleSdk(new EthereumWallet(ethereum), "development", { logs: LogsLevel.DISABLED })

	test("get ETH balance with wallet", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get ETH balance without wallet", async () => {
		const sdk = createRaribleSdk(undefined, "development", { logs: LogsLevel.DISABLED })
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
		})
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get ETH balance without wallet with CurrencyId", async () => {
		const sdk = createRaribleSdk(undefined, "development", { logs: LogsLevel.DISABLED })
		const walletAddress = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const currency = toCurrencyId(`ETHEREUM:${ZERO_ADDRESS}`)
		const balance = await sdk.balances.getBalance(walletAddress, currency)
		expect(balance.toString()).toEqual("1.9355")
	})

	test("get balance erc-20", async () => {
		const sender = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")

		const contract = toContractAddress("ETHEREUM:0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6")
		const nextBalance = "0.00035"
		const balance = await sdk.balances.getBalance(sender, {
			"@type": "ERC20",
			contract,
		})
		expect(balance.toString()).toEqual(nextBalance)
	})

	test("get balance erc-20 with CurrencyId", async () => {
		const sender = toUnionAddress("ETHEREUM:0xa14FC5C72222FAce8A1BcFb416aE2571fA1a7a91")
		const contract = toCurrencyId("ETHEREUM:0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6")
		const nextBalance = "0.00035"
		const balance = await sdk.balances.getBalance(sender, contract)
		expect(balance.toString()).toEqual(nextBalance)
	})

	test("convert from eth to wETH", async () => {
		const senderRaw = wallet1.getAddressString()
		const wethE2eAssetType: AssetType = {
			"@type": "ERC20",
			contract: convertEthereumContractAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6", Blockchain.ETHEREUM),
		}
		const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)
		const initWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)
		const convertTx = await sdk.balances.convert({
			blockchain: Blockchain.ETHEREUM,
			isWrap: true,
			value: "0.00035",
		})
		await convertTx.wait()

		await retry(10, 2000, async () => {
			const finishWethBalance = await sdk.balances.getBalance(sender, wethE2eAssetType)

			expect(finishWethBalance.toString()).toBe(
				new BigNumber(initWethBalance).plus("0.00035").toString()
			)
		})
	})

	test("convert from wETH to eth", async () => {
		const senderRaw = wallet1.getAddressString()
		const wethE2eAssetType: AssetType = {
			"@type": "ERC20",
			contract: convertEthereumContractAddress("0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6", Blockchain.ETHEREUM),
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

describe.skip("get polygon balance", () => {
	const sdk = createRaribleSdk(undefined, "staging", { logs: LogsLevel.DISABLED })

	test("get Matic balance", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const balance = await sdk.balances.getBalance(walletAddress, {
			"@type": "ETH",
			blockchain: Blockchain.POLYGON,
		})
		expect(balance.toString()).toEqual("0.009145")
	})

	test("get Matic balance with CurrencyId", async () => {
		const walletAddress = toUnionAddress("ETHEREUM:0xc8f35463Ea36aEE234fe7EFB86373A78BF37e2A1")
		const currency = toCurrencyId(`POLYGON:${ZERO_ADDRESS}`)
		const balance = await sdk.balances.getBalance(walletAddress, currency)
		expect(balance.toString()).toEqual("0.009145")
	})
})

describe.skip("Bidding balance", () => {
	const { web31, wallet1 } = initProviders({
		pk1: "ded057615d97f0f1c751ea2795bc4b03bbf44844c13ab4f5e6fd976506c276b9",
	})

	const ethereum = new Web3Ethereum({ web3: web31 })
	const wallet = new EthereumWallet(ethereum)
	const sdk = createRaribleSdk(wallet, "development", { logs: LogsLevel.DISABLED })

	test("Should check bidding balance & deposit & withdraw", async () => {
		const checkBalance = async (expecting: BigNumberValue | null) => {
			const balance = await sdk.balances.getBiddingBalance({
				blockchain: Blockchain.ETHEREUM,
				walletAddress: toUnionAddress("ETHEREUM:" + wallet1.getAddressString()),
			})
			if (expecting !== null) {
				expect(parseFloat(balance.toString())).toBeCloseTo(parseFloat(expecting.toString()), 5)
			}
			return balance
		}

		const initBalance = new BigNumber(await checkBalance(null))

		await checkBalance(initBalance)

		let tx = await sdk.balances.depositBiddingBalance({ amount: 0.005, blockchain: Blockchain.ETHEREUM })
		await tx.wait()

		const remainBalance = await checkBalance(new BigNumber(initBalance).plus(0.005))

		tx = await sdk.balances.withdrawBiddingBalance({ amount: remainBalance, blockchain: Blockchain.ETHEREUM })
		await tx.wait()

		await checkBalance(0)
	})
})
