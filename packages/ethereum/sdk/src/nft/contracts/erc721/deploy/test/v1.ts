import type { Web3 } from "@rarible/web3-v4-ethereum"
import { erc721v1Abi } from "../../v1"
import { NumberDataFormat } from "../../../../../common/contracts"
import { erc721v1MintableTokenBytecode } from "./bytecodes"

export async function deployErc721V1(web3: Web3, name: string, symbol: string) {
	const empty = new web3.eth.Contract(erc721v1Abi, {}, NumberDataFormat)
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
	return deploy.send({ from: address, gas: "4000000" })
}
