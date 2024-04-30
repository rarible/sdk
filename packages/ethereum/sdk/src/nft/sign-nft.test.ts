import { toAddress, toBigNumber } from "@rarible/types"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { getEthereumConfig } from "../config"
import { createEthereumProviders } from "../common/test/create-test-providers"
import type { SimpleLazyNft } from "./sign-nft"
import { signNft } from "./sign-nft"

const { provider, wallets } = createGanacheProvider(
	"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
)
const { providers } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("sign nft test", (ethereum) => {
	const config = getEthereumConfig("dev-ethereum")
	const getConfig = async () => config


	test("should sign ERC721 nft with web3 v1", async () => {
		const nftTemplate: SimpleLazyNft<"signatures"> = {
			"@type": "ERC721",
			contract: toAddress("0x2547760120aED692EB19d22A5d9CCfE0f7872fcE"),
			tokenId: toBigNumber("1"),
			uri: "ipfs://ipfs/hash",
			creators: [{ account: toAddress(await ethereum.getFrom()), value: 10000 }],
			royalties: [],
		}
		const signature = await signNft(ethereum, getConfig, nftTemplate)
		expect(signature).toEqual(
			"0xc0630ed85471ebfcd191b4ef45676520164be53689dd2bc88e9936a6352f653d7e641d5b1777aaef7e48366ab4e4436963fb0149ae9652b899551799cb02486f1b"
		)
	})
})
