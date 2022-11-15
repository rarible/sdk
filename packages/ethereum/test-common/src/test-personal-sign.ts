import * as ethSigUtil from "eth-sig-util"
import type { Ethereum } from "@rarible/ethereum-provider"

export async function testPersonalSign(ethereum: Ethereum) {
	const account = await ethereum.getFrom()
	const message = "test message"
	const signature = await ethereum.personalSign(message)
	const recovered = ethSigUtil.recoverPersonalSignature({ sig: signature, data: message })
	expect(account.toLowerCase()).toBe(recovered.toLowerCase())
}
