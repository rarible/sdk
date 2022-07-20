import { e2eTestsConfig } from "./config/e2e"
import { developmentTestsConfig } from "./config/development"

export const testsConfig = {
	env: process.env.TEST_ENV,
	variables: fetchEnv(process.env.TEST_ENV),
}

function fetchEnv(env?: string) {
	if (env === "e2e") {
		return e2eTestsConfig
	}
	if (env === "development") {
		return developmentTestsConfig
	}
	throw new Error("Wrong environment")
}
