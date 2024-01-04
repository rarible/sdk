import React from "react"
import { toCollectionId } from "@rarible/types"
import type { Item, ItemId, ItemsSearchFilter, Order, TraitEntry } from "@rarible/api-client"
import { Connect } from "./connect"
import { blocto, createConnector, injected } from "./connector"
import { useCollectionTraits, useConnect, useNft, useNftList } from "./read-hooks"
import { useBuyNft } from "./write-hooks"

//todo server components
//todo server-side wallet connect? (or auth)

//creating a connector - specify needed connection providers to connect the wallet
const connector = createConnector({
	providers: [
		//specify list of connection providers
		blocto(),
	]
})


function Root() {
	return (
		<Connect connector={connector}>
			<ConnectionOptions/>
			<Filter/>
			<NFTList filter={({})}/>
		</Connect>
	)
}

/**
 * Shows connect options if wallet disconnected
 */
function ConnectionOptions() {
	const data = useConnect()

	if (data.status === "disconnected") {
		//render all available options and let user connect to any of them
		return <ul>
			{data.options.map(opt => (
				<li onClick={() => opt.connect()}>{opt.option}</li>
			))}
		</ul>
	}

	return (
		<></>
	)
}

/**
 * Shows filter for collection traits
 */
function Filter() {
	const data = useCollectionTraits({ collectionId: [toCollectionId("ETHEREUM:0x000000011111")] })

	if (data.status === "error") {
		return <Error error={data.error}/>
	}

	if (data.status === "loading") {
		return <Spinner/>
	}

	return <RealFilters traits={data.value}/>
}

/**
 * Shows list of NFTs
 * @constructor
 */
function NFTList({ filter }: { filter: ItemsSearchFilter }) {
	const data = useNftList(filter)

	if (data.status === "error") {
		return <Error error={data.error}/>
	}

	if (data.status === "loading") {
		return <Spinner/>
	}

	return (
		<ul>
			{data.value.map(nft => (
				<ShowNft id={nft.id}/>
			))}
		</ul>
	)
}

function ShowNft({ id }: { id: ItemId }) {
	const data = useNft(id)

	if (data.status === "done") {
		return (
			<div>
				<div>{data.value.meta?.name}</div>
				<div>{data.value.meta?.description}</div>
				<div>{data.value.meta?.attributes}</div>
				{/*show traits*/}
			</div>
		)
	}

	if (data.status === "error") {
		return <Error error={data.error}/>
	}

	if (data.status === "loading") {
		return <Spinner/>
	}

	return <></>
}

/**
 * Example of Modal window. Pass bestSellOrder from Item type
 */
function BuyNftWindow({ order }: { order: Order }) {
	//get all data needed for buy - how many items user can buy, platform, fees information etc
	const data = useBuyNft({ order })

	if (data.status === "done") {
		//show form
		return (
			<form>
				{/*add validator for amount, using data.value.maxAmount*/}
				<input type="number" name="amount"/>
				<input type="submit" name="price" onClick={() => data.submit(1)}/> {/*pass amount to buy*/}
			</form>
		)
	}
}

/**
 * This component which should display filters for each trait
 */
function RealFilters(args: { traits: TraitEntry[] }) {
	return <></>
}

function Spinner() {
	return <></>
}

function Error(props: { error?: any }) {
	return <></>
}