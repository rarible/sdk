import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address, EVMAddress } from "@rarible/types"
import { randomWord } from "@rarible/types"
import type { Maybe } from "@rarible/types"
import type { SendFunction } from "../common/send-transaction"
import type { GetConfigByChainId } from "../config"
import { createErc721FactoryContract } from "./contracts/erc721/deploy/rarible-factory"
import { createErc721UserFactoryContract } from "./contracts/erc721/deploy/rarible-user-factory"

export class DeployErc721 {
  constructor(
    private readonly ethereum: Maybe<Ethereum>,
    private readonly send: SendFunction,
    private readonly getConfig: GetConfigByChainId,
  ) {
    this.deployToken = this.deployToken.bind(this)
    this.deployUserToken = this.deployUserToken.bind(this)
  }

  async deployToken(
    name: string,
    symbol: string,
    baseURI: string,
    contractURI: string,
  ): Promise<{ tx: EthereumTransaction; address: EVMAddress }> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const config = await this.getConfig()
    const contract = createErc721FactoryContract(this.ethereum, config.factories.erc721)
    const salt = randomWord()
    const tx = await this.send(contract.functionCall("createToken", name, symbol, baseURI, contractURI, salt))
    const events = await tx.getEvents()
    const proxyEvent = events.find(e => e.event === "Create721RaribleProxy")
    if (!proxyEvent) {
      throw new Error("Event 'Create721RaribleProxy' has not been found")
    }
    return {
      tx,
      address: proxyEvent.args?.proxy || proxyEvent.returnValues?.proxy,
    }
  }

  async deployUserToken(
    name: string,
    symbol: string,
    baseURI: string,
    contractURI: string,
    operators: (Address | EVMAddress)[],
  ): Promise<{ tx: EthereumTransaction; address: EVMAddress }> {
    if (!this.ethereum) {
      throw new Error("Wallet undefined")
    }
    const config = await this.getConfig()
    const contract = createErc721UserFactoryContract(this.ethereum, config.factories.erc721)
    const salt = randomWord()
    const tx = await this.send(
      contract.functionCall("createToken", name, symbol, baseURI, contractURI, operators, salt),
    )
    const events = await tx.getEvents()
    const proxyEvent = events.find(e => e.event === "Create721RaribleUserProxy")
    if (!proxyEvent) {
      throw new Error("Event 'Create721RaribleUserProxy' has not been found")
    }
    return {
      tx,
      address: proxyEvent.args?.proxy || proxyEvent.returnValues?.proxy,
    }
  }
}
