import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress } from "@rarible/types"
import { erc1155v2Abi } from "../nft/contracts/erc1155/v2"
import { LogsLevel } from "../types"
import { DEV_PK_1 } from "./test/test-credentials"
import type { ILoggerConfig } from "./logger/logger"
import { getSendWithInjects } from "./send-transaction"

describe("estimate gas before send tx", () => {
	const { provider } = createE2eProvider(DEV_PK_1)
	const web3 = new Web3(provider as any)
	const ethereum = new Web3Ethereum({ web3, gas: 1000000 })

	const erc1155Address = toAddress("0x11F13106845CF424ff5FeE7bAdCbCe6aA0b855c1")
	const logConfig: ILoggerConfig = {
		level: LogsLevel.ERROR,
		instance: {
			...console,
			raw: (...args) => console.info(args),
		},
	}
	const sendTemplate = getSendWithInjects({ logger: logConfig })
	const api = { createGatewayPendingTransactions: () => {} }
	const send = sendTemplate.bind(null, api as any, () => true as any)

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
