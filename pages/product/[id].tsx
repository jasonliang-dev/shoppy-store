import Head from 'next/head'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product } from '@/common/interfaces'
import { useShop } from '@/common/ShopContext'
import { useRouter } from 'next/router'

export default function ProductPage() {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)

  const id = String(router.query.id || '')

  useEffect(() => {
    async function getProduct() {
      const res = await fetch('/api/product?' + new URLSearchParams({ id }))
      const json = await res.json()
      setProduct(json)
    }

    setProduct(null)
    getProduct()
  }, [id])

  return product ? <ProductDetails product={product} /> : <ProductSkeleton />
}

function ProductSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto">
      <Head>
        <title>Product</title>
      </Head>
      <div className="animate-pulse flex items-start">
        <div className="w-[30rem] flex-none">
          <div className="rounded-lg shadow-sm bg-gray-200 border border-gray-300 aspect-square" />
        </div>
        <div className="ml-8 w-full flex flex-col gap-y-4">
          <div className="bg-gray-300 rounded-lg h-5 w-full max-w-[30rem]"></div>
          <div className="bg-gray-300 rounded-full h-3 w-full max-w-[10rem]"></div>
          <div className="bg-gray-300 rounded-full h-3 w-full max-w-[12rem]"></div>
          <div className="bg-gray-300 rounded-full h-3 w-full max-w-[18rem]"></div>
          <div className="bg-gray-300 rounded-full h-3 w-full max-w-[8rem]"></div>
          <div className="bg-gray-300 rounded-full h-3 w-full max-w-[18rem]"></div>
        </div>
      </div>
    </div>
  )
}

function ProductDetails({ product }: { product: Product }) {
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
  const [adding, setAdding] = useState(false)
  const { cart, updateCart, setOverlay, moneyFormat } = useShop()

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
    if (!variant || !cart) {
      return
    }

    setAdding(true)

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
    updateCart(json)
    setAdding(false)
    setOverlay(true)
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
          {moneyFormat(variant.compareAtPrice)}
        </div>
        <div className="text-red-700">
          {moneyFormat(variant.price)}
        </div>
      </>
  } else {
    price =
      <div className="text-gray-700">
        {moneyFormat(variant.price)}
      </div>
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <Head>
        <title>{product.title}</title>
      </Head>
      <div className="flex items-start">
        <div className="w-[30rem] flex-none">
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
                className="relative cursor-pointer w-full aspect-square rounded overflow-hidden border border-gray-400 bg-white"
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
          <h2 className="text-3xl font-semibold">{product.title}</h2>
          <div className="flex gap-x-2 items-center">
            {price}
            {variant && !variant.available &&
              <div className="rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700">
                Out of stock
              </div>}
            &nbsp;
          </div>
          {product.options.map(option => (
            <div key={option.id} className="mb-3 mt-2">
              <span className="font-semibold text-sm text-gray-800 mb-1">
                {option.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {option.values.map(({ value }) =>
                  <button
                    key={value}
                    className={
                      'px-2 py-1 border rounded min-w-[3rem] '
                      + (selected[option.id] === value
                        ? 'bg-gray-900 hover:bg-black border-gray-900 text-gray-50'
                        : 'bg-white hover:bg-gray-100 border-gray-300')}
                    onClick={() => setSelected(s => ({ ...s, [option.id]: value }))}
                    type="button"
                  >
                    {value}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="mb-3 mt-2">
            <label className="font-semibold text-sm text-gray-800 mb-1" htmlFor="quantity">
              Quantity
            </label>
            <div className="flex gap-x-2">
              <button
                disabled={!variant?.available}
                className="p-1 @btn disabled:bg-gray-200"
                type="button"
                onClick={() => setQuantity(quantity - 1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              <input
                disabled={!variant?.available}
                className="min-w-0 w-[5rem] text-center px-2 py-1 @control disabled:bg-gray-200"
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
                className="p-1 @btn disabled:bg-gray-200"
                type="button"
                onClick={() => setQuantity(quantity + 1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>
          <div className="h-[2.5rem] flex items-center">
            {!variant &&
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="ml-2 text-gray-700">Not available</span>
              </div>}
            {variant && !variant.available &&
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="ml-2 text-gray-700">Sold out</span>
              </div>}
            {variant && variant.available &&
              <button
                disabled={adding}
                onClick={addLine}
                className="@btn-purple disabled:bg-purple-500 w-[12rem] h-[2.5rem] flex justify-center items-center disabled:opacity-75"
                type="button"
              >
                {adding
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
              </button>}
          </div>
          {product.descriptionHtml &&
            <article
              className="prose prose-sm text-gray-900 mt-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />}
        </div>
      </div>
    </div>
  )
}