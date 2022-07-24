import type { MethodWithAction } from "../../common"
import type { ICreateCollectionSimplified } from "./simplified"
import type { ICreateCollectionAction } from "./domain"

export type ICreateCollection = MethodWithAction<ICreateCollectionSimplified, ICreateCollectionAction>
