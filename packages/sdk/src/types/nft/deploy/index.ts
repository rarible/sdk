import type { ICreateCollectionSimplified } from "./simplified"
import type { ICreateCollectionAction } from "./domain"

export type ICreateCollection = ICreateCollectionSimplified & {
	action: ICreateCollectionAction
}
