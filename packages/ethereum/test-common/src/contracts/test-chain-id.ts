import type { Web3 } from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import { DEFAULT_DATA_TYPE, replaceBigIntInContract } from "../common"

const abi= [
	{
		inputs: [],
		name: "getChainID",
		outputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
] as const

const bytecode =
	"0x6080604052348015600f57600080fd5b5060878061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063564b81ef14602d575b600080fd5b60336049565b6040518082815260200191505060405180910390f35b60004690509056fea26469706673582212205617b576866dcc49713d04a8fe0ed372be382a360a8b4d598aedbbe73119443c64736f6c63430007060033"

export async function deployTestChainId(web3: Web3) {
	const empty = createTestChaiId(web3)
	const [address] = await web3.eth.getAccounts()
	const contract = await empty
		.deploy({ data: bytecode })
		.send({ from: address, gas: "4000000" })
	return replaceBigIntInContract(contract)
}

function createTestChaiId(web3: Web3, address?: Address) {
	return new web3.eth.Contract(abi, address, DEFAULT_DATA_TYPE)
}
