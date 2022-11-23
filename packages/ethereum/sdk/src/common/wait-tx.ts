import type { EthereumTransaction } from "@rarible/ethereum-provider"

export async function waitTx(tx: Promise<EthereumTransaction | undefined>) {
	const awaited = await tx
	if (awaited !== undefined) {
		await awaited.wait()
	}
}
