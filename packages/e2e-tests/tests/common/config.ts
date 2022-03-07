import type { Blockchain } from "@rarible/api-client"
import { e2eTestsConfig } from "./config/e2e"
import { developmentTestsConfig } from "./config/development"

export const testsConfig = {
	blockchain: process.env.BLOCKCHAIN?.split(",") as Blockchain[],
	env: process.env.TEST_ENV,
	variables: fetch(process.env.TEST_ENV),
}

function fetch(env?: string) {
	if (env === "e2e") {
		return e2eTestsConfig
	}
	if (env === "development") {
		return developmentTestsConfig
	}
	throw new Error("Wrong environment")
}
