import { personalSign } from "eth-sig-util"
import Wallet from "ethereumjs-wallet"
import { fromRpcSig, bufferToHex, toBuffer, setLengthLeft } from "ethereumjs-util"
import { randomWord } from "@rarible/types"
import type Web3 from "web3"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { isSigner } from "./is-signer"
import { createTestProviders } from "./test/create-test-providers"

const { provider, wallets } = createGanacheProvider()
const { web3, providers } = createTestProviders(provider, wallets[0] )

describe.each(providers)("isSigner", (ethereum) => {
	test("recover works for hw wallets workaround", async () => {
		const hash = randomWord()

		const pk = Buffer.from(randomWord().substring(2), "hex")
		const wallet = new Wallet(pk)

		const signature = personalSign(pk, { data: hash })
		const sig = fromRpcSig(signature)
		const fixed = toRpcSig(sig.v + 4, sig.r, sig.s)
		expect(await isSigner(null as any, wallet.getAddressString(), Buffer.from(hash.substring(2), "hex"), fixed))
			.toBe(true)
	})

	test("erc1271 works", async () => {
		const test = await deployTestErc1271(web3)
		const from = await ethereum.getFrom()
		const hash = Buffer.from(randomWord().substring(2), "hex")
		const pk = Buffer.from(randomWord().substring(2), "hex")
		const signature = personalSign(pk, { data: randomWord() })

		await test.methods.setReturnSuccessfulValidSignature(false).send({ from })
		expect(await isSigner(ethereum, test.options.address!, hash, signature)).toBe(false)

		await test.methods.setReturnSuccessfulValidSignature(true).send({ from })
		expect(await isSigner(ethereum, test.options.address!, hash, signature)).toBe(true)
	})
})

function toRpcSig(v: number, r: Buffer, s: Buffer) {
	return bufferToHex(Buffer.concat([setLengthLeft(r, 32), setLengthLeft(s, 32), toBuffer(v)]))
}

async function deployTestErc1271(web3: Web3) {
	const empty = new web3.eth.Contract(testABI)
	const [address] = await web3.eth.getAccounts()
	return empty
	// @ts-ignore
		.deploy({ data: bytecode, arguments: [] })
		.send({ from: address, gas: "1000000" })
}

const bytecode = "0x608060405234801561001057600080fd5b506102db806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806311a5e4091461005c5780631626ba7e146100995780631ce30181146101915780639890cdca146101ce578063a85a89f81461020b575b600080fd5b61006461023b565b60405180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b61015c600480360360408110156100af57600080fd5b8101908080359060200190929190803590602001906401000000008111156100d657600080fd5b8201836020820111156100e857600080fd5b8035906020019184600183028401116401000000008311171561010a57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610246565b60405180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b610199610276565b60405180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b6101d661027e565b60405180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b6102396004803603602081101561022157600080fd5b81019080803515159060200190929190505050610289565b005b63fb855dc960e01b81565b60008060009054906101000a900460ff1661026557600060e01b61026e565b631626ba7e60e01b5b905092915050565b600060e01b81565b631626ba7e60e01b81565b806000806101000a81548160ff0219169083151502179055505056fea264697066735822122042b07029b7a1f3062d62f3340aea67ba4152306106e84f9322f8258d9fba0cde64736f6c63430007060033"
const testABI = [
	{
		"inputs": [],
		"name": "ERC1271_INTERFACE_ID",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "ERC1271_RETURN_INVALID_SIGNATURE",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [],
		"name": "ERC1271_RETURN_VALID_SIGNATURE",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "value",
				"type": "bool",
			},
		],
		"name": "setReturnSuccessfulValidSignature",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function",
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_hash",
				"type": "bytes32",
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes",
			},
		],
		"name": "isValidSignature",
		"outputs": [
			{
				"internalType": "bytes4",
				"name": "",
				"type": "bytes4",
			},
		],
		"stateMutability": "view",
		"type": "function",
	},
] as const
