type Head<T extends string> = T extends `${infer First}.${string}` ? First : T

type Tail<T extends string> = T extends `${string}.${infer Rest}` ? Rest : never

export type DeepPick<T, K extends string> = T extends object
  ? {
      [P in Head<K> & keyof T]: T[P] extends readonly unknown[]
        ? DeepPick<T[P][number], Tail<Extract<K, `${P}.${string}`>>>[]
        : DeepPick<T[P], Tail<Extract<K, `${P}.${string}`>>>
    }
  : T
