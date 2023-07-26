import { EthereumProviderError } from "@rarible/ethereum-provider"
import { isInfoLevel } from "@rarible/sdk-common"
import { WrongNetworkWarning } from "@rarible/protocol-ethereum-sdk/src/order/check-chain-id"
import { WalletType } from "../../index"
import { InsufficientFundsError } from "../../sdk-blockchains/ethereum/bid"
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

	test("isInfoLevel returns true", async () => {
		const err = new EthereumProviderError({
			data: null,
			error: {
				message: "Cancelled",
			},
			method: "any",
		})
		const isInfoLvl = isInfoLevel(err)
		expect(isInfoLvl).toBeTruthy()
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
})
