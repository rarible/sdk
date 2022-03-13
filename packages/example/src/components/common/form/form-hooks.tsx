import { useForm } from "react-hook-form"

export function useFormInputError(form: ReturnType<typeof useForm>, field: string) {
	const { formState: { errors } } = form
	const error = errors[field]

	const hasError = !!error
	let message = ""

	if (hasError) {
		message = error.message
		if (!message) {
			switch (error.type) {
				case "required":
					message = "This field is required"
					break
				default:
					message = ""
			}
		}
	}

	return {message, hasError}
}