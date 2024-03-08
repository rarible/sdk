import { toUnionAddress } from "@rarible/types"
import type { RaribleSdkProvider } from "@rarible/sdk-wallet/build"
import { createRaribleSdk } from "../.."
import { LogsLevel } from "../../domain"
import type { IRaribleSdk } from "../../domain"
import { toBlockchainGroup } from "../extract-blockchain"
import { getAPIKey } from "../test/create-sdk"
import type { RaribleSdkEnvironment } from "../../config/domain"
import type { TestSuiteHookedProvider, SuiteSupportedBlockchain, TestSuiteSDKConfig } from "./domain"
import { ItemTestSuite } from "./item"
import { OrderTestSuite } from "./order"
import { OwnershipTestSuite } from "./ownership"
import { BalancesTestSuite } from "./balances"

export class SDKBaseTestSuite {
  readonly sdk: IRaribleSdk

  constructor(
  	config: TestSuiteSDKConfig = {},
  	provider: RaribleSdkProvider | undefined = undefined
  ) {
  	const env: RaribleSdkEnvironment = "development"
  	this.sdk = createRaribleSdk(provider, env, {
  		logs: LogsLevel.DISABLED,
  		apiKey: getAPIKey(env),
  		...config,
  	})

  }
}

export class SDKTestSuite<T extends SuiteSupportedBlockchain> extends SDKBaseTestSuite {
	readonly blockchainGroup = toBlockchainGroup(this.blockchain)
  readonly provider = this.hooked.provider
	readonly items = new ItemTestSuite(this.blockchain, this.sdk, this.provider)
	readonly ownerships = new OwnershipTestSuite(this.sdk)
	readonly orders = new OrderTestSuite(this.blockchain, this.sdk, this.ownerships)
	readonly addressUnion = toUnionAddress(`${this.blockchainGroup}:${this.addressString}`)
	readonly balances = new BalancesTestSuite(this.blockchain, this.sdk, this.addressUnion)

	constructor(
		public readonly blockchain: T,
		public readonly hooked: TestSuiteHookedProvider<T>,
		public readonly addressString: string,
		config?: TestSuiteSDKConfig
	) {
		super(config, hooked.provider)
	}

  destroy = () => this.hooked.destroy()
}
