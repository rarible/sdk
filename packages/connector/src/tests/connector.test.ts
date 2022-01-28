import type { Observable } from "rxjs"
import { BehaviorSubject, of } from "rxjs"
import { filter, first, map } from "rxjs/operators"
import type { ConnectionProvider } from "../provider"
import { MappedConnectionProvider } from "../provider"
import { Connector } from "../connector"
import { getStateConnected, getStateDisconnected } from "../connection-state"

describe("Connector", () => {
	test("should return options", async () => {
		const connector = Connector.create(test1).add(test2)
		expect(await connector.getOptions()).toStrictEqual([
			{ provider: test1, option: "test1-op1" },
			{ provider: test2, option: "test2-op1" },
		])
	})

	test("Connector can be created with some connectors", async () => {
		const cp1 = test1
		const cp2 = new MappedConnectionProvider(test2, n => `${n}`)
		const connector = new Connector([cp1, cp2])
		const options = await connector.getOptions()
		expect(options).toHaveLength(2)
	})

	test.skip("should not allow to connect if other connected", async () => {
		const conn1 = new BehaviorSubject<string | undefined>("connected")
		const p1 = createTestProvider(conn1)
		const conn2 = new BehaviorSubject<string | undefined>(undefined)
		const p2 = createTestProvider(conn2)

		const connector = Connector.create(p1).add(p2)
		const [opt1, opt2] = await connector.getOptions()
		await connector.connect(opt1)
		expect(async () => await connector.connect(opt2)).toThrow()

		conn1.next(undefined)
		expect(async () => await connector.connect(opt2)).not.toThrow()
		expect(async () => await connector.connect(opt2)).not.toThrow()
	})

	test("provider can be auto-connected", async () => {
		const test1AutoConnected = {
			...test1,
			isAutoConnected: () => Promise.resolve(true),
		}
		const connector = Connector.create(test1AutoConnected).add(test2)
		let connected = await connector.connection.pipe(
			filter(it => it !== undefined),
			first()
		).toPromise()
		expect(connected).toStrictEqual({ status: "initializing" })
		await connector.connect({
			provider: test1AutoConnected,
			option: "test1-op1",
		})

		connected = await connector.connection.pipe(first()).toPromise()
		expect(connected).toMatchObject({ status: "connected", connection: "connected" })
	})
})

const test1: ConnectionProvider<"test1-op1" | "test1-op2", string> = {
	getOption: () => Promise.resolve("test1-op1"),
	getConnection: () => of({ status: "connected", connection: "connected" }),
	isAutoConnected: () => Promise.resolve(false),
	getId: () => "test1-op1",
	isConnected: () => Promise.resolve(false),
}

const test2: ConnectionProvider<"test2-op1", number> = {
	getOption: () => Promise.resolve("test2-op1"),
	getConnection: () => of({ status: "connected", connection: 1 }),
	isAutoConnected: () => Promise.resolve(false),
	getId: () => "test2-op1",
	isConnected: () => Promise.resolve(false),
}

function createTestProvider(connection: Observable<string | undefined>): ConnectionProvider<"option", string > {
	return {
		getOption: () => Promise.resolve("option"),
		getConnection: () => connection.pipe(map(
			it => it ? getStateConnected({ connection: it }) : getStateDisconnected())
		),
		isAutoConnected: () => Promise.resolve(false),
		getId: () => "option",
		isConnected: () => Promise.resolve(false),
	}
}
