import { createContext, useContext } from 'react'
import { Cart, Shop, Collection, Money } from '@/common/interfaces'

export const ShopContext = createContext<{
  shop: Shop | null,
  cart: Cart | null,
  collections: Collection[],
  homepage: Collection | null,
  overlay: boolean,
  setOverlay: (open: boolean) => void,
  updateCart: (c: Cart) => void,
  moneyFormat: (money: Money | null, factor?: number) => string,
}>({
  shop: null,
  cart: null,
  collections: [],
  homepage: null,
  overlay: false,
  setOverlay() {},
  updateCart() {},
  moneyFormat() { return '' },
})
export default ShopContext

export function useShop() {
  return useContext(ShopContext)
}