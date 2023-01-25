import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/common/Nav'
import { useShop } from '@/common/ShopContext'
import { money } from '@/common/interfaces'

export default function CartPage() {
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

  useEffect(() => {
    if (cart) {
      setQuantities(cart.lineItems.map(item => String(item.quantity)))
    }

  }, [cart])

  return (
    <>
      <Head>
        <title>Your Cart</title>
      </Head>
      <Nav />
      <div className="container max-w-4xl mx-auto">
        <h1 className="font-semibold text-4xl mb-4">Your Cart</h1>
        {(() => {
          if (!cart) {
            return null
          }

          if (cart.lineItems.length === 0) {
            return (
              <div className="border border-gray-400 shadow rounded py-[5rem] text-center bg-white">
                <h3 className="font-semibold text-2xl mb-4">Your cart is empty!</h3>
                <Link href="/" className="px-4 py-2 rounded shadow-sm bg-purple-500 hover:bg-purple-600 text-white border border-purple-800">
                  View products
                </Link>
              </div>
            )
          }

          return (
            <>
              <Link href="/" className="text-purple-600 hover:text-purple-900 hover:underline">Continue shopping</Link>
              <ul className={`${updating ? 'opacity-75' : ''} mb-3`}>
                {cart.lineItems.map((item, index) => (
                  <li key={item.id} className="flex items-center py-4 border-b border-gray-300">
                    <div className="relative w-[4rem] border rounded aspect-square shadow-sm bg-white">
                      <Image
                        fill
                        className="object-contain"
                        src={item.variant.image.src || '/600.svg'}
                        alt={item.variant.image.altText || item.variant.title}
                        sizes="4rem"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Link href={'/product/' + item.variant.product.handle} className="font-semibold text-gray-900 hover:underline">
                          {item.title}
                        </Link>
                        <div className="ml-2 rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700">
                          {money(item.variant.price)}
                        </div>
                      </div>
                      <div className="text-gray-700">{item.variant.title}</div>
                    </div>
                    <span className="ml-auto text-gray-700 font-semibold">
                      {money(item.variant.price, item.quantity)}
                    </span>
                    <div className="ml-8 flex gap-x-2">
                      <button
                        disabled={updating}
                        className="p-1 border border-gray-400 bg-white rounded shadow-sm"
                        type="button"
                        onClick={() => setLineQuantity(item.id, item.quantity - 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <input
                        disabled={updating}
                        className="min-w-0 w-[4rem] text-center px-2 py-1 border border-gray-400 bg-white rounded shadow-sm"
                        onBlur={e => {
                          const num = Number(e.target.value)
                          if (!Number.isNaN(num)) {
                            setLineQuantity(item.id, num)
                          } else {
                            setQuantityInput(index, String(item.quantity))
                          }
                        }}
                        onChange={e => setQuantityInput(index, e.target.value)}
                        value={quantities[index] || 0}
                        id="quantity"
                        type="text"
                      />
                      <button
                        disabled={updating}
                        className="p-1 border border-gray-400 bg-white rounded shadow-sm"
                        type="button"
                        onClick={() => setLineQuantity(item.id, item.quantity + 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                    <button
                      disabled={updating}
                      className="ml-8 p-2 text-red-500 rounded hover:shadow-sm border border-transparent hover:border-gray-400 hover:bg-white"
                      type="button"
                      onClick={() => removeLine(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-end">
                <div className="mb-6">
                  <span className="font-bold text-xs text-gray-700">Subtotal</span>
                  <span className="font-semibold text-lg ml-3">
                    {money(cart.subtotalPrice)}
                  </span>
                </div>
                <span className="text-gray-700 mb-3">Shipping and tax calculated at checkout</span>
                <a className="px-3 py-2 bg-black text-white inline-block rounded" href={cart.webUrl}>
                  Proceed to checkout
                </a>
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}
