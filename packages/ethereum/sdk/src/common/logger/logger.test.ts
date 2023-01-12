import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { createRemoteLogger } from "./logger"

describe("logger test", () => {
	const pk = "d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
	const { provider } = createE2eProvider(pk)
	const web3 = new Web3(provider)
	const ethereum = new Web3Ethereum({ web3 })

	test("createRemoteLogger", async () => {
		createRemoteLogger({
			ethereum,
			env: "dev",
		})
	})
})
