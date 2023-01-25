import Link from 'next/link'

export default function Nav({ title, quantity }: { title: string, quantity: number }) {
  return (
    <nav className="flex items-center gap-x-8 px-8 py-4 bg-gray-50 shadow border-b border-gray-300 mb-5">
      <Link className="text-gray-900 hover:text-gray-700 hover:underline text-xl font-semibold" href="/">{title}</Link>
      <Link className="text-gray-900 hover:text-gray-700 hover:underline" href="/catalog">Catalog</Link>
      <Link className="text-gray-900 hover:text-gray-700 hover:underline" href="/cart">Cart ({quantity})</Link>
    </nav>
  )
}