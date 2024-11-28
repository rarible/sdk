import type { Address, Maybe, UnionAddress, Word } from "@rarible/types"
import {
  toEVMAddress,
  toBigNumber,
  toBinary,
  toCollectionId,
  toUnionContractAddress,
  toItemId,
  toOrderId,
  toUnionAddress,
  toWord,
} from "@rarible/types"
import { isRealBlockchainSpecified } from "@rarible/types"
import type {
  Asset,
  AssetType,
  Collection,
  CollectionId,
  Creator,
  ItemId,
  Order,
  OrderData,
  OrderId,
  UnionContractAddress,
} from "@rarible/api-client"
import { Blockchain } from "@rarible/api-client"
import type { ContractAddress } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { toBn } from "@rarible/utils"
import type {
  Asset as EthereumAsset,
  AssetType as EthereumAssetType,
  EVMAddress,
  Part,
} from "@rarible/ethereum-api-client"
import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { CommonFillRequestAssetType } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { NftAssetType } from "@rarible/protocol-ethereum-sdk/build/order/check-asset-type"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { EVMBlockchain } from "@rarible/sdk-common"
import { EVMBlockchains, isEVMBlockchain, WalletIsUndefinedError } from "@rarible/sdk-common/build"
import {
  getBlockchainBySDKNetwork,
  getBlockchainFromChainId,
  getNetworkFromChainId,
} from "@rarible/protocol-ethereum-sdk/build/common"
import type { Payout } from "@rarible/api-client/build/models/Payout"
import type { BlockchainIsh, SupportedBlockchain } from "@rarible/sdk-common"
import { extractBlockchain } from "@rarible/sdk-common"
import type { EthOrderDataLegacy, EthRaribleV2OrderData } from "@rarible/api-client/build/models/OrderData"
import type {
  EthCryptoPunksAssetType,
  EthErc1155AssetType,
  EthErc1155LazyAssetType,
  EthErc721AssetType,
  EthErc721LazyAssetType,
} from "@rarible/api-client/build/models/AssetType"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import type {
  OrderCryptoPunksData,
  OrderDataLegacy,
  OrderLooksRareDataV1,
  OrderLooksRareDataV2,
  OrderOpenSeaV1DataV1,
  OrderRaribleV2DataV1,
  OrderRaribleV2DataV2,
  OrderRaribleV2DataV3,
  OrderSudoSwapAmmDataV1,
  OrderX2Y2Data,
} from "@rarible/ethereum-api-client/build/models/OrderData"
import {
  OrderLooksRareDataV2QuoteType,
  OrderOpenSeaV1DataV1FeeMethod,
  OrderOpenSeaV1DataV1HowToCall,
  OrderOpenSeaV1DataV1SaleKind,
  OrderOpenSeaV1DataV1Side,
} from "@rarible/ethereum-api-client/build/models/OrderData"
import { SeaportOrderType } from "@rarible/ethereum-api-client/build/models/SeaportOrderType"
import { SeaportItemType } from "@rarible/ethereum-api-client/build/models/SeaportItemType"
import { SudoSwapCurveType } from "@rarible/ethereum-api-client/build/models/SudoSwapCurveType"
import { SudoSwapPoolType } from "@rarible/ethereum-api-client/build/models/SudoSwapPoolType"
import { getPrice } from "@rarible/protocol-ethereum-sdk/build/common/get-price"
import { convertDateToTimestamp } from "../../../common/get-expiration-date"
import type { CurrencyType, RequestCurrencyAssetType } from "../../../common/domain"
import type { FillRequest, PrepareFillRequest } from "../../../types/order/fill/domain"
import { OriginFeeSupport, PayoutsSupport } from "../../../types/order/fill/domain"
import type { OrderRequest, UnionPart } from "../../../types/order/common"

export type CreateEthereumCollectionResponse = {
  tx: EthereumTransaction
  address: Address
}

