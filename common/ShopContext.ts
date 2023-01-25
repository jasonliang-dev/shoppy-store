import { createContext, useContext } from 'react'
import { Cart, Shop } from '@/common/interfaces'

export const ShopContext = createContext<{
  shop?: Shop,
  cart?: Cart,
  updateCart: (c: Cart) => void
}>({
  updateCart() {},
})
export default ShopContext

export function useShop() {
  return useContext(ShopContext)
}