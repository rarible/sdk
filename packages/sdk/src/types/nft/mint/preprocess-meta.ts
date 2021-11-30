import type { MetaContentRepresentation } from "@rarible/api-client/build/models/MetaContent"

export type PreprocessMeta = {
	name: string
	decimals: number
	description?: string
	attributes: Array<PreprocessMetaAttribute>
	content: Array<PreprocessMetaContent>
	raw?: string
	minter?: string
	creators?: Array<string>
	contributors?: Array<string>
	publishers?: Array<string>
	date?: string
	type?: string
	tags?: Array<string>
	genres?: Array<string>
	rights?: Array<string>
	language?: string
}

export type PreprocessMetaContent = {
	url: string
	mimeType: string
	representation: MetaContentRepresentation
	hash?: string
	size?: number
	width?: number
	height?: number
	filename?: string
	duration?: string
	dataRate?: {
		value: string
		unit: string
	}
}

export type PreprocessMetaAttribute = {
	name: string
	value: string
	type?: string
}
