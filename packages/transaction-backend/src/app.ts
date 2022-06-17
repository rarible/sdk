import path from "path"
import express from "express"
import bodyParser from "body-parser"
import FormData from "form-data"
import redoc from "redoc-express"
import * as ordersController from "./orders"

global.FormData = FormData as any

export const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/v0.1/orders/buy-tx", ordersController.postFillAction)

app.get("/openapi.yml", (req, res) => {
	res.sendFile("openapi.yml", { root: path.resolve(__dirname) })
})
app.use(
	"/",
	redoc({
		title: "Rarible Transaction Backend API Docs",
		specUrl: "/openapi.yml",
	})
)

app.use(function(req, res){
	return res
		.status(404)
		.json({ message: "Not found" })
})

process.on("unhandledRejection", (e) => {
	console.error("unhandledRejection", e)
})