export function getEthTakeAssetType(currency: RequestCurrencyAssetType) {
  switch (currency["@type"]) {
    case "ERC20":
      return {
        assetClass: currency["@type"],
        contract: convertToEthereumAddress(currency.contract),
      }
    case "ETH":
      return {
        assetClass: currency["@type"],
      }
    default:
      throw new Error("Invalid take asset type")
  }
}

export async function convertToEthereumAsset(ethereum: Ethereum, asset: Asset): Promise<EthereumAsset> {
  const assetType = convertToEthereumAssetType(asset.type)
  let value = toBn(asset.value)
  if (asset.type["@type"] === "ERC20" || asset.type["@type"] === "ETH") {
    value = await getPrice(ethereum, assetType, value)
  }
  return {
    assetType,
    value: toBigNumber(value.toString()),
  }
}

export function convertToEthereumAssetType(assetType: AssetType): EthereumAssetType {
  switch (assetType["@type"]) {
    case "ETH": {
      return { assetClass: "ETH" }
    }
    case "ERC20": {
      return {
        assetClass: "ERC20",
        contract: convertToEthereumAddress(assetType.contract),
      }
    }
    case "ERC721": {
      return {
        assetClass: "ERC721",
        contract: convertToEthereumAddress(assetType.contract),
        tokenId: assetType.tokenId,
      }
    }
    case "ERC721_Lazy": {
      return {
        assetClass: "ERC721_LAZY",
        contract: convertToEthereumAddress(assetType.contract),
        tokenId: assetType.tokenId,
        uri: assetType.uri,
        creators: assetType.creators.map(c => ({
          account: convertToEthereumAddress(c.account),
          value: toBn(c.value).toNumber(),
        })),
        royalties: assetType.royalties.map(r => ({
          account: convertToEthereumAddress(r.account),
          value: toBn(r.value).toNumber(),
        })),
        signatures: assetType.signatures.map(str => toBinary(str)),
      }
    }
    case "ERC1155": {
      return {
        assetClass: "ERC1155",
        contract: convertToEthereumAddress(assetType.contract),
        tokenId: assetType.tokenId,
      }
    }
    case "ERC1155_Lazy": {
      return {
        assetClass: "ERC1155_LAZY",
        contract: convertToEthereumAddress(assetType.contract),
        tokenId: assetType.tokenId,
        uri: assetType.uri,
        supply: assetType.supply !== undefined ? toBigNumber(assetType.supply) : toBigNumber("1"),
        creators: assetType.creators.map(c => ({
          account: convertToEthereumAddress(c.account),
          value: toBn(c.value).toNumber(),
        })),
        royalties: assetType.royalties.map(r => ({
          account: convertToEthereumAddress(r.account),
          value: toBn(r.value).toNumber(),
        })),
        signatures: assetType.signatures.map(str => toBinary(str)),
      }
    }
    case "CRYPTO_PUNKS": {
      return {
        assetClass: "CRYPTO_PUNKS",
        contract: convertToEthereumAddress(assetType.contract),
        tokenId: assetType.tokenId,
      }
    }
    case "GEN_ART": {
      return {
        assetClass: "GEN_ART",
        contract: convertToEthereumAddress(assetType.contract),
      }
    }
    case "AMM_NFT": {
      return {
        assetClass: "AMM_NFT",
        contract: convertToEthereumAddress(assetType.contract),
      }
    }
    case "COLLECTION": {
      return {
        assetClass: "COLLECTION",
        contract: convertToEthereumAddress(assetType.contract),
      }
    }
    default: {
      throw new Error(`Unsupported asset type=${assetType["@type"]}`)
    }
  }
}

export function convertOrderDataToEth(data: OrderData): SimpleOrder["data"] {
  switch (data["@type"]) {
    case "ETH_RARIBLE_V1": {
      return {
        dataType: "LEGACY",
        fee: +data.fee,
      } as OrderDataLegacy
    }
    case "ETH_RARIBLE_V2": {
      return {
        dataType: "RARIBLE_V2_DATA_V1",
        payouts: toEthereumParts(data.payouts),
        originFees: toEthereumParts(data.originFees),
      } as OrderRaribleV2DataV1
    }
    case "ETH_RARIBLE_V2_2": {
      return {
        dataType: "RARIBLE_V2_DATA_V2",
        payouts: toEthereumParts(data.payouts),
        originFees: toEthereumParts(data.originFees),
        isMakeFill: data.isMakeFill,
      } as OrderRaribleV2DataV2
    }
    case "ETH_RARIBLE_V2_3": {
      return {
        dataType: "RARIBLE_V2_DATA_V3",
        payouts: toEthereumParts(data.payouts),
        originFees: toEthereumParts(data.originFees),
        isMakeFill: data.isMakeFill,
      } as OrderRaribleV2DataV3
    }
    case "ETH_OPEN_SEA_V1": {
      return {
        dataType: "OPEN_SEA_V1_DATA_V1",
        exchange: convertToEthereumAddress(data.exchange),
        makerRelayerFee: data.makerRelayerFee,
        takerRelayerFee: data.takerRelayerFee,
        makerProtocolFee: data.makerProtocolFee,
        takerProtocolFee: data.takerProtocolFee,
        feeRecipient: convertToEthereumAddress(data.feeRecipient),
        feeMethod: OrderOpenSeaV1DataV1FeeMethod[data.feeMethod],
        side: OrderOpenSeaV1DataV1Side[data.side],
        saleKind: OrderOpenSeaV1DataV1SaleKind[data.saleKind],
        howToCall: OrderOpenSeaV1DataV1HowToCall[data.howToCall],
        callData: data.callData,
        replacementPattern: data.replacementPattern,
        staticTarget: convertToEthereumAddress(data.staticTarget),
        staticExtraData: data.staticExtraData,
        extra: data.extra,
      } as OrderOpenSeaV1DataV1
    }
    case "ETH_BASIC_SEAPORT_DATA_V1": {
      return {
        dataType: "BASIC_SEAPORT_DATA_V1",
        protocol: convertToEthereumAddress(data.protocol),
        orderType: SeaportOrderType[data.orderType],
        offer: data.offer.map(offer => ({
          itemType: SeaportItemType[offer.itemType],
          token: convertToEthereumAddress(offer.token),
          identifierOrCriteria: offer.identifierOrCriteria,
          startAmount: offer.startAmount,
          endAmount: offer.endAmount,
        })),
        consideration: data.consideration.map(data => ({
          itemType: SeaportItemType[data.itemType],
          token: convertToEthereumAddress(data.token),
          identifierOrCriteria: data.identifierOrCriteria,
          startAmount: data.startAmount,
          endAmount: data.endAmount,
          recipient: convertToEthereumAddress(data.recipient),
        })),
        zone: convertToEthereumAddress(data.zone),
        zoneHash: toWord(data.zoneHash),
        conduitKey: toWord(data.conduitKey),
        counter: data.counter,
        nonce: data.nonce,
      }
    }
    case "ETH_CRYPTO_PUNKS": {
      return {
        dataType: "CRYPTO_PUNKS_DATA",
      } as OrderCryptoPunksData
    }
    case "ETH_X2Y2_ORDER_DATA_V1": {
      return {
        dataType: "X2Y2_DATA",
        itemHash: toWord(data.itemHash),
        isCollectionOffer: data.isCollectionOffer,
        isBundle: data.isBundle,
        side: data.side,
        orderId: data.orderId,
      } as OrderX2Y2Data
    }
    case "ETH_LOOKSRARE_ORDER_DATA_V1": {
      return {
        dataType: "LOOKSRARE_DATA_V1",
        minPercentageToAsk: data.minPercentageToAsk,
        strategy: convertToEthereumAddress(data.strategy),
        nonce: data.nonce,
        params: data.params && toBinary(data.params),
      } as OrderLooksRareDataV1
    }
    case "ETH_LOOKSRARE_ORDER_DATA_V2": {
      return {
        dataType: "LOOKSRARE_DATA_V2",
        quoteType: OrderLooksRareDataV2QuoteType[data.quoteType],
        globalNonce: data.globalNonce,
        orderNonce: data.orderNonce,
        subsetNonce: data.subsetNonce,
        strategyId: data.strategyId,
        additionalParameters: toBinary(data.strategyId),
        merkleRoot: data.merkleRoot && toBinary(data.merkleRoot),
        merkleProof: data.merkleProof,
      } as OrderLooksRareDataV2
    }
    case "ETH_SUDOSWAP_AMM_DATA_V1": {
      return {
        dataType: "SUDOSWAP_AMM_DATA_V1",
        poolAddress: convertToEthereumAddress(data.poolAddress),
        bondingCurve: convertToEthereumAddress(data.bondingCurve),
        curveType: SudoSwapCurveType[data.curveType],
        assetRecipient: convertToEthereumAddress(data.assetRecipient),
        poolType: SudoSwapPoolType[data.poolType],
        delta: data.delta,
        fee: data.fee,
        feeDecimal: data.feeDecimal,
      } as OrderSudoSwapAmmDataV1
    }
    default:
      throw new Error(`Unrecognized order data type: ${data["@type"]}`)
  }
}

