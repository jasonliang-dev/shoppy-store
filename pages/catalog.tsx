import { useState, useEffect, useRef, ReactNode } from 'react'
import Head from 'next/head'
import { client } from '@/common/shopify'
import { Product, money } from '@/common/interfaces'
import ProductItem from '@/common/ProductItem'
import Image from 'next/image'
import Link from 'next/link'

export default function CatalogPage({ products: productsRaw }: { products: Product[] }) {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState(productsRaw)

  function sortProducts(cmp: (lhs: Product, rhs: Product) => number) {
    const arr = [...products].sort(cmp)
    setProducts(arr)
  }

  const menuItem = 'px-4 py-1 hover:bg-gray-200 text-left flex items-center gap-x-2'

  return (
    <>
      <Head>
        <title>Products</title>
      </Head>
      <div className="container max-w-4xl mx-auto">
        <h1 className="font-semibold text-4xl mb-4">Products</h1>
        <div className="flex items-center mb-4">
          <input
            className="w-[20rem] bg-white border border-gray-400 shadow-sm rounded px-3 py-2"
            type="text"
            placeholder="Search..."
            onChange={e => setSearch(e.target.value)}
            value={search}
          />
          <SortButton>
            <button
              onClick={() => sortProducts((lhs, rhs) => {
                const left = lhs.title.toLocaleLowerCase()
                const right = rhs.title.toLocaleLowerCase()
                return left.localeCompare(right)
              })}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Name, ascending
            </button>
            <button
              onClick={() => sortProducts((lhs, rhs) => {
                const left = lhs.title.toLocaleLowerCase()
                const right = rhs.title.toLocaleLowerCase()
                return right.localeCompare(left)
              })}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Name, descending
            </button>
            <hr className="border-gray-300 my-1" />
            <button
              onClick={() => sortProducts((lhs, rhs) => {
                const left = Number(lhs.variants[0]?.price.amount || 0)
                const right = Number(rhs.variants[0]?.price.amount || 0)
                return left - right
              })}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Price, ascending
            </button>
            <button
              onClick={() => sortProducts((lhs, rhs) => {
                const left = Number(lhs.variants[0]?.price.amount || 0)
                const right = Number(rhs.variants[0]?.price.amount || 0)
                return right - left
              })}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Price, descending
            </button>
          </SortButton>
        </div>
        <ul className="grid grid-cols-5 gap-4">
          {products.map(product => {
            const trim = search.trim().toLowerCase()
            const title = product.title.toLowerCase()
            const show = trim.length === 0 || title.includes(trim)

            return <ProductItem key={product.id} product={product} className={show ? '' : 'hidden'} />
          })}
        </ul>
      </div>
    </>
  )
}

function SortButton({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function clickOut(e: MouseEvent) {
      if (!ref.current || !(e.target instanceof Node)) {
        return
      }

      if (!ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', clickOut)

    return () => {
      document.removeEventListener('click', clickOut)
    }
  }, [])

  return (
    <div className="ml-auto" ref={ref}>
      <button
        onClick={() => setOpen(s => !s)}
        className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-400 shadow-sm rounded flex items-center"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
          <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z" clipRule="evenodd" />
        </svg>
        <span className="ml-2">Sort by...</span>
      </button>
      <div className={`${open ? '' : 'hidden'} relative`}>
        <div className="absolute overflow-hidden z-[999] top-0 right-0 bg-white shadow-lg rounded-lg border border-gray-400 flex flex-col py-2 mt-2 w-[15rem]">
          {children}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  const products = await client.product.fetchAll(50)

  return {
    props: {
      products: JSON.parse(JSON.stringify(products))
    }
  }
}
