import { toAddress } from "@rarible/types"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { mintTokensToNewSudoswapPool } from "../amm/test/utils"
import { retry } from "../../../common/retry"
import type { SimpleAmmOrder } from "../../types"
import type { NftAssetType } from "../../check-asset-type"
import type { AmmOrderFillRequest } from "../types"
import { DEV_PK_1, DEV_PK_2 } from "../../../common/test/test-credentials"
import type { EthereumNetwork } from "../../../types"
import { createRaribleSdk } from "../../../index"
import { getEthereumConfig } from "../../../config"
import { checkChainId } from "../../check-chain-id"
import { getSimpleSendWithInjects } from "../../../common/send-transaction"
import { makeAmmOrder, ordersToRequests } from "./test/common/utils"

describe("amm batch buy tests", () => {
	const { provider: providerBuyer } = createE2eProvider(DEV_PK_1)
	const { provider: providerSeller } = createE2eProvider(DEV_PK_2)

	const env: EthereumNetwork = "dev-ethereum"
	const web3Seller = new Web3(providerSeller as any)
	const ethereumSeller = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })
	const ethereum = new Web3Ethereum({ web3: web3Seller, gas: 3000000 })

	const buyerWeb3 = new Web3Ethereum({ web3: new Web3(providerBuyer as any), gas: 3000000 })
	const sdkBuyer = createRaribleSdk(buyerWeb3, env)
	const sdkSeller = createRaribleSdk(ethereumSeller, env)

	const config = getEthereumConfig(env)
	const checkWalletChainId = checkChainId.bind(null, ethereum, config)
	const send = getSimpleSendWithInjects().bind(null, checkWalletChainId)


	test.skip("amm sudoswap few items sell form different pools", async () => {
		const orders = await Promise.all([
			makeAmmOrder(sdkSeller, env, ethereum, send, config),
			makeAmmOrder(sdkSeller, env, ethereum, send, config),
		])

		console.log("order", orders[0])
		const tx = await sdkBuyer.order.buyBatch(ordersToRequests(orders, [{
			account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
			value: 100,
		}]))
		await tx.wait()
		console.log(tx)
	})

	test("amm sudoswap few items sell from one pool one request", async () => {
		const { poolAddress, items, contract } = await mintTokensToNewSudoswapPool(
			sdkSeller,
			env,
			ethereum,
			send,
			config.sudoswap.pairFactory,
			3
		)
		const orderHash = "0x" + poolAddress.slice(2).padStart(64, "0")
		const order = await retry(20, 2000, async () => {
			return await sdkSeller.apis.order.getValidatedOrderByHash({ hash: orderHash })
		}) as SimpleAmmOrder

		const requests: NftAssetType[] = items.map(item => ({
			contract,
			tokenId: item,
		}))
		console.log("reqs", requests)
		const tx = await sdkBuyer.order.buyBatch([{
			order,
			amount: 1,
			originFees: [{
				account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
				value: 100,
			}],
			assetType: items.map(item => ({
				contract,
				tokenId: item,
			})),
		} as AmmOrderFillRequest])
		console.log(tx)
		await tx.wait()
	})

})
