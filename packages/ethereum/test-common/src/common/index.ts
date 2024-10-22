import { FMT_BYTES, FMT_NUMBER } from "web3-types"
import { deepReplaceBigInt } from "@rarible/sdk-common"

export const DEFAULT_DATA_TYPE = { number: FMT_NUMBER.STR, bytes: FMT_BYTES.HEX } as const
export const NumberDataFormat = { number: FMT_NUMBER.NUMBER, bytes: FMT_BYTES.HEX } as const

export function replaceBigintInCallMethods(methods: any) {
  return Object.entries(methods).reduce((acc, [methodName, method]) => {
    // @ts-ignore
    acc[methodName] = (...args) => {
      // @ts-ignore
      const methodResponse = method(...args)
      return {
        ...methodResponse,
        // @ts-ignore
        call: async (...callArgs) => {
          // @ts-ignore
          const callResult = await methodResponse.call(...callArgs)
          return deepReplaceBigInt(callResult)
        },
      }
    }
    return acc
  }, {})
}

export function replaceBigIntInContract(contract: any) {
  const updatedMethods = replaceBigintInCallMethods(contract.methods)

  return new Proxy(contract, {
    get(target, prop, receiver) {
      //for fixing bigint in <*.methods.fn.call()>
      if (prop === "methods") {
        return updatedMethods
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}
