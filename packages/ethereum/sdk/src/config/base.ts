import { Blockchain } from "@rarible/api-client"
import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const baseConfig: EthereumConfig<"base"> = {
	network: "base",
	blockchain: Blockchain.BASE,
	basePath: "https://base-api.rarible.org",
	chainId: 8453,
	environment: "production",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x6C65a3C3AA67b126e43F86DA85775E0F5e9743F7"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0xC699FB932c1bD7235C7ED19388f26A2428224AED"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x4217a346C8b48731641327b65bb6F6d3243d64e2"),
		erc20: toAddress("0x13b05523634ABb96E6017Da71b7698CAecDf50b2"),
		erc721Lazy: toAddress("0x339e61eb644A29B134D7fD3fA589C6b3ca184111"),
		erc1155Lazy: toAddress("0x5faf16A85028BE138A7178B222DeC98092FEEF97"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
		merkleValidator: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0xF965237c6b3f89f8C62B45b94097899E3562A830"),
		erc1155: toAddress("0xd37DC0CD86Dfa9B2B57CD7DFA8B6AA0092a9517d"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	publicCollections: {
		erc721: {
			v2: ZERO_ADDRESS,
			v3: toAddress("0x139608ABeE12Ff39FEDae39C493B571A25995E10"),
		},
		erc1155: {
			v2: toAddress("0x55A921a57f7F15dF2f229Ab9889506Ca89310800"),
		},
	},
	weth: toAddress("0x4200000000000000000000000000000000000006"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
