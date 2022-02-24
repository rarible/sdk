import { e2eTestsConfig } from "./config/e2e"
import { Blockchain } from "@rarible/api-client";

export const testsConfig = {
    blockchain: process.env.BLOCKCHAIN?.split(',') as Blockchain[],
    env: process.env.TEST_ENV,
    variables: fetch(process.env.TEST_ENV)
}

function fetch(env?: string) {
    if (env === "e2e") {
        return e2eTestsConfig
    }
    throw new Error("Wrong environment")
}
