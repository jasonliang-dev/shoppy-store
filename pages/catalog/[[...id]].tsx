import React, { useState, useEffect, ReactNode } from 'react'
import Head from 'next/head'
import { Product } from '@/common/interfaces'
import Link from 'next/link'
import ProductItem, { ProductSkeleton } from '@/common/ProductItem'
import { Menu, Transition } from '@headlessui/react'
import { useShop } from '@/common/ShopContext'
import { useRouter } from 'next/router'

// from the next.js docs:
// https://nextjs.org/docs/api-reference/next/router#router-object

// > query: Object - The query string parsed to an object, including dynamic route
// > parameters. It will be an empty object during prerendering if the page
// > doesn't use Server-side Rendering. Defaults to {}

// when page is statically optimized, router.query.id will initially be empty,
// even if id is provided. rendering server side fixes this.

// this is done because I'd like:
//
// the `/catalog` route to show all products
// - router.query.id === undefined
//
// and `/catalog/[id]` to filter by collection
// - router.query.id === [id]
// - but on load, router.query.id === undefined

// without server side rendering, I don't think it's possible to tell if we're
// showing all products or filtering by collection without some hacks like
// waiting for page to settle with setTimeout.
export function getServerSideProps() {
  return { props: {} }
}

export default function CatalogPage() {
  const router = useRouter()

  const handle = String(router.query.id || '')
  const search = String(router.query.search || '')

  const [searchText, setSearchText] = useState(search)
  const [sort, setSort] = useState({ key: 'TITLE', reverse: false })
  const { collections } = useShop()
  const [products, setProducts] = useState<{
    list: Product[],
    stat: 'loaded' | 'loading' | 'error',
  }>({
    list: [],
    stat: 'loading',
  })

  const collection = collections.find(col => col.handle === handle)

  useEffect(() => {
    async function refreshProducts() {
      setProducts(p => ({ list: p.list, stat: 'loading' }))

      let res
      if (handle === '') {
        res = await fetch('/api/products?' + new URLSearchParams({
          title: search,
          sort: sort.key,
          reverse: sort.reverse ? 'yes' : 'no',
          num: '40',
        }))
      } else {
        res = await fetch('/api/products?' + new URLSearchParams({
          collection: handle,
          sort: sort.key,
          reverse: sort.reverse ? 'yes' : 'no',
          num: '40',
        }))
      }
      const json = await res.json()

      setProducts({ list: json, stat: 'loaded' })
    }

    refreshProducts()
  }, [handle, search, sort])

  useEffect(() => {
    if (handle !== '') {
      setSearchText('')
    }
  }, [handle])

  return (
    <div className="container mx-auto px-2 mt-8">
      <Head>
        <title>Catalog</title>
      </Head>
      <span className="font-bold text-gray-700 text-sm">Collection</span>
      <h1 className="font-black text-4xl mb-4">
        {collection ? collection.title : 'All Products'}
      </h1>
      <div className="flex flex-col md:flex-row">
        <div className="flex-0 md:w-[20rem]">
          <form
            className="mb-6"
            onSubmit={e => {
              e.preventDefault()
              const url = '/catalog?' + new URLSearchParams({ search: searchText })
              router.push(url)
            }}
          >
            <div className="mb-1 flex items-baseline font-bold text-sm">
              <label htmlFor="search" className="text-gray-700">
                Search
              </label>
              {search &&
                <Link
                  onClick={() => setSearchText('')}
                  className="text-purple-600 hover:text-purple-900 hover:underline ml-3"
                  href="/catalog"
                >
                  Clear
                </Link>}
            </div>
            <div className="flex items-stretch">
              <input
                id="search"
                className="min-w-0 flex-1 px-3 py-2 @control"
                placeholder="Search all products..."
                type="text"
                onChange={e => setSearchText(e.target.value)}
                value={searchText}
              />
              <button className="flex items-center px-3 py-2 ml-2 @btn" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
          <div className="hidden md:block">
            <span className="flex items-baseline font-bold text-sm text-gray-700 mb-2">
              Collections
              {collection &&
                <Link
                  className="text-purple-600 hover:text-purple-900 hover:underline ml-3"
                  href="/catalog"
                >
                  View all
                </Link>}
            </span>
            <div className="flex flex-col gap-y-1">
              {collections.map(col =>
                <Link
                  key={col.id}
                  className={`${collection?.handle === col.handle ? 'bg-purple-200 text-purple-900' : 'hover:bg-gray-200 text-gray-600'} px-3 py-2 rounded text-left text-sm font-semibold`}
                  href={`/catalog/${col.handle}`}
                >
                  {col.title}
                </Link>)}
            </div>
          </div>
        </div>
        <div className="flex-1 mt-4 md:mt-0 md:ml-8">
          <div className="flex flex-col gap-2 sm:flex-row justify-end items-end mb-4">
            <Dropdown
              className="md:hidden"
              button={
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                    <path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">
                    Collection:
                    <span className="ml-1 text-sm text-gray-800 font-semibold">
                      {collection?.title || 'All'}
                    </span>
                  </span>
                </>
              }
              items={[
                {
                  name: "All products",
                  onClick: () => router.push('/catalog'),
                },
                'separator 0',
                ...collections.map(col => ({
                  name: col.title,
                  onClick: () => router.push(`/catalog/${col.handle}`),
                }))
              ]}
            />
            <Dropdown
              button={
                <>
                  {sort.reverse
                    ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                        <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                    )}
                  <span className="ml-2">
                    Sort by:
                    <span className="ml-1 text-sm text-gray-800 font-semibold">
                      {{
                        "BEST_SELLING": "Best selling",
                        "TITLE": "Name",
                        "PRICE": "Price",
                      }[sort.key]}
                    </span>
                  </span>
                </>
              }
              items={[
                {
                  name: "Best selling",
                  onClick: () => setSort({ key: 'BEST_SELLING', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
                    </svg>
                },
                'separator 0',
                {
                  name: "Name, ascending",
                  onClick: () => setSort({ key: 'TITLE', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                {
                  name: "Name, descending",
                  onClick: () => setSort({ key: 'TITLE', reverse: true }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                'separator 1',
                {
                  name: "Price, ascending",
                  onClick: () => setSort({ key: 'PRICE', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                {
                  name: "Price, descending",
                  onClick: () => setSort({ key: 'PRICE', reverse: true }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
              ]}
            />
          </div>
          {products.stat === 'loaded' && products.list.length === 0 &&
            <div className="border border-gray-300 shadow-inner rounded py-[5rem] text-center bg-gray-200">
              <h3 className="font-semibold text-2xl mb-2">No products found!</h3>
            </div>}
          {products.stat === 'loaded' && products.list.length > 0 &&
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.list.map((product, index) =>
                <div
                  key={product.id}
                  className="@slide-up"
                  style={{ animationDuration: `${Math.floor(Math.sqrt(index + 1) * 150)}ms` }}
                >
                  <ProductItem product={product} />
                </div>)}
            </div>}
          {products.stat === 'loading' &&
            <ul className="animate-pulse grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from(Array(12)).map((_, i) => <ProductSkeleton key={i} />)}
            </ul>}
        </div>
      </div>
    </div>
  )
}

function Dropdown({
  button,
  items,
  className,
}: {
  button: ReactNode,
  items: (string | { icon?: ReactNode, name: string, onClick: () => void })[],
  className?: string,
}) {
  return (
    <Menu as="div" className={className}>
      <Menu.Button className="px-2 py-1 @btn flex items-center">
        {button}
      </Menu.Button>
      <Transition
        className="relative z-[999]"
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Menu.Items className="absolute mt-1 top-0 right-0 bg-white shadow-lg rounded-lg border border-gray-300 flex flex-col py-2 mt-2 w-[15rem]">
          {items.map(item => {
            if (typeof item === 'string') {
              return <hr key={item} className="my-2" />
            }

            return (
              <Menu.Item key={item.name}>
                {({ active }) =>
                  <button
                    onClick={item.onClick}
                    className={`px-4 py-1 text-left flex items-center gap-x-2 ${active ? 'bg-gray-200' : ''}`}
                    type="button"
                  >
                    {item.icon} {item.name}
                  </button>}
              </Menu.Item>
            )
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
