import type { Ethereum } from "@rarible/ethereum-provider"
import { randomWord, toAddress, ZERO_ADDRESS } from "@rarible/types"
import { createSeaportV14Contract } from "../../contracts/seaport-v14"
import { NFT_DOMAIN_TYPE } from "../../../nft/eip712-lazy"
import { toVrs } from "../../../common/to-vrs"
import type { OrderComponents } from "./types"
import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  EIP_712_ORDER_TYPE,
  KNOWN_CONDUIT_KEYS_TO_CONDUIT,
  OPENSEA_CONDUIT_KEY,
} from "./constants"
import { MAX_INT, OrderType, SEAPORT_CONTRACT_NAME, SEAPORT_CONTRACT_VERSION } from "./constants"
import type { CreateOrderInput, OrderParameters } from "./types"
import {
  areAllCurrenciesSame,
  deductFees,
  feeToConsiderationItem,
  mapInputItemToOfferItem,
  totalItemsAmount,
} from "./order"
import { isCurrencyItem } from "./item"
import { getBalancesAndApprovals, validateOfferBalancesAndApprovals } from "./balance-and-approval-check"
import { getApprovalActions } from "./approval"

export async function createOrder(
  ethereum: Ethereum,
  {
    send,
    conduitKey = OPENSEA_CONDUIT_KEY,
    zone = ZERO_ADDRESS,
    startTime = Math.floor(Date.now() / 1000).toString(),
    endTime = MAX_INT.toString(),
    offer,
    consideration,
    counter,
    allowPartialFills,
    restrictedByZone,
    fees,
    salt = randomWord(),
  }: CreateOrderInput,
) {
  const offerer = await ethereum.getFrom()
  const offerItems = offer.map(mapInputItemToOfferItem)
  const considerationItems = [
    ...consideration.map(consideration => ({
      ...mapInputItemToOfferItem(consideration),
      recipient: consideration.recipient ?? offerer,
    })),
  ]

  if (
    !areAllCurrenciesSame({
      offer: offerItems,
      consideration: considerationItems,
    })
  ) {
    throw new Error("All currency tokens in the order must be the same token")
  }

  const currencies = [...offerItems, ...considerationItems].filter(isCurrencyItem)

  const totalCurrencyAmount = totalItemsAmount(currencies)

  const operator = (KNOWN_CONDUIT_KEYS_TO_CONDUIT as Record<string, string>)[conduitKey]

  const seaportContract = createSeaportV14Contract(ethereum, toAddress(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS))

  const [resolvedCounter, balancesAndApprovals] = await Promise.all([
    counter ?? seaportContract.functionCall("getCounter", offerer).call(),
    getBalancesAndApprovals({
      ethereum,
      owner: offerer,
      items: offerItems,
      criterias: [],
      operator,
    }),
  ])

  const orderType = getOrderTypeFromOrderOptions({
    allowPartialFills,
    restrictedByZone,
  })

  const considerationItemsWithFees = [
    ...deductFees(considerationItems, fees),
    ...(currencies.length
      ? fees?.map(fee =>
          feeToConsiderationItem({
            fee,
            token: currencies[0].token,
            baseAmount: totalCurrencyAmount.startAmount,
            baseEndAmount: totalCurrencyAmount.endAmount,
          }),
        ) ?? []
      : []),
  ]

  const orderParameters: OrderComponents = {
    offerer,
    zone,
    zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    // zoneHash: formatBytes32String(resolvedCounter.toString()),
    startTime,
    endTime,
    orderType,
    offer: offerItems,
    consideration: considerationItemsWithFees,
    totalOriginalConsiderationItems: considerationItemsWithFees.length,
    salt,
    conduitKey,
    counter: (counter ?? seaportContract.functionCall("getCounter", offerer).call()).toString(),
  }

  const checkBalancesAndApprovals = true

  const insufficientApprovals = checkBalancesAndApprovals
    ? validateOfferBalancesAndApprovals({
        offer: offerItems,
        criterias: [],
        balancesAndApprovals,
        throwOnInsufficientBalances: checkBalancesAndApprovals,
        operator,
      })
    : []

  const approvalActions = checkBalancesAndApprovals
    ? await getApprovalActions(ethereum, send, insufficientApprovals)
    : []

  await Promise.all(approvalActions)

  const signature = await signOrder(ethereum, orderParameters, resolvedCounter)

  return {
    parameters: { ...orderParameters, counter: resolvedCounter },
    signature,
  }
}

export function getOrderTypeFromOrderOptions({
  allowPartialFills,
  restrictedByZone,
}: Pick<CreateOrderInput, "allowPartialFills" | "restrictedByZone">) {
  if (allowPartialFills) {
    return restrictedByZone ? OrderType.PARTIAL_RESTRICTED : OrderType.PARTIAL_OPEN
  }

  return restrictedByZone ? OrderType.FULL_RESTRICTED : OrderType.FULL_OPEN
}

export async function signOrder(
  ethereum: Ethereum,
  orderParameters: OrderParameters,
  counter: number,
): Promise<string> {
  const orderComponents: OrderComponents = {
    ...orderParameters,
    counter,
  }

  const chainId = await ethereum.getChainId()

  const domainData = {
    name: SEAPORT_CONTRACT_NAME,
    version: SEAPORT_CONTRACT_VERSION,
    chainId,
    verifyingContract: CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  }

  const signatureNew = await ethereum.signTypedData({
    primaryType: "OrderComponents",
    domain: domainData,
    types: {
      ...EIP_712_ORDER_TYPE,
      EIP712Domain: NFT_DOMAIN_TYPE,
    },
    message: {
      ...orderComponents,
      maker: await ethereum.getFrom(),
    },
  })

  return toVrs(signatureNew).compact
}
