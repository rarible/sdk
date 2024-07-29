import { deepMerge } from "./deep-merge"
describe("deepMerge", () => {
  it("should correctly merge two objects and not modify the original objects", () => {
    const obj1 = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
      },
    }
    const clonedObj1 = JSON.parse(JSON.stringify(obj1))

    const obj2 = {
      a: 10,
      c: {
        d: 30,
      },
      f: 5,
    }
    const clonedObj2 = JSON.parse(JSON.stringify(obj2))

    const expectedResult = {
      a: 10,
      b: 2,
      c: {
        d: 30,
        e: 4,
      },
      f: 5,
    }

    const mergeResult = {}
    expect(deepMerge(mergeResult, obj1, obj2)).toEqual(expectedResult)
    expect(mergeResult).toEqual(expectedResult)
    expect(obj1).toEqual(clonedObj1)
    expect(obj2).toEqual(clonedObj2)
  })
})
