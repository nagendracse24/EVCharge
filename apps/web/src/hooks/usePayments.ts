import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : null
}

// Get user's payment history
export function usePaymentHistory() {
  return useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const authHeader = await getAuthHeader()
      if (!authHeader) return { data: [] }

      const response = await fetch(`${API_URL}/api/payments/history`, {
        headers: { Authorization: authHeader },
      })
      
      if (!response.ok) throw new Error('Failed to fetch payment history')
      return response.json()
    },
  })
}

// Request refund for a payment
export async function requestRefund(paymentId: string, reason?: string) {
  const authHeader = await getAuthHeader()
  if (!authHeader) throw new Error('Authentication required')

  const response = await fetch(`${API_URL}/api/payments/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({
      payment_id: paymentId,
      reason,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Refund request failed')
  }

  return response.json()
}




