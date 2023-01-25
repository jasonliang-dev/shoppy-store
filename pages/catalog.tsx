import { useState, useEffect, useRef, ReactNode, FormEvent } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { client } from '@/common/shopify'
import { Product, Cart, Shop } from '@/common/interfaces'
import Nav from '@/common/Nav'
import ProductItem from '@/common/ProductItem'

export default function CatalogPage({ shop, cart }: { shop: Shop, cart: Cart }) {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[] | 'error' | 'loading'>('loading')
  const [sort, setSort] = useState({ key: 'TITLE', reverse: false })

  async function getProductsSort(sortKey: string, reverse: boolean) {
    setProducts('loading')
    setSort({ key: sortKey, reverse })

    const res = await fetch('/api/products?' + new URLSearchParams({
      num: '40',
      title: search,
      reverse: reverse ? 'yes' : 'no',
      sort: sortKey,
    }))

    const json = await res.json()
    setProducts(json)
  }

  useEffect(() => {
    getProductsSort(sort.key, sort.reverse)
  }, [])

  const menuItem = 'px-4 py-1 hover:bg-gray-200 text-left flex items-center gap-x-2'

  let productList
  if (products === 'loading') {
    productList =
      <ul className="animate-pulse grid grid-cols-4 gap-4">
        {Array.from(Array(12)).map((_, i) => (
          <li key={i} className="bg-white rounded-lg shadow-sm p-3 flex flex-col gap-y-3">
            <div className="bg-gray-200 rounded aspect-square"></div>
            <div className="bg-gray-200 rounded-full h-3"></div>
            <div className="bg-gray-200 rounded-full w-2/3 h-3"></div>
          </li>
        ))}
      </ul>
  } else if (products === 'error') {
    productList = []
  } else {
    productList =
      <ul className="grid grid-cols-4 gap-4">
        {products.map(product => <ProductItem key={product.id} product={product} />)}
      </ul>
  }

  return (
    <>
      <Head>
        <title>Products</title>
      </Head>
      <Nav title={shop.name} quantity={cart.lineItems.length} />
      <div className="container max-w-4xl mx-auto">
        <h1 className="font-semibold text-4xl mb-4">Products</h1>
        <div className="flex items-center mb-4">
          <form
            onSubmit={e => {
              e.preventDefault()
              getProductsSort(sort.key, sort.reverse)
            }}
          >
            <input
              className="w-[20rem] bg-white border border-gray-300 shadow-sm rounded px-3 py-2"
              type="text"
              onChange={e => setSearch(e.target.value)}
              value={search}
            />
            <button className="px-3 py-2 bg-white hover:bg-gray-100 ml-2 rounded border shadow-sm border-gray-300" type="submit">
              Search
            </button>
          </form>
          <SortButton>
            <button
              onClick={() => getProductsSort('BEST_SELLING', false)}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
              </svg>
              Best selling
            </button>
            <hr className="border-gray-200 my-1" />
            <button
              onClick={() => getProductsSort('TITLE', false)}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Name, ascending
            </button>
            <button
              onClick={() => getProductsSort('TITLE', true)}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h7.508a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V7.75A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75h4.562a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Name, descending
            </button>
            <hr className="border-gray-200 my-1" />
            <button
              onClick={() => getProductsSort('PRICE', false)}
              className={menuItem}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Price, ascending
            </button>
            <button
              onClick={() => getProductsSort('PRICE', true)}
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
        {productList}
      </div>
    </>
  )
}

function SortButton({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const self = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function clickOut(e: MouseEvent) {
      if (!self.current || !menu.current) {
        return
      }

      if (!(e.target instanceof Node)) {
        return
      }

      if (menu.current.contains(e.target)) {
        setOpen(false)
        return
      }

      if (!self.current.contains(e.target)) {
        setOpen(false)
      }
    }

    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener('click', clickOut)
    document.addEventListener('keyup', escape)

    return () => {
      document.removeEventListener('click', clickOut)
      document.removeEventListener('keyup', escape)
    }
  }, [])

  return (
    <div className="ml-auto" ref={self}>
      <button
        onClick={() => setOpen(s => !s)}
        className="px-2 py-1 bg-white hover:bg-gray-100 border border-gray-300 shadow-sm rounded flex items-center"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
          <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z" clipRule="evenodd" />
        </svg>
        <span className="ml-2">Sort by...</span>
      </button>
      <div className={`${open ? '' : 'hidden'} relative`}>
        <div
          ref={menu}
          className="absolute overflow-hidden z-[999] top-0 right-0 bg-white shadow-lg rounded-lg border border-gray-300 flex flex-col py-2 mt-2 w-[15rem]"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{ cart: Cart, shop: Shop }> = async (context) => {
  const { checkout } = context.req.cookies

  const shopJob = client.shop.fetchInfo()
  const cartJob = client.checkout.fetch(String(checkout))

  const [shop, cart] = await Promise.all([shopJob, cartJob])

  return {
    props: {
      shop: JSON.parse(JSON.stringify(shop)),
      cart: JSON.parse(JSON.stringify(cart)),
    }
  }
}
