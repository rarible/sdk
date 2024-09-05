import type { OrderData, Part } from "@rarible/ethereum-api-client"
import type { Ethereum } from "@rarible/ethereum-provider"
import type { BigNumber } from "@rarible/types"
import { toBigNumber, toWord } from "@rarible/types"

const ZERO_WORD = toWord("0x0000000000000000000000000000000000000000000000000000000000000000")

/**
 * Function encoded Part struct to single uint256
 * @param part
 */
export function encodePartToBuffer(part: Part | undefined): BigNumber {
  if (!part) {
    return toBigNumber(ZERO_WORD)
  }

  const value = part.value.toString(16)
  let account: string = part.account
  if (account.startsWith("0x")) {
    account = account.substring(2)
  }
  return toBigNumber("0x" + value.padStart(12, "0") + account)
}

export function encodeRaribleV2OrderData(
  ethereum: Ethereum,
  data: OrderData,
  wrongEncode: Boolean = false,
): [string, string] {
  switch (data.dataType) {
    case "RARIBLE_V2_DATA_V3": {
      const encoded = ethereum.encodeParameter(DATA_V3_TYPE, {
        payouts: data.payouts,
        originFees: data.originFees,
        isMakeFill: data.isMakeFill,
      })
      return ["0x4ade54ca", encoded]
    }
    case "RARIBLE_V2_DATA_V2": {
      const encoded = ethereum.encodeParameter(DATA_V2_TYPE, {
        payouts: data.payouts,
        originFees: data.originFees,
        isMakeFill: data.isMakeFill,
      })
      return ["0x23d235ef", encoded]
    }
    case "RARIBLE_V2_DATA_V1": {
      const encoded = ethereum.encodeParameter(DATA_V1_TYPE, {
        payouts: data.payouts,
        originFees: data.originFees,
      })
      if (wrongEncode) {
        return ["0x4c234266", `0x${encoded.substring(66)}`]
      }
      return ["0x4c234266", encoded]
    }
    default: {
      throw new Error(`Data type not supported: ${data.dataType}`)
    }
  }
}

const DATA_V1_TYPE = {
  components: [
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "payouts",
      type: "tuple[]",
    },
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "originFees",
      type: "tuple[]",
    },
  ],
  name: "data",
  type: "tuple",
}

const DATA_V2_TYPE = {
  components: [
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "payouts",
      type: "tuple[]",
    },
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "originFees",
      type: "tuple[]",
    },
    {
      name: "isMakeFill",
      type: "bool",
    },
  ],
  name: "data",
  type: "tuple",
}

const DATA_V3_TYPE = {
  components: [
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "payouts",
      type: "tuple[]",
    },
    {
      components: [
        {
          name: "account",
          type: "address",
        },
        {
          name: "value",
          type: "uint96",
        },
      ],
      name: "originFees",
      type: "tuple[]",
    },
    {
      name: "isMakeFill",
      type: "bool",
    },
  ],
  name: "data",
  type: "tuple",
}
