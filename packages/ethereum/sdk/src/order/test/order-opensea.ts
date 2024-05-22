import type { Asset } from "@rarible/ethereum-api-client"
import {
  OrderOpenSeaV1DataV1FeeMethod,
  OrderOpenSeaV1DataV1HowToCall,
  OrderOpenSeaV1DataV1SaleKind,
  OrderOpenSeaV1DataV1Side,
} from "@rarible/ethereum-api-client"
import { toAddress, toBigNumber, toBinary, toWord, ZERO_ADDRESS } from "@rarible/types"
import type { Ethereum } from "@rarible/ethereum-provider"
import axios from "axios"
import { keccak256 } from "ethereumjs-util"
import type { OpenSeaOrderDTO } from "../fill-order/open-sea-types"
import type { SimpleOpenSeaV1Order } from "../types"
import { convertOpenSeaOrderToDTO } from "../fill-order/open-sea-converter"
import type { ConsiderationInputItem, CreateInputItem } from "../fill-order/seaport-utils/types"
import { createOrder } from "../fill-order/seaport-utils/create-order"
import type { SendFunction } from "../../common/send-transaction"
import { CROSS_CHAIN_SEAPORT_V1_5_ADDRESS } from "../fill-order/seaport-utils/constants"

function getRandomTokenId(): string {
  return Math.floor(Math.random() * 300000000).toString()
}

export function getAssetTypeBlank(assetClass: string): Asset {
  switch (assetClass) {
    case "ETH": {
      return {
        assetType: {
          assetClass: "ETH",
        },
        value: toBigNumber("100"),
      }
    }
    case "ERC20": {
      return {
        assetType: {
          assetClass: "ERC20",
          contract: toAddress(ZERO_ADDRESS),
        },
        value: toBigNumber("100"),
      }
    }
    case "ERC721": {
      return {
        assetType: {
          assetClass: "ERC721",
          contract: toAddress(ZERO_ADDRESS),
          tokenId: toBigNumber(getRandomTokenId()),
        },
        value: toBigNumber("1"),
      }
    }
    case "ERC1155": {
      return {
        assetType: {
          assetClass: "ERC1155",
          contract: toAddress(ZERO_ADDRESS),
          tokenId: toBigNumber(getRandomTokenId()),
        },
        value: toBigNumber("100"),
      }
    }
    default:
      throw new Error("Unrecognized asset type")
  }
}

export const OPENSEA_ORDER_TEMPLATE: Omit<SimpleOpenSeaV1Order, "make" | "take"> = {
  maker: toAddress(ZERO_ADDRESS),
  salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
  type: "OPEN_SEA_V1",
  start: 0,
  end: 0,
  data: {
    dataType: "OPEN_SEA_V1_DATA_V1",
    exchange: toAddress(ZERO_ADDRESS),
    makerRelayerFee: toBigNumber("0"),
    takerRelayerFee: toBigNumber("0"),
    makerProtocolFee: toBigNumber("0"),
    takerProtocolFee: toBigNumber("0"),
    feeRecipient: toAddress(ZERO_ADDRESS),
    feeMethod: OrderOpenSeaV1DataV1FeeMethod.SPLIT_FEE,
    side: OrderOpenSeaV1DataV1Side.SELL,
    saleKind: OrderOpenSeaV1DataV1SaleKind.FIXED_PRICE,
    howToCall: OrderOpenSeaV1DataV1HowToCall.CALL,
    callData: toBinary("0x"),
    replacementPattern: toBinary("0x"),
    staticTarget: ZERO_ADDRESS,
    staticExtraData: toBinary("0x"),
    extra: toBigNumber("0"),
  },
}

export type TestAssetClass = "ETH" | "ERC20" | "ERC721" | "ERC1155"

