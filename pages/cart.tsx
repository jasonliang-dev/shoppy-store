import Head from 'next/head'
import Link from 'next/link'
import { useShop } from '@/common/ShopContext'
import { imgSrcOr } from '@/common/interfaces'
import useCart from '@/common/useCart'

export default function CartPage() {
  return (
    <div className="container max-w-5xl mx-auto mt-8 px-2">
      <Head>
        <title>Your Cart</title>
      </Head>
      <h1 className="font-black text-4xl mb-4">Your Cart</h1>
      <CartContent />
    </div>
  )
}

function CartContent() {
  const { moneyFormat } = useShop()
  const {
    cart,
    updating,
    quantities,
    removeLine,
    setQuantityInput,
    setLineQuantity,
    inputBlur,
  } = useCart()

  if (!cart) {
    return null
  }

  if (cart.lineItems.length === 0) {
    return (
      <div className="border border-gray-300 shadow-inner rounded py-[5rem] text-center bg-gray-200">
        <h3 className="font-semibold text-2xl mb-2">Your cart is empty!</h3>
        <Link href="/" className="text-purple-600 hover:text-purple-700 hover:underline">
          View products
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/" className="text-purple-600 hover:text-purple-900 hover:underline">Continue shopping</Link>
      <ul className={`${updating ? 'opacity-75' : ''} mb-3`}>
        {cart.lineItems.map((item, index) => {
          if (!item.variant) {
            return null
          }

          return (
            <li key={item.id} className="flex flex-wrap md:flex-nowrap items-center py-4 border-b border-gray-300">
              <img
                className="w-[4rem] border rounded aspect-square shadow-sm bg-white object-contain"
                src={imgSrcOr(item.variant.image, '/600.svg') + '?width=80'}
                alt={item.variant.image?.altText || item.variant.title}
                sizes="4rem"
                loading="lazy"
                decoding="async"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <Link href={'/product/' + item.variant.product.handle} className="font-semibold text-gray-900 hover:underline">
                    {item.title}
                  </Link>
                  <div className="ml-2 rounded-full px-2 text-xs font-semibold bg-gray-300 text-gray-700">
                    {moneyFormat(item.variant.price)} each
                  </div>
                </div>
                <div className="text-gray-700">{item.variant.title}</div>
              </div>
              <div className="ml-auto flex items-center justify-end w-full md:w-auto">
                <span className="text-gray-700 font-semibold">
                  {moneyFormat(item.variant.price, item.quantity)}
                </span>
                <div className="ml-8 flex gap-x-2">
                  <button
                    disabled={updating}
                    className="p-1 @btn"
                    type="button"
                    onClick={() => setLineQuantity(item.id, item.quantity - 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                  <input
                    disabled={updating}
                    className="min-w-0 w-[4rem] text-center px-2 py-1 @control"
                    onBlur={e => inputBlur(Number(e.target.value), index)}
                    onChange={e => setQuantityInput(index, e.target.value)}
                    value={quantities[index] === undefined ? 0 : quantities[index]}
                    id="quantity"
                    type="text"
                  />
                  <button
                    disabled={updating}
                    className="p-1 @btn"
                    type="button"
                    onClick={() => setLineQuantity(item.id, item.quantity + 1)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
                <button
                  disabled={updating}
                  className="ml-8 p-2 text-red-500 rounded hover:shadow-sm border border-transparent hover:border-gray-300 hover:bg-white"
                  type="button"
                  onClick={() => removeLine(item.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          )
        }
        )}
      </ul>
      <div className="flex flex-col items-end">
        <div className="mb-6">
          <span className="font-bold text-xs text-gray-700">Subtotal</span>
          <span className="font-semibold text-lg ml-3">
            {moneyFormat(cart.subtotalPrice)}
          </span>
        </div>
        <span className="text-gray-700 mb-3">Shipping and tax calculated at checkout</span>
        <a className="px-3 py-2 font-semibold inline-block @btn-zinc" href={cart.webUrl}>
          Proceed to checkout
        </a>
      </div>
    </>
    )
}