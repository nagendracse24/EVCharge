import Razorpay from 'razorpay'
import { config } from '../config'

// Initialize Razorpay instance only if credentials are provided
let razorpayInstance: Razorpay | null = null

if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  })
  console.log('✅ Razorpay initialized')
} else {
  console.warn('⚠️  Razorpay not configured - payment features will be disabled')
}

export const razorpay = razorpayInstance

// Payment configuration
export const PAYMENT_CONFIG = {
  currency: 'INR',
  receipt_prefix: 'evcharge_',
  
  // Payment methods available
  payment_methods: {
    upi: true,
    card: true,
    wallet: true,
    netbanking: true,
  },
  
  // Minimum and maximum amounts (in paise)
  min_amount: 100, // ₹1
  max_amount: 100000, // ₹1000
}

/**
 * Create a Razorpay order for payment
 */
export async function createRazorpayOrder(params: {
  amount: number // in rupees
  bookingId: string
  userId: string
  metadata?: any
}) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.')
  }

  const { amount, bookingId, userId, metadata } = params
  
  // Convert amount to paise (Razorpay uses paise)
  const amountInPaise = Math.round(amount * 100)
  
  // Validate amount
  if (amountInPaise < PAYMENT_CONFIG.min_amount || amountInPaise > PAYMENT_CONFIG.max_amount) {
    throw new Error(`Amount must be between ₹${PAYMENT_CONFIG.min_amount / 100} and ₹${PAYMENT_CONFIG.max_amount / 100}`)
  }
  
  // Create order
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: PAYMENT_CONFIG.currency,
    receipt: `${PAYMENT_CONFIG.receipt_prefix}${bookingId}`,
    notes: {
      booking_id: bookingId,
      user_id: userId,
      ...metadata,
    },
  })
  
  return order
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const { orderId, paymentId, signature } = params
  
  try {
    const crypto = require('crypto')
    const generated_signature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET || '')
      .update(orderId + '|' + paymentId)
      .digest('hex')
    
    return generated_signature === signature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    throw error
  }
}

/**
 * Initiate refund for a payment
 */
export async function initiateRefund(params: {
  paymentId: string
  amount?: number // partial refund amount in rupees
  reason?: string
}) {
  if (!razorpay) {
    throw new Error('Razorpay is not configured')
  }

  const { paymentId, amount, reason } = params
  
  const refundData: any = {
    notes: {
      reason: reason || 'Booking cancelled',
    },
  }
  
  // If partial refund, add amount in paise
  if (amount) {
    refundData.amount = Math.round(amount * 100)
  }
  
  try {
    const refund = await razorpay.payments.refund(paymentId, refundData)
    return refund
  } catch (error) {
    console.error('Refund failed:', error)
    throw error
  }
}

