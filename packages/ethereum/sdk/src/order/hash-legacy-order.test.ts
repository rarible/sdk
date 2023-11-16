import { toAddress, toBigNumber, toWord } from "@rarible/types"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { createTestProviders } from "../common/test/create-test-providers"
import { getEthUnionAddr } from "../common/test"
import { hashLegacyOrder } from "./hash-legacy-order"
import type { SimpleLegacyOrder } from "./types"

const { provider, wallets } = createGanacheProvider()
const { providers } = createTestProviders(provider, wallets[0])

describe.each(providers)("hashLegacyOrder", ethereum => {

	test("simple order is hashed correctly", () => {
		const hash = hashLegacyOrder(ethereum, {
			data: {
				"@type": "ETH_RARIBLE_V1",
				fee: 1,
			},
			salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
			maker: getEthUnionAddr("0x10aea70c91688485a9c2f602d0a8dd438c75ea41"),
			make: {
				type: {
					"@type": "ERC20",
					contract: getEthUnionAddr("0x1685975920792048e861647c1b1b6f22318215fa"),
				},
				value: toBigNumber("10"),
			},
			take: {
				type: {
					"@type": "ERC20",
					contract: getEthUnionAddr("0x44953ab2e88391176576d49ca23df0b8acd793be"),
				},
				value: toBigNumber("5"),
			},
		} as SimpleLegacyOrder)

		expect(hash).toBe("0xc1da10c91abd6133109b4dfd20c106887493a0893eec49f2980b1b43c608ad02")
	})
})
