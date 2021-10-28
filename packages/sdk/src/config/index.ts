import { E2E_CONFIG } from "./e2e"
import { DEV_CONFIG } from "./dev"
import { STAGING_CONFIG } from "./staging"
import { PROD_CONFIG } from "./prod"

export const CONFIGS = {
	dev: DEV_CONFIG,
	e2e: E2E_CONFIG,
	staging: STAGING_CONFIG,
	prod: PROD_CONFIG,
}
