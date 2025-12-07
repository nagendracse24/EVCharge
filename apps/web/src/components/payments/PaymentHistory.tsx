'use client'

import { useState } from 'react'
import { usePaymentHistory, requestRefund } from '@/hooks/usePayments'
import { CreditCard, CheckCircle2, XCircle, Clock, Download, RefreshCw } from 'lucide-react'

export function PaymentHistory() {
  const { data, isLoading, error, refetch } = usePaymentHistory()
  const [refunding, setRefunding] = useState<string | null>(null)

  const payments = data?.data || []

  const handleRefund = async (paymentId: string, bookingId: string) => {
    if (!confirm('Are you sure you want to request a refund? This will cancel your booking.')) {
      return
    }

    setRefunding(paymentId)
    try {
      await requestRefund(paymentId, 'User requested cancellation')
      alert('Refund initiated successfully! It will be processed in 5-7 business days.')
      refetch()
    } catch (err: any) {
      alert(`Refund failed: ${err.message}`)
    } finally {
      setRefunding(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      failed: 'bg-red-500/20 text-red-400 border-red-500/50',
      refunded: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    }

    const icons = {
      completed: <CheckCircle2 className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      failed: <XCircle className="w-4 h-4" />,
      refunded: <RefreshCw className="w-4 h-4" />,
    }

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Failed to load payment history</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
        <p className="text-gray-400">
          Your payment history will appear here once you book a charging slot.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment History</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.map((payment: any) => (
          <div
            key={payment.id}
            className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all"
          >
            {/* Header */}
            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {payment.booking?.station?.name || 'Charging Station'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {payment.booking?.station?.address || 'Unknown location'}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(payment.status)}
                  <div className="text-2xl font-bold text-white mt-2">
                    ₹{parseFloat(payment.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Network */}
                {payment.booking?.station?.network && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Network</div>
                    <div className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg inline-block text-sm">
                      {payment.booking.station.network}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">Payment Date</div>
                  <div className="text-sm text-white font-medium">
                    {formatDate(payment.created_at)}
                  </div>
                </div>

                {/* Payment Method */}
                {payment.payment_method && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Payment Method</div>
                    <div className="text-sm text-white font-medium uppercase">
                      {payment.payment_method}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              {payment.booking && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="text-xs text-gray-500 mb-2">Booking Details</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Booking ID:</span>
                      <span className="text-white font-mono ml-2">
                        {payment.booking.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white ml-2 capitalize">
                        {payment.booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {/* Download Receipt */}
                <button
                  onClick={() => {
                    // Generate simple receipt
                    const receipt = `
EVCharge India - Payment Receipt
---------------------------------
Payment ID: ${payment.id}
Razorpay Payment ID: ${payment.razorpay_payment_id || 'N/A'}
Station: ${payment.booking?.station?.name || 'N/A'}
Network: ${payment.booking?.station?.network || 'N/A'}
Amount: ₹${payment.amount}
Status: ${payment.status}
Date: ${formatDate(payment.created_at)}
Payment Method: ${payment.payment_method || 'N/A'}
---------------------------------
Thank you for using EVCharge India!
                    `.trim()

                    const blob = new Blob([receipt], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `receipt-${payment.id.slice(0, 8)}.txt`
                    a.click()
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>

                {/* Refund Button (only for completed payments) */}
                {payment.status === 'completed' && (
                  <button
                    onClick={() => handleRefund(payment.id, payment.booking_id)}
                    disabled={refunding === payment.id}
                    className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${refunding === payment.id ? 'animate-spin' : ''}`} />
                    {refunding === payment.id ? 'Processing...' : 'Request Refund'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

