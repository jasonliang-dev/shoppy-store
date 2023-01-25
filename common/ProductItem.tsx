import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/common/interfaces'
import { useShop } from '@/common/ShopContext'

export default function ProductItem({ product, className }: { product: Product, className?: string }) {
  const { moneyFormat } = useShop()
  const [hot, setHot] = useState(false)
  const variant = product.variants[0]

  const image = product.images[0]
  const hotImage = product.images[1] || product.images[0]

  let price
  if (!variant) {
    price = null
  } else if (Number(variant.compareAtPrice?.amount) > Number(variant.price.amount)) {
    price =
      <>
        <div className="text-gray-700 text-xs line-through">
          {moneyFormat(variant.compareAtPrice)}
        </div>
        <div className="text-red-700 text-sm">
          {moneyFormat(variant.price)}
        </div>
      </>
  } else {
    price =
      <div className="text-gray-700 text-sm">
        {moneyFormat(variant.price)}
      </div>
  }

  const shouldTransition = image?.src !== hotImage?.src
  const img = `z-20 absolute object-contain rounded ${shouldTransition ? 'transition-opacity' : ''}`

  return (
    <li
      className={`${className} h-full`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <Link
        className="flex flex-col h-full bg-white rounded-lg shadow-sm p-3 border border-gray-300"
        href={"/product/" + product.handle}
      >
        <div className="relative w-full aspect-square rounded">
          <Image
            fill
            className={`${img} ${(shouldTransition && hot) ? 'opacity-0' : 'opacity-1'}`}
            src={image?.src || '/600.svg'}
            alt={image?.altText || product.title}
            sizes="560px"
          />
          {shouldTransition &&
            <Image
              fill
              className={`${img} ${(hot) ? 'opacity-1' : 'opacity-0'}`}
              src={hotImage?.src || '/600.svg'}
              alt={hotImage?.altText || product.title}
              sizes="560px"
            />}
          {variant && !variant.available &&
            <div className="z-50 absolute left-0 bottom-0 pb-2 flex">
              <span className="rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700 shadow">
                Sold out
              </span>
            </div>}
        </div>
        {/* group hover doesn't work? */}
        <div className={`font-semibold mb-1 ${hot ? 'underline' : ''}`}>
          {product.title}
        </div>
        {price}
      </Link>
    </li>
  )
}