import { useState, useCallback } from 'react'

export const fmt = {
  currency: (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n ?? 0),

  date: (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : '—',

  shortDate: (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    }) : '—',
}

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  return { toast, showToast, clearToast }
}
