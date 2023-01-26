import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Product } from '@/common/interfaces'
import ProductItem, { ProductSkeleton } from '@/common/ProductItem'
import Image from 'next/image'
import Link from 'next/link'
import heroImage from '@/public/hero.jpg'
import shopImage from '@/public/shop.jpg'

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | 'error' | 'loading'>('loading')

  useEffect(() => {
    async function getProducts() {
      const res = await fetch('/api/products?' + new URLSearchParams({
        num: '6',
        sort: 'BEST_SELLING',
        collection: 'homepage',
      }))

      const json = await res.json()
      setProducts(json)
    }

    getProducts()
  }, [])

  let productList
  if (products === 'loading') {
    productList =
      <ul className="animate-pulse grid grid-cols-3 gap-4">
        {Array.from(Array(6)).map((_, i) => <ProductSkeleton key={i} />)}
      </ul>
  } else if (products === 'error') {
    productList = null
  } else {
    productList =
      <ul className="grid grid-cols-3 gap-4">
        {products.map(product => <ProductItem key={product.id} product={product} />)}
      </ul>
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <Head>
        <title>Home</title>
      </Head>
      <div className="h-[30rem] overflow-hidden relative rounded-lg shadow mb-8">
        <div className="absolute inset-0">
          <Image
            className="brightness-[.25] z-10 w-full h-full object-cover"
            src={heroImage}
            alt=""
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="font-semibold text-4xl mb-1">
            Welcome to Cool Corner &amp; Stuff
          </h1>
          <p className="text-gray-200 text-lg mb-4">
            That one secret store that only the cool people know about
          </p>
          <Link
            className="px-3 py-1 font-semibold rounded shadow-sm text-white bg-black flex items-center"
            href="/catalog"
          >
            <span className="mr-2">View catalog</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
          <p className="text-gray-300 text-sm mt-4">
            Photo by{' '}
            <Link className="text-purple-400 underline" href="https://unsplash.com/@randomlies?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
              Ashim D’Silva
            </Link>
            {' '}on{' '}
            <Link className="text-purple-400 underline" href="https://unsplash.com/photos/ZmgJiztRHXE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
              Unsplash
            </Link>
          </p>
        </div>
      </div>
      <h2 className="font-semibold text-4xl mb-4">Products</h2>
      {productList}
      <div className="flex justify-center mt-8 mb-8">
        <Link
          className="px-4 py-1 text-lg font-semibold @btn-purple flex items-center"
          href="/catalog"
        >
          <span className="mr-2">Show all products</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </Link>
      </div>
      <h2 className="font-semibold text-4xl mb-4">About</h2>
      <div className="flex">
        <div className="w-[50rem]">
          <figure>
            <Image
              className="rounded aspect-video"
              src={shopImage}
              alt="A bright clothes shop"
            />
            <figcaption className="text-gray-700 text-sm mt-2">
              Photo by{' '}
              <Link className="text-purple-700 underline" href="https://unsplash.com/@korie?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                Korie Cull
              </Link>
              {' '}on{' '}
              <Link className="text-purple-700 underline" href="https://unsplash.com/photos/IzIME1jwjCY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                Unsplash
              </Link>
            </figcaption>
          </figure>
        </div>
        <article className="ml-4 prose">
          <p>
            This isn&#39;t an actual store. Sorry to burst your bubble. This is
            a custom storefront using a bit of TypeScript and some well known
            libraries such as:
          </p>
          <ul>
            <li>Next.js, a React framework</li>
            <li>Shopify JS Buy SDK, which uses the Shopify Storefront API</li>
            <li>Tailwind CSS, for styling this website</li>
          </ul>
          <p>
            I think it&#39;s kinda neat that this can be put together with
            not much code (at least on my end).
          </p>
          <div className="not-prose">
            <Link
              className="@btn-purple px-3 py-1 inline-flex items-center"
              href="/catalog"
            >
              <span className="mr-2">See catalog</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>
        </article>
      </div>
    </div>
  )
}