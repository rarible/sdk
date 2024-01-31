import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address } from "@rarible/types"
import { randomWord } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SendFunction } from "../common/send-transaction"
import type { GetConfigByChainId } from "../config"
import { createErc1155FactoryContract } from "./contracts/erc1155/deploy/rarible-factory"
import { createErc1155UserFactoryContract } from "./contracts/erc1155/deploy/rarible-user-factory"

export class DeployErc1155 {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly getConfig: GetConfigByChainId,
	) {
		this.deployToken = this.deployToken.bind(this)
		this.deployUserToken = this.deployUserToken.bind(this)
	}

	async deployToken(
		name: string, symbol: string, baseURI: string, contractURI: string
	): Promise<{tx: EthereumTransaction, address: Address}> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const config = await this.getConfig()
		const contract = createErc1155FactoryContract(this.ethereum, config.factories.erc1155)
		const salt = randomWord()
		const tx = await this.send(
			contract.functionCall("createToken", name, symbol, baseURI, contractURI, salt)
		)
		const events = await tx.getEvents()
		const proxyEvent = events
			.find(e => e.event === "Create1155RaribleProxy")
		if (!proxyEvent) {
			throw new Error("Event 'Create1155RaribleProxy' has not been found")
		}
		return {
			tx,
			address: proxyEvent.args.proxy,
		}
	}

	async deployUserToken(
		name: string, symbol: string, baseURI: string, contractURI: string, operators: Address[]
	): Promise<{tx: EthereumTransaction, address: Address}> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const config = await this.getConfig()
		const contract = createErc1155UserFactoryContract(this.ethereum, config.factories.erc1155)
		const salt = randomWord()
		const tx = await this.send(
			contract.functionCall("createToken", name, symbol, baseURI, contractURI, operators, salt)
		)
		const events = await tx.getEvents()
		const proxyEvent = events
			.find(e => e.event === "Create1155RaribleUserProxy")
		if (!proxyEvent) {
			throw new Error("Event 'Create1155RaribleProxy' has not been found")
		}
		return {
			tx,
			address: proxyEvent.args.proxy,
		}
	}
}