export function getOrderTemplate(
  makeAsset: TestAssetClass,
  takeAsset: TestAssetClass,
  side: OrderOpenSeaV1DataV1Side,
): SimpleOpenSeaV1Order {
  return {
    ...OPENSEA_ORDER_TEMPLATE,
    make: getAssetTypeBlank(makeAsset),
    take: getAssetTypeBlank(takeAsset),
    data: {
      ...OPENSEA_ORDER_TEMPLATE.data,
      callData: toBinary(
        "0xf242432a00000000000000000000000000d5cbc289e4b66a6252949d6eb6ebbb12df24ab00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000",
      ),
      replacementPattern: toBinary(
        "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ),
      side,
    },
  }
}

//TODO replace web3.eth.sign
export async function getOrderSignature(ethereum: Ethereum, order: SimpleOpenSeaV1Order): Promise<string> {
  const web3: any = (ethereum as any)["config"].web3
  const from = await ethereum.getFrom()
  // return ethereum.ethSign(hashOpenSeaV1Order(ethereum, order))
  return web3.eth.sign(hashOpenSeaV1Order(ethereum, order), from)
}

export function hashOrder(ethereum: Ethereum, order: OpenSeaOrderDTO): string {
  const dataForEncoding = [
    {
      value: order.exchange,
      type: "address",
    },
    {
      value: order.maker,
      type: "address",
    },
    {
      value: order.taker,
      type: "address",
    },
    {
      value: order.makerRelayerFee,
      type: "uint",
    },
    {
      value: order.takerRelayerFee,
      type: "uint",
    },
    {
      value: order.makerProtocolFee,
      type: "uint",
    },
    {
      value: order.takerProtocolFee,
      type: "uint",
    },
    {
      value: order.feeRecipient,
      type: "address",
    },
    {
      value: order.feeMethod,
      type: "uint8",
    },
    {
      value: order.side,
      type: "uint8",
    },
    {
      value: order.saleKind,
      type: "uint8",
    },
    {
      value: order.target,
      type: "address",
    },
    {
      value: order.howToCall,
      type: "uint8",
    },
    {
      value: order.calldata,
      type: "bytes",
    },
    {
      value: order.replacementPattern,
      type: "bytes",
    },
    {
      value: order.staticTarget,
      type: "address",
    },
    {
      value: order.staticExtradata,
      type: "bytes",
    },
    {
      value: order.paymentToken,
      type: "address",
    },
    {
      value: order.basePrice,
      type: "uint",
    },
    {
      value: order.extra,
      type: "uint",
    },
    {
      value: order.listingTime,
      type: "uint",
    },
    {
      value: order.expirationTime,
      type: "uint",
    },
    {
      value: order.salt,
      type: "uint",
    },
  ]
  const web3 = (ethereum as any)["config"].web3
  const packed = web3.utils.encodePacked(...dataForEncoding)
  return `0x${keccak256(Buffer.from(packed.substring(2), "hex")).toString("hex")}`
}

export function hashToSign(ethereum: Ethereum, hash: string): string {
  const web3 = (ethereum as any)["config"].web3
  const packed = web3.utils.encodePacked(
    {
      type: "string",
      value: "\x19Ethereum Signed Message:\n32",
    },
    {
      type: "bytes32",
      value: hash,
    },
  )
  return `0x${keccak256(Buffer.from(packed.substring(2), "hex")).toString("hex")}`
}

export function hashOpenSeaV1Order(ethereum: Ethereum, order: SimpleOpenSeaV1Order): string {
  return hashOrder(ethereum, convertOpenSeaOrderToDTO(ethereum, order))
}

export async function createSeaportOrder(
  provider: Ethereum,
  send: SendFunction,
  make: CreateInputItem,
  take: ConsiderationInputItem[],
) {
  const endTime = getMaxOrderExpirationTimestamp().toString()
  const createdOrder = await createOrder(provider, {
    send,
    offer: [make],
    consideration: take,
    startTime: undefined,
    endTime,
    //goerli
    zone: "0x0000000000000000000000000000000000000000",
    restrictedByZone: false,
    allowPartialFills: true,
  })

  let orderHash = ""
  try {
    const { data } = await axios.post("https://testnets-api.opensea.io/v2/orders/goerli/seaport/listings", {
      ...createdOrder,
      protocol_address: CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
    })
    orderHash = data.order.order_hash
  } catch (e: any) {
    console.log(JSON.stringify(e?.response?.data, null, "	"))
    throw e
  }
  return orderHash
}

export const getMaxOrderExpirationTimestamp = () => {
  const maxExpirationDate = new Date()

  maxExpirationDate.setMonth(maxExpirationDate.getMonth() + 1)
  maxExpirationDate.setDate(maxExpirationDate.getDate() - 1)

  return Math.round(maxExpirationDate.getTime() / 1000)
}
