import { toAddress } from "@rarible/types"
import { getOrderHash, getStringHash } from "./get-order-hash"
import { convertAPIOrderToSeaport } from "./convert-to-seaport-order"

describe("get seaport order hash", () => {
  test("get hash string", async () => {
    const offerItemTypeString =
      "OfferItem(uint8 itemType,address token,uint256 identifierOrCriteria,uint256 startAmount,uint256 endAmount)"

    const stringHash = getStringHash(offerItemTypeString)
    expect(stringHash).toBe("0xa66999307ad1bb4fde44d13a5d710bd7718e0c87c1eef68a571629fbf5b93d02")
  })

  test("get order hash", async () => {
    const orderData = {
      type: "SEAPORT_V1",
      maker: toAddress("0x22d491bde2303f2f43325b2108d26f1eaba1e32b"),
      make: {
        assetType: {
          assetClass: "ERC721",
          contract: toAddress("0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"),
          tokenId: "15754214302034704911334786657881932847148102202883437712117637319024858628154",
        },
        value: "1",
        valueDecimal: 1,
      },
      take: {
        assetType: { assetClass: "ETH" },
        value: "10000000000",
        valueDecimal: 1.0e-8,
      },
      fill: "0",
      start: 1657711513,
      end: 1660303513,
      makeStock: "1",
      makeStockValue: 1,
      cancelled: false,
      salt: "0x000000000000000000000000000000001d03fb4a7f616d794371da9c40a3ec56",
      signature:
        "0x7d5c1fcd39bd6f8a21f693dff506a69b300fca5b74a83d516452fb83b00e16ab5bfd9b583996766800e18dc262617030e37186a8cc9429ad25f0d0d7093029ac",
      createdAt: "2022-07-13T11:25:15.345Z",
      lastUpdateAt: "2022-07-13T11:32:57.295Z",
      dbUpdatedAt: "2022-07-13T11:32:57.418Z",
      pending: [],
      hash: "0x8e852229aca4ce11f15d8695e76282c3d7afb86b6baec8e3042445fe728e006a",
      makeBalance: "0",
      makePrice: 1.0e-8,
      makePriceUsd: 0.000010730370823197682,
      priceHistory: [
        {
          date: "2022-07-13T11:25:15.345Z",
          makeValue: 1,
          takeValue: 1.0e-8,
        },
      ],
      status: "ACTIVE",
      data: {
        dataType: "BASIC_SEAPORT_DATA_V1",
        protocol: toAddress("0x00000000006c3852cbef3e08e8df289169ede581"),
        orderType: "PARTIAL_RESTRICTED",
        offer: [
          {
            itemType: "ERC721",
            token: "0x6ede7f3c26975aad32a475e1021d8f6f39c89d82",
            identifierOrCriteria: "15754214302034704911334786657881932847148102202883437712117637319024858628154",
            startAmount: "1",
            endAmount: "1",
          },
        ],
        consideration: [
          {
            itemType: "NATIVE",
            token: "0x0000000000000000000000000000000000000000",
            identifierOrCriteria: "0",
            startAmount: "9750000000",
            endAmount: "9750000000",
            recipient: "0x22d491bde2303f2f43325b2108d26f1eaba1e32b",
          },
          {
            itemType: "NATIVE",
            token: "0x0000000000000000000000000000000000000000",
            identifierOrCriteria: "0",
            startAmount: "250000000",
            endAmount: "250000000",
            recipient: "0x8de9c5a032463c561423387a9648c5c7bcc5bc90",
          },
        ],
        zone: "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
        zoneHash: "0x3000000000000000000000000000000000000000000000000000000000000000",
        conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
        counter: 0,
        nonce: 0,
      },
    } as const
    const order = convertAPIOrderToSeaport(orderData as any)

    const hash = getOrderHash(order.parameters)
    expect(hash).toBe(orderData.hash)
  })
})
