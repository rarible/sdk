import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { getBalance } from "../index"
import { createApis } from "../apis"

describe("test imx balances", () => {
	const address = "0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"
	const env = "testnet"
	const apis = createApis(env)

	test.skip("should get eth balance", async () => {
		const ethBalance = await getBalance(env, apis, toAddress(address), { assetClass: "ETH" })
		expect(parseFloat(ethBalance.toString())).toBeGreaterThan(0)
	})

	test.skip("should get erc20 balance", async () => {
		const ethBalance = await getBalance(env, apis, toAddress(address), {
			assetClass: "ERC20",
			contract: toAddress("0x26b81657e09d3a6a18ff1c6d776fd09f4bb9ee80"),
		})
		expect(parseFloat(ethBalance.toString())).toBeGreaterThan(0)
	})

	test("should return 0 for not exist token", async () => {
		const nonExistableBalance = await getBalance(env, apis, toAddress(address), {
			assetClass: "ERC20",
			contract: ZERO_ADDRESS,
		})
		expect(parseFloat(nonExistableBalance.toString())).toEqual(0)
	})

})
