import type Web3 from "web3"
import type { Address } from "@rarible/ethereum-api-client"
import type { Contract } from "web3-eth-contract"
import type { AbiItem } from "../common/abi-item"

export function createTestRoyaltiesProviderContract(web3: Web3, address?: Address): Contract {
	return new web3.eth.Contract(testRoyaltiesProviderAbi, address)
}

export async function deployTestRoyaltiesProvider(web3: Web3) {
	const empty = createTestRoyaltiesProviderContract(web3)
	const [address] = await web3.eth.getAccounts()
	return empty.deploy({ data: testRoyaltiesProviderBytecode }).send({ from: address, gas: 4000000, gasPrice: "0" })
}

const testRoyaltiesProviderAbi: AbiItem[] = [
	{
		inputs: [
			{
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
		],
		name: "getRoyalties",
		outputs: [
			{
				components: [
					{
						internalType: "address payable",
						name: "account",
						type: "address",
					},
					{
						internalType: "uint96",
						name: "value",
						type: "uint96",
					},
				],
				internalType: "struct LibPart.Part[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
]

export const testRoyaltiesProviderBytecode =
	"0x608060405234801561001057600080fd5b5061017d806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80639ca7dc7a14610030575b600080fd5b61004361003e3660046100ab565b610059565b60405161005091906100e1565b60405180910390f35b6040805160008082526020820190925260609161008c565b610079610094565b8152602001906001900390816100715790505b509392505050565b604080518082019091526000808252602082015290565b600080604083850312156100bd578182fd5b82356001600160a01b03811681146100d3578283fd5b946020939093013593505050565b602080825282518282018190526000919060409081850190868401855b8281101561013a57815180516001600160a01b031685528601516bffffffffffffffffffffffff168685015292840192908501906001016100fe565b509197965050505050505056fea2646970667358221220747fdf85c33063fca611bb784ec60014959c4b9c81d99ae611a0700000520d4764736f6c63430007060033"
