import type { EVMAddress } from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { BigNumberValue } from "@rarible/utils"
import type { BigNumber, Maybe } from "@rarible/types"
import { toBn } from "@rarible/utils/build/bn"
import type { SendFunction } from "../common/send-transaction"
import { createErc20Contract } from "./contracts/erc20"

const infiniteBn = toBn(2).pow(256).minus(1)

export async function approveErc20(
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  contract: EVMAddress,
  owner: EVMAddress,
  operator: EVMAddress,
  value: BigNumber | BigNumberValue,
  infinite: boolean = true,
): Promise<EthereumTransaction | undefined> {
  if (!ethereum) {
    throw new Error("Wallet undefined")
  }
  const erc20 = createErc20Contract(ethereum, contract)
  const allowance = toBn(await erc20.functionCall("allowance", owner, operator).call())
  const bnValue = toBn(value)
  if (allowance.lt(bnValue)) {
    if (!infinite) {
      return send(erc20.functionCall("approve", operator, bnValue.toFixed()))
    } else {
      return send(erc20.functionCall("approve", operator, infiniteBn.toFixed()))
    }
  } else {
    return undefined
  }
}
