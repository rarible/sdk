import type { CreateCollectionResponse } from "./domain"
import type { CreateCollectionRequestSimplified } from "./simplified"

export type ICreateCollection = (req: CreateCollectionRequestSimplified) => Promise<CreateCollectionResponse>
