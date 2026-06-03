-- Marketplace schema enhancements

-- Seller approval status
DO $$ BEGIN
  CREATE TYPE seller_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Quote status
DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('draft', 'pending_verification', 'verified', 'rejected', 'accepted', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Dispute status
DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Payment status
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Seller profiles with approval system
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  business_registration TEXT DEFAULT '',
  status seller_status NOT NULL DEFAULT 'pending',
  approval_notes TEXT DEFAULT '',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes from sellers to buyers
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status quote_status NOT NULL DEFAULT 'draft',
  total_inr NUMERIC(30, 12) NOT NULL DEFAULT 0,
  delivery_date DATE NOT NULL,
  delivery_terms TEXT NOT NULL,
  validity_days INT NOT NULL DEFAULT 7,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quote line items
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,
  quantity NUMERIC(30, 12) NOT NULL CHECK (quantity > 0),
  unit unit_code NOT NULL,
  price_per_unit_inr NUMERIC(30, 12) NOT NULL CHECK (price_per_unit_inr >= 0),
  line_total_inr NUMERIC(30, 12) NOT NULL CHECK (line_total_inr >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disputes between buyers and sellers
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT DEFAULT '',
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_inr NUMERIC(30, 12) NOT NULL CHECK (amount_inr > 0),
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT '',
  payment_reference TEXT DEFAULT '',
  paid_at TIMESTAMPTZ,
  refund_reason TEXT DEFAULT '',
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS seller_profiles_user_id_idx ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS seller_profiles_status_idx ON seller_profiles(status);
CREATE INDEX IF NOT EXISTS quotes_seller_id_idx ON quotes(seller_id);
CREATE INDEX IF NOT EXISTS quotes_buyer_id_idx ON quotes(buyer_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
CREATE INDEX IF NOT EXISTS quotes_expires_at_idx ON quotes(expires_at);
CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS disputes_buyer_id_idx ON disputes(buyer_id);
CREATE INDEX IF NOT EXISTS disputes_seller_id_idx ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON disputes(status);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments(order_id);
CREATE INDEX IF NOT EXISTS payments_buyer_id_idx ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS payments_seller_id_idx ON payments(seller_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
