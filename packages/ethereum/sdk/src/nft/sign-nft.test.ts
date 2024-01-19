import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber } from "@rarible/types"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { getEthereumConfig } from "../config"
import type { SimpleLazyNft } from "./sign-nft"
import { signNft } from "./sign-nft"

describe("mint-lazy test", () => {
	const { provider, addresses } = createGanacheProvider(
		"d519f025ae44644867ee8384890c4a0b8a7b00ef844e8d64c566c0ac971c9469"
	)
	const [address] = addresses
	// @ts-ignore
	const web3 = new Web3(provider)

	const config = getEthereumConfig("dev-ethereum")
	const getConfig = async () => config


	test("should sign ERC721 nft", async () => {
		const nftTemplate: SimpleLazyNft<"signatures"> = {
			"@type": "ERC721",
			contract: toAddress("0x2547760120aED692EB19d22A5d9CCfE0f7872fcE"),
			tokenId: toBigNumber("1"),
			uri: "ipfs://ipfs/hash",
			creators: [{ account: address, value: 10000 }],
			royalties: [],
		}
		const signature = await signNft(new Web3Ethereum({ web3 }), getConfig, nftTemplate)
		expect(signature).toEqual(
			"0xc0630ed85471ebfcd191b4ef45676520164be53689dd2bc88e9936a6352f653d7e641d5b1777aaef7e48366ab4e4436963fb0149ae9652b899551799cb02486f1b"
		)
	})
})
