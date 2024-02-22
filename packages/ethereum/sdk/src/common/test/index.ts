import type { PayableTxOptions } from "web3-eth-contract/lib/types"
import type { AbiFunctionFragment, ContractMethod } from "web3-types"
import type { NonPayableMethodObject, PayableMethodObject } from "web3-eth-contract/lib/types"
import {
	getPromiEventConfirmationPromise,
	getPromiEventHashPromise,
} from "@rarible/web3-v4-ethereum/build/utils/to-promises"

export async function sentTx(source: BoundType, options: PayableTxOptions): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	// return waitForHash(event)
	return getPromiEventHashPromise(event)
}

export type ContractBoundMethod<
	Abi extends AbiFunctionFragment,
	Method extends ContractMethod<Abi> = ContractMethod<Abi>,
> = (
	...args: Method["Inputs"]
) => Method["Abi"]["stateMutability"] extends "payable" | "pure"
	? PayableMethodObject<Method["Inputs"], Method["Outputs"]>
	: NonPayableMethodObject<Method["Inputs"], Method["Outputs"]>

export type BoundType = ReturnType<ContractBoundMethod<any, any>>
export async function sentTxConfirm(source: BoundType, options: PayableTxOptions): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	// return waitForConfirmation(event)
	return getPromiEventConfirmationPromise(event)
}
