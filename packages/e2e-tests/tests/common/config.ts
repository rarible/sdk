import type { Blockchain } from "@rarible/api-client"
import { e2eTestsConfig } from "./config/e2e"
import { developmentTestsConfig } from "./config/development"

export const testsConfig = {
	blockchain: getBlockchain(),
	env: process.env.TEST_ENV,
	variables: fetchEnv(process.env.TEST_ENV),
}

function getBlockchain() {
	let blockchains = process.env.BLOCKCHAIN?.split(",")
	if (blockchains === undefined || blockchains.includes("ALL")) {
		blockchains = ["ETHEREUM", "TEZOS", "FLOW", "SOLANA"]
	}
	return blockchains as Blockchain[]
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
