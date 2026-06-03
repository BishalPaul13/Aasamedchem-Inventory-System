CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'seller');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dimension_type AS ENUM ('weight', 'volume', 'count');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE unit_code AS ENUM ('g', 'kg', 'mL', 'L', 'unit');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('quoted', 'accepted', 'rejected', 'fulfilled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'seller',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  dimension dimension_type NOT NULL,
  base_unit unit_code NOT NULL,
  inventory_base_quantity NUMERIC(30, 12) NOT NULL DEFAULT 0 CHECK (inventory_base_quantity >= 0),
  price_per_base_unit_inr NUMERIC(30, 12) NOT NULL CHECK (price_per_base_unit_inr >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_base_unit_matches_dimension CHECK (
    (dimension = 'weight' AND base_unit = 'g')
    OR (dimension = 'volume' AND base_unit = 'mL')
    OR (dimension = 'count' AND base_unit = 'unit')
  )
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'quoted',
  total_inr NUMERIC(30, 12) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL,
  ordered_quantity NUMERIC(30, 12) NOT NULL CHECK (ordered_quantity > 0),
  ordered_unit unit_code NOT NULL,
  base_quantity NUMERIC(30, 12) NOT NULL CHECK (base_quantity > 0),
  price_per_base_unit_inr NUMERIC(30, 12) NOT NULL CHECK (price_per_base_unit_inr >= 0),
  line_total_inr NUMERIC(30, 12) NOT NULL CHECK (line_total_inr >= 0)
);

CREATE INDEX IF NOT EXISTS products_search_idx ON products USING gin (
  to_tsvector('english', name || ' ' || sku || ' ' || category || ' ' || description)
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
