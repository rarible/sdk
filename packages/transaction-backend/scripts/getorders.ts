import axios from "axios"

async function getOrderData() {
	const apiUrl = "https://polygon-api.rarible.org/v0.1/order/orders/sell/byCollectionAndByStatus"
	const apiKey = "4df39770-4e14-42ce-87d8-27e6d0b68167" // Replace with your actual API key
	const collectionAddress = "0x179f99618419c4103813dcd09e76e2e7588705fd"
	const platform = "RARIBLE"
	const continuation = "" // You can set this if you have a continuation token
	const size = 10 // Number of items to return
	const status = ["ACTIVE"] // Order status array

	const queryParams = new URLSearchParams({
		collection: collectionAddress,
		platform: platform,
		continuation: continuation,
		size: size.toString(),
		status: status.join(","),
	})

	const config = {
		headers: {
			"X-API-KEY": apiKey,
		},
	}

	const url = `${apiUrl}?${queryParams.toString()}`

	try {
		const response = await axios.get(url, config)
		const data = response.data
		console.log(JSON.stringify(data.orders[0]))
	} catch (error) {
		console.error("Error fetching data:", error)
	}
}

getOrderData()