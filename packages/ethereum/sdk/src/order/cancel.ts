import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address, CryptoPunksAssetType } from "@rarible/ethereum-api-client"
import type { Maybe } from "@rarible/types/build/maybe"
import { toAddress, toBigNumber } from "@rarible/types"
import type { ExchangeAddresses } from "../config/type"
import { toVrs } from "../common/to-vrs"
import { createCryptoPunksMarketContract } from "../nft/contracts/cryptoPunks"
import type { SendFunction } from "../common/send-transaction"
import type { RaribleEthereumApis } from "../common/apis"
import { getRequiredWallet } from "../common/get-required-wallet"
import type { GetConfigByChainId } from "../config"
import { createExchangeV1Contract } from "./contracts/exchange-v1"
import { createExchangeV2Contract } from "./contracts/exchange-v2"
import { createOpenseaContract } from "./contracts/exchange-opensea-v1"
import { toStructLegacyOrderKey } from "./fill-order/rarible-v1"
import { getAtomicMatchArgAddresses, getAtomicMatchArgUints } from "./fill-order/open-sea"
import type {
  SimpleCryptoPunkOrder,
  SimpleLegacyOrder,
  SimpleLooksrareOrder,
  SimpleLooksrareV2Order,
  SimpleOpenSeaV1Order,
  SimpleOrder,
  SimpleRaribleV2Order,
  SimpleSeaportV1Order,
  SimpleX2Y2Order,
} from "./types"
import { orderToStruct } from "./sign-order"
import { convertOpenSeaOrderToDTO } from "./fill-order/open-sea-converter"
import type { CheckLazyOrderPart } from "./check-lazy-order"
import { convertAPIOrderToSeaport } from "./fill-order/seaport-utils/convert-to-seaport-order"
import { createLooksrareExchange } from "./contracts/looksrare-exchange"
import { createX2Y2Contract } from "./contracts/exchange-x2y2-v1"
import { getSeaportContract } from "./fill-order/seaport-utils/seaport-utils"
import { createLooksrareV2Exchange } from "./contracts/looksrare-v2"

export async function cancel(
  checkLazyOrder: (form: CheckLazyOrderPart) => Promise<CheckLazyOrderPart>,
  ethereum: Maybe<Ethereum>,
  send: SendFunction,
  getConfig: GetConfigByChainId,
  getApis: () => Promise<RaribleEthereumApis>,
  orderToCheck: SimpleOrder,
): Promise<EthereumTransaction> {
  const config = await getConfig()
  const apis = await getApis()

  if (ethereum) {
    const order = (await checkLazyOrder(orderToCheck)) as SimpleOrder
    switch (order.type) {
      case "RARIBLE_V1":
        return cancelLegacyOrder(ethereum, send, config.exchange.v1, order)
      case "RARIBLE_V2":
        return cancelV2Order(ethereum, send, config.exchange.v2, order)
      case "OPEN_SEA_V1":
        return cancelOpenseaOrderV1(ethereum, send, order)
      case "SEAPORT_V1":
        return cancelSeaportOrder(ethereum, send, apis, order)
      case "LOOKSRARE":
        return cancelLooksRareOrder(ethereum, send, config.exchange, order)
      case "LOOKSRARE_V2":
        return cancelLooksRareV2Order(ethereum, send, config.exchange, order)
      case "CRYPTO_PUNK":
        return cancelCryptoPunksOrder(ethereum, send, order)
      case "X2Y2":
        return cancelX2Y2Order(ethereum, send, apis, config.exchange.x2y2, order)
      default:
        throw new Error(`Unsupported order: ${JSON.stringify(order)}`)
    }
  }
  throw new Error("Wallet undefined")
}

async function cancelLegacyOrder(ethereum: Ethereum, send: SendFunction, contract: Address, order: SimpleLegacyOrder) {
  const v1 = createExchangeV1Contract(ethereum, contract)
  return send(v1.functionCall("cancel", toStructLegacyOrderKey(order)))
}

async function cancelV2Order(ethereum: Ethereum, send: SendFunction, contract: Address, order: SimpleRaribleV2Order) {
  const v2 = createExchangeV2Contract(ethereum, contract)
  return send(v2.functionCall("cancel", orderToStruct(ethereum, order)))
}

