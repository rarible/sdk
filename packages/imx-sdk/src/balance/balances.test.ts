import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { getBalance } from "../index"

describe("test imx balances", () => {
	const address = "0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"

	test("should get eth balance", async () => {
		const ethBalance = await getBalance("dev", toAddress(address), { assetClass: "ETH" })
		expect(parseFloat(ethBalance.toString())).toBeGreaterThan(0)
	})

	test("should get erc20 balance", async () => {
		const ethBalance = await getBalance("dev", toAddress(address), {
			assetClass: "ERC20",
			contract: toAddress("0x26b81657e09d3a6a18ff1c6d776fd09f4bb9ee80"),
		})
		expect(parseFloat(ethBalance.toString())).toBeGreaterThan(0)
	})

	test("should return 0 for not exist token", async () => {
		const nonExistableBalance = await getBalance("dev", toAddress(address), {
			assetClass: "ERC20",
			contract: ZERO_ADDRESS,
		})
		expect(parseFloat(nonExistableBalance.toString())).toEqual(0)
	})

})
