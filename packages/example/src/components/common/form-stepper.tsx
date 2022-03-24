import React, { useReducer } from "react"
import { Box, Button, Step, StepLabel, Stepper } from "@mui/material"
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons"
import { cloneDeep } from "lodash"
import { Icon } from "./icon"

interface IFormStepperStep {
	label: string,
	render: (onComplete: (formResponse: any) => void, prevFormResponse: any) => React.ReactNode
}

interface IFormStepperProps {
	steps: IFormStepperStep[]
	onComplete?: (data: any) => void
}

export function FormStepper({ steps, onComplete }: IFormStepperProps) {
	const [state, setFormResponse] = useReducer((prevState: any, action: {
		type: "next"
		response: any
	} | {
		type: "prev"
	}) => {
		const state = cloneDeep(prevState)
		switch (action.type) {
			case "next":
				state.responses[state.currentStep] = action.response
				state.currentStep = Math.min(state.currentStep + 1, steps.length - 1)
				return state
			case "prev":
				state.currentStep = Math.max(state.currentStep - 1, 0)
				return state
		}
	}, {
		currentStep: 0,
		responses: []
	})

	console.log(state)

	return (
		<>
			<Stepper activeStep={state.currentStep}>
				{
					steps.map((step, index) => {
						const last = index === steps.length - 1
						const lastCompleted = last && state.currentStep === steps.length - 1

						return <Step
							key={index}
							index={index}
							sx={{
								".Mui-completed": {
									color: lastCompleted ? "green" : "primary"
								}
							}}
							completed={lastCompleted ? true : undefined}
						>
							<StepLabel>{step.label}</StepLabel>
						</Step>
					})
				}
			</Stepper>
			<Box sx={{ mt: 4 }}>
				{steps[state.currentStep].render(
					(formResponse) => {
						setFormResponse({ type: "next", response: formResponse })
						if (state.currentStep === steps.length - 1) {
							onComplete?.(formResponse)
						}
					},
					state.responses[state.currentStep - 1]
				)}
			</Box>
			{
				state.currentStep > 0 &&
                <Box sx={{ mt: 2 }}>
                    <Button
                        startIcon={<Icon icon={faAngleLeft}/>}
                        color={"inherit"}
                        variant="text"
                        onClick={() => setFormResponse({ type: "prev" })}
                    >
                        Back
                    </Button>
                </Box>
			}
		</>
	)
}