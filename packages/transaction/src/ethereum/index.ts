import type { Blockchain } from "@rarible/api-client"
import type { EthereumTransaction } from "@rarible/ethereum-provider"
import type { EthereumNetwork } from "@rarible/protocol-ethereum-sdk/build/types"
import { getBlockchainBySDKNetwork, getChainIdByNetwork } from "@rarible/protocol-ethereum-sdk/build/common"
import { isObjectLike } from "@rarible/sdk-common"
import type { IBlockchainTransaction } from "../domain"

export class BlockchainEthereumTransaction<TransactionResult = undefined>
  implements IBlockchainTransaction<Blockchain, TransactionResult>
{
  public blockchain: Blockchain
  public chainId: number

  constructor(
    public transaction: EthereumTransaction,
    public network: EthereumNetwork,
    public resultExtractor?: (getEvents: EthereumTransaction["getEvents"]) => Promise<TransactionResult | undefined>,
  ) {
    this.blockchain = this.getBlockchain(network)
    this.chainId = getChainIdByNetwork(this.network)
  }

  hash = () => this.transaction.hash

  wait = async () => {
    await this.transaction.wait()

    return {
      blockchain: this.blockchain,
      hash: this.transaction.hash,
      events: await this.transaction.getEvents(),
      result: await this.resultExtractor?.(this.transaction.getEvents.bind(this.transaction)),
    }
  }

  getTxLink = () => {
    switch (this.network) {
      case "mainnet":
        return `https://etherscan.io/tx/${this.hash()}`
      case "mumbai":
        return `https://mumbai.polygonscan.com/tx/${this.hash()}`
      case "polygon":
        return `https://polygonscan.com/tx/${this.hash()}`
      case "testnet":
        return `https://sepolia.etherscan.io/tx/${this.hash()}`
      case "mantle":
        return `https://explorer.mantle.xyz/tx/${this.hash()}`
      case "testnet-mantle":
        return `https://explorer.testnet.mantle.xyz/tx/${this.hash()}`
      case "arbitrum":
        return `https://arbiscan.io/tx/${this.hash()}`
      case "testnet-arbitrum":
        return `https://sepolia.arbiscan.io/tx/${this.hash()}`
      case "zksync":
        return `https://explorer.zksync.io/tx/${this.hash()}`
      case "testnet-zksync":
        return `https://sepolia.explorer.zksync.io/tx/${this.hash()}`
      case "chiliz":
        return `https://scan.chiliz.com/tx/${this.hash()}`
      case "testnet-chiliz":
        return `https://spicy-explorer.chiliz.com/tx/${this.hash()}`
      case "lightlink":
        return `https://phoenix.lightlink.io/tx/${this.hash()}`
      case "testnet-lightlink":
        return `https://pegasus.lightlink.io/tx/${this.hash()}`
      case "rari":
        return `https://rari.calderaexplorer.xyz/tx/${this.hash()}`
      case "testnet-rari":
        return `https://rari-testnet.calderaexplorer.xyz/tx/${this.hash()}`
      case "base":
        return `https://basescan.org/tx/${this.hash()}`
      case "base-sepolia":
        return `https://base-sepolia.blockscout.com/tx/${this.hash()}`
      case "dev-ethereum":
        return `http://ethereum-explorer.dev.rarible.int/transactions/${this.hash()}`
      case "dev-polygon":
        return `http://polygon-explorer.dev.rarible.int/transactions/${this.hash()}`
      case "amoy-polygon":
        return `https://amoy.polygonscan.com/tx/${this.hash()}`
      case "zkatana":
        return `https://zkatana.blockscout.com/tx/${this.hash()}`
      case "astar-zkevm":
        return `https://astar-zkevm.explorer.startale.com/tx/${this.hash()}`
      case "astar-kyoto":
        return `https://astar-zkyoto.blockscout.com/tx/${this.hash()}`
      case "testnet-celo":
        return `https://explorer.celo.org/alfajores/tx/${this.hash()}`
      case "celo":
        return `https://explorer.celo.org/mainnet/tx/${this.hash()}`
      case "testnet-fief":
        return `https://explorer.playground.fiefdom.gg/tx/${this.hash()}`
      case "testnet-kroma":
        return `https://blockscout.sepolia.kroma.network/tx/${this.hash()}`
      case "kroma":
        return `https://blockscout.kroma.network/tx/${this.hash()}`
      case "testnet-saakuru":
        return `https://explorer-testnet.saakuru.network/explorer-testnet/tx/${this.hash()}`
      case "saakuru":
        return `https://explorer.saakuru.network/explorer/tx/${this.hash()}`
      case "testnet-oasys":
        return `https://explorer.testnet.oasys.games/tx/${this.hash()}`
      case "oasys":
        return `https://explorer.oasys.games/tx/${this.hash()}`
      case "sei-arctic-1":
        return `https://seitrace.com/tx/${this.hash()}?chain=arctic-1`
      case "sei-pacific-1":
        return `https://seitrace.com/tx/${this.hash()}?chain=pacific-1`
      case "moonbeam":
        return `https://moonbeam.moonscan.io/tx/${this.hash()}`
      case "moonbeam-testnet":
        return `https://moonbase.moonscan.io/tx/${this.hash()}`
      case "palm-testnet":
        return `https://testnet.palm.chainlens.com/transactions/${this.hash()}`
      case "palm":
        return `https://palm.chainlens.com/transactions/${this.hash()}`
      case "etherlink-testnet":
        return `https://testnet-explorer.etherlink.com/tx/${this.hash()}`
      case "etherlink":
        return `https://explorer.etherlink.com/tx/${this.hash()}`
      case "lisk-sepolia":
        return `https://sepolia-blockscout.lisk.com/tx/${this.hash()}`
      case "lisk":
        return `https://blockscout.lisk.com/tx/${this.hash()}`
      case "alephzero-testnet":
        return `https://evm-explorer-testnet.alephzero.org/tx/${this.hash()}`
      case "alephzero":
        return `https://evm-explorer.alephzero.org/tx/${this.hash()}`
      case "match":
        return `https://matchscan.io/tx/${this.hash()}`
      case "match-testnet":
        return `https://testnet.matchscan.io/tx/${this.hash()}`
      case "shape":
        return `https://shapescan.xyz/tx/${this.hash()}`
      case "shape-testnet":
        return `https://explorer-sepolia.shape.network/tx/${this.hash()}`
      case "berachain-testnet":
        return `https://bartio.beratrail.io/tx/${this.hash()}`
      case "berachain":
        return `https://berascan.com/tx/${this.hash()}`
      case "telos-testnet":
        return `https://testnet.teloscan.io/tx/${this.hash()}`
      case "telos":
        return `https://teloscan.io/tx/${this.hash()}`
      case "abstract":
        return `https://abscan.org/tx/${this.hash()}`
      case "abstract-testnet":
        return `https://sepolia.abscan.org/tx/${this.hash()}`
      case "viction":
        return `https://www.vicscan.xyz/txs/${this.hash()}`
      case "viction-testnet":
        return `https://testnet.vicscan.xyz/txs/${this.hash()}`
      case "zkCandy":
        return `https://explorer.zkcandy.io/tx/${this.hash()}`
      case "zkCandy-testnet":
        return `https://sepolia.explorer.zkcandy.io/tx/${this.hash()}`
      case "hedera-testnet":
        return `https://hashscan.io/testnet/transaction/${this.hash()}`
      case "hedera":
        return `https://hashscan.io/mainnet/transaction/${this.hash()}`
      case "goat":
        return `https://explorer.goat.network/tx/${this.hash()}`
      case "goat-testnet":
        return `https://explorer.testnet3.goat.network/tx/${this.hash()}`
      case "settlus":
        return `https://mainnet.settlus.network/tx/${this.hash()}`
      case "settlus-testnet":
        return `https://sepolia.settlus.network/tx/${this.hash()}`
      default:
        throw new Error("Unsupported transaction network")
    }
  }

  get isEmpty(): boolean {
    return false
  }

  private getBlockchain(network: EthereumNetwork): Blockchain {
    return getBlockchainBySDKNetwork(network)
  }

  static isInstance(original: unknown) {
    if (original instanceof BlockchainEthereumTransaction) return true

    if (isObjectLike(original)) {
      if (original.constructor.name === "BlockchainEthereumTransaction") return true
      if ("hash" in original && "wait" in original && "getTxLink" in original) return true
    }
    return false
  }
}
