import Image from 'next/image'
import Link from 'next/link'
import { Product, money } from '@/common/interfaces'

export default function ProductItem({ product, className }: { product: Product, className?: string }) {
  const image = product.images[0]
  const variant = product.variants[0]

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
    <li key={product.id} className={`w-full ${className || ''}`}>
      <Link className="group" href={"/product/" + product.handle}>
        <div className="relative w-full aspect-square bg-gray-200 rounded">
          <Image
            fill
            className="absolute object-contain rounded"
            src={image?.src || '/600.svg'}
            alt={image?.altText || product.title}
            sizes="560px"
          />
          {variant && !variant.available &&
            <div className="absolute left-0 bottom-0 p-2 flex">
              <span className="rounded-full px-1 text-xs font-semibold bg-gray-300 text-gray-700 border border-gray-400">
                Sold out
              </span>
            </div>}
        </div>
        <div className="font-semibold group-hover:underline mb-1">
          {product.title}
        </div>
        {price}
      </Link>
    </li>
  )
}