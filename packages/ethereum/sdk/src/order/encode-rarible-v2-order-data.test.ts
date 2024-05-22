import { toAddress, ZERO_WORD } from "@rarible/types"
import { encodePartToBuffer } from "./encode-rarible-v2-order-data"

describe("Convert OriginFee Part to uint", () => {
  test("Should make correct value", () => {
    expect(encodePartToBuffer(undefined)).toEqual(ZERO_WORD)

    expect(
      encodePartToBuffer({
        account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
        value: 1,
      }),
    ).toEqual("0x0000000000010d28e9Bd340e48370475553D21Bd0A95c9a60F92".toLowerCase())

    expect(
      encodePartToBuffer({
        account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
        value: 50,
      }),
    ).toEqual("0x0000000000320d28e9Bd340e48370475553D21Bd0A95c9a60F92".toLowerCase())

    expect(
      encodePartToBuffer({
        account: toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92"),
        value: 8888,
      }),
    ).toEqual("0x0000000022B80d28e9Bd340e48370475553D21Bd0A95c9a60F92".toLowerCase())
  })
})
