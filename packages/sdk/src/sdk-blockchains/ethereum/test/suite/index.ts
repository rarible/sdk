import { E2EProvider } from "@rarible/ethereum-sdk-test-common/build"
import type { E2EProviderConfig } from "@rarible/ethereum-sdk-test-common/build"
import type { BigNumberValue } from "@rarible/utils"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { Blockchain } from "@rarible/api-client"
import type { Address } from "@rarible/types"
import { toAddress } from "@rarible/types"
import { SDKTestSuite } from "../../../../common/suite"
import { devNetworkByBlockchain } from "../common"
import type { EVMSuiteHookedProvider, EVMSuiteSupportedBlockchain, EVMSuiteTestConfig } from "./domain"
import { EVMContractsTestSuite } from "./contracts"

class EVMTestSuiteHookedProvider<T extends EVMSuiteSupportedBlockchain> implements EVMSuiteHookedProvider<T> {
    private readonly internalProvider: E2EProvider
    readonly provider: EVMSuiteHookedProvider<T>["provider"]

    constructor(blockchain: T, pk?: string, config?: Partial<E2EProviderConfig>) {
    	this.internalProvider = new E2EProvider(pk, {
    		...devNetworkByBlockchain[blockchain],
    		...config,
    	})
    	this.provider = new Web3Ethereum({
    		web3: this.internalProvider.web3,
    	})
    }

    start = () => this.internalProvider.start()
    destroy = () => this.internalProvider.stop()
}

export class EVMTestSuiteFactory<T extends EVMSuiteSupportedBlockchain> {
    create = async (pk?: string, config?: EVMSuiteTestConfig) => {
    	const hooked = new EVMTestSuiteHookedProvider(this.blockchain, pk)
    	hooked.start()
    	const address = await hooked.provider.getFrom()
    	return new EVMTestSuite(this.blockchain, hooked, address, {
    		...devNetworkByBlockchain[this.blockchain],
    		...config,
    	})
    }

    constructor(public readonly blockchain: T) {}
}

export class EVMTestSuite<T extends EVMSuiteSupportedBlockchain> extends SDKTestSuite<T> {
    readonly contracts = new EVMContractsTestSuite(this.blockchain, this.provider)
    readonly addressEvm = toAddress(this.addressString)

    constructor(
    	blockchain: T,
    	hooked: EVMSuiteHookedProvider<T>,
    	addressString: string,
    	config?: EVMSuiteTestConfig
    ) {
    	super(blockchain, hooked, addressString, config)
    }

    sponsor = async (to: Address, valueDecimal: BigNumberValue) => {
    	const nativeToken = this.getNativeToken()
    	return nativeToken.transfer(to, valueDecimal)
    }

    getNativeToken = () => {
    	switch (this.blockchain) {
    		case Blockchain.ETHEREUM: return this.contracts.getContract("eth")
    		case Blockchain.POLYGON: return this.contracts.getContract("eth")
    		default: throw new Error("Unsupported EVM blockchain")
    	}
    }
}
