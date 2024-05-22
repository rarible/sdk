import type { MessageTypes, TypedMessage } from "./domain"
import { SignTypedDataMethodEnum } from "./domain"
import { BiconomyMiddlewareError } from "./errors"

export type SendFunction = (method: string, params: any) => Promise<any>

export async function signTypedData<T extends MessageTypes>(
  send: SendFunction,
  signer: string,
  data: TypedMessage<T>,
): Promise<string> {
  try {
    console.log("v4", signer, JSON.stringify(data))
    return await send(SignTypedDataMethodEnum.V4, [signer, JSON.stringify(data)])
  } catch (error) {
    console.error("got error white executing sign typed data v4", error)
    filterErrors(error)
    try {
      console.log("v3", signer, JSON.stringify(data))
      return await send(SignTypedDataMethodEnum.V3, [signer, JSON.stringify(data)])
    } catch (error) {
      console.error("got error white executing sign typed data v3", error)
      filterErrors(error)
      try {
        return await send(SignTypedDataMethodEnum.DEFAULT, [signer, data])
      } catch (e: any) {
        throw new BiconomyMiddlewareError({
          message: e?.message,
          error: e,
          data: {
            signer,
            data,
          },
        })
      }
    }
  }
}

/*
	4900 - wallet is disconnected
	4001 - user cancelled request
	4901 - chain is not connected
	4100 - not authorized in wallet
*/

function filterErrors(original: unknown) {
  if (hasCode(original)) {
    if ([4900, 4001, 4901, 4100].includes(original.code)) {
      throw original
    }
  }
}

function hasCode(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error
}
