import { toAddress, toWord } from "@rarible/types"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import { BlockchainEthereumTransaction } from "./"

const networks: EthereumNetwork[] = ["mainnet", "mumbai", "testnet"]

describe.each(networks)("get ethereum tx link in %s network", network => {
  const ethTx = {
    hash: toWord("0x62b32a0793ab08515c3cdc159430f1ddc62b906b3db809a824571844ba5d459f"),
    from: toAddress("0xccfceecf8451d8cfd1edd0b859c4301f60d3e948"),
    data: "" as any,
    wait: () => Promise.resolve(null as any),
    getEvents: async () => [],
  } as EthereumTransaction

  test("get tx link", () => {
    const tx = new BlockchainEthereumTransaction(ethTx, network)
    expect(tx.getTxLink()).toBeTruthy()
  })

  test("get chainId from tx", () => {
    const tx = new BlockchainEthereumTransaction(ethTx, network)

    expect(tx.chainId).toBeTruthy()
  })
})
