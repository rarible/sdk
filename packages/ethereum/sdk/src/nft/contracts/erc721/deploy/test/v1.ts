import type Web3 from "web3"
import type { Contract } from "web3-eth-contract"
import { erc721v1Abi } from "../../v1"
import { erc721v1MintableTokenBytecode } from "./bytecodes"

export async function deployErc721V1(web3: Web3, name: string, symbol: string): Promise<Contract> {
	const empty = new web3.eth.Contract(erc721v1Abi)
	const [address] = await web3.eth.getAccounts()
	const deploy = await empty.deploy({
		data: erc721v1MintableTokenBytecode,
		arguments: [
			name,
			symbol,
			"https://api-test.rarible.com/contractMetadata/{address}",
			"ipfs:/",
			"0x002ed05478c75974e08f0811517aa0e3eddc1380",
		],
	})
	return deploy.send({ from: address, gas: 4000000, gasPrice: "0" })
}
