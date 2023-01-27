import { useState, useEffect } from 'react'
import Head from 'next/head'
import { imgUrl, Product } from '@/common/interfaces'
import ProductItem, { ProductSkeleton } from '@/common/ProductItem'
import Link from 'next/link'
import { useShop } from '@/common/ShopContext'

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | 'error' | 'loading'>('loading')
  const { collections, homepage } = useShop()

  const featuredCollections = collections.filter(collection => collection.image)

  useEffect(() => {
    async function getProducts() {
      const res = await fetch('/api/products?' + new URLSearchParams({
        num: '8',
        sort: 'BEST_SELLING',
        collection: 'homepage',
      }))
      const json = await res.json()

      setProducts(json)
    }

    getProducts()
  }, [])

  const hero = homepage?.image?.src || ''
  console.log(hero)

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <div className="relative h-[40rem]">
        <img
          className="z-10 absolute inset-0 w-full h-full object-cover brightness-[.5]"
          srcSet={hero !== ''
            ? `
              ${hero}&width=640 640w,
              ${hero}&width=768 768w,
              ${hero}&width=1024 1024w,
              ${hero}&width=1280 1820w,
              ${hero}&width=1536 1536w
            `
            : undefined}
          alt=""
          sizes="100vw"
          loading="eager"
          decoding="sync"
        />
        <div className="relative z-20 flex flex-col items-center justify-center h-full">
          <h1 className="font-black text-4xl sm:text-6xl mb-4 text-white max-w-4xl text-center">
            The best snow gear for tumbing down mountains
          </h1>
          <Link
            className="px-4 py-2 font-semibold rounded shadow flex items-center @btn-zinc"
            href="/catalog"
          >
            <span className="mr-2">View products</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
      <div className="container max-w-5xl mx-auto px-2 -mt-[8rem]">
        <div className="flex flex-wrap justify-center">
          {featuredCollections.map(collection =>
            <div key={collection.id} className="w-1/2 lg:w-1/3 p-3">
              <Link
                href={`/catalog/${collection.handle}`}
                className="group rounded-lg shadow-lg overflow-hidden relative p-4 flex flex-col justify-end h-[15rem] sm:h-[20rem] md:h-[25rem]"
              >
                <img
                  className="z-10 absolute w-full h-full object-cover inset-0 object-cover transition transform group-hover:scale-105"
                  src={imgUrl(collection.image, '630')}
                  alt={collection.image?.altText || ''}
                  sizes="630px"
                  loading="lazy"
                  decoding="async"
                />
                <div className="z-20 absolute bg-gradient-to-t from-gray-900 to-transparent inset-0 opacity-75" />
                <div className="z-30 relative leading-tight">
                  <span className="text-gray-300 text-xs">Collection</span>
                  <h2 className="text-white font-semibold">
                    {collection.title}
                  </h2>
                </div>
              </Link>
            </div>)}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-baseline mt-12 mb-4">
          <h2 className="font-black text-2xl">
            Featured Products
          </h2>
          <Link href="/catalog" className="text-purple-600 hover:text-purple-700 hover:underline">
            Shop all products
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {typeof products !== 'string' && products.map(product =>
            <ProductItem key={product.id} product={product} />)}
        </div>
        {products === 'loading' &&
          <ul className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from(Array(6)).map((_, i) => <ProductSkeleton key={i} />)}
          </ul>}
      </div>
      {/* humor tailwind. mx-auto prose prose-invert bg-zinc-800 px-2 */}
      {homepage?.descriptionHtml &&
        <div dangerouslySetInnerHTML={{ __html: homepage.descriptionHtml }} />}
    </div>
  )
}
