import type { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import type { Address, BigNumber } from "@rarible/types"
import { toAddress, toBigNumber } from "@rarible/types"
import type {
  AmmOrderFillRequest,
  FillBatchSingleOrderRequest,
  FillOrderAction,
  FillOrderRequest,
} from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type { SimpleOrder } from "@rarible/protocol-ethereum-sdk/build/order/types"
import { BigNumber as BigNumberClass } from "@rarible/utils/build/bn"
import type { IBlockchainTransaction } from "@rarible/sdk-transaction"
import { BlockchainEthereumTransaction } from "@rarible/sdk-transaction"
import type { EthereumWallet } from "@rarible/sdk-wallet"
import type { Maybe } from "@rarible/types/build/maybe"
import type { Blockchain, Order, OrderId } from "@rarible/api-client"
import { Platform } from "@rarible/api-client"
import type { AmmTradeInfo } from "@rarible/ethereum-api-client"
import { Warning } from "@rarible/logger/build"
import { extractBlockchain, extractId } from "@rarible/sdk-common"
import type { TransactionData } from "@rarible/protocol-ethereum-sdk/build/order/fill-order/types"
import type {
  BatchFillRequest,
  FillRequest,
  IBatchBuyTransactionResult,
  PrepareBatchBuyResponse,
  PrepareFillRequest,
  PrepareFillResponse,
} from "../../types/order/fill/domain"
import { MaxFeesBasePointSupport, OriginFeeSupport, PayoutsSupport } from "../../types/order/fill/domain"
import type { BuyAmmInfoRequest } from "../../types/balances"
import type { AcceptBidSimplifiedRequest, BuySimplifiedRequest } from "../../types/order/fill/simplified"
import { checkPayouts } from "../../common/check-payouts"
import type { IApisSdk } from "../../domain"
import type { IGetBuyTxDataRequest } from "../../types/ethereum/domain"
import type { EVMBlockchain } from "./common"
import {
  assertBlockchainAndChainId,
  assertWallet,
  checkWalletBlockchain,
  convertEthereumContractAddress,
  convertToEthereumAddress,
  getAssetTypeFromFillRequest,
  getEthereumItemId,
  getEthOrder,
  getOrderId,
  getWalletNetwork,
  isEVMBlockchain,
  isNft,
  toEthereumParts,
} from "./common"

export type SupportFlagsResponse = {
  originFeeSupport: OriginFeeSupport
  payoutsSupport: PayoutsSupport
  maxFeesBasePointSupport: MaxFeesBasePointSupport
  supportsPartialFill: boolean
}

export class EthereumFill {
  constructor(
    private sdk: RaribleSdk,
    private wallet: Maybe<EthereumWallet>,
    private apis: IApisSdk,
  ) {
    this.fill = this.fill.bind(this)
    this.buy = this.buy.bind(this)
    this.batchBuy = this.batchBuy.bind(this)
    this.acceptBid = this.acceptBid.bind(this)
    this.buyBasic = this.buyBasic.bind(this)
    this.acceptBidBasic = this.acceptBidBasic.bind(this)
    this.batchBuyBasic = this.batchBuyBasic.bind(this)
    this.getBuyAmmInfo = this.getBuyAmmInfo.bind(this)
    this.getBuyTxData = this.getBuyTxData.bind(this)
  }

  async buyBasic(request: BuySimplifiedRequest): Promise<IBlockchainTransaction> {
    const prepare = await this.buy(request)
    return prepare.submit(request)
  }

  async acceptBidBasic(request: AcceptBidSimplifiedRequest): Promise<IBlockchainTransaction> {
    const prepare = await this.acceptBid(request)
    return prepare.submit(request)
  }

  getFillOrderRequest(order: SimpleOrder, fillRequest: FillRequest): FillOrderRequest {
    let request: FillOrderRequest
    switch (order.type) {
      case "RARIBLE_V1": {
        request = {
          order,
          amount: fillRequest.amount,
          infinite: fillRequest.infiniteApproval,
          originFee: fillRequest.originFees?.[0]?.value ? fillRequest.originFees[0].value : 0,
          payout: fillRequest.payouts?.[0]?.account
            ? convertToEthereumAddress(fillRequest.payouts[0].account)
            : undefined,
        }
        break
      }
      case "RARIBLE_V2": {
        request = {
          order,
          amount: fillRequest.amount,
          infinite: fillRequest.infiniteApproval,
          payouts: toEthereumParts(fillRequest.payouts),
          originFees: toEthereumParts(fillRequest.originFees),
        }
        break
      }
      case "OPEN_SEA_V1": {
        request = {
          order,
          originFees: order.take.assetType.assetClass === "ETH" ? toEthereumParts(fillRequest.originFees) : [],
          payouts: toEthereumParts(fillRequest.payouts),
          infinite: fillRequest.infiniteApproval,
        }
        break
      }
      case "SEAPORT_V1": {
        request = {
          order,
          originFees: toEthereumParts(fillRequest.originFees),
          amount: fillRequest.amount,
        }
        break
      }
      case "LOOKSRARE": {
        request = {
          order,
          originFees: toEthereumParts(fillRequest.originFees),
          amount: fillRequest.amount,
        }
        break
      }
      case "LOOKSRARE_V2": {
        request = {
          order,
          originFees: toEthereumParts(fillRequest.originFees),
          amount: fillRequest.amount,
        }
        break
      }
      case "X2Y2": {
        request = {
          order,
          originFees: toEthereumParts(fillRequest.originFees),
          amount: fillRequest.amount,
        }
        break
      }
      case "AMM": {
        return {
          order,
          originFees: toEthereumParts(fillRequest.originFees),
          amount: fillRequest.amount,
          assetType: getAssetTypeFromFillRequest(fillRequest.itemId) as AmmOrderFillRequest["assetType"],
          addRoyalty: fillRequest.addRoyalties,
        } as AmmOrderFillRequest
      }
      default: {
        throw new Error("Unsupported order type")
      }
    }

    if (fillRequest.addRoyalties) {
      throw new Warning("Adding royalties is available only for AMM orders")
    }

    if (fillRequest.itemId) {
      if (Array.isArray(fillRequest.itemId)) {
        throw new Error("Array of itemIds is supported only for AMM orders")
      }
      const { contract, tokenId } = getEthereumItemId(fillRequest.itemId)
      request.assetType = {
        contract: toAddress(contract),
        tokenId,
      }
    }

    return request
  }

  getSupportFlags(order: Order): SupportFlagsResponse {
    switch (order.data["@type"]) {
      case "ETH_RARIBLE_V1": {
        return {
          originFeeSupport: OriginFeeSupport.AMOUNT_ONLY,
          payoutsSupport: PayoutsSupport.SINGLE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      }

      case "ETH_RARIBLE_V2":
      case "ETH_RARIBLE_V2_2": {
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.MULTIPLE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      }
      case "ETH_RARIBLE_V2_3":
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.MULTIPLE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      case "ETH_OPEN_SEA_V1": {
        return {
          originFeeSupport: order.take.type["@type"] === "ETH" ? OriginFeeSupport.FULL : OriginFeeSupport.NONE,
          payoutsSupport: PayoutsSupport.SINGLE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: false,
        }
      }
      case "ETH_BASIC_SEAPORT_DATA_V1": {
        const supportsPartialFill =
          order.data.orderType === "PARTIAL_OPEN" || order.data.orderType === "PARTIAL_RESTRICTED"
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.NONE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill,
        }
      }
      case "ETH_LOOKSRARE_ORDER_DATA_V1": {
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.NONE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      }
      case "ETH_LOOKSRARE_ORDER_DATA_V2": {
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.NONE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      }
      case "ETH_SUDOSWAP_AMM_DATA_V1": {
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.NONE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: true,
        }
      }
      case "ETH_X2Y2_ORDER_DATA_V1": {
        return {
          originFeeSupport: OriginFeeSupport.FULL,
          payoutsSupport: PayoutsSupport.NONE,
          maxFeesBasePointSupport: MaxFeesBasePointSupport.IGNORED,
          supportsPartialFill: false,
        }
      }
      default:
        throw new Error("Unsupported order type")
    }
  }

  getPlatform(order: Order): Platform {
    switch (order.data["@type"]) {
      case "ETH_RARIBLE_V1":
      case "ETH_RARIBLE_V2":
      case "ETH_RARIBLE_V2_2":
      case "ETH_RARIBLE_V2_3":
        return Platform.RARIBLE
      case "ETH_OPEN_SEA_V1":
      case "ETH_BASIC_SEAPORT_DATA_V1":
        return Platform.OPEN_SEA
      case "ETH_LOOKSRARE_ORDER_DATA_V1":
      case "ETH_LOOKSRARE_ORDER_DATA_V2":
        return Platform.LOOKSRARE
      case "ETH_SUDOSWAP_AMM_DATA_V1":
        return Platform.SUDOSWAP
      case "ETH_X2Y2_ORDER_DATA_V1":
        return Platform.X2Y2
      case "ETH_CRYPTO_PUNKS":
        return Platform.CRYPTO_PUNKS
      default:
        return Platform.RARIBLE
    }
  }

  async getMaxAmount(order: Order): Promise<BigNumber | null> {
    if (order.take.type["@type"] === "COLLECTION") {
      return null
    }
    if (isNft(order.take.type)) {
      if (this.wallet === undefined) {
        throw new Error("Wallet undefined")
      }
      const address = await this.wallet.ethereum.getFrom()
      const ownershipId = `${order.take.type.contract}:${order.take.type.tokenId}:${toAddress(address)}`
      const ownership = await this.apis.ownership.getOwnershipById({ ownershipId })

      return toBigNumber(BigNumberClass.min(ownership.value, order.take.value).toFixed())
    }
    return order.makeStock
  }

  async isMultiple(order: Order): Promise<boolean> {
    let contract: string

    if (isNft(order.take.type) || order.take.type["@type"] === "COLLECTION") {
      contract = order.take.type.contract
    } else if (isNft(order.make.type) || order.make.type["@type"] === "COLLECTION") {
      contract = order.make.type.contract
    } else if (order.make.type["@type"] === "AMM_NFT") {
      return false
    } else {
      throw new Error("Nft has not been found")
    }
    const collection = await this.apis.collection.getCollectionById({
      collection: contract,
    })

    return collection.type === "ERC1155"
  }

  hasCollectionAssetType(order: Order) {
    return order.take.type["@type"] === "COLLECTION" || order.make.type["@type"] === "COLLECTION"
  }

  private async commonFill(
    action: FillOrderAction,
    request: PrepareFillRequest,
    isBid = false,
  ): Promise<PrepareFillResponse> {
    const orderId = getOrderId(request)
    const blockchain = extractBlockchain(orderId)
    if (!isEVMBlockchain(blockchain)) throw new Error("Not an EVM order")

    const order = await this.apis.order.getValidatedOrderById({ id: orderId })
    const ethOrder = await getEthOrder(assertWallet(this.wallet).ethereum, order)

    const submit = action.around(
      async (fillRequest: FillRequest) => {
        await checkWalletBlockchain(this.wallet, blockchain)
        checkPayouts(fillRequest.payouts)
        if (fillRequest.unwrap) {
          throw new Warning("Unwrap is not supported yet")
        }
        if (this.hasCollectionAssetType(order) && !fillRequest.itemId) {
          throw new Warning("For collection order you should pass itemId")
        }
        return this.getFillOrderRequest(ethOrder, fillRequest)
      },
      async tx => new BlockchainEthereumTransaction(tx, await getWalletNetwork(this.wallet)),
    )

    const nftAssetType = isBid ? order.take.type : order.make.type
    console.log("orderdata", {
      platform: this.getPlatform(order),
      nftCollection: "contract" in nftAssetType ? nftAssetType.contract : undefined,
    })
    return {
      ...this.getSupportFlags(order),
      multiple: await this.isMultiple(order),
      maxAmount: await this.getMaxAmount(order),
      baseFee: await this.sdk.order.getBaseOrderFillFee(ethOrder),
      submit,
      orderData: {
        platform: this.getPlatform(order),
        nftCollection:
          "contract" in nftAssetType ? convertEthereumContractAddress(nftAssetType.contract, blockchain) : undefined,
      },
    }
  }

  /**
   * @deprecated
   * @param request
   */
  async fill(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    return this.commonFill(this.sdk.order.fill, request)
  }

  async buy(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    return this.commonFill(this.sdk.order.buy, request)
  }

  async acceptBid(request: PrepareFillRequest): Promise<PrepareFillResponse> {
    return this.commonFill(this.sdk.order.acceptBid, request, true)
  }

  async batchBuy(prepareRequest: PrepareFillRequest[]): Promise<PrepareBatchBuyResponse> {
    const orders: Record<OrderId, SimpleOrder> = {} // ethereum orders cache

    const submit = this.sdk.order.buyBatch.around(
      async (request: BatchFillRequest) => {
        const walletChainId = await assertWallet(this.wallet).ethereum.getChainId()
        return request.map(req => {
          const blockchain = extractBlockchain(req.orderId)
          assertBlockchainAndChainId(walletChainId, blockchain)
          checkPayouts(req.payouts)
          const order = orders[req.orderId]
          if (!order) {
            throw new Error(`Order with id ${req.orderId} not precached`)
          }

          if (req.unwrap) {
            throw new Error("Unwrap is not supported yet")
          }

          return this.getFillOrderRequest(order, req) as FillBatchSingleOrderRequest
        })
      },
      async (tx, request: BatchFillRequest) => {
        const network = await getWalletNetwork(this.wallet)
        return new BlockchainEthereumTransaction<IBatchBuyTransactionResult>(tx, network, async getEvents => {
          try {
            const events: any = (await getEvents()) || []
            let executionEvents: any[] = []

            for (let event of events) {
              if ("0" in event && event[0]?.event === "Execution") {
                if (Array.isArray(event)) {
                  executionEvents.push(...event)
                } else {
                  // cycling over events "subarray", because web3 provider
                  // returning it not as real array, but as object
                  let i = 0
                  while (event[i]) {
                    executionEvents.push(event[i])
                    i += 1
                  }
                }
              } else if (event.event === "Execution") {
                executionEvents.push(event)
              }
            }

            if (executionEvents) {
              return {
                type: "BATCH_BUY",
                results: request.map((req, index) => ({
                  orderId: req.orderId,
                  result:
                    (executionEvents[index]?.data || executionEvents[index]?.raw?.data) === // ethers variant // web3 variant
                    "0x0000000000000000000000000000000000000000000000000000000000000001",
                })),
              }
            } else {
              return undefined
            }
          } catch (e) {
            console.error("Can't parse transaction events", e)
            return undefined
          }
        })
      },
    )

    const prepared = await Promise.all(
      prepareRequest.map(async req => {
        const orderId = getOrderId(req)
        const unionOrder = await this.apis.order.getOrderById({ id: orderId })
        const blockchain = extractBlockchain(orderId) as EVMBlockchain
        const order = await getEthOrder(assertWallet(this.wallet).ethereum, unionOrder)
        orders[orderId] = order

        if (unionOrder.status !== "ACTIVE") {
          throw new Error(`Order with id ${orderId} is not active`)
        }

        if (
          order.type !== "OPEN_SEA_V1" &&
          order.type !== "RARIBLE_V2" &&
          order.type !== "SEAPORT_V1" &&
          order.type !== "LOOKSRARE" &&
          order.type !== "LOOKSRARE_V2" &&
          order.type !== "AMM" &&
          order.type !== "X2Y2"
        ) {
          throw new Error(`Order type ${order.type} is not supported for batch buy`)
        }

        if (order.make.assetType.assetClass === "ETH" || order.make.assetType.assetClass === "ERC20") {
          throw new Error("Bid orders is not supported")
        }

        return {
          orderId,
          ...this.getSupportFlags(unionOrder),
          multiple: await this.isMultiple(unionOrder),
          maxAmount: await this.getMaxAmount(unionOrder),
          baseFee: await this.sdk.order.getBaseOrderFillFee(order),
          orderData: {
            platform: this.getPlatform(unionOrder),
            nftCollection:
              "contract" in order.make.assetType
                ? convertEthereumContractAddress(order.make.assetType.contract, blockchain)
                : undefined,
          },
        }
      }),
    )

    return {
      submit,
      prepared,
    }
  }

  getBuyAmmInfo(request: BuyAmmInfoRequest): Promise<AmmTradeInfo> {
    return this.sdk.order.getBuyAmmInfo({
      hash: request.hash,
      numNFTs: request.numNFTs,
    })
  }

  async getBuyTxData(input: IGetBuyTxDataRequest): Promise<TransactionData> {
    const unionOrderId = getOrderId(input.request)
    const order = await this.apis.order.getValidatedOrderById({ id: unionOrderId })
    const ethOrder = await getEthOrder(assertWallet(this.wallet).ethereum, order)

    let from: Address
    if (input.from) {
      from = toAddress(extractId(input.from))
    } else if (this.wallet) {
      from = toAddress(await this.wallet.ethereum.getFrom())
    } else {
      throw new Error("Request doesn't contain `from` address")
    }
    const ethRequest = this.getFillOrderRequest(ethOrder, input.request)
    return this.sdk.order.getBuyTxData({
      request: ethRequest,
      from,
    })
  }

  async batchBuyBasic(
    request: BatchFillRequest,
  ): Promise<IBlockchainTransaction<Blockchain, IBatchBuyTransactionResult>> {
    const response = await this.batchBuy(request)
    return response.submit(request)
  }
}
