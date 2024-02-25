import type { Web3v4Ethereum } from "@rarible/web3-v4-ethereum"
import type { EVMSuiteSupportedBlockchain } from "../domain"
import type { EVMKnownTestContract, EVMContractsDictionary } from "./domain"
import { ERC1155Contract } from "./variants/erc1155"
import { ERC20Mintable } from "./variants/erc20-mintable"
import { ERC20Wrapped } from "./variants/erc20-wrapped"
import { ERC721Contract } from "./variants/erc721"
import { EVMNativeToken } from "./variants/native"

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
  				"0xA4A70E8627e858567a9f1F08748Fe30691f72b9e",
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "wrapped_eth": {
  			return new ERC20Wrapped(
  				this.blockchain,
  				"0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6",
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "eth": {
  			return new EVMNativeToken(this.blockchain, this.provider) as EVMContractsDictionary<T>[K]
  		}
  		case "erc1155_1": {
  			return new ERC1155Contract(
  				this.blockchain,
  				"0xda75B20cCFf4F86d2E8Ef00Da61A166edb7a233a",
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		case "erc721_1": {
  			return new ERC721Contract(
  				this.blockchain,
  				"0x96CE5b00c75e28d7b15F25eA392Cbb513ce1DE9E",
  				this.provider
  			) as EVMContractsDictionary<T>[K]
  		}
  		default:
  			throw new Error("Unknown contract type")
  	}
  };
}
