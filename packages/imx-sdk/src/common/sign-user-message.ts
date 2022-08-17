import type { Link } from "@imtbl/imx-sdk"

export async function signPersonalMessage(link: Link, address: string, message: string) {
	const signature = await link.sign({
		message,
		description: message,
	})
	return {
		signature: signature.result,
		publicKey: address,
	}
}
