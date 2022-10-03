import { developmentTestsConfig } from "./config/development"

export const testsConfig = {
	env: process.env.TEST_ENV,
	variables: fetchEnv(process.env.TEST_ENV),
}

function fetchEnv(env?: string) {
	if (env === "development") {
		return developmentTestsConfig
	}
	throw new Error("Wrong environment")
}