export function getEthOrderType(data: OrderData): SimpleOrder["type"] {
  switch (data["@type"]) {
    case "ETH_RARIBLE_V1":
      return "RARIBLE_V1"
    case "ETH_RARIBLE_V2":
    case "ETH_RARIBLE_V2_2":
    case "ETH_RARIBLE_V2_3":
      return "RARIBLE_V2"
    case "ETH_OPEN_SEA_V1":
      return "OPEN_SEA_V1"
    case "ETH_BASIC_SEAPORT_DATA_V1":
      return "SEAPORT_V1"
    case "ETH_CRYPTO_PUNKS":
      return "CRYPTO_PUNK"
    case "ETH_X2Y2_ORDER_DATA_V1":
      return "X2Y2"
    case "ETH_LOOKSRARE_ORDER_DATA_V1":
      return "LOOKSRARE"
    case "ETH_LOOKSRARE_ORDER_DATA_V2":
      return "LOOKSRARE_V2"
    case "ETH_SUDOSWAP_AMM_DATA_V1":
      return "AMM"
    default:
      throw new Error(`Unrecognized order data type: ${data["@type"]}`)
  }
}

export async function getEthOrder(ethereum: Ethereum, order: Order): Promise<SimpleOrder> {
  return {
    hash: toWord(convertOrderIdToEthereumHash(order.id)),
    type: getEthOrderType(order.data),
    maker: convertToEthereumAddress(order.maker),
    make: await convertToEthereumAsset(ethereum, order.make),
    take: await convertToEthereumAsset(ethereum, order.take),
    taker: order.taker && convertToEthereumAddress(order.taker),
    salt: toWord(order.salt),
    start: order.startedAt && convertDateToTimestamp(new Date(order.startedAt)),
    end: order.endedAt && convertDateToTimestamp(new Date(order.endedAt)),
    signature: order.signature && toBinary(order.signature),
    data: convertOrderDataToEth(order.data),
  } as SimpleOrder
}

export function toEthereumParts(parts: UnionPart[] | Creator[] | undefined): Part[] {
  return parts?.map(part => convertEthereumPart(part)) || []
}

export function convertEthereumPart(part: UnionPart | Creator): Part {
  return {
    account: convertToEthereumAddress(part.account),
    value: part.value,
  }
}

export function getOriginFeesSum(originFees: Array<Part | Payout>): number {
  return originFees.reduce((prev, curr) => prev + curr.value, 0)
}

export function getOrderFeesSum(order: Order): number {
  switch (order.data["@type"]) {
    case "ETH_RARIBLE_V1":
      return +order.data.fee
    case "ETH_RARIBLE_V2":
    case "ETH_RARIBLE_V2_2":
    case "ETH_RARIBLE_V2_3":
      return getOriginFeesSum(order.data.originFees)
    default:
      throw new Error("Unexpected order dataType")
  }
}

