import type { Ethereum, EthereumTransaction } from "@rarible/ethereum-provider"
import type { Address, Word } from "@rarible/types"
import { randomWord } from "@rarible/types"
import type { Maybe } from "@rarible/types/build/maybe"
import type { SendFunction } from "../common/send-transaction"
import type { EthereumConfig } from "../config/type"
import { checkChainId } from "../order/check-chain-id"
import { createErc721FactoryContract } from "./contracts/erc721/deploy/rarible-factory"
import { createErc721UserFactoryContract } from "./contracts/erc721/deploy/rarible-user-factory"

export class DeployErc721 {
	constructor(
		private readonly ethereum: Maybe<Ethereum>,
		private readonly send: SendFunction,
		private readonly config: EthereumConfig,
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
		const contract = createErc721FactoryContract(this.ethereum, this.config.factories.erc721)
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
		const contract = createErc721FactoryContract(this.ethereum, this.config.factories.erc721)
		return contract.functionCall("getAddress", name, symbol, baseURI, contractURI, salt).call()
	}

	async deployUserToken(
		name: string, symbol: string, baseURI: string, contractURI: string, operators: Address[]
	): Promise<{tx: EthereumTransaction, address: Address}> {
		await checkChainId(this.ethereum, this.config)
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const contract = createErc721UserFactoryContract(this.ethereum, this.config.factories.erc721)
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
		await checkChainId(this.ethereum, this.config)
		if (!this.ethereum) {
			throw new Error("Wallet undefined")
		}
		const contract = createErc721UserFactoryContract(this.ethereum, this.config.factories.erc721)
		return contract.functionCall("getAddress", name, symbol, baseURI, contractURI, operators, salt).call()
	}
}
