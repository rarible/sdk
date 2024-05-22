import { conditionalRetry } from "./retry"

describe("retry", function () {
  test("retry if catch custom error", async () => {
    let attemptsCounter = 0
    let err
    try {
      await conditionalRetry(
        2,
        100,
        async () => {
          attemptsCounter += 1
          throw new Error("custom error")
        },
        err => err.message === "custom error",
      )
    } catch (e: any) {
      err = e
    }

    expect(attemptsCounter).toBe(3)
    expect(err?.message).toBe("custom error")
  })

  test("don't retry if error is not custom", async () => {
    let attemptsCounter = 0
    let err
    try {
      await conditionalRetry(
        10,
        100,
        async () => {
          attemptsCounter += 1
          throw new Error("default error")
        },
        err => err.message === "custom error",
      )
    } catch (e: any) {
      err = e
    }

    expect(attemptsCounter).toBe(1)
    expect(err?.message).toBe("default error")
  })

  test("throw default error after retrying custom error", async () => {
    let attemptsCounter = 0
    let err
    try {
      await conditionalRetry(
        10,
        100,
        async () => {
          attemptsCounter += 1
          if (attemptsCounter < 2) throw new Error("custom error")
          throw new Error("default error")
        },
        err => err.message === "custom error",
      )
    } catch (e: any) {
      err = e
    }
    expect(attemptsCounter).toBe(2)
    expect(err?.message).toBe("default error")
  })

  test("return result after 3 failed attempts", async () => {
    let attemptsCounter = 0
    const result = await conditionalRetry(
      10,
      100,
      async () => {
        attemptsCounter += 1
        if (attemptsCounter < 4) throw new Error("custom error")
        return "wow"
      },
      err => err.message === "custom error",
    )
    expect(result).toBe("wow")
    expect(attemptsCounter).toBe(4)
  })
})
