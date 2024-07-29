import type { ItemId, UnionAddress } from "@rarible/types"
import type { TezosProvider } from "@rarible/tezos-sdk"
import { handleFetchErrorResponse, NetworkError } from "@rarible/logger/build"
import type { CanTransferResult } from "../../../types/nft/restriction/domain"
import type { MaybeProvider } from "../common"
import { convertUnionAddress, getRequiredProvider, getTezosItemData } from "../common"
import { NetworkErrorCode } from "../../../common/apis"

export class TezosCanTransfer {
  constructor(private provider: MaybeProvider<TezosProvider>) {
    this.canTransfer = this.canTransfer.bind(this)
  }

  async canTransfer(itemId: ItemId, from: UnionAddress, to: UnionAddress): Promise<CanTransferResult> {
    const provider = getRequiredProvider(this.provider)
    const { tokenId, contract } = getTezosItemData(itemId)
    const body = {
      chain_id: this.provider.config.chain_id,
      contract: contract,
      entrypoint: "can_transfer",
      gas: "100000",
      input: {
        prim: "Pair",
        args: [
          { int: tokenId },
          {
            prim: "Pair",
            args: [{ string: convertUnionAddress(from) }, { string: convertUnionAddress(to) }],
          },
        ],
      },
      payer: convertUnionAddress(from),
      source: this.provider.config.transfer_proxy,
      unparsing_mode: "Readable",
    }
    const initParams = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
    const fetchUrl = `${provider.tezos.tk.rpc.getRpcUrl()}/chains/main/blocks/head/helpers/scripts/run_view`
    let response
    try {
      response = await window.fetch(fetchUrl, initParams)
    } catch (e) {
      throw new NetworkError({
        url: fetchUrl,
        data: (e as Error).message,
        code: NetworkErrorCode.TEZOS_EXTERNAL_ERR,
      })
    }
    await handleFetchErrorResponse(response, {
      requestInit: initParams,
      code: NetworkErrorCode.TEZOS_EXTERNAL_ERR,
    })
    const result: CheckResponse = await response.json()
    if (result.data.string === "") {
      return { success: true }
    }
    return { success: false, reason: getReasonMessage(result.data.string) }
  }
}

const REASONS_MESSAGES: Record<string, string> = {
  ARCHETYPE_QUOTA_REACHED:
    "You have reached the maximum amount of Digits you can own of this Edition, " +
    "please visit [quartz.ubisoft.com](https://quartz.ubisoft.com) for more information.",
  TO_RESTRICTED:
    "You can't trade this Digit at the moment, please visit " +
    "[quartz.ubisoft.com](https://quartz.ubisoft.com) for more information.",
}

function getReasonMessage(code: ERROR_CODE | string): string {
  if (!(code in REASONS_MESSAGES)) {
    return REASONS_MESSAGES["TO_RESTRICTED"]
  }
  return REASONS_MESSAGES[code]
}

type ERROR_CODE =
  | "FROM_RESTRICTED"
  | "TO_RESTRICTED"
  | "TO_NOT_ALLOWED"
  | "BAD_TOKEN_ID"
  | "ARCHETYPE_QUOTA_REACHED"
  | "ARCHOWNER_NOT_SET"
  | "ARCHLEDGER_NOT_SET"
  | "WHITELIST_ERROR"
type CheckResponse = {
  data: { string: "" | ERROR_CODE }
}
