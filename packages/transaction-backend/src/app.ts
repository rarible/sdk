import express from "express"
import bodyParser from "body-parser"
import * as ordersController from "./orders"

export const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/orders/fill-tx", ordersController.postFillAction)
app.use(function(req, res){
	return res
		.status(404)
		.json({ message: "Not found" })
})

process.on("unhandledRejection", (e) => {
	console.error("unhandledRejection", e)
})
