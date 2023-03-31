import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const stagingEthereumConfig: EthereumConfig = {
	basePath: "https://staging-ethereum-api.rarible.org",
	chainId: 200500,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x6aABb267a1c440CfB5C200Ebcd078Efa9249492A"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x274c9F788D322b00857fd43E7D07cDF9F0314c37"),
		looksrare: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0xc6f33b62A94939E52E1b074c4aC1A801B869fDB2"),
		erc20: toAddress("0x3586d3E6CDaE98d5F0eEaB737977Bc78406Da2BD"),
		erc721Lazy: toAddress("0xeC47DA9591FC24F5a5F401e8D275526Cc5eE5d37"),
		erc1155Lazy: toAddress("0x8812cFb55853da0968a02AaaEA84CD93EC4b42A1"),
		openseaV1: ZERO_ADDRESS,
		cryptoPunks: ZERO_ADDRESS,
	},
	feeConfigUrl: FEE_CONFIG_URL,
	openSea: {
		metadata: id32("RARIBLE"),
		proxyRegistry: ZERO_ADDRESS,
	},
	factories: {
		erc721: toAddress("0x6972347e66A32F40ef3c012615C13cB88Bf681cc"),
		erc1155: toAddress("0x2754b8bc3D1b59053B1b53adfDb9536EED023D58"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0x525641e8f1140b8a215A0D9692BA2C9A7916e017"),
		pairRouter: toAddress("0xE27A07e9B293dC677e34aB5fF726073ECbeCA842"),
	},
	weth: toAddress("0x8618444D5916c52Ef2BA9a64dDE5fE04249F6001"),
	auction: ZERO_ADDRESS,
}
