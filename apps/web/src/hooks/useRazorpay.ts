import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

interface PaymentOptions {
  bookingId: string
  amount: number
  onSuccess: (paymentId: string) => void
  onFailure: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Razorpay script
  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  // Create payment order
  const createOrder = useCallback(async (bookingId: string, amount: number) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        booking_id: bookingId,
        amount,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create order')
    }

    return response.json()
  }, [session])

  // Verify payment
  const verifyPayment = useCallback(async (paymentData: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Payment verification failed')
    }

    return response.json()
  }, [session])

  // Initialize payment
  const initiatePayment = useCallback(async ({ bookingId, amount, onSuccess, onFailure }: PaymentOptions) => {
    setLoading(true)
    setError(null)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Create order
      const orderData = await createOrder(bookingId, amount)
      const { order_id, amount: orderAmount, currency } = orderData.data

      // Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        name: 'EVCharge India',
        description: 'Charging Slot Booking',
        order_id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (verificationResult.data.success) {
              onSuccess(verificationResult.data.payment_id)
            } else {
              onFailure('Payment verification failed')
            }
          } catch (err: any) {
            onFailure(err.message || 'Payment verification failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
          email: user?.email || '',
          contact: user?.user_metadata?.phone || '',
        },
        theme: {
          color: '#6366f1', // Indigo color matching our app
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            onFailure('Payment cancelled by user')
          },
        },
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
      setLoading(false)
      onFailure(err.message || 'Failed to initiate payment')
    }
  }, [user, createOrder, verifyPayment, loadRazorpayScript])

  return {
    initiatePayment,
    loading,
    error,
  }
}

