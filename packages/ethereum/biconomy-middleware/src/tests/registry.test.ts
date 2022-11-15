import { Registry } from "../registry"

describe("registry test", function () {
	it("should check allowed functions", async () => {
		const registry = new Registry("https://example.com")
		const data = {
			types: {
				EIP712Domain: [],
				MetaTransaction: [],
			},
			domain: [],
			primaryType: "type",
			allowedFunctions: ["0x12345678", "abcdEFGh"],
		}
		registry["registryData"] = {
			"0x123": data,
		}

		const metadata = await registry.getMetadata("0x123", "0x123456789")
		expect(metadata).toEqual(data)

		const metadata2 = await registry.getMetadata("0x123", "123456789")
		expect(metadata2).toEqual(data)

		const metadata3 = await registry.getMetadata("0x123", "xxx")
		expect(metadata3).toEqual(undefined)

		const metadata4 = await registry.getMetadata("0x321", "0x123456789")
		expect(metadata4).toEqual(undefined)

		const metadata5 = await registry.getMetadata("0x123", "abcdefghxxx")
		expect(metadata5).toEqual(data)

		const metadata6 = await registry.getMetadata("0x123", "0xabcdefghxxx")
		expect(metadata6).toEqual(data)

		const metadata7 = await registry.getMetadata("0x321", "")
		expect(metadata7).toEqual(undefined)

		const metadata8 = await registry.getMetadata("0x321", undefined)
		expect(metadata8).toEqual(undefined)

		const metadata9 = await registry.getMetadata("0x123", undefined)
		expect(metadata9).toEqual(undefined)
	})

	it("will not check signature if allowedFunctions not specified", async () => {
		const registry = new Registry("https://example.com")
		const data = {
			types: {
				EIP712Domain: [],
				MetaTransaction: [],
			},
			domain: [],
			primaryType: "type",
		}
		registry["registryData"] = {
			"0x123": data,
		}

		const metadata = await registry.getMetadata("0x123", "0x123456789")
		expect(metadata).toEqual(data)

		const metadata1 = await registry.getMetadata("0x123")
		expect(metadata1).toEqual(data)

		const metadata2 = await registry.getMetadata("0x321", "0x123456789")
		expect(metadata2).toEqual(undefined)
	})
})
