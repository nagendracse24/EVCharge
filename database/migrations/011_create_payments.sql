-- ============================================
-- PAYMENTS TABLE FOR RAZORPAY INTEGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Booking reference
  booking_id UUID NOT NULL REFERENCES slot_bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Razorpay references
  razorpay_order_id VARCHAR(255) UNIQUE,
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_signature VARCHAR(512),
  
  -- Payment status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50), -- upi, card, wallet, netbanking
  
  -- Additional info
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  USING (true); -- Backend will use service role key

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER payments_updated_at_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Add helpful comments
COMMENT ON TABLE payments IS 'Stores payment transactions for charging slot bookings';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay Order ID for tracking';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay Payment ID after successful payment';
COMMENT ON COLUMN payments.razorpay_signature IS 'Signature for payment verification';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, processing, completed, failed, refunded';

-- Update slot_bookings to include payment_status
ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table exists
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'payments';

-- Check policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'payments';

-- Should show 3 policies:
-- 1. Users can view their own payments (SELECT)
-- 2. Users can create their own payments (INSERT)
-- 3. System can update payments (UPDATE)

