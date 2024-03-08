import { EthereumProviderError } from "@rarible/ethereum-provider"
import { delay, isInfoLevel } from "@rarible/sdk-common"
import { WrongNetworkWarning } from "@rarible/protocol-ethereum-sdk/src/order/check-chain-id"
import { Blockchain } from "@rarible/api-client"
import { toCollectionId } from "@rarible/types"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import Web3 from "web3"
import { EthereumWallet } from "@rarible/sdk-wallet"
import { RemoteLogger } from "@rarible/logger/build"
import type { LoggableValue } from "@rarible/logger/build/domain"
import { DEV_PK_1, ETH_DEV_SETTINGS } from "../../sdk-blockchains/ethereum/test/common"
import { convertEthereumContractAddress, convertEthereumToUnionAddress } from "../../sdk-blockchains/ethereum/common"
import { InsufficientFundsError } from "../../sdk-blockchains/ethereum/bid"
import { createRaribleSdk, WalletType } from "../../index"
import { getAPIKey } from "../test/create-sdk"
import { getSdkContext } from "../get-sdk-context"
import { LogsLevel } from "../../domain"
import { MintType } from "../../types/nft/mint/prepare"
import { getExecRevertedMessage, isErrorWarning } from "./logger-overrides"

describe("logger overrides", () => {
	describe("isErrorWarning", () => {

		test("EthereumProviderError (transaction underpriced)", async () => {
			const err = new EthereumProviderError({
				data: null,
				error: {
					code: -32603,
					message: '[ethjs-query] while formatting outputs from RPC \'{"value":{"code":-32603,"data":{"code":-32000,"message":"transaction underpriced"}}}',
				},
				method: "any",
			})
			const isError = isErrorWarning(err, WalletType.ETHEREUM)
			expect(isError).toBeTruthy()
		})

		test("WrongNetworkWarning", async () => {
			const err = new WrongNetworkWarning(1, 2)
			const isError = isErrorWarning(err, WalletType.ETHEREUM)
			expect(isError).toBeTruthy()
		})

		test("InsufficientFundsError", async () => {
			const err = new InsufficientFundsError()
			const isError = isErrorWarning(err, WalletType.ETHEREUM)
			expect(isError).toBeTruthy()
		})
	})

	describe("isInfoLevel tests", () => {
		const errors = [
			{ message: "Cancelled" },
			{ message: "User did not approve" },
			{ message: "Popup closed" },
			{ code: 4001 },
		]
		test.each(errors)("isInfoLevel test with message=$message and code=$code", (error) => {
			const err = new EthereumProviderError({
				data: null,
				error,
				method: "any",
			})
			const isInfoLvl = isInfoLevel(err)
			expect(isInfoLvl).toBeTruthy()
		})
	})

	test("simple message", () => {
		expect(getExecRevertedMessage("execution reverted: simple error")).toEqual("simple error")
	})

	test("ethers error", () => {
		const ethersError = "Error while gas estimation with message cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason=\"execution reverted: Function call not successful\", method=\"estimateGas\", transaction={\"from\":\"0x2Cbc450E04a6379d37F1b85655d1fc09bdA3E6dA\",\"to\":\"0x12b3897a36fDB436ddE2788C06Eff0ffD997066e\",\"data\":\"0x0c53c5"
		expect(getExecRevertedMessage(ethersError)).toEqual("Function call not successful")
	})

	test("RPC error", () => {
		const error = "Internal JSON-RPC error.\n{\n  \"code\": -32000,\n  \"message\": \"execution reverted\"\n}"
		expect(getExecRevertedMessage(error)).toEqual(error)
	})

	test("no transfer error", () => {
		const error = "execution reverted: This token is SBT, so this can not transfer."
		expect(getExecRevertedMessage(error)).toEqual("This token is SBT, so this can not transfer.")
	})

	test("noop error", () => {
		const error = "execution reverted: Mxp: noop"
		expect(getExecRevertedMessage(error)).toEqual("Mxp: noop")
	})

	test("creator error", () => {
		const error = "execution reverted: AssetContractShared#creatorOnly: ONLY_CREATOR_ALLOWED"
		expect(getExecRevertedMessage(error)).toEqual("AssetContractShared#creatorOnly: ONLY_CREATOR_ALLOWED")
	})

	test("flow proposal key error error", () => {
		const error = new Error("[Error Code: 1007] error caused by: 1 error occurred:\\n\\t* checking sequence number failed: [Error Code: 1007] invalid proposal key: public key 0 on account 201362ac764cf16f has sequence number 284, but given 283\\n\\n")
		expect(isErrorWarning(error, WalletType.FLOW)).toBeTruthy()
	})

	describe("SDK middleware extra fields", () => {
		const { provider, wallet } = createE2eProvider(DEV_PK_1, ETH_DEV_SETTINGS)
		const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

		const ethereumWallet = new EthereumWallet(ethereum)
		const erc721Address = convertEthereumContractAddress("0xF3348949Db80297C78EC17d19611c263fc61f987", Blockchain.ETHEREUM)

		test("should mint ERC721 token", async () => {
			const mockLogger = jest.fn()

			const sdk = createRaribleSdk(ethereumWallet, "development", {
				apiKey: getAPIKey("development"),
				logger: new RemoteLogger(
					async (msg: LoggableValue) => mockLogger(msg),
					{
						initialContext: getSdkContext({
							env: "development",
							sessionId: "",
							config: {
								logs: LogsLevel.ERROR,
							},
						}),
						dropBatchInterval: 100,
						maxByteSize: 5 * 10240,
					}),
				logs: LogsLevel.ERROR,
			})

			const senderRaw = wallet.getAddressString()
			const sender = convertEthereumToUnionAddress(senderRaw, Blockchain.ETHEREUM)

			try {
				const action = await sdk.nft.mint.prepare({
					collectionId: toCollectionId(erc721Address),
				})
				const result = await action.submit({
					uri: "ipfs://ipfs/QmfVqzkQcKR1vCNqcZkeVVy94684hyLki7QcVzd9rmjuG5",
					creators: [{
						account: sender,
						value: 10000,
					}],
					royalties: [],
					lazyMint: false,
					supply: 1,
				})

				if (result.type === MintType.ON_CHAIN) {
					const transaction = await result.transaction.wait()
					expect(transaction.blockchain).toEqual("ETHEREUM")
					expect(transaction.hash).toBeTruthy()
				} else {
					throw new Error("Must be on chain")
				}
			} catch (e) {}

			await delay(1000)

			console.log("JSON", mockLogger.mock.calls[0][0])
			const logObject = JSON.parse(mockLogger.mock.calls[0][0][0].error)

			expect(logObject.status).toBe(404)
			expect(logObject.code).toBe("NETWORK_ERR")
		})
	})

})
