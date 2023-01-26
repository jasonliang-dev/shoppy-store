import React, { useState, useEffect, ReactNode } from 'react'
import Head from 'next/head'
import { Product } from '@/common/interfaces'
import Link from 'next/link'
import ProductItem, { ProductSkeleton } from '@/common/ProductItem'
import { Menu, Transition } from '@headlessui/react'
import { useShop } from '@/common/ShopContext'
import { useRouter } from 'next/router'

export default function CatalogPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[] | 'error' | 'loading'>('loading')
  const [sort, setSort] = useState({ key: 'TITLE', reverse: false })
  const { collections } = useShop()

  const handle = String(router.query.id || '')
  const collection = collections.find(col => col.handle === handle)

  async function refreshProducts(sort: { key: string, reverse: boolean }) {
    setProducts('loading')
    setSort(sort)

    const num = '40'
    if (handle !== '') {
      const res = await fetch('/api/products?' + new URLSearchParams({
        reverse: sort.reverse ? 'yes' : 'no',
        sort: sort.key,
        collection: handle,
        num,
      }))
      const json = await res.json()
      setProducts(json)
    } else {
      const res = await fetch('/api/products?' + new URLSearchParams({
        title: search,
        reverse: sort.reverse ? 'yes' : 'no',
        sort: sort.key,
        num,
      }))

      const json = await res.json()
      setProducts(json)
    }
  }

  useEffect(() => {
    if (handle !== '') {
      setSearch('')
    }
    refreshProducts(sort)
  }, [handle])

  useEffect(() => {
    refreshProducts({ key: 'TITLE', reverse: false })
  }, [])

  let productList
  if (products === 'loading') {
    productList =
      <ul className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from(Array(12)).map((_, i) => <ProductSkeleton key={i} />)}
      </ul>
  } else if (products === 'error') {
    productList = null
  } else {
    productList =
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(product => <ProductItem key={product.id} product={product} />)}
      </ul>
  }

  return (
    <div className="container mx-auto px-2">
      <Head>
        <title>Catalog</title>
      </Head>
      <h1 className="font-semibold text-4xl mb-4">
        {collection ? collection.title : 'All Products'}
      </h1>
      <div className="flex">
        <div className="flex-0 w-[20rem]">
          <form
            className="mb-6"
            onSubmit={e => {
              e.preventDefault()
              if (handle === '') {
                refreshProducts(sort)
              } else {
                router.push('/catalog')
              }
            }}
          >
            <label htmlFor="search" className="block font-semibold text-sm text-gray-800 mb-1">
              Search
            </label>
            <div className="flex items-stretch">
              <input
                id="search"
                className="min-w-0 flex-1 px-3 py-2 @control"
                type="text"
                onChange={e => setSearch(e.target.value)}
                value={search}
              />
              <button className="flex items-center px-3 py-2 ml-2 @btn" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
          <span className="flex justify-between items-baseline font-semibold text-sm text-gray-800 mb-2">
            Collections
            {collection &&
              <Link
                className="text-purple-600 hover:text-purple-900 hover:underline"
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
        <div className="flex-1 ml-8">
          <div className="flex justify-end items-center mb-4">
            <Dropdown
              className="ml-2"
              button={
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                    <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">
                    Sort by...
                  </span>
                </>
              }
              items={[
                {
                  name: "Best selling",
                  onClick: () => refreshProducts({ key: 'BEST_SELLING', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
                    </svg>
                },
                'separator 0',
                {
                  name: "Name, ascending",
                  onClick: () => refreshProducts({ key: 'TITLE', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                {
                  name: "Name, descending",
                  onClick: () => refreshProducts({ key: 'TITLE', reverse: true }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                'separator 1',
                {
                  name: "Price, ascending",
                  onClick: () => refreshProducts({ key: 'PRICE', reverse: false }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
                {
                  name: "Price, descending",
                  onClick: () => refreshProducts({ key: 'PRICE', reverse: true }),
                  icon:
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                      <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                },
              ]}
            />
          </div>
          {productList}
        </div>
      </div>
    </div>
  )
}

type DropdownItem = string | {
  icon?: ReactNode,
  name: string,
  onClick: () => void,
}

function Dropdown({ button, items, className }: { button: ReactNode, items: DropdownItem[], className?: string }) {
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