// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type FormData from "form-data"

declare global {
  namespace globalThis {
    var FormData: typeof FormData
  }
}
