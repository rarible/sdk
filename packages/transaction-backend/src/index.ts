import "dotenv/config"
import { app } from "./app"
import { readEnvSafe } from "./utils/read-env"

const port = parseInt(readEnvSafe("PORT") || "3000")
app.listen(port, () => {
  console.log(`Rarible tx backend listening on port ${port}`)
})

process.on("unhandledRejection", err => {
  console.error("unhandledRejection", err)
})
