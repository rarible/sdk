import { getStringifiedData } from "./get-stringified-data"

describe("get stringified data", () => {
  test("empty object", () => {
    const data = getStringifiedData({})
    expect(data).toBe("{}")
  })

  test("string argument", () => {
    const data = getStringifiedData("")
    expect(data).toBe("")
  })

  test("object with string, number and another object", () => {
    const data = getStringifiedData({
      field1: "o",
      field2: 10,
      field3: { field4: "o" },
    })
    expect(data).toBe(`{\n  "field1": "o",\n  "field2": 10,\n  "field3": {\n    "field4": "o"\n  }\n}`)
  })

  test("object with error", () => {
    const data = getStringifiedData({
      field1: new Error("o"),
    }) as string
    expect(data.includes(`"field1": {`)).toBeTruthy()
    expect(data.includes(`"stack": "Error:`)).toBeTruthy()
    expect(data.includes(`"message": "o"`)).toBeTruthy()
  })

  test("circular object", () => {
    const sourceObject: any = {
      field1: "str",
    }
    sourceObject.field2 = sourceObject
    const data = getStringifiedData(sourceObject)
    expect(data).toBeTruthy()
  })
})
