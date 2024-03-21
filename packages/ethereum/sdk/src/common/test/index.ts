import {
	getPromiEventConfirmationPromise,
	getPromiEventHashPromise,
} from "@rarible/web3-v4-ethereum/build/utils/to-promises"
import type { Web3EthContractTypes, Web3Types } from "@rarible/web3-v4-ethereum"

export async function sentTx(source: BoundType, options: Web3EthContractTypes.PayableTxOptions): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	return getPromiEventHashPromise(event)
}

export type ContractBoundMethod<
	Abi extends Web3Types.AbiFunctionFragment,
	Method extends Web3Types.ContractMethod<Abi> = Web3Types.ContractMethod<Abi>,
> = (
	...args: Method["Inputs"]
) => Method["Abi"]["stateMutability"] extends "payable" | "pure"
	? Web3EthContractTypes.PayableMethodObject<Method["Inputs"], Method["Outputs"]>
	: Web3EthContractTypes.NonPayableMethodObject<Method["Inputs"], Method["Outputs"]>

export type BoundType = ReturnType<ContractBoundMethod<any, any>>
export async function sentTxConfirm(
	source: BoundType, options: Web3EthContractTypes.PayableTxOptions
): Promise<string> {
	const event = source.send({ ...options, gas: "3000000" })
	return getPromiEventConfirmationPromise(event)
}