export function isRaribleV1Data(data: OrderData): boolean {
  return data["@type"] === "ETH_RARIBLE_V1"
}
export function isRaribleV2Data(data: OrderData): boolean {
  return (
    data["@type"] === "ETH_RARIBLE_V2" || data["@type"] === "ETH_RARIBLE_V2_2" || data["@type"] === "ETH_RARIBLE_V2_3"
  )
}

export function convertOrderType(data: OrderData): "RARIBLE_V1" | "RARIBLE_V2" {
  if (isRaribleV1Data(data)) return "RARIBLE_V1"
  if (isRaribleV2Data(data)) return "RARIBLE_V2"
  throw new Error("Unknown order type " + data["@type"])
}

export function getOriginFeeSupport(data: OrderData): OriginFeeSupport {
  if (isRaribleV1Data(data)) {
    return OriginFeeSupport.AMOUNT_ONLY
  }
  if (isRaribleV2Data(data)) {
    return OriginFeeSupport.FULL
  }
  throw new Error("Unknown order type " + data["@type"])
}

export function getPayoutsSupport(data: OrderData): PayoutsSupport {
  if (isRaribleV1Data(data)) {
    return PayoutsSupport.SINGLE
  }
  if (isRaribleV2Data(data)) {
    return PayoutsSupport.MULTIPLE
  }
  throw new Error("Unknown order type " + data["@type"])
}

export function getEVMBlockchain(network: EthereumNetwork): EVMBlockchain {
  const blockchain = getBlockchainBySDKNetwork(network)
  if (!isEVMBlockchain(blockchain)) {
    throw new Error(`Network ${network} is not EVM compatible`)
  }
  return blockchain
}

export function extractEVMBlockchain(value: BlockchainIsh): EVMBlockchain {
  const blockchain = extractBlockchain(value)
  if (!isEVMBlockchain(blockchain)) {
    throw new Error(`Blockchain ${blockchain} is not EVM compatible`)
  }
  return blockchain
}

export function getSupportedCurrencies(
  blockchain: EVMBlockchain = Blockchain.ETHEREUM,
  forBids: boolean = false,
): CurrencyType[] {
  if (forBids) {
    return [{ blockchain, type: "ERC20" }]
  }
  return [
    { blockchain, type: "NATIVE" },
    { blockchain, type: "ERC20" },
  ]
}

export function convertToEthereumAddress(contractAddress: UnionAddress | ContractAddress | CollectionId): EVMAddress {
  if (!isRealBlockchainSpecified(contractAddress)) {
    throw new Error("Not a union or contract address: " + contractAddress)
  }

  const [blockchain, address] = contractAddress.split(":")
  if (!isEVMBlockchain(blockchain)) {
    throw new Error("Not an Ethereum address")
  }
  return toEVMAddress(address)
}

export function convertEthereumOrderHash(hash: Word, blockchain: EVMBlockchain): OrderId {
  return toOrderId(`${blockchain}:${hash}`)
}

export function convertOrderIdToEthereumHash(orderId: OrderId): string {
  if (!isRealBlockchainSpecified(orderId)) {
    throw new Error(`Blockchain is not correct=${orderId}`)
  }

  const [blockchain, orderHash] = orderId.split(":")
  if (!isEVMBlockchain(blockchain)) {
    throw new Error("Not an Ethereum address")
  }
  return orderHash
}

export function convertEthereumContractAddress(
  address: string | undefined,
  blockchain: EVMBlockchain,
): UnionContractAddress {
  if (!address) throw new Error("Address is undefined")
  return toUnionContractAddress(`${blockchain}:${address}`)
}

export function convertEthereumCollectionId(address: string, blockchain: EVMBlockchain): CollectionId {
  return toCollectionId(`${blockchain}:${address}`)
}

