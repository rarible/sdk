import { toEVMAddress, toBigNumber, toWord } from "@rarible/types"
import { createGanacheProvider } from "@rarible/ethereum-sdk-test-common/build/create-ganache-provider"
import { createEthereumProviders } from "../common/test/create-test-providers"
import { hashLegacyOrder } from "./hash-legacy-order"

const { provider, wallets } = createGanacheProvider()
const { providers } = createEthereumProviders(provider, wallets[0])

/**
 * @group provider/ganache
 */
describe.each(providers)("hashLegacyOrder", ethereum => {
  test("simple order is hashed correctly", () => {
    const hash = hashLegacyOrder(ethereum, {
      type: "RARIBLE_V1",
      data: {
        dataType: "LEGACY",
        fee: 1,
      },
      salt: toWord("0x000000000000000000000000000000000000000000000000000000000000000a"),
      maker: toEVMAddress("0x10aea70c91688485a9c2f602d0a8dd438c75ea41"),
      make: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress("0x1685975920792048e861647c1b1b6f22318215fa"),
        },
        value: toBigNumber("10"),
      },
      take: {
        assetType: {
          assetClass: "ERC20",
          contract: toEVMAddress("0x44953ab2e88391176576d49ca23df0b8acd793be"),
        },
        value: toBigNumber("5"),
      },
    })

    expect(hash).toBe("0xc1da10c91abd6133109b4dfd20c106887493a0893eec49f2980b1b43c608ad02")
  })
})
