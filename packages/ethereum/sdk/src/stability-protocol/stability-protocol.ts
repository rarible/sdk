import { EVM_ZERO_ADDRESS } from "@rarible/types"
import { ethers } from "ethers"
import { hexlify, toUtf8Bytes } from "ethers/lib/utils"
import type { RemoteLogger } from "@rarible/logger/build"
import { getErrorMessageString } from "../common/logger/logger"
import type { RaribleStabilityProtocolSdk, RaribleStabilityMessage } from "../index"

export class StabilityProtocol implements RaribleStabilityProtocolSdk {
  private provider: ethers.providers.JsonRpcProvider
  private signer: ethers.Wallet
  private logger: RemoteLogger
  private destinationAddress: string

  constructor(apiKey: string, destinationAddress: string | undefined, logger: RemoteLogger) {
    const providerUrl = `https://rpc.stabilityprotocol.com/zgt/${apiKey}`
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl)
    this.signer = ethers.Wallet.createRandom().connect(this.provider)
    this.logger = logger
    this.destinationAddress = destinationAddress ?? EVM_ZERO_ADDRESS
  }

  sendMessage(message: RaribleStabilityMessage) {
    const messageBytes = hexlify(toUtf8Bytes(JSON.stringify(message)))
    const transaction = {
      to: this.destinationAddress,
      data: messageBytes,
      maxPriorityFeePerGas: 0,
      maxFeePerGas: 0,
    }

    return this.signer
      .sendTransaction(transaction)
      .then(x => undefined)
      .catch(error => {
        this.logger.raw({
          level: "ERROR",
          method: "stabilityProtocol.sendMessage",
          message: getErrorMessageString(error),
          provider: this.provider.connection.url,
          to: this.destinationAddress,
          value: message,
        })
      })
  }
}
