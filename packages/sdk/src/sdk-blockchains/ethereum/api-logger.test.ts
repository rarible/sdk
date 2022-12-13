import {
	toAddress,
	toBigNumber,
	toCollectionId,
	toItemId,
	toOrderId,
	toUnionAddress,
	ZERO_ADDRESS,
} from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { awaitAll } from "@rarible/ethereum-sdk-test-common"
import { createRaribleSdk } from "../../index"
import { LogsLevel } from "../../domain"
import { DEV_PK_1, ETH_DEV_SETTINGS } from "./test/common"
import { convertEthereumContractAddress } from "./common"

describe("ethereum api logger", () => {
	const it = awaitAll({
		sdk: createRaribleSdk(undefined, "testnet"),
	})

	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	test("request url in error.value.url", async () => {
		let error: any = null
		try {
			await it.sdk.apis.collection.getCollectionById({ collection: erc721Address })
		} catch (e) {
			error = e
		}
		expect(error?.url).toBe("https://testnet-api.rarible.org/v0.1/collections/0x64f088254d7ede5dd6208639aabf3614c80d396d")
	})

	test("request url in EthereumSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			const prepare = await it.sdk.nft.transfer.prepare({
				itemId: toItemId(`${Blockchain.ETHEREUM}:0x64F088254d7EDE5dd6208639aaBf3614C80D396d:0`),
			})
			await prepare.submit({
				to: toUnionAddress(`${Blockchain.ETHEREUM}:${ZERO_ADDRESS}`),
			})
		} catch (e) {
			error = e
			console.log(e)
		}
		expect(error?.url).toBe("https://testnet-ethereum-api.rarible.org/v0.1/nft/items/0x64F088254d7EDE5dd6208639aaBf3614C80D396d:0")
	})

	test("request url in FlowSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			await it.sdk.order.bidUpdate.prepare({
				orderId: toOrderId("FLOW:106746924000000000000"),
			})
		} catch (e) {
			error = e
			console.log(e)
		}
		expect(error?.url).toBe("https://testnet-flow-api.rarible.org/v0.1/orders/106746924000000000000")
	})
})

describe("ethereum api logger with tx ethereum errors", () => {
	const { provider } = createE2eProvider(DEV_PK_1, ETH_DEV_SETTINGS)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum)
	const it = awaitAll({
		sdk: createRaribleSdk(ethereumWallet, "development", { logs: LogsLevel.ERROR }),
	})

	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")

	test("should throw ethereum tx error", async () => {
		const contract = convertEthereumContractAddress(erc721Address, Blockchain.ETHEREUM)

		try {
			const result = await it.sdk.nft.mint({
				uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
				collectionId: toCollectionId(contract),
				tokenId: {
					tokenId: toBigNumber("1"),
					signature: { v: "" as any, r: "" as any, s: "" as any },
				},
			})
			await result.transaction.wait()
		} catch (e: any) {
			expect(e.name).toBe("EthereumProviderError")
			expect(e.method).toBe("Web3FunctionCall.send")
		}
	})

})
