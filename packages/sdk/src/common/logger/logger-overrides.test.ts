import { getExecRevertedMessage } from "./logger-overrides"

describe("logger overrides", () => {
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
})
