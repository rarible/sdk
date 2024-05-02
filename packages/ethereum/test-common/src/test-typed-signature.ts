import type { Ethereum } from "@rarible/ethereum-provider"
import type { MessageTypes } from "@rarible/ethereum-provider/build/domain"
import { toAddress } from "@rarible/types"
import * as sigUtil from "eth-sig-util"

export async function testTypedSignature(eth: Ethereum) {
	const from = await eth.getFrom()
	const domain = {
		name: "Ether Mail",
		version: "1",
		chainId: 300500,
		verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
	}
	const types = {
		Person: [
			{ name: "name", type: "string" },
			{ name: "wallet", type: "address" },
		],
		Mail: [
			{ name: "from", type: "Person" },
			{ name: "to", type: "Person" },
			{ name: "contents", type: "string" },
		],
		EIP712Domain: [
			{ type: "string", name: "name" },
			{ type: "string", name: "version" },
			{ type: "uint256", name: "chainId" },
			{ type: "address", name: "verifyingContract" },
		],
	}
	const message = {
		from: {
			name: "Cow",
			wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
		},
		to: {
			name: "Bob",
			wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
		},
		contents: "Hello, Bob!",
	}
	const data: sigUtil.TypedMessage<MessageTypes> = {
		primaryType: "Mail",
		domain,
		types,
		message,
	}
	const signature = await eth.signTypedData(data)
	const result = sigUtil.recoverTypedSignature_v4({
		data,
		sig: signature,
	})
	expect(result).toEqual(toAddress(from))
}
