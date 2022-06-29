import React from "react"
import { Box } from "@mui/material"
import { Page } from "../../components/page"
import { CommentedBlock } from "../../components/common/commented-block"
import { FormStepper } from "../../components/common/form-stepper"
import { RequestResult } from "../../components/common/request-result"
import { UploadMetaForm } from "./upload-meta-form"
import { UploadMetaComment } from "./comments/upload-meta-comment"
import { UploadMetaResult } from "./upload-meta-result"

export function UploadMetaPage() {

	return (
		<Page header="Upload metadata">
			<CommentedBlock sx={{ my: 2 }} comment={<UploadMetaComment/>}>
				<FormStepper
					steps={[
						{
							label: "Get Meta Info",
							render: (onComplete, lastResponse) => {
								console.log(lastResponse)
								return <UploadMetaForm
									onComplete={onComplete}
								/>
							}
						},
						{
							label: "Done",
							render: (onComplete, lastResponse) => {
								return <RequestResult
									result={{ type: "complete", data: lastResponse }}
									completeRender={(data) =>
										<Box sx={{ my: 2 }}>
											<UploadMetaResult result={data}/>
										</Box>
									}
								/>
							}
						}
					]}
				/>
			</CommentedBlock>
		</Page>
	)
}
