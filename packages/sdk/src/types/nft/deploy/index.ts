import type { SimplifiedWithActionClass } from "../../common"
import type { ICreateCollectionSimplified } from "./simplified"
import type { ICreateCollectionAction } from "./domain"

export type ICreateCollection = SimplifiedWithActionClass<ICreateCollectionSimplified, ICreateCollectionAction>
