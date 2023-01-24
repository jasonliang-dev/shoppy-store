import Head from 'next/head'
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client } from '@/common/shopify'
import { Cart, Product, money } from '@/common/interfaces'

export default function ProductPage({ product, cart: cartRaw }: { product: Product, cart: Cart }) {
  const [selected, setSelected] = useState(() => {
    const obj: Record<string, string> = {}
    for (const option of product.options) {
      obj[option.id] = option.values[0].value
    }
    return obj
  })
  const [quantity, setQuantityRaw] = useState(1)
  const [quantityText, setQuantityText] = useState(String(quantity))
  const [image, setImage] = useState(product.images[0])
  const [cart, setCart] = useState(cartRaw)

  // maybe find a better way to get a variant from product options?
  // don't like it when things are 'stringly typed'
  const variantTitle = product.options.map(option => selected[option.id]).join(' / ')
  const variant = product.variants.find(variant => variant.title === variantTitle)

  function setQuantity(num: number) {
    num = Math.max(1, Math.min(99, num))
    setQuantityRaw(num)
    setQuantityText(String(num))
  }

  async function addLine() {
    if (!variant) {
      return false
    }

    const updated = await fetch('/api/addLine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkout: cart.id,
        variant: variant.id,
        quantity,
      }),
    })

    const json = await updated.json()
    setCart(json)

    return true
  }

  useEffect(() => {
    if (variant) {
      setImage(() => variant.image)
    }
  }, [variant])

  let price
  if (!variant) {
    price = null
  } else if (Number(variant.compareAtPrice?.amount) > Number(variant.price.amount)) {
    price =
      <>
        <div className="text-gray-700 text-xs line-through">
          {money(variant.compareAtPrice)}
        </div>
        <div className="text-red-700">
          {money(variant.price)}
        </div>
      </>
  } else {
    price =
      <div className="text-gray-700">
        {money(variant.price)}
      </div>
  }

  return (
    <>
      <Head>
        <title>{product.title}</title>
      </Head>
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-start">
          <div className="w-[20rem] flex-none">
            <div className="relative w-full aspect-square mb-3">
              <Image
                fill
                src={image?.src || '/600.svg'}
                alt={image?.altText || ''}
                className="object-contain rounded-lg"
                sizes="640px"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map(img => (
                <div
                  key={img.id}
                  onClick={() => setImage(img)}
                  className="relative cursor-pointer w-full aspect-square rounded border border-gray-300 bg-white"
                >
                  <Image
                    fill
                    src={img.src || '/600.svg'}
                    alt={img.altText || ''}
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-8">
            <h2 className="text-3xl font-semibold mb-4">{product.title}</h2>
            <div className="flex gap-x-2 items-center">
              {price}
              {variant && !variant.available &&
                <div className="rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700">
                  Sold out
                </div>}
            </div>
            {product.options.map(option => (
              <div key={option.id} className="mb-3 mt-2">
                <span className="font-semibold text-sm text-gray-700 mb-1">
                  {option.name}
                </span>
                <div className="flex flex-wrap gap-2">
                  {option.values.map(({ value }) =>
                    <button
                      key={value}
                      className={
                        'px-2 py-1 border rounded min-w-[3rem] '
                        + (selected[option.id] === value
                          ? 'bg-gray-900 border-gray-900 text-gray-50'
                          : 'bg-white border-gray-400')}
                      onClick={() => setSelected(s => ({ ...s, [option.id]: value }))}
                      type="button"
                    >
                      {value}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="mb-3 mt-2 w-[20rem]">
              <label className="font-semibold text-sm text-gray-700 mb-1" htmlFor="quantity">
                Quantity
              </label>
              <div className="flex gap-x-2">
                <button
                  disabled={!variant?.available}
                  className="p-1 border border-gray-400 bg-white disabled:bg-gray-200 rounded shadow-sm"
                  type="button"
                  onClick={() => setQuantity(quantity - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <input
                  disabled={!variant?.available}
                  className="min-w-0 w-[5rem] text-center px-2 py-1 border border-gray-400 bg-white disabled:bg-gray-200 rounded shadow-sm"
                  onBlur={e => {
                    const num = Number(e.target.value)
                    if (!Number.isNaN(num)) {
                      setQuantity(num)
                    } else {
                      setQuantityText(String(quantity))
                    }
                  }}
                  onChange={e => setQuantityText(e.target.value)}
                  value={quantityText}
                  id="quantity"
                  type="text"
                />
                <button
                  disabled={!variant?.available}
                  className="p-1 border border-gray-400 bg-white disabled:bg-gray-200 rounded shadow-sm"
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
            {variant?.available
              ? <AddToCartButton onClick={addLine} cart={cart} onUpdate={c => setCart(c)} />
              : (
                <div className="inline-block px-3 py-1 rounded bg-gray-200 border border-gray-400 shadow-sm">
                  Sold out
                </div>
              )}
            {product.descriptionHtml &&
              <article
                className="prose prose-sm text-gray-900"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />}
          </div>
        </div>
      </div>
    </>
  )
}

function AddToCartButton({ onClick, cart, onUpdate }: { onClick: () => Promise<boolean>, cart: Cart, onUpdate: (c: Cart) => void }) {
  const [popup, setPopupRaw] = useState(false)
  const [wait, setWait] = useState(false)
  const [updating, setUpdating] = useState(false)

  function setPopup(open: boolean) {
    setPopupRaw(open)

    // bad raw dom change to disable scrolling
    if (open) {
      document.body.classList.add('overflow-y-hidden', 'h-full')
    } else {
      document.body.classList.remove('overflow-y-hidden', 'h-full')
    }
  }

  async function realOnClick() {
    setWait(true)
    const res = await onClick()
    if (!res) {
      console.error('something went wrong')
      setWait(false)
      return
    }

    setWait(false)
    setPopup(true)
  }

  async function setLineQuantity(id: string, num: number) {
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
    onUpdate(json)
  }

  async function removeLine(id: string) {
    setUpdating(true)

    const updated = await fetch('/api/removeLine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkout: cart.id, lineItem: id }),
    })

    const json = await updated.json()
    setUpdating(false)
    onUpdate(json)
  }

  useEffect(() => {
    return () => {
      document.body.classList.remove('overflow-y-hidden', 'h-full')
    }
  })

  const btn = 'px-3 py-1 rounded shadow-sm '
  const primaryBtn = btn + 'bg-purple-500 enabled:hover:bg-purple-600 text-white border border-purple-800 '

  return (
    <>
      <button
        disabled={wait}
        onClick={realOnClick}
        className={primaryBtn + 'mb-3 w-[12rem] h-[2.5rem] flex justify-center items-center disabled:opacity-75'}
        type="button"
      >
        {wait
          ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 animate-spin opacity-75">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">Adding...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <span className="ml-2">Add to cart</span>
            </>
          )}
      </button>
      <div className={`${popup ? '' : 'hidden'} z-[9999] fixed inset-0`}>
        <div onClick={() => setPopup(false)} className="absolute z-10 bg-white inset-0 opacity-75" />
        <div className="absolute z-20 bg-white right-0 inset-y-0 w-[30rem] shadow-lg border-l border-gray-400 p-4 flex flex-col">
          <h2 className="font-semibold text-3xl mb-3">Your cart</h2>
          <div className="flex-1 overflow-auto">
            <ul className={updating ? 'opacity-75' : ''}>
              {cart.lineItems.map(item => (
                <li key={item.id} className="mb-5">
                  <div className="flex items-center gap-x-2">
                    <div className="flex-none relative w-[3rem] border rounded aspect-square shadow-sm bg-white">
                      <Image
                        fill
                        className="object-contain"
                        src={item.variant.image.src || '/600.svg'}
                        alt={item.variant.image.altText || item.variant.title}
                        sizes="4rem"
                      />
                    </div>
                    <div className="ml-3">
                      <Link href={'/product/' + item.variant.product.handle} className="font-semibold text-gray-900 hover:underline">
                        {item.title}
                      </Link>
                      <div className="text-gray-700">{item.variant.title}</div>
                      <div className="text-gray-700 text-sm font-semibold">
                        {money(item.variant.price, item.quantity)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-auto flex justify-between items-center gap-x-2">
                      <button
                        disabled={updating}
                        className="p-1 border border-gray-400 bg-white rounded shadow-sm"
                        type="button"
                        onClick={() => setLineQuantity(item.id, item.quantity - 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        disabled={updating}
                        className="p-1 border border-gray-400 bg-white rounded shadow-sm"
                        type="button"
                        onClick={() => setLineQuantity(item.id, item.quantity + 1)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
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
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-gray-300 flex gap-x-3 items-center justify-end pt-4">
            <span className="font-semibold text-gray-700 text-sm">
              {money(cart.subtotalPrice)} Total
            </span>
            <button
              onClick={() => setPopup(false)}
              className={btn + 'bg-white hover:bg-gray-100 border border-gray-400'}
              type="button"
            >
              Close
            </button>
            <Link href="/cart" className={primaryBtn}>
              View cart
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{ product: Product, cart: Cart }> = async (context) => {
  const { id } = context.params!
  const { checkout } = context.req.cookies

  const product = await client.product.fetchByHandle(String(id))
  const cart = await client.checkout.fetch(String(checkout))

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      cart: JSON.parse(JSON.stringify(cart)),
    }
  }
}
