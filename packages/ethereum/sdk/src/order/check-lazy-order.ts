import type {
  Address,
  Asset,
  AssetType,
  Erc1155LazyAssetType,
  Erc721LazyAssetType,
  OrderForm,
} from "@rarible/ethereum-api-client"

export type CheckLazyOrderPart = Pick<OrderForm, "make" | "take" | "maker">

export async function checkLazyOrder(
  checkLazyAsset: (asset: Asset) => Promise<Asset>,
  form: CheckLazyOrderPart,
): Promise<CheckLazyOrderPart> {
  const make = await checkLazyMakeAsset(checkLazyAsset, form.make, form.maker)
  const take = await checkLazyAsset(form.take)
  return {
    ...form,
    make,
    take,
  }
}

async function checkLazyMakeAsset(
  checkLazyAsset: (asset: Asset) => Promise<Asset>,
  asset: Asset,
  maker: Address,
): Promise<Asset> {
  const make = await checkLazyAsset(asset)
  if (isLazyAsset(make.assetType) && make.assetType.creators[0].account === maker) {
    return make
  }
  return asset
}

function isLazyAsset(x: AssetType): x is Erc721LazyAssetType | Erc1155LazyAssetType {
  return x.assetClass === "ERC1155_LAZY" || x.assetClass === "ERC721_LAZY"
}
