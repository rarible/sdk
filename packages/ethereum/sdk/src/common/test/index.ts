import {
	getPromiEventConfirmationPromise,
	getPromiEventHashPromise,
} from "@rarible/web3-v4-ethereum/build/utils/to-promises"


export async function sentTx(source: any, options: any): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	return getPromiEventHashPromise(event)
}

export async function sentTxConfirm(source: any, options: any): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	return getPromiEventConfirmationPromise(event)
}
