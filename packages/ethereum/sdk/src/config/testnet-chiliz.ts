import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { Blockchain } from "@rarible/api-client"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const chilizTestnetConfig: EthereumConfig = {
	basePath: "https://testnet-chiliz-api.rarible.org",
	chainId: 88882,
	environment: "testnet",
	blockchain: Blockchain.CHILIZ,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x4c27bE9fE53227194Ff259D8906A2A1b0479A3AA"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x1fD75d68F0D0F66383F011D282890BDACE221Dc2"),
		looksrare: ZERO_ADDRESS,
		looksrareV2: ZERO_ADDRESS,
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x3d1C134ece4CFA4c44AE5D37f74dEeccBceC9031"),
		erc20: toAddress("0x8A42da3cfd53ff38E6551cc3a05F536428DaaE34"),
		erc721Lazy: toAddress("0x615fdFC73edB58d9ef09574B5284E6E6362F7f6D"),
		erc1155Lazy: toAddress("0x40785643bdD364A21aeE1d138E026e8914c98572"),
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
		erc721: toAddress("0xAeEfB55eD03eC5a25Fc4C84354b6C8c65Df963EA"),
		erc1155: toAddress("0x7c512F690E89CF01deb04Bc68af95b1A5f7A2504"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: ZERO_ADDRESS,
		pairRouter: ZERO_ADDRESS,
	},
	weth: toAddress("0x678c34581db0a7808d0aC669d7025f1408C9a3C6"),
	auction: ZERO_ADDRESS,
	looksrareOrderValidatorV2: ZERO_ADDRESS,
}
