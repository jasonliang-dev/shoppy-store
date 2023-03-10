import Link from 'next/link'
import { useShop } from '@/common/ShopContext'

export default function Nav() {
  const { cart, setOverlay } = useShop()

  const link = 'text-gray-900 hover:text-gray-700 hover:underline text-sm font-semibold '

  let count = 0
  if (cart) {
    for (const item of cart.lineItems) {
      count += item.quantity
    }
  }


  return (
    <nav className="flex items-center gap-x-8 px-4 sm:px-6 py-4 bg-white border-b border-gray-300">
      <Link className={link} href="/">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </Link>
      <Link className={link} href="/catalog">Products</Link>
      <button
        className="ml-auto text-gray-900 hover:text-gray-700 flex items-center"
        onClick={() => setOverlay(true)}
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {cart &&
          <div className="rounded-full flex items-center justify-center w-5 h-5 bg-purple-500 text-white text-xs font-bold ml-1">
            {count}
          </div>}
      </button>
    </nav>
  )
}