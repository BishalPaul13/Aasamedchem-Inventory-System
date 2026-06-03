# aasamedchem Inventory

A small inventory and quotation management system built with Next.js, JavaScript, Neon PostgreSQL, and Vercel.

## Features

- Cookie-based authentication with three roles: `admin`, `seller`, and `buyer`.
- Seller and buyer dashboard for product search, category filtering, flexible quantity entry, live conversion preview, INR line totals, and quotation placement.
- Admin dashboard for catalog management, base-unit inventory/pricing, order review, and order status updates.
- Order records preserve product snapshots, ordered units, converted base quantities, base rates, and INR totals so conversions can be audited later.

## Tech Stack And Design

- **Next.js App Router** renders the UI and runs server actions for writes.
- **Neon PostgreSQL** is the primary database. The app uses `@neondatabase/serverless`.
- **Vercel** hosts the Next.js app. `DATABASE_URL` and `SESSION_SECRET` are configured as Vercel environment variables.
- **Authentication** uses PBKDF2 password hashes in `users.password_hash` and signed HTTP-only cookies. Admin-only routes call `requireUser('admin')`.

## Database Schema

Key tables are defined in [db/schema.sql](./db/schema.sql).

- `users`
  - `id UUID`
  - `email TEXT UNIQUE`
  - `password_hash TEXT`
  - `role user_role`, either `admin`, `seller`, or `buyer`
- `products`
  - `dimension dimension_type`, one of `weight`, `volume`, `count`
  - `base_unit unit_code`, constrained to `g`, `mL`, or `unit`
  - `inventory_base_quantity NUMERIC(30,12)`
  - `price_per_base_unit_inr NUMERIC(30,12)`
- `orders`
  - `status order_status`
  - `total_inr NUMERIC(30,12)`
- `order_items`
  - `ordered_quantity NUMERIC(30,12)`
  - `ordered_unit unit_code`
  - `base_quantity NUMERIC(30,12)`
  - `price_per_base_unit_inr NUMERIC(30,12)`
  - `line_total_inr NUMERIC(30,12)`
  - `product_snapshot JSONB`

`NUMERIC(30,12)` was chosen for quantities, rates, and totals because chemical inventory can involve very small fractional amounts and very large stock quantities. PostgreSQL `NUMERIC` avoids floating-point storage errors and gives 18 digits before the decimal plus 12 digits after it.

## Unit Storage And Conversion Strategy

Products are stored in a base unit according to their dimension:

- Weight: base unit `g`; supported order units `g`, `kg`.
- Volume: base unit `mL`; supported order units `mL`, `L`.
- Count: base unit `unit`; supported order unit `unit`.

Conversion factors:

- `1 kg = 1000 g`
- `1 L = 1000 mL`
- `1 unit = 1 unit`

Inventory is always saved in the product base unit. Prices are always saved as INR per base unit:

- A product priced at `0.42` with base unit `g` means `₹0.42/g`, so `1 kg` costs `1000 * 0.42 = ₹420`.
- A product priced at `0.18` with base unit `mL` means `₹0.18/mL`, so `1 L` costs `1000 * 0.18 = ₹180`.

Conversions are centralized in [lib/units.js](./lib/units.js):

- The seller/buyer UI uses `toBaseQuantity`, `unitToBaseFactor`, and `calculateLineTotal` for live previews before submission.
- `placeOrderAction` in [app/actions.js](./app/actions.js) validates the selected unit, converts the ordered quantity to the base unit, calculates totals, and saves both the original ordered values and converted values.
- Admin order detail pages display ordered quantity, converted base quantity, stored base rate, and line total side by side.

The UI intentionally shows the selected-unit rate and converted base quantity while placing an order so users can verify kg/g and L/mL calculations before submitting.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

3. Add a Neon connection string and a long random `SESSION_SECRET`.

4. Apply the database schema and seed demo data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

## Test Credentials

- Admin: `admin@example.com` / `Admin@12345`
- Seller: `seller@example.com` / `Seller@12345`
- Buyer: `buyer@example.com` / `Buyer@12345`

These users are created by `npm run db:seed`. Change them before using the app with real data.

## How To Use

Seller or buyer flow:

1. Log in as the seller or buyer.
2. Search or filter products on `/dashboard`.
3. Enter a quantity and choose a compatible unit.
4. Review the selected-unit rate, base conversion, line total, and quotation total.
5. Place the quotation and view the order detail page.

Admin flow:

1. Log in as the admin.
2. Use `/admin/products` to create, edit, or deactivate products.
3. Store inventory in the shown base unit and price as INR per base unit.
4. Use `/admin/orders` to inspect incoming quotations and update their status.
5. Open an order to verify ordered units, converted base quantities, and pricing.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel as a Next.js project.
3. Add these environment variables in Vercel:
   - `DATABASE_URL`
   - `SESSION_SECRET`
4. Run the migration and seed scripts against the Neon database from a trusted local machine or CI job:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Deploy or redeploy from the Vercel dashboard.

I cannot safely provide a live Vercel URL without access to your GitHub, Neon, and Vercel accounts or deployment tokens. The app is structured for Vercel deployment once those project secrets are configured.
