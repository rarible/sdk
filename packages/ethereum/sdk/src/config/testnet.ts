import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { id32 } from "../common/id"
import type { EthereumConfig } from "./type"
import { FEE_CONFIG_URL } from "./common"

export const testnetEthereumConfig: EthereumConfig = {
	basePath: "https://testnet-ethereum-api.rarible.org",
	chainId: 5,
	exchange: {
		v1: ZERO_ADDRESS,
		v2: toAddress("0x02afbD43cAD367fcB71305a2dfB9A3928218f0c1"),
		openseaV1: ZERO_ADDRESS,
		wrapper: toAddress("0x792936889cE1759E87D33035205C5fFf08A07e32"),
		looksrare: toAddress("0xD112466471b5438C1ca2D218694200e49d81D047"),
		x2y2: ZERO_ADDRESS,
	},
	transferProxies: {
		nft: toAddress("0x21B0B84FfAB5A8c48291f5eC9D9FDb9aef574052"),
		erc20: toAddress("0x17cEf9a8bf107D58E87c170be1652c06390BD990"),
		erc721Lazy: toAddress("0x96102D9472C0338005cbf12Fb7eA829F242C2809"),
		erc1155Lazy: toAddress("0x1e1B6E13F0eB4C570628589e3c088BC92aD4dB45"),
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
		erc721: toAddress("0x66a1037a48b6A2469cF740aD9Ac42BD47eDF9573"),
		erc1155: toAddress("0xf6dFfCB8E97c7F32f6bb6F0fad60b9D1ED661ba6"),
	},
	cryptoPunks: {
		marketContract: ZERO_ADDRESS,
		wrapperContract: ZERO_ADDRESS,
	},
	sudoswap: {
		pairFactory: toAddress("0xF0202E9267930aE942F0667dC6d805057328F6dC"),
		pairRouter: toAddress("0x25b4EfC43c9dCAe134233CD577fFca7CfAd6748F"),
	},
	weth: toAddress("0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6"),
	auction: ZERO_ADDRESS,
}
