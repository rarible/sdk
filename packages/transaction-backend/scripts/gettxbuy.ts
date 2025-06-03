import axios from "axios"

interface Part {
  account: string // Blockchain address in Union format ${blockchainGroup}:${token}
  value: number
}

interface RequestBody {
  from: string
  to: string
  request: {
    orderId: string // Rarible OrderId in Union format ${blockchainGroup}:${orderId}
    amount: number
    originFees: Part[]
    payouts: Part[]
  }
}

const orderData = {
  type: "RARIBLE_V2",
  maker: "0x3625490833992a468f241c33a57d3cc2232470d9",
  make: {
    assetType: {
      assetClass: "ERC721",
      contract: "0x179f99618419c4103813dcd09e76e2e7588705fd",
      tokenId: "1819",
    },
    value: "1",
    valueDecimal: 1,
  },
  take: {
    assetType: { assetClass: "ETH" },
    value: "38000000000000000000",
    valueDecimal: 38,
  },
  fill: "0",
  fillValue: 0,
  end: 1700562028,
  makeStock: "1",
  makeStockValue: 1,
  cancelled: false,
  optionalRoyalties: false,
  salt: "0x0e014f484881aec33aea5cba9280cf27dbfafe049e363f438db8fd7d1dc4ee6e",
  signature:
    "0xf36340b94938e6bbc482b194dc2be9a9581aca283e12dad078527128bbd3d36614505b7c610196f8e19b96648afad0d1790a72c67c83a2345a50aa67fd1ed4d21b",
  createdAt: "2023-08-21T09:21:08.637Z",
  lastUpdateAt: "2023-08-21T09:21:08.637Z",
  dbUpdatedAt: "2023-08-21T09:21:08.679Z",
  id: "0xc4a3fc0899a0d1562c0a57f85e672323223f8950a046d2080da8edb6c53955c2",
  hash: "0xc4a3fc0899a0d1562c0a57f85e672323223f8950a046d2080da8edb6c53955c2",
  makeBalance: "0",
  makePrice: 38,
  makePriceUsd: 21.668155127683242,
  priceHistory: [{ date: "2023-08-21T09:21:08.637Z", makeValue: 1, takeValue: 38 }],
  status: "ACTIVE",
  data: {
    dataType: "RARIBLE_V2_DATA_V2",
    payouts: [] as Part[],
    originFees: [{ account: "0x1cf0df2a5a20cd61d68d4489eebbf85b8d39e18a", value: 150 }] as Part[],
    isMakeFill: true,
  },
}

const baseUrl = "http://localhost:5500/v0.1/orders/buy-tx"

async function getTransactionData(): Promise<void> {
  const requestBody: RequestBody = {
    from: "0x669f66b15544d3E3AEA8B9A88C92285ffd9D3a45",
    to: "0xbe4f5AdF3913E7EF0437a21174490a42853A7637",
    request: {
      orderId: "POLYGON:0x47330bc27fff59e777dad28a17cba26adc0e1c09f3f35551b5a977aa96400bcf",
      amount: 1,
      originFees: [],
      payouts: [{ account: "0x1cf0df2a5a20cd61d68d4489eebbf85b8d39e18a", value: 150 }],
    },
  }

  try {
    const response = await axios.post(baseUrl, requestBody)
    console.log("Response:", JSON.stringify(response.data))
  } catch (error) {
    console.error("Error:", error)
  }
}

getTransactionData()
