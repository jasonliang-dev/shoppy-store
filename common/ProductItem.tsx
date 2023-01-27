import { useState } from 'react'
import Link from 'next/link'
import { imgUrl, Product } from '@/common/interfaces'
import { useShop } from '@/common/ShopContext'

export default function ProductItem({ product, className }: { product: Product, className?: string }) {
  const { moneyFormat } = useShop()
  const [hot, setHot] = useState(false)

  const image = product.images[0]
  const hotImage = product.images[1] || product.images[0]

  let variant = product.variants[0]
  for (const v of product.variants) {
    if (Number(v.price.amount) < Number(variant.price.amount)) {
      variant = v
    }
  }

  let price
  if (!variant) {
    price = null
  } else if (Number(variant.compareAtPrice?.amount) > Number(variant.price.amount)) {
    price =
      <div className="flex items-center">
        <span className="text-xs line-through text-gray-700">
          {moneyFormat(variant.compareAtPrice)}
        </span>
        <span className="text-red-700 ml-2">
          {moneyFormat(variant.price)}
        </span>
      </div>
  } else {
    price =
      <div className="">
        {moneyFormat(variant.price)}
      </div>
  }

  const shouldTransition = image?.src !== hotImage?.src
  const img = `z-20 w-full h-full absolute object-contain rounded transition transform ${shouldTransition ? 'transition-opacity' : ''} ${hot ? 'scale-100' : 'scale-[.975]'} `

  return (
    <div
      className={`${className} h-full mb-4`}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <Link
        className="flex flex-col h-full"
        href={"/product/" + product.handle}
      >
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-300">
          <div className={`relative w-full aspect-square rounded `}>
            <img
              className={`${img} ${(shouldTransition && hot) ? 'opacity-0' : 'opacity-1'}`}
              src={imgUrl(image, '510', '/600.svg')}
              alt={image?.altText || product.title}
              sizes="510px"
              loading="lazy"
              decoding="async"
            />
            {shouldTransition &&
              <img
                className={`${img} ${(hot) ? 'opacity-1' : 'opacity-0'}`}
                src={imgUrl(hotImage, '510', '/600.svg')}
                alt={hotImage?.altText || product.title}
                sizes="510px"
                loading="lazy"
                decoding="async"
              />}
            {!product.availableForSale &&
              <div className="z-50 absolute left-0 bottom-0 pb-2 flex">
                <span className="rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700 shadow">
                  Sold out
                </span>
              </div>}
          </div>
        </div>
        {/* group hover doesn't work? */}
        <div className={`font-semibold text-sm mt-2 mb-1 ${hot ? 'text-purple-700 underline' : 'text-gray-600'}`}>
          {product.title}
        </div>
        {price}
      </Link>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-y-3 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-300">
        <div className="bg-gray-200 rounded aspect-square transform scale-[.975]"></div>
      </div>
      <div className="bg-gray-300 rounded-full w-1/2 h-3"></div>
      <div className="bg-gray-300 rounded-full w-1/3 h-3"></div>
    </div>
  )
}