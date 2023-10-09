import fingerprint from "@fingerprintjs/fingerprintjs"

export const UNRECOGNIZED = toFingerprint("UNRECOGNIZED")

export type Fingerprint = string & {
	__IS_FINGERPRINT__: true
}

export async function getFingerprint(): Promise<Fingerprint> {
	try {
		const loaded = await fingerprint.load()
		const fg = await loaded.get()
		return toFingerprint(fg.visitorId)
	} catch (error) {
		return UNRECOGNIZED
	}
}

function toFingerprint(raw: string) {
	return raw as Fingerprint
}
