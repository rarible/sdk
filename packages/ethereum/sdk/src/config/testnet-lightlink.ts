import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const testnetLightlinkConfig: EthereumConfig = {
	basePath: "https://testnet-lightlink-api.rarible.org",
	chainId: 1891,
	environment: "testnet",
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x2E015B0474364757d2cc8e28897DCBCdEE07e340"),
		openseaV1: ZERO_ADDRESS,
		wrapper: ZERO_ADDRESS,
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x166F6180170f438Ddc38050a2B708d38c0890956"),
		erc20: toAddress("0x7d47126a2600E22eab9eD6CF0e515678727779A6"),
		erc721Lazy: toAddress("0x98C2d878064dCD20489214cf0866f972f91784D0"),
		erc1155Lazy: toAddress("0x12B372153249F006F756d0668fCDBD8fbD8b0a15"),
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
		erc721: toAddress("0xfeC0F8d936B9cBa92a332bCB06dC7DF4DdE0c253"),
		erc1155: toAddress("0x63e3297a90B4101d0a4Bb8EbEFDF3D47C8d4D4Ac"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0xF42991f02C07AB66cFEa282E7E482382aEB85461"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
