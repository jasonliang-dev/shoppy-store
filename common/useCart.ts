import { useState, useEffect } from 'react'
import useSWR from 'swr'

export default function useCart() {
  const [stored, setStored] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    } else {
      return window.localStorage.getItem('cartID') || ''
    }
  })

  const { data, error, isLoading } = useSWR('/api/getCheckout?' + new URLSearchParams({
    id: stored,
  }))

  useEffect(() => {
    if (!data) {
      return
    }

    if (data.id !== stored) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cartID', data.id)
      }
      setStored(data.id)
    }
  }, [stored, data])

  if (error) {
    return ''
  }

  if (isLoading) {
    return ''
  }

  return data
}