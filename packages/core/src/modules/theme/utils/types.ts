/**
 * Utility Types
 */

/**
 * Deep partial - makes all nested properties optional
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

/**
 * Deep required - makes all nested properties required
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

/**
 * Extract keys with string values
 */
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Omit deep - omit nested keys
 */
export type OmitDeep<T, K extends string> = T extends object
  ? {
      [P in keyof T as P extends K ? never : P]: OmitDeep<T[P], K>
    }
  : T
