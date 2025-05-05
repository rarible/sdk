import { sum2 } from "./test-class1"

describe("sum", () => {
  it("should return the sum of two positive numbers", () => {
    expect(sum2(1, 2)).toBe(3)
  })

  it("should return the sum of two negative numbers", () => {
    expect(sum2(-1, -2)).toBe(-3)
  })

  it("should return the sum of a positive and a negative number", () => {
    expect(sum2(1, -2)).toBe(-1)
  })

  it("should return the sum of zero and a number", () => {
    expect(sum2(0, 5)).toBe(5)
  })
})
