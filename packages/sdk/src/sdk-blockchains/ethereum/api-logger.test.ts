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
import { ETH_DEV_SETTINGS } from "./test/common"
import { convertEthereumContractAddress } from "./common"
import { createSdk } from "./test/create-sdk"

describe("ethereum api logger", () => {
	const sdk = createSdk(undefined, "testnet")

	const erc721Address = toAddress("0x64F088254d7EDE5dd6208639aaBf3614C80D396d")

	test.concurrent("request url in error.value.url", async () => {
		let error: any = null
		try {
			await sdk.apis.collection.getCollectionById({ collection: erc721Address })
		} catch (e) {
			error = e
		}
		expect(error).toBeTruthy()
	})

	test.concurrent("request url in EthereumSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			const prepare = await sdk.nft.transfer.prepare({
				itemId: toItemId(`${Blockchain.ETHEREUM}:0x64F088254d7EDE5dd6208639aaBf3614C80D396d:0`),
			})
			await prepare.submit({
				to: toUnionAddress(`${Blockchain.ETHEREUM}:${ZERO_ADDRESS}`),
			})
		} catch (e) {
			error = e
		}
		expect(error).toBeTruthy()
	})

	test.concurrent("request url in FlowSDK.apis.* returns error with error.url", async () => {
		let error: any = null
		try {
			await sdk.order.bidUpdate.prepare({
				orderId: toOrderId("FLOW:106746924000000000000"),
			})
		} catch (e) {
			error = e
		}
		expect(error).toBeTruthy()
	})
})

describe("ethereum api logger with tx ethereum errors", () => {
	const { provider } = createE2eProvider(undefined, ETH_DEV_SETTINGS)
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum)
	const sdk = createSdk(ethereumWallet, "development")

	const erc721Address = toAddress("0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E")

	test("should throw ethereum tx error", async () => {
		const contract = convertEthereumContractAddress(erc721Address, Blockchain.ETHEREUM)

		try {
			const result = await sdk.nft.mint({
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
