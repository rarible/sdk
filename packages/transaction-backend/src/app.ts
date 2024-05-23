import path from "path"
import express from "express"
import bodyParser from "body-parser"
import redoc from "redoc-express"
import * as ordersController from "./orders"

export const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/v0.1/orders/buy-tx", ordersController.postFillAction)
app.get("/openapi.yml", (_, res) => res.sendFile("openapi.yml", { root: path.resolve(__dirname) }))

app.use(
  "/",
  redoc({
    title: "Rarible Transaction Backend API Docs",
    specUrl: "/openapi.yml",
  }),
)

app.use((_, res) => res.status(404).json({ message: "Not found" }))
