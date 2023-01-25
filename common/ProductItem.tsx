import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product, money } from '@/common/interfaces'

export default function ProductItem({ product, className }: { product: Product, className?: string }) {
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
          {money(variant.compareAtPrice)}
        </div>
        <div className="text-red-700 text-sm">
          {money(variant.price)}
        </div>
      </>
  } else {
    price =
      <div className="text-gray-700 text-sm">
        {money(variant.price)}
      </div>
  }

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
            className={`z-20 absolute object-contain rounded transition-opacity ${hot ? 'opacity-0' : 'opacity-1'}`}
            src={image?.src || '/600.svg'}
            alt={image?.altText || product.title}
            sizes="560px"
          />
          <Image
            fill
            className={`z-10 absolute object-contain rounded`}
            src={hotImage?.src || '/600.svg'}
            alt={hotImage?.altText || product.title}
            sizes="560px"
          />
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