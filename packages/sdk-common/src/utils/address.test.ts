import { normalizeAptosAddress, normalizeAptosNetwork } from "./address"

describe("address/network utilities", () => {
  test("normalize address #1", () => {
    const normalizedAddress = normalizeAptosAddress("0x001")
    expect(normalizedAddress).toBe("0x0000000000000000000000000000000000000000000000000000000000000001")
  })

  test("normalize address #2", () => {
    const normalizedAddress = normalizeAptosAddress("0x99999999999999999")
    expect(normalizedAddress).toBe("0x0000000000000000000000000000000000000000000000099999999999999999")
  })

  test("normalize network #1", () => {
    const normalizedAddress = normalizeAptosNetwork("mainnet")
    expect(normalizedAddress).toBe("Mainnet")
  })

  test("normalize network #2", () => {
    const normalizedAddress = normalizeAptosNetwork("Testnet")
    expect(normalizedAddress).toBe("Testnet")
  })
})
