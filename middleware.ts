import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { client } from '@/common/shopify'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const id = request.cookies.get('checkout')
  if (!id) {
    const cart = await client.checkout.create()
    response.cookies.set('checkout', String(cart.id))
  } else {
    let cart = await client.checkout.fetch(id.value)
    if (!cart) {
      cart = await client.checkout.create()
      response.cookies.set('checkout', String(cart.id))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}