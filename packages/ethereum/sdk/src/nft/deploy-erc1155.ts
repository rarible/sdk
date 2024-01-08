import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address, Word } from "@rarible/types"
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
		return {
			tx: await this.send(
				contract.functionCall("createToken", name, symbol, baseURI, contractURI, salt)
			),
			address: await this.getContractAddress(name, symbol, baseURI, contractURI, salt),
		}
	}

	private async getContractAddress(
		name: string, symbol: string, baseURI: string, contractURI: string, salt: Word
	): Promise<Address> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const config = await this.getConfig()
		const contract = createErc1155FactoryContract(this.ethereum, config.factories.erc1155)
		return contract.functionCall("getAddress", name, symbol, baseURI, contractURI, salt).call()
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
		return {
			tx: await this.send(
				contract.functionCall("createToken", name, symbol, baseURI, contractURI, operators, salt)
			),
			address: await this.getUserContractAddress(name, symbol, baseURI, contractURI, operators, salt),
		}
	}

	private async getUserContractAddress(
		name: string, symbol: string, baseURI: string, contractURI: string, operators: Address[], salt: Word
	): Promise<Address> {
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const config = await this.getConfig()
		const contract = createErc1155UserFactoryContract(this.ethereum, config.factories.erc1155)
		return contract.functionCall("getAddress", name, symbol, baseURI, contractURI, operators, salt)
			.call()
	}
}
