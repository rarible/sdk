import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum/build"
import { toAddress } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import { createRaribleSdk } from "../../index"
import { getEthereumConfig } from "../../config"
import { getSimpleSendWithInjects } from "../../common/send-transaction"
import { checkChainId } from "../check-chain-id"
import { retry } from "../../common/retry"
import type { SimpleOrder } from "../types"
import { DEV_PK_1, DEV_PK_2 } from "../../common/test/test-credentials"
import type { EthereumNetwork } from "../../types"
import { mintTokensToNewSudoswapPool } from "./amm/test/utils"

describe.skip("amm", () => {
	const { provider: providerSeller } = createE2eProvider(
		DEV_PK_2,
	)
	const { provider: providerBuyer } = createE2eProvider(
		DEV_PK_1,
	)

	const env: EthereumNetwork = "dev-ethereum"
	const config = getEthereumConfig(env)
	const sellerWeb3 = new Web3Ethereum({ web3: new Web3(providerSeller as any), gas: 3000000 })
	const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer as any), gas: 3000000 })
	const checkWalletChainId = checkChainId.bind(null, buyerWeb3, config)
	const sendBuyer = getSimpleSendWithInjects().bind(null, checkWalletChainId)
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)

	const sdkSeller = createRaribleSdk(sellerWeb3, env)
	const checkWalletChainIdSeller = checkChainId.bind(null, sellerWeb3, config)
	const sendSeller = getSimpleSendWithInjects().bind(null, checkWalletChainIdSeller)

	const royalty1Account = toAddress("0x8508317a912086b921F6D2532f65e343C8140Cc8")
	const royalty2Account = toAddress("0xEE5DA6b5cDd5b5A22ECEB75b84C7864573EB4FeC")
	const originFee1Account = toAddress("0xf6a21e471E07793C06D285CEa7AabA8B72029435")
	const originFee2Account = toAddress("0x2C3beA5Bd9adE1242Eecb327258a95516f9F45dE")

	test("try to fill order", async () => {
		const pair = await mintTokensToNewSudoswapPool(
			sdkSeller,
			env,
			sellerWeb3,
			sendBuyer,
			config.sudoswap.pairFactory,
			1
		)
		console.log(pair)
		const orderHash = "0x" + pair.poolAddress.slice(2).padStart(64, "0")
		console.log("order:", orderHash)
		const singleOrder: SimpleOrder = await retry(20, 2000, async () => {
			return await sdkBuyer.apis.order.getOrderByHash({ hash: orderHash })
		})
		console.log("single order", singleOrder)

		const tx = await sdkBuyer.order.buy({
			order: singleOrder as any,
			amount: 1,
			originFees: [],
			assetType: {
				contract: pair.contract,
				tokenId: pair.items[0],
			},
		})
		console.log(tx)
		await tx.wait()
	})

	test("try to fill order with royalties", async () => {
		const pair = await mintTokensToNewSudoswapPool(
			sdkSeller,
			env,
			sellerWeb3,
			sendSeller,
			config.sudoswap.pairFactory,
			1
		)
		console.log(pair)
		const orderHash = "0x" + pair.poolAddress.slice(2).padStart(64, "0")
		console.log("order:", orderHash)
		const singleOrder: SimpleOrder = await retry(20, 2000, async () => {
			return await sdkBuyer.apis.order.getOrderByHash({ hash: orderHash })
		})

		const [
			royalty1Balance,
			royalty2Balance,
			originFee1Balance,
			originFee2Balance,
		] = await getEthBalances([royalty1Account, royalty2Account, originFee1Account, originFee2Account])
		const tx = await sdkBuyer.order.buy({
			order: singleOrder as any,
			amount: 1,
			originFees: [
				{
					account: originFee1Account,
					value: 1000,
				},
				{
					account: originFee2Account,
					value: 1000,
				},
			],
			assetType: {
				contract: pair.contract,
				tokenId: pair.items[0],
			},
			addRoyalty: true,
		})
		console.log(tx)
		await tx.wait()
		//royalty #1
		await checkEthBalance(royalty1Account, royalty1Balance.plus("0.00000000000000011").toString())
		//royalty #2
		await checkEthBalance(royalty2Account, royalty2Balance.plus("0.00000000000000011").toString())
		//origin fee #1
		await checkEthBalance(originFee1Account, originFee1Balance.plus("0.00000000000000011").toString())
		//origin fee #2
		await checkEthBalance(originFee2Account, originFee2Balance.plus("0.00000000000000011").toString())
	})

	async function checkEthBalance(address: string, value: string) {
		return retry(10, 3000, async () => {
			const balance = toBn(await buyerWeb3.getBalance(toAddress(address))).div(toBn(10).pow(18))
			expect(balance.toString()).toBe(value)
		})
	}
	async function getEthBalances(addresses: string[]) {
		return Promise.all(
			addresses.map(async address => {
				return toBn(await buyerWeb3.getBalance(toAddress(address))).div(toBn(10).pow(18))
			})
		)
	}
})
