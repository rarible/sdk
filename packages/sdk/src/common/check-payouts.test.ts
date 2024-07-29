import { toUnionAddress } from "@rarible/types"
import { checkPayouts } from "./check-payouts"

describe("check payouts", () => {
  test("should pass when payouts non specified", async () => {
    checkPayouts()
  })

  test("should throw error when sum of payouts less than 10,000 basis points", async () => {
    const promise = () =>
      checkPayouts([
        {
          account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
          value: 10,
        },
      ])
    expect(promise).toThrow("Sum of the values of Payouts objects should be equal to 10000 basis points, passed=10")
  })

  test("should throw error if sum more than 10,000 basis points", async () => {
    const promise = () =>
      checkPayouts([
        {
          account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
          value: 10,
        },
        {
          account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
          value: 9991,
        },
      ])
    expect(promise).toThrow("Sum of the values of Payouts objects should be equal to 10000 basis points, passed=10001")
  })

  test("should success if sum more than 10,000 basis points", async () => {
    checkPayouts([
      {
        account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
        value: 10,
      },
      {
        account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
        value: 9990,
      },
    ])
  })

  test("should success", async () => {
    checkPayouts([
      {
        account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
        value: 3333.3333333333335,
      },
      {
        account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
        value: 3333.3333333333335,
      },
      {
        account: toUnionAddress("ETHEREUM:0xcf715bc7a0817507d0648fae6c6dd1c1e6f8fe56"),
        value: 3333.3333333333335,
      },
    ])
  })
})
