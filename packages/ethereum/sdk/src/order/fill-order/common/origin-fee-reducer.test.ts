import { toAddress, ZERO_ADDRESS } from "@rarible/types"
import { OriginFeeReducer } from "./origin-fee-reducer"
import { ZERO_FEE_VALUE } from "./origin-fees-utils"

describe("OriginFeeReducer", () => {
  const addr1 = toAddress("0xFc7b41fFC023bf3eab6553bf4881D45834EF1E8a")
  const addr2 = toAddress("0x0d28e9Bd340e48370475553D21Bd0A95c9a60F92")
  const addr3 = toAddress("0x3eab6553bf4881D45834EF1E87047555c9a67773")

  test("no fees test", () => {
    const feeReducer = new OriginFeeReducer()
    expect(feeReducer.getAddresses()).toEqual([ZERO_ADDRESS, ZERO_ADDRESS])
    const val = feeReducer.reduce([])
    expect(val).toEqual(ZERO_FEE_VALUE)
    expect(feeReducer.getAddresses()).toEqual([ZERO_ADDRESS, ZERO_ADDRESS])
  })

  test("simple fees reduce test", () => {
    const feeReducer = new OriginFeeReducer()
    let val = feeReducer.reduce([
      {
        account: addr1,
        value: 10,
      },
    ])
    expect(val).toEqual("0x00000000000000000000000000000000000000000000000000000000000a0000")
    expect(feeReducer.getAddresses()).toEqual([addr1, ZERO_ADDRESS])

    val = feeReducer.reduce([
      {
        account: addr1,
        value: 100,
      },
    ])
    expect(val).toEqual("0x0000000000000000000000000000000000000000000000000000000000640000")
    expect(feeReducer.getAddresses()).toEqual([addr1, ZERO_ADDRESS])

    val = feeReducer.reduce([
      {
        account: addr1,
        value: 100,
      },
      {
        account: addr1,
        value: 10,
      },
    ])
    expect(val).toEqual("0x00000000000000000000000000000000000000000000000000000000006e0000")
    expect(feeReducer.getAddresses()).toEqual([addr1, ZERO_ADDRESS])

    val = feeReducer.reduce([
      {
        account: addr1,
        value: 5,
      },
      {
        account: addr2,
        value: 1,
      },
    ])
    expect(val).toEqual("0x0000000000000000000000000000000000000000000000000000000000050001")
    expect(feeReducer.getAddresses()).toEqual([addr1, addr2])

    val = feeReducer.reduce([
      {
        account: addr2,
        value: 1,
      },
    ])
    expect(val).toEqual("0x0000000000000000000000000000000000000000000000000000000000000001")
    expect(feeReducer.getAddresses()).toEqual([addr1, addr2])
  })

  test("different order addresses", () => {
    const feeReducer = new OriginFeeReducer()

    let val = feeReducer.reduce([
      {
        account: addr1,
        value: 5,
      },
      {
        account: addr2,
        value: 1,
      },
    ])
    expect(val).toEqual("0x0000000000000000000000000000000000000000000000000000000000050001")
    expect(feeReducer.getAddresses()).toEqual([addr1, addr2])

    val = feeReducer.reduce([
      {
        account: addr2,
        value: 9,
      },
      {
        account: addr1,
        value: 3,
      },
    ])
    expect(val).toEqual("0x0000000000000000000000000000000000000000000000000000000000030009")
    expect(feeReducer.getAddresses()).toEqual([addr1, addr2])
  })

  test("should throw when reduce more than 2 addresses", () => {
    const feeReducer = new OriginFeeReducer()

    expect(() =>
      feeReducer.reduce([
        {
          account: addr1,
          value: 5,
        },
        {
          account: addr2,
          value: 1,
        },
        {
          account: addr3,
          value: 1,
        },
      ]),
    ).toThrow("Supports max up to 2 different origin fee address per request")
  })

  test("should throw when reduce more than 2 addresses in different reduces", () => {
    const feeReducer = new OriginFeeReducer()

    expect(() =>
      feeReducer.reduce([
        {
          account: addr1,
          value: 5,
        },
        {
          account: addr2,
          value: 1,
        },
      ]),
    ).not.toThrow()

    expect(() =>
      feeReducer.reduce([
        {
          account: addr2,
          value: 1,
        },
      ]),
    ).not.toThrow()

    expect(() =>
      feeReducer.reduce([
        {
          account: addr1,
          value: 5,
        },
        {
          account: addr3,
          value: 1,
        },
      ]),
    ).toThrow("Supports max up to 2 different origin fee address per request")

    expect(() =>
      feeReducer.reduce([
        {
          account: addr3,
          value: 5,
        },
        {
          account: addr1,
          value: 1,
        },
      ]),
    ).toThrow("Supports max up to 2 different origin fee address per request")
  })
})
