import Web3 from "web3"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { withBiconomyMiddleware } from "../biconomy"
import type { BiconomyApiLimitResponse, ContractMetadata, IContractRegistry, ILimitsRegistry } from "../types"
import { rinkebyMetaTxContract, rinkebyMetaTxContractMetadata } from "./metaTxContract/contract"

const testRegistry: IContractRegistry = {
	async getMetadata(address: string): Promise<ContractMetadata | undefined> {
		switch (address.toLowerCase()) {
			case "0x329ee2ea52e74ddd622bf06412f49e0177840d3c":
				return rinkebyMetaTxContractMetadata
			default:
				return undefined
		}
	},
}

const testLimitsRegistry: ILimitsRegistry = {
	checkLimits(): Promise<BiconomyApiLimitResponse> {
		return Promise.resolve({
			limit: {
				allowed: true,
				limitLeft: 100,
				type: 0,
				resetTime: 99999,
			},
			allowed: true,
			message: "Allowed",
			code: 200,
		})
	},
}

describe("middleware test", () => {
	const { provider, wallet } = createE2eProvider(undefined, {
		networkId: 4,
		rpcUrl: "https://node-rinkeby.rarible.com/",
	})

	test.skip("Should use biconomy middleware", async () => {
		const biconomyProvider = withBiconomyMiddleware(provider as any, testRegistry, testLimitsRegistry, {
			apiKey: "",
		})
		const web3 = new Web3(biconomyProvider as any)

		const ethereum = new Web3Ethereum({ web3 })

		const contract = ethereum.createContract(
			rinkebyMetaTxContract.abi,
			rinkebyMetaTxContract.address
		)

		const args = {
			tokenId: wallet.getAddressString() + "000000000000000000001027",
			tokenURI: "uri:/",
			supply: 1,
			creators: [{ account: wallet.getAddressString(), value: 10000 }],
			royalties: [],
			signatures: ["0x"],
		}

		const tx = await contract.functionCall("mintAndTransfer", args, wallet.getAddressString()).send()
		const receipt = await tx.wait()
		expect(receipt.transactionHash).toBeTruthy()
	})
})
