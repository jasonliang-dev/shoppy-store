import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import '@/styles/globals.css'
import Head from 'next/head'
import Link from 'next/link'
import type { AppProps } from 'next/app'
import { Inter } from '@next/font/google'
import ShopContext from '@/common/ShopContext'
import { Cart, Shop, Collection, Money, imgSrcOr } from '@/common/interfaces'
import Nav from '@/common/Nav'
import CartBehavior from '@/common/CartBehavior'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [overlay, setOverlayRaw] = useState(false)
  const [group, setGroup] = useState<{
    shop: Shop | null,
    collections: Collection[],
    homepage: Collection | null,
    waitingFirstLoad: boolean
  }>({
    shop: null,
    collections: [],
    homepage: null,
    waitingFirstLoad: true,
  })

  function setOverlay(open: boolean) {
    setOverlayRaw(open)
  }

  function updateCart(cart: Cart) {
    setCart(cart)
    localStorage.setItem('checkout', cart.id)
  }

  useEffect(() => {
    async function getShop() {
      const res = await fetch('/api/shop')
      const json = await res.json()

      const collections = []
      let homepage = null
      for (const collection of json.collections) {
        if (collection.handle === 'homepage') {
          homepage = collection
        } else {
          collections.push(collection)
        }
      }

      setGroup({
        shop: json.shop,
        waitingFirstLoad: false,
        collections,
        homepage,
      })
    }

    async function getCart() {
      const res = await fetch('/api/cart?' + new URLSearchParams({
        id: localStorage.getItem('checkout') || ''
      }))

      const json = await res.json()
      updateCart(json)
    }

    function routeChangeStart() {
      // setTransitioning(true)
    }

    function routeChangeComplete() {
      // setTransitioning(false)
    }

    getShop()
    getCart()

    router.events.on('routeChangeStart', routeChangeStart)
    router.events.on('routeChangeComplete', routeChangeComplete)

    return () => {
      router.events.off('routeChangeStart', routeChangeStart)
      router.events.off('routeChangeComplete', routeChangeComplete)
    }
  }, [])

  function moneyFormat(m: Money | null, factor = 1) {
    if (!m) {
      return ''
    }

    const num = (Number(m.amount) * factor).toLocaleString('en-US', { minimumFractionDigits: 2 })

    if (group.shop?.moneyFormat) {
      return group.shop.moneyFormat.replace("{{amount}}", num)
    } else {
      return `${num} ${m.currencyCode}`
    }
  }

  const label = 'font-black text-gray-800'
  const link = 'text-gray-700 hover:text-gray-800 hover:underline text-sm'

  return (
    <>
      <Head>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ShopContext.Provider
        value={{
          shop: group.shop,
          collections: group.collections,
          homepage: group.homepage,
          cart,
          overlay,
          setOverlay,
          updateCart,
          moneyFormat,
        }}
      >
        <div className={inter.className}>
          <Transition
            show={group.waitingFirstLoad}
            className="fixed z-[9999] z-10 bg-gray-200 inset-0 p-8 flex items-end justify-end"
            enter="transition ease-in-out duration-500 transform"
            enterFrom="-translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in-out duration-500 transform"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-full opacity-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 animate-spin text-gray-600">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-800 ml-2 font-semibold">
              Loading...
            </span>
          </Transition>
          <div className="min-h-screen">
            <Nav />
            <Component {...pageProps} />
          </div>
          <footer className="bg-gray-200 py-12 px-10 mt-12 flex flex-wrap gap-x-24 border-t border-gray-300">
            <div className="flex flex-col gap-y-3 mb-8">
              <span className={label}>Pages</span>
              <Link className={link} href="/">Home</Link>
              <Link className={link} href="/catalog">Catalog</Link>
              <Link className={link} href="/cart">Cart</Link>
            </div>
            <div className="grid grid-cols-3 gap-y-3 gap-x-8 mb-8">
              <span className={`${label} col-span-3`}>Collections</span>
              {group.collections.map(collection =>
                <Link className={link} href={`/catalog/${collection.handle}`}>
                  {collection.title}
                </Link>)}
            </div>
            <div className="flex flex-col gap-y-3 mb-8">
              <span className={label}>More</span>
              <Link className={link} href="https://github.com/jasonliang-dev/shoppy-store">Source code on GitHub</Link>
            </div>
          </footer>
          <CartOverlay open={overlay} setOpen={setOverlay} moneyFormat={moneyFormat} />
        </div>
      </ShopContext.Provider>
    </>
  )
}

