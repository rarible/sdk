import "dotenv/config"
import { app } from "./app"

app.listen(process.env.PORT || 5500, () => {
	console.log("Rarible tx backend listening...")
})
