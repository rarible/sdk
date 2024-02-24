import type { Ethereum } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/ethereum-api-client"

export async function testSimpleContract(ethereum: Ethereum, contractAddress: Address) {
	const contract = ethereum.createContract(SIMPLE_TEST_ABI, contractAddress)

	const tx = await contract.functionCall("setValue", 10).send()
	await tx.wait()
	const events = await tx.getEvents()
	const eventValue = events.filter(e => e.event === "Value")[0]
	expect(eventValue.args.value.toString()).toBe("10")

	const valueCall = contract.functionCall("value")
	const value = await valueCall.call()
	expect(value.toString()).toBe("10")

	const valueCallInfo = await valueCall.getCallInfo()
	expect(valueCallInfo.contract.toLowerCase()).toEqual(contractAddress?.toLowerCase())
}

export const SIMPLE_TEST_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256",
			},
		],
		"name": "Value",
		"type": "event",
	},
	{
		"inputs": [],
		"name": "value",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256",
			},
		],
		"name": "setValue",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
]

export const SIMPLE_TEST_CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b5060e28061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80633fa4f2451460375780635524107714604f575b600080fd5b603d606b565b60408051918252519081900360200190f35b606960048036036020811015606357600080fd5b50356071565b005b60005481565b60008190556040805182815290517f2a27502c345a4cd966daa061d5537f54cd60d2d20b73680b3bf195c91e806a4b9181900360200190a15056fea2646970667358221220e9d63fa3f3e9446cb890f2b1fa149d729f1c66157181510bd3c3abd55e8a60b664736f6c63430007060033"
