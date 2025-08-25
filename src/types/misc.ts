export type JsonifyObject<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends object
      ? JsonifyObject<T[K]>
      : T[K]
}
