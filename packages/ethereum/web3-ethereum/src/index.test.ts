import Web3 from "web3"
import * as common from "@rarible/ethereum-sdk-test-common"
import { SeaportABI } from "@rarible/ethereum-sdk-test-common/build/contracts/opensea/test-seaport"
import { toAddress } from "@rarible/types"
import { deployTestContract, SIMPLE_TEST_ABI } from "@rarible/ethereum-sdk-test-common/src/test-contract"
import { DEV_PK_1 } from "@rarible/ethereum-sdk-test-common"
import { parseRequestError } from "./utils/parse-request-error"
import { Web3Ethereum, Web3FunctionCall, Web3Transaction } from "./index"

describe("Web3Ethereum", () => {
  const { provider } = common.createE2eProvider(DEV_PK_1)
  const web3e2e = new Web3(provider)
  const e2eEthereum = new Web3Ethereum({ web3: web3e2e })
  const { provider: ganache } = common.createGanacheProvider()
  const web3 = new Web3(ganache)
  const ganacheEthereum = new Web3Ethereum({ web3 })

  test("signs typed data correctly", async () => {
    await common.testTypedSignature(e2eEthereum)
  })

  test("signs personal message correctly", async () => {
    await common.testPersonalSign(e2eEthereum)
  })

  test("should correctly parse error for invalid method request", async () => {
    let ok = false
    try {
      await e2eEthereum.send("unknown method", [])
      ok = true
    } catch (err) {
      const error = parseRequestError(err)
      expect(error?.code).toEqual(-32601)
    }
    expect(ok).toBeFalsy()
  })

  test("allows to send transactions and call functions", async () => {
    await common.testSimpleContract(web3, ganacheEthereum)
  })

  test("getNetwork", async () => {
    const network = await e2eEthereum.getChainId()
    expect(network).toBe(300500)
  })

  test("encode/decode", async () => {
    const type = {
      components: [
        {
          name: "payouts",
          type: "uint256",
        },
        {
          name: "originFeeFirst",
          type: "uint256",
        },
        {
          name: "marketplaceMarker",
          type: "bytes",
        },
        {
          name: "r",
          type: "uint8",
        },
      ],
      name: "data",
      type: "tuple",
    }

    const data = {
      payouts: 0x4058,
      originFeeFirst: 0x1011,
      marketplaceMarker: "0xabcdef",
      r: 78,
    }

    const encoded = e2eEthereum.encodeParameter(type, data)
    const decoded = e2eEthereum.decodeParameter(type, encoded)
    for (const field in data) {
      //@ts-ignore
      expect(decoded["data"][field]).toEqual(data[field].toString())
    }
  })

  test("test retrying call/estimateGas with reserve node", async () => {
    const deployed = await deployTestContract(web3e2e)
    const contract = e2eEthereum.createContract(SIMPLE_TEST_ABI, deployed.options.address)
    const tx = await contract.functionCall("setValue", 10).send()
    await tx.wait()

    const originalValue = await contract.functionCall("value").call()
    const originalGas = await contract.functionCall("value").estimateGas()

    const web3Contract = new web3e2e.eth.Contract(SIMPLE_TEST_ABI as any, deployed.options.address)

    const outOfGasMsg =
      "Returned values aren't valid, did it run Out of Gas? " +
      "You might also see this error if you are not using the correct ABI for the " +
      "contract you are retrieving data from, requesting data from a block number " +
      "that does not exist, or querying a node which is not fully synced."
    web3Contract.methods["value"] = () => {
      return {
        ...web3Contract.methods["value"],
        call: () => {
          throw new Error(outOfGasMsg)
        },
        estimateGas: () => {
          throw new Error(outOfGasMsg)
        },
      }
    }

    const fnCall = new Web3FunctionCall(
      {
        web3,
        reserveNodes: {
          300500: "https://dev-ethereum-node.rarible.com",
        },
      },
      web3Contract,
      "value",
      [],
    )

    const value = await fnCall.call()
    expect(value).toBe(originalValue)

    const gas = await fnCall.estimateGas()
    expect(gas).toBe(originalGas)
  })

  test("test retrying call/estimateGas without reserve node is not working", async () => {
    console.log("from", await e2eEthereum.getFrom())
    const deployed = await deployTestContract(web3e2e)
    const contract = e2eEthereum.createContract(SIMPLE_TEST_ABI, deployed.options.address)
    const tx = await contract.functionCall("setValue", 10).send()
    await tx.wait()

    const web3Contract = new web3e2e.eth.Contract(SIMPLE_TEST_ABI as any, deployed.options.address)

    const outOfGasMsg =
      "Returned values aren't valid, did it run Out of Gas? " +
      "You might also see this error if you are not using the correct ABI for the " +
      "contract you are retrieving data from, requesting data from a block number " +
      "that does not exist, or querying a node which is not fully synced."
    web3Contract.methods["value"] = () => {
      return {
        ...web3Contract.methods["value"],
        call: () => {
          throw new Error(outOfGasMsg)
        },
        estimateGas: () => {
          throw new Error(outOfGasMsg)
        },
      }
    }

    const fnCall = new Web3FunctionCall({ web3 }, web3Contract, "value", [])

    let callError
    try {
      await fnCall.call()
    } catch (e: any) {
      callError = e.message
    }
    expect(callError.includes(outOfGasMsg)).toBeTruthy()

    let estimateGasError
    try {
      await fnCall.estimateGas()
    } catch (e: any) {
      estimateGasError = e.message
    }
    expect(estimateGasError.includes(outOfGasMsg)).toBeTruthy()
  })
})

describe("get transaction receipt events", () => {
  const { provider } = common.createE2eProvider("d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469", {
    networkId: 1,
    rpcUrl: "https://node-mainnet.rarible.com",
  })
  const e2eEthereum = new Web3Ethereum({ web3: new Web3(provider) })

  test("get Seaport tx events (prod)", async () => {
    const web3 = e2eEthereum.getWeb3Instance()
    const receipt = web3.eth.getTransactionReceipt("0x2f81b44332228d78eda5ea48e62134fddd2354713d77f4f61588d91cd7a735ff")
    const seaportAddr = "0x00000000006c3852cbef3e08e8df289169ede581"

    const tx = new Web3Transaction(receipt, null as any, null as any, null as any, toAddress(seaportAddr), SeaportABI)
    const events = await tx.getEvents()
    expect(events.find(e => e.event === "OrderFulfilled")).toBeTruthy()
  })
})
