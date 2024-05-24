import type { RaribleSdkEnvironment } from "@rarible/sdk/build/config/domain"

export type EnvironmentConfig<T extends RaribleSdkEnvironment> = {
  label: string
  value: T
}

export type EnvironmentDictionary = {
  [K in RaribleSdkEnvironment]: EnvironmentConfig<K>
}
