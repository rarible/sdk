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
	expect(signature).toBe("0x3fe4fa104fface8c7c587d306b97c902ff54554d6d8155c136fbf97ffafa4b7a2193ddc2dea38bff53da6cf67f9a3b207a54de934e0d706508359d9690d165c81c")
	const result = sigUtil.recoverTypedSignature_v4({
		data,
		sig: signature,
	})
	expect(result).toEqual(toAddress(from))
}

export function recover(data: any, sig: any) {
	return sigUtil.recoverTypedSignature_v4({
		data,
		sig,
	})
}