function CartOverlay({
  open,
  setOpen,
  moneyFormat,
}: {
  open: boolean,
  setOpen: (open: boolean) => void,
  moneyFormat: (money: Money, factor?: number) => string,
}) {
  return (
    <CartBehavior>
      {({
        cart,
        updating,
        quantities,
        removeLine,
        setQuantityInput,
        inputBlur,
      }) =>
        <Transition show={open}>
          <div className="z-[9999] fixed inset-0">
            <Transition.Child
              onClick={() => setOpen(false)}
              className="absolute z-10 bg-gray-300 inset-0 opacity-75"
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-75"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-75"
              leaveTo="opacity-0"
            />
            <Transition.Child
              className="absolute z-20 right-4 left-4 sm:left-auto inset-y-4"
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full opacity-0"
              enterTo="translate-x-0 opacity-100"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0 opacity-100"
              leaveTo="translate-x-full opacity-0"
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col sm:w-[30rem] h-full">
                <h2 className="font-black text-3xl mb-3 pt-4 px-4">Your cart</h2>
                <div className="flex-1 overflow-auto">
                  <ul className={`${updating ? 'opacity-75' : ''} flex flex-col gap-y-8`}>
                    {cart?.lineItems.map((item, index) => (
                      <li key={item.id} className="px-4 flex items-center">
                        <div className="flex items-center gap-x-2 mr-6">
                          <img
                            className="flex-none w-[3rem] border rounded aspect-square shadow-sm bg-white object-contain"
                            src={imgSrcOr(item.variant.image, '/600.svg') + '?width=80'}
                            alt={item.variant.image?.altText || item.variant.title}
                            sizes="80px"
                          />
                          <div className="ml-3">
                            <Link
                              onClick={() => setOpen(false)}
                              href={{
                                pathname: '/product/[id]',
                                query: { id: item.variant.product.handle },
                              }}
                              className="font-semibold text-gray-900 hover:underline"
                            >
                              {item.title}
                            </Link>
                            <div className="text-gray-700">{item.variant.title}</div>
                            <div className="text-gray-700 text-sm font-semibold">
                              {moneyFormat(item.variant.price, item.quantity)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-auto flex justify-between items-center gap-x-2">
                          <input
                            type="text"
                            className="min-w-0 w-[4rem] text-center px-2 py-1 @control"
                            onBlur={e => inputBlur(Number(e.target.value), index)}
                            onChange={e => setQuantityInput(index, e.target.value)}
                            value={quantities[index] === undefined ? 0 : quantities[index]}
                          />
                        </div>
                        <button
                          disabled={updating}
                          className="ml-6 p-1 text-red-500 rounded hover:shadow-sm border border-transparent hover:border-gray-300 hover:bg-white"
                          type="button"
                          onClick={() => removeLine(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-4 pb-4 border-t border-gray-300 flex gap-x-3 items-center justify-end pt-4">
                  <span className="font-semibold text-gray-700 text-sm">
                    {cart && moneyFormat(cart.subtotalPrice)} Total
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    className="@btn px-2 py-1"
                    type="button"
                  >
                    Close
                  </button>
                  <Link
                    onClick={() => setOpen(false)}
                    href="/cart"
                    className="@btn-purple px-2 py-1 font-semibold"
                  >
                    View cart
                  </Link>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Transition>}
    </CartBehavior>
  )
}