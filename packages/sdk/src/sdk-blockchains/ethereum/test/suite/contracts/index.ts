import { Blockchain } from "@rarible/api-client"
import { getTestContract } from "@rarible/ethereum-sdk-test-common"
import { getEthereumConfig } from "@rarible/protocol-ethereum-sdk/src/config"
import type { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import type { EVMSuiteSupportedBlockchain } from "../domain"
import type { EVMKnownTestContract, EVMContractsDictionary } from "./domain"
import { ERC1155Contract } from "./variants/erc1155"
import { ERC20Mintable } from "./variants/erc20-mintable"
import { ERC20Wrapped } from "./variants/erc20-wrapped"
import { ERC721Contract } from "./variants/erc721"
import { EVMNativeToken } from "./variants/native"
import type { EVMContractsByBlockchain } from "./domain"
import type { EVMDeployContractType } from "./domain"
import type { EVMDeployableTestContract } from "./domain"

export class EVMContractsTestSuite<T extends EVMSuiteSupportedBlockchain> {
	constructor(
		private readonly blockchain: T,
		private readonly provider: Web3v4Ethereum
	) {}

  getContract = <K extends EVMKnownTestContract>(
  	type: K
  ): EVMContractsDictionary<T>[K] => {
  	switch (type) {
  		case "erc20_mintable_1": {
  			return new ERC20Mintable(
  				this.blockchain,
  				CONTRACTS_DICTIONARY[this.blockchain]["erc20_mintable_1"],
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "wrapped_eth": {
  			return new ERC20Wrapped(
  				this.blockchain,
  				CONTRACTS_DICTIONARY[this.blockchain]["wrapped_eth"],
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "eth": {
  			return new EVMNativeToken(this.blockchain, this.provider) as EVMContractsDictionary<T>[K]
  		}
  		case "erc1155_1": {
  			return new ERC1155Contract(
  				this.blockchain,
  				CONTRACTS_DICTIONARY[this.blockchain]["erc1155_1"],
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "erc721_1": {
  			return new ERC721Contract(
  				this.blockchain,
  				CONTRACTS_DICTIONARY[this.blockchain]["erc721_1"],
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		default:
  			throw new Error("Unknown contract type")
  	}
  }

  deployContract = <K extends EVMDeployableTestContract>(
  	type: K
  ): Promise<EVMDeployContractType<T>[K]> => {
  	switch (type) {
  		case "erc20": {
  			return ERC20Mintable.deploy(this.blockchain, this.provider)
  		}
  		default: throw new Error(`Unknown deploy contract type (${type})`)
  	}
  }
}

const CONTRACTS_DICTIONARY: EVMContractsByBlockchain = {
	[Blockchain.ETHEREUM]: {
		erc20_mintable_1: getTestContract("dev-ethereum", "erc20"),
		wrapped_eth: getEthereumConfig("dev-ethereum").weth,
		erc721_1: getTestContract("dev-ethereum", "erc721V3"),
		erc1155_1: getTestContract("dev-ethereum", "erc1155V2"),
	},
	[Blockchain.POLYGON]: {
		erc20_mintable_1: "0xd6e804e7EDB5B2AecB31D9cCC9d9F3940a7b4cE2",
		wrapped_eth: "0x328823f69a0915c9BEc366Eb09ccdfB964f91Ad5",
		erc721_1: "0xF3348949Db80297C78EC17d19611c263fc61f987",
		erc1155_1: "0x1e74B5E00A5198ce5eeF657431bc7F94EbaeA471",
	},
}
