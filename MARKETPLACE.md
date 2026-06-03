# aasamedchem Marketplace System

A three-tier marketplace connecting admins, sellers, and buyers for chemical products quotation and ordering.

## System Roles

### 1. **Admin**
- Approves/rejects seller profiles
- Verifies seller quotes before buyers see them
- Monitors all orders and quotes
- Handles disputes between buyers and sellers
- Manages payments and reconciliation
- Can remove fake sellers or reject fraudulent quotes

### 2. **Seller**
- Creates a profile with company information (requires approval)
- Proposes price quotes to specific buyers
- Includes delivery date and delivery terms
- Quotes automatically expire after specified validity period (default: 7 days)
- Can view all quotes they've sent and their status
- Receives orders when buyers accept their quotes

### 3. **Buyer**
- Views verified quotes from approved sellers
- Can compare multiple seller quotes for same products
- Accepts verified quotes to create orders
- Creates disputes if there are issues with orders
- Makes payments through the system

## Marketplace Flow

### Quote Workflow

```
Seller creates quote with:
├─ Buyer selection
├─ Product list with quantities
├─ Pricing per unit
├─ Delivery date
├─ Delivery terms
└─ Validity (days)

    ↓

Seller submits quote
  Status: pending_verification

    ↓

Admin reviews & verifies quote
  ├─ Approve → Status: verified
  └─ Reject → Status: rejected (with reason)

    ↓ (if verified)

Buyer sees verified quote
  ├─ View quote details
  ├─ Compare with other sellers
  └─ Accept → Creates Order

    ↓

Payment created and tracked
  Status: pending/paid/failed/refunded
```

### Order Creation from Quote

When a buyer **accepts a verified quote**:
1. Order is created with `status = 'accepted'`
2. Order inherits all details from quote (items, prices, total)
3. Payment record created automatically
4. Seller receives notification
5. Admin can monitor fulfillment

### Dispute Resolution

If buyer or seller has issues:
1. Create dispute with title and description
2. Admin reviews dispute details
3. Admin resolves with notes (e.g., refund, replacement, etc.)
4. Dispute status: open → in_progress → resolved

## Database Schema

### Core Tables

```sql
seller_profiles
├─ user_id (FK users)
├─ company_name
├─ business_registration
├─ status (pending/approved/rejected/suspended)
└─ approval_notes

quotes
├─ seller_id (FK users)
├─ buyer_id (FK users)
├─ status (draft/pending_verification/verified/rejected/accepted/expired)
├─ total_inr
├─ delivery_date
├─ delivery_terms
├─ expires_at
├─ verified_by (FK users)
└─ rejection_reason

quote_items
├─ quote_id (FK quotes)
├─ product_id (FK products)
├─ quantity & unit
└─ price_per_unit_inr

disputes
├─ buyer_id (FK users)
├─ seller_id (FK users)
├─ quote_id or order_id
├─ title & description
├─ status (open/in_progress/resolved/closed)
└─ resolution_notes

payments
├─ order_id (FK orders)
├─ buyer_id & seller_id
├─ amount_inr
├─ status (pending/paid/failed/refunded)
└─ payment_reference
```

## Navigation Routes

### Seller Routes
- `/seller/quotes` - View all quotes sent
- `/seller/create-quote` - Create new quote
- `/seller/quotes/[id]` - View quote details

### Buyer Routes
- `/buyer/quotes` - View all available quotes
- `/buyer/quotes/[id]` - View quote details & accept

### Admin Routes
- `/admin/sellers` - Manage seller approvals
- `/admin/quotes` - Verify quotes before buyers see
- `/admin/orders` - Monitor order fulfillment
- `/admin/disputes` - Resolve buyer-seller disputes
- `/admin/payments` - Track payment status

## Key Features

✅ **Seller Verification** - Admin approval before sellers can create quotes
✅ **Quote Verification** - Admin approves quotes before buyers see them
✅ **Price Transparency** - Buyers see seller pricing, delivery terms, dates
✅ **Fraud Prevention** - Admin can reject fake sellers and fraudulent quotes
✅ **Automatic Expiry** - Quotes expire automatically if not accepted
✅ **Payment Tracking** - Full payment lifecycle management
✅ **Dispute Handling** - Admin mediates buyer-seller disputes
✅ **Order Tracking** - All orders linked to original quotes

## Server Actions

### Seller Actions
- `createSellerProfileAction` - Register as seller
- `createQuoteAction` - Create new quote
- `submitQuoteAction` - Submit quote for verification

### Admin Actions
- `approveSellerAction` - Approve seller profile
- `rejectSellerAction` - Reject seller with reason
- `verifyQuoteAction` - Verify quote for buyers
- `rejectQuoteAction` - Reject quote with reason
- `resolveDisputeAction` - Resolve dispute
- `markPaymentAction` - Mark payment as received

### Buyer Actions
- `acceptQuoteAction` - Accept quote & create order

## Running the System

1. **Apply Database Migrations**
   ```bash
   psql -d your_db < db/marketplace-migrations.sql
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access By Role**
   - Admin: `/admin`
   - Seller: `/seller/quotes`
   - Buyer: `/buyer/quotes`

## Demo Users

After seeding, use these accounts:
- **Admin**: admin@example.com / Admin@12345
- **Seller**: seller@example.com / Seller@12345
- **Buyer**: buyer@example.com / Buyer@12345

## Security Notes

- Sellers must be approved before creating quotes
- Quotes must be verified by admin before buyers see them
- All user actions are role-restricted
- Sensitive fields (payment references, etc.) are encrypted
- All modifications logged with admin references
