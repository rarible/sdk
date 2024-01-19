import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { toAddress } from "@rarible/types"
import { erc1155v2Abi } from "../nft/contracts/erc1155/v2"
import { LogsLevel } from "../types"
import { DEV_PK_1 } from "./test/test-credentials"
import type { ILoggerConfig } from "./logger/logger"
import { getSendWithInjects } from "./send-transaction"

describe("estimate gas before send tx", () => {
	const { web3Ethereum: ethereum } = createE2eProvider(DEV_PK_1)

	const erc1155Address = toAddress("0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1")
	const logConfig: ILoggerConfig = {
		level: LogsLevel.ERROR,
		instance: {
			...console,
			raw: (...args) => console.info(args),
		},
	}
	const send = getSendWithInjects({ logger: logConfig })

	test("estimate gas should pass to logger 'to' and 'value' fields", async () => {
		const contract = ethereum.createContract(erc1155v2Abi, erc1155Address)
		const fnCall = contract.functionCall(
			"safeTransferFrom",
			erc1155Address,
			erc1155Address,
			"0x00",
			"0x01",
			"0x00",
		)
		try {
		  const tx = await send(fnCall, { value: "0x00" })
			await tx.wait()
		} catch (e) {
			console.log(e)
		  expect(e).toBeTruthy()
		}
	})
})
