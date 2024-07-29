import type { useForm } from "react-hook-form"

export function useFormInputError(form: ReturnType<typeof useForm>, field: string) {
  const { errors } = form.formState
  const error = errors[field]

  return {
    message: typeof error?.message === "string" ? error.message : "",
    hasError: !!error,
  }
}
