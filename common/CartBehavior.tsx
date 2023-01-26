import { useShop } from '@/common/ShopContext'
import { useEffect, useState } from 'react'
import { Cart } from '@/common/interfaces'

export default function CartBehavior({
  children
}: {
  children: (data: {
    cart: Cart | null,
    updating: boolean,
    quantities: string[],
    setLineQuantity: (id: string, num: number) => void,
    removeLine: (id: string) => void,
    setQuantityInput: (index: number, text: string) => void,
    inputBlur: (num: number, index: number) => void,
  }) => JSX.Element | null
}) {
  const { cart, updateCart } = useShop()
  const [updating, setUpdating] = useState(false)
  const [quantities, setQuantities] = useState<string[]>([])

  async function setLineQuantity(id: string, num: number) {
    if (!cart) {
      return
    }

    setUpdating(true)

    const updated = await fetch('/api/updateLine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout: cart.id,
        lineItem: id,
        quantity: Math.max(1, Math.min(99, num)),
      }),
    })

    const json = await updated.json()
    setUpdating(false)
    updateCart(json)
  }

  function setQuantityInput(index: number, text: string) {
    setQuantities(q => {
      const clone = [...q]
      clone[index] = text
      return clone
    })
  }

  async function removeLine(id: string) {
    if (!cart) {
      return
    }

    setUpdating(true)

    const updated = await fetch('/api/removeLine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkout: cart.id, lineItem: id }),
    })

    const json = await updated.json()
    setUpdating(false)
    updateCart(json)
  }

  function inputBlur(num: number, index: number) {
    if (!cart) {
      return
    }

    const item = cart.lineItems[index]
    if (Number.isNaN(num)) {
      setQuantityInput(index, String(item.quantity))
    } else if (item.quantity !== num) {
      setLineQuantity(item.id, num)
    }
  }

  useEffect(() => {
    if (cart) {
      setQuantities(cart.lineItems.map(item => String(item.quantity)))
    }
  }, [cart])

  return children({
    cart,
    updating,
    quantities,
    setLineQuantity,
    removeLine,
    setQuantityInput,
    inputBlur,
  })
}