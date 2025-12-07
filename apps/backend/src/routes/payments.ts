import { FastifyInstance } from 'fastify'
import { supabase, supabaseAdmin } from '../db/supabase'
import { createRazorpayOrder, verifyPaymentSignature, getPaymentDetails, initiateRefund } from '../services/razorpay'

export async function paymentRoutes(server: FastifyInstance) {
  
  // POST /api/payments/create-order - Create Razorpay order for booking
  server.post<{
    Body: {
      booking_id: string
      amount: number
    }
  }>('/api/payments/create-order', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { booking_id, amount } = request.body

    if (!booking_id || !amount) {
      return reply.code(400).send({ error: { message: 'booking_id and amount are required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Verify booking belongs to user
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('slot_bookings')
        .select('*, station:stations(name, network)')
        .eq('id', booking_id)
        .eq('user_id', user.id)
        .single()

      if (bookingError || !booking) {
        return reply.code(404).send({ error: { message: 'Booking not found' } })
      }

      // Check if payment already exists
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('booking_id', booking_id)
        .eq('status', 'completed')
        .single()

      if (existingPayment) {
        return reply.code(400).send({ error: { message: 'Payment already completed for this booking' } })
      }

      // Create Razorpay order
      const order = await createRazorpayOrder({
        amount,
        bookingId: booking_id,
        userId: user.id,
        metadata: {
          station_name: booking.station?.name,
          network: booking.station?.network,
        },
      })

      // Store payment record in database
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          booking_id,
          user_id: user.id,
          amount,
          currency: 'INR',
          razorpay_order_id: order.id,
          status: 'pending',
          metadata: {
            station_name: booking.station?.name,
            network: booking.station?.network,
          },
        })
        .select()
        .single()

      if (paymentError) {
        server.log.error(paymentError)
        throw paymentError
      }

      return reply.send({
        data: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          payment_id: payment.id,
        },
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/payments/verify - Verify payment after Razorpay callback
  server.post<{
    Body: {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }
  }>('/api/payments/verify', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return reply.code(400).send({ error: { message: 'Missing payment verification data' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Verify signature
      const isValid = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      })

      if (!isValid) {
        // Update payment as failed
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
            error_message: 'Invalid payment signature',
          })
          .eq('razorpay_order_id', razorpay_order_id)

        return reply.code(400).send({ error: { message: 'Payment verification failed' } })
      }

      // Fetch payment details from Razorpay
      const paymentDetails = await getPaymentDetails(razorpay_payment_id)

      // Update payment in database
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          payment_method: paymentDetails.method,
          completed_at: new Date().toISOString(),
          metadata: {
            ...paymentDetails,
          },
        })
        .eq('razorpay_order_id', razorpay_order_id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (paymentError) {
        server.log.error(paymentError)
        throw paymentError
      }

      // Update booking status to confirmed
      await supabaseAdmin
        .from('slot_bookings')
        .update({
          payment_status: 'completed',
          payment_id: payment.id,
          status: 'confirmed',
        })
        .eq('id', payment.booking_id)

      return reply.send({
        data: {
          success: true,
          payment_id: payment.id,
          status: 'completed',
        },
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // GET /api/payments/history - Get user's payment history
  server.get('/api/payments/history', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      const { data: payments, error } = await supabaseAdmin
        .from('payments')
        .select(`
          *,
          booking:slot_bookings(
            *,
            station:stations(name, address, network)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return reply.send({ data: payments || [] })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })

  // POST /api/payments/refund - Request refund for a payment
  server.post<{
    Body: {
      payment_id: string
      reason?: string
    }
  }>('/api/payments/refund', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.code(401).send({ error: { message: 'Authentication required' } })
    }

    const { payment_id, reason } = request.body

    if (!payment_id) {
      return reply.code(400).send({ error: { message: 'payment_id is required' } })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return reply.code(401).send({ error: { message: 'Invalid token' } })
      }

      // Get payment
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .eq('user_id', user.id)
        .single()

      if (paymentError || !payment) {
        return reply.code(404).send({ error: { message: 'Payment not found' } })
      }

      if (payment.status !== 'completed') {
        return reply.code(400).send({ error: { message: 'Only completed payments can be refunded' } })
      }

      if (payment.status === 'refunded') {
        return reply.code(400).send({ error: { message: 'Payment already refunded' } })
      }

      // Initiate refund through Razorpay
      const refund = await initiateRefund({
        paymentId: payment.razorpay_payment_id,
        reason,
      })

      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'refunded',
          metadata: {
            ...payment.metadata,
            refund: refund,
          },
        })
        .eq('id', payment_id)

      // Update booking status
      await supabaseAdmin
        .from('slot_bookings')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
        })
        .eq('id', payment.booking_id)

      return reply.send({
        data: {
          success: true,
          refund_id: refund.id,
          status: 'refunded',
        },
      })
    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: { message: error.message } })
    }
  })
}