export function convertEthereumToUnionAddress(
  address: string,
  blockchain: EVMBlockchain = Blockchain.ETHEREUM,
): UnionAddress {
  return toUnionAddress(`${blockchain}:${address}`)
}

export function convertEthereumItemId(itemId: string, blockchain: EVMBlockchain): ItemId {
  return toItemId(`${blockchain}:${itemId}`)
}

export function getEthereumItemId(itemId: ItemId) {
  if (!itemId) {
    throw new Error("ItemId has not been specified")
  }
  const [domain, contract, tokenId] = itemId.split(":")
  if (!isEVMBlockchain(domain)) {
    throw new Error(`Not an ethereum item: ${itemId}`)
  }
  return {
    itemId: `${contract}:${tokenId}`,
    contract,
    tokenId,
    domain,
  }
}

export function getOrderAmount(orderAmount: OrderRequest["amount"], collection: Collection): number {
  let amount = collection.type === "ERC721" ? 1 : orderAmount
  if (amount === undefined) {
    throw new Error("You should set amount of asset")
  }
  return amount
}

export function getOrderId(fillRequest: PrepareFillRequest) {
  if ("order" in fillRequest) {
    return fillRequest.order.id
  } else if ("orderId" in fillRequest) {
    return fillRequest.orderId
  }
  throw new Error("OrderId has not been found in request")
}

export function getAssetTypeFromItemId(itemId: ItemId): NftAssetType {
  const { contract, tokenId } = getEthereumItemId(itemId)
  return {
    contract: toEVMAddress(contract),
    tokenId,
  }
}

export function getAssetTypeFromFillRequest(
  itemId: FillRequest["itemId"],
): CommonFillRequestAssetType | CommonFillRequestAssetType[] | undefined {
  if (!itemId) {
    return undefined
  }
  if (Array.isArray(itemId)) {
    return itemId.map(item => {
      return getAssetTypeFromItemId(item)
    })
  }

  return getAssetTypeFromItemId(itemId)
}

export function assertWallet(wallet: Maybe<EthereumWallet>): EthereumWallet {
  if (!wallet) throw new WalletIsUndefinedError()
  return wallet
}

export async function getWalletBlockchain(wallet: Maybe<EthereumWallet>) {
  return getBlockchainFromChainId(await assertWallet(wallet).ethereum.getChainId())
}

export async function getWalletNetwork(wallet: Maybe<EthereumWallet>) {
  return getNetworkFromChainId(await assertWallet(wallet).ethereum.getChainId())
}
export async function checkWalletBlockchain(wallet: Maybe<EthereumWallet>, blockchain: SupportedBlockchain) {
  const walletChainId = await assertWallet(wallet).ethereum.getChainId()
  assertBlockchainAndChainId(walletChainId, blockchain)
}

export function assertBlockchainAndChainId(chainId: number, blockchain: SupportedBlockchain) {
  if (getBlockchainFromChainId(chainId) !== blockchain) {
    throw new Error(`Change network of your wallet to ${blockchain}`)
  }
}

export function isRaribleOrderData(data: OrderData): data is EthOrderDataLegacy | EthRaribleV2OrderData {
  return isRaribleV1Data(data) || isRaribleV2Data(data)
}

export function isNft(
  type: AssetType,
): type is
  | EthErc721AssetType
  | EthErc721LazyAssetType
  | EthErc1155AssetType
  | EthErc1155LazyAssetType
  | EthCryptoPunksAssetType {
  switch (type["@type"]) {
    case "ERC721":
    case "ERC1155":
    case "ERC721_Lazy":
    case "ERC1155_Lazy":
    case "CRYPTO_PUNKS":
      return true
    default:
      return false
  }
}

export function isWETH(assetType: AssetType, wethAddress: EVMAddress | Address) {
  return assetType["@type"] === "ERC20" && convertToEthereumAddress(assetType.contract) === wethAddress
}

export { EVMBlockchains, EVMBlockchain, isEVMBlockchain }
