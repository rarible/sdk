import { developmentTestsConfig } from "./config/development"
import { stagingTestsConfig } from "./config/staging"

export const testsConfig = {
	env: process.env.TEST_ENV,
	variables: fetchEnv(process.env.TEST_ENV),
}

function fetchEnv(env?: string) {
	if (env === "development") {
		return developmentTestsConfig
	}
	if (env === "staging") {
		return stagingTestsConfig
	}
	throw new Error("Wrong environment")
}