export function cancelOpenseaOrderV1(ethereum: Ethereum, send: SendFunction, order: SimpleOpenSeaV1Order) {
  const exchangeContract = createOpenseaContract(ethereum, order.data.exchange)

  const dto = convertOpenSeaOrderToDTO(ethereum, order)
  const makerVRS = toVrs(order.signature || "0x")

  return send(
    exchangeContract.functionCall(
      "cancelOrder_",
      getAtomicMatchArgAddresses(dto),
      getAtomicMatchArgUints(dto),
      dto.feeMethod,
      dto.side,
      dto.saleKind,
      dto.howToCall,
      dto.calldata,
      dto.replacementPattern,
      dto.staticExtradata,
      makerVRS.v,
      makerVRS.r,
      makerVRS.s,
    ),
  )
}

export async function cancelX2Y2Order(
  ethereum: Ethereum,
  send: SendFunction,
  apis: RaribleEthereumApis,
  contract: Address,
  order: SimpleX2Y2Order,
) {
  function decodeCancelInput(input: string) {
    return ethereum.decodeParameter(
      {
        components: [
          {
            name: "itemHashes",
            type: "bytes32[]",
          },
          {
            name: "deadline",
            type: "uint256",
          },
          {
            name: "v",
            type: "uint8",
          },
          {
            name: "r",
            type: "bytes32",
          },
          {
            name: "s",
            type: "bytes32",
          },
        ],
        name: "data",
        type: "tuple",
      },
      input,
    )[0] as {
      itemHashes: string[]
      deadline: string
      // signature
      r: string
      s: string
      v: number
    }
  }

  const OP_CANCEL_OFFER = toBigNumber("3")
  const exchangeContract = createX2Y2Contract(ethereum, contract)

  const signMessage = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
  const cancelInput = decodeCancelInput(
    (
      await apis.orderSignature.cancelSignX2Y2({
        x2Y2GetCancelInputRequest: {
          orderId: order.data.orderId,
          op: OP_CANCEL_OFFER,
          caller: await ethereum.getFrom(),
          sign: await ethereum.personalSign(signMessage),
          signMessage: signMessage,
        },
      })
    ).input,
  )

  return send(
    exchangeContract.functionCall(
      "cancel",
      cancelInput.itemHashes,
      cancelInput.deadline,
      cancelInput.v,
      cancelInput.r,
      cancelInput.s,
    ),
  )
}

export function cancelCryptoPunksOrder(ethereum: Ethereum, send: SendFunction, order: SimpleCryptoPunkOrder) {
  if (order.make.assetType.assetClass === "CRYPTO_PUNKS") {
    return cancelCryptoPunkOrderByAsset(ethereum, send, "punkNoLongerForSale", order.make.assetType)
  } else if (order.take.assetType.assetClass === "CRYPTO_PUNKS") {
    return cancelCryptoPunkOrderByAsset(ethereum, send, "withdrawBidForPunk", order.take.assetType)
  } else {
    throw new Error("Crypto punks asset has not been found")
  }
}

export function cancelCryptoPunkOrderByAsset(
  ethereum: Ethereum,
  send: SendFunction,
  methodName: string,
  assetType: CryptoPunksAssetType,
) {
  const ethContract = createCryptoPunksMarketContract(ethereum, assetType.contract)
  return send(ethContract.functionCall(methodName, assetType.tokenId))
}

export async function cancelSeaportOrder(
  ethereum: Ethereum,
  send: SendFunction,
  apis: RaribleEthereumApis,
  order: SimpleSeaportV1Order,
) {
  if (!order.signature || order.signature === "0x") {
    const { signature } = await apis.orderSignature.getSeaportOrderSignature({
      hash: order.hash,
    })
    order.signature = signature
  }
  const orderParams = convertAPIOrderToSeaport(order).parameters
  const seaport = getSeaportContract(ethereum, toAddress(order.data.protocol))
  return send(seaport.functionCall("cancel", [orderParams]))
}

export async function cancelLooksRareOrder(
  ethereum: Ethereum,
  send: SendFunction,
  config: ExchangeAddresses,
  order: SimpleLooksrareOrder,
) {
  const provider = getRequiredWallet(ethereum)

  if (!config.looksrare) {
    throw new Error("Looksrare contract did not specified")
  }

  const contract = createLooksrareExchange(provider, config.looksrare)

  return send(contract.functionCall("cancelMultipleMakerOrders", [order.data.nonce]))
}

export async function cancelLooksRareV2Order(
  ethereum: Ethereum,
  send: SendFunction,
  config: ExchangeAddresses,
  order: SimpleLooksrareV2Order,
) {
  const provider = getRequiredWallet(ethereum)

  if (!config.looksrareV2) {
    throw new Error("Looksrare contract did not specified")
  }

  const contract = createLooksrareV2Exchange(provider, config.looksrareV2)

  return send(contract.functionCall("cancelOrderNonces", [order.data.orderNonce]))
}
