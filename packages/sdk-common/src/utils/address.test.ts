import { normalizeAddress } from "./address"

describe("address utilities", () => {
  test("normalize address #1", () => {
    const normalizedAddress = normalizeAddress("0x001")
    expect(normalizedAddress).toBe("0x0000000000000000000000000000000000000000000000000000000000000001")
  })

  test("normalize address #2", () => {
    const normalizedAddress = normalizeAddress("0x99999999999999999")
    expect(normalizedAddress).toBe("0x0000000000000000000000000000000000000000000000099999999999999999")
  })
})
