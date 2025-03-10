import { toBinary, EVM_ZERO_ADDRESS } from "@rarible/types"
import { FILL_CALLDATA_TAG } from "../../../config/common"
import { getUpdatedCalldata } from "./get-updated-call"

describe("getUpdatedFunctionCall", () => {
  test("get updated call with null-length fillCalldata should be rejected", async () => {
    const promise = async () => getUpdatedCalldata({ marketplaceMarker: toBinary("0x") })
    expect(promise).rejects.toThrow("MarketplaceMarker has length = 0, but should be = 48")
  })

  test("get updated call with non-hex fillCalldata should be rejected", async () => {
    const promise = async () => getUpdatedCalldata({ marketplaceMarker: toBinary("heh,hoh,2022") })
    expect(promise).rejects.toThrow("MarketplaceMarker is not a hex value")
  })

  test("get updated call with fillCalldata should returns correct FunctionCall", async () => {
    const calldata = getUpdatedCalldata({ marketplaceMarker: toBinary(`${EVM_ZERO_ADDRESS}00000001`) })
    expect(calldata).toBe(`${EVM_ZERO_ADDRESS}00000001${FILL_CALLDATA_TAG}`)
  })

  test("get updated call with no fillCalldata should returns default value", async () => {
    const calldata = getUpdatedCalldata()
    expect(calldata).toBe(`${EVM_ZERO_ADDRESS}00000000${FILL_CALLDATA_TAG}`)
  })
})
