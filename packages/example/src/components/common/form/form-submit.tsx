import React from "react"
import { useForm } from "react-hook-form"
import { faCheckDouble, faExclamationTriangle, faCheck } from "@fortawesome/free-solid-svg-icons"
import { LoadingButton } from "@mui/lab"
import { IconDefinition } from "@fortawesome/fontawesome-common-types"
import { size } from "lodash"
import { Icon } from "../icon"
import { FormState } from "./types"

interface IFormSubmitProps  {
	form: ReturnType<typeof useForm>
	label: string
	state: FormState
	icon?: IconDefinition
	disabled?: boolean
}

export function FormSubmit({ form, icon, label, state, disabled }: IFormSubmitProps) {
	const { formState: { errors, isSubmitting, isValidating } } = form

	const isValid = size(errors) === 0

	let color
	let iconEl
	if (!isValid) {
		color = "warning"
		iconEl = <Icon icon={faExclamationTriangle}/>
	} else {
		switch (state) {
			case "error":
				color = "error"
				iconEl = <Icon icon={faExclamationTriangle}/>
				break
			case "success":
				color = "success"
				iconEl = <Icon icon={faCheckDouble}/>
				break
			case "normal":
			default:
				color = "primary"
				iconEl = <Icon icon={icon ?? faCheck}/>
		}
	}

	return <LoadingButton
		type="submit"
		loading={isSubmitting || isValidating}
		loadingPosition="start"
		startIcon={iconEl}
		color={color as any}
		variant="contained"
		disabled={disabled}
	>
		{label}
	</LoadingButton>
}