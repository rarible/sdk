import type { MetaAttribute } from "@rarible/api-client/build/models/MetaAttribute"
import type { MetaContent } from "@rarible/api-client/build/models/MetaContent"

export type PreprocessMeta = {
	name: string;
	description?: string
	attributes: Array<PreprocessMetaAttribute>
	content: Array<PreprocessMetaContent>
	raw?: string
	minter?: string
	creators?: string
	date?: string
	type?: string
	tags?: Array<string>
	genres?: Array<string>
	rights?: Array<string>
	language?: string
}

export type PreprocessMetaContent = {
	url: string
	hash?: string
	mimeType: string
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
