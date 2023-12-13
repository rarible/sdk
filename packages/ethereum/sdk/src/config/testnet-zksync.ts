import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const zkSyncTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-zksync-api.rarible.org",
	chainId: 280,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x1d2c207419A7dC6c1a59760f61B16Bbc76F486FE"),
		openseaV1: ZERO_ADDRESS,
		wrapper: ZERO_ADDRESS,
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xb0B38eAD18Ad31C5CDaf27Bd96628290F0A542b4"),
		erc20: toAddress("0x5CA0A4CBfFdB62F2e9BF2Ae077Faa87F94a89e5f"),
		erc721Lazy: toAddress("0x27EE300098DB6cb21637739e94E733127ff5a066"),
		erc1155Lazy: toAddress("0xB3FA3bC0C5Ea0BDA5298c94103682B34070590ce"),
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
		erc721: toAddress("0xde44BF92f848ca334E131e196e3EDa1a3dDfD6A4"),
		erc1155: toAddress("0xb2E38fe7025EF5f0597A0420aAfD1DA7D40c8a32"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x20b28B1e4665FFf290650586ad76E977EAb90c5D"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
