# Supabase Setup Guide for Nissi Kreations

Follow these steps to enable permanent Cloud Persistence for your Nissi Kreations billing and management software across all devices and browsers.

---

## 1. Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account or sign in.
2. Click **New Project**.
3. Set your project name (e.g. `nissi-kreations`), choose a secure database password, and select your nearest cloud region (e.g., `Mumbai / India (ap-south-1)`).
4. Wait 1-2 minutes for the database to provision.

---

## 2. Run the Database SQL Schema

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Paste the following SQL script and click **Run**:

```sql
-- 1. Settings Table
CREATE TABLE IF NOT EXISTS nissi_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS nissi_customers (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS nissi_quotations (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS nissi_invoices (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS nissi_orders (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS nissi_payments (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS nissi_expenses (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Products Catalog Table
CREATE TABLE IF NOT EXISTS nissi_products (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE nissi_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nissi_products ENABLE ROW LEVEL SECURITY;

-- Allow access policies
DROP POLICY IF EXISTS "Public access on nissi_settings" ON nissi_settings;
CREATE POLICY "Public access on nissi_settings" ON nissi_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_customers" ON nissi_customers;
CREATE POLICY "Public access on nissi_customers" ON nissi_customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_quotations" ON nissi_quotations;
CREATE POLICY "Public access on nissi_quotations" ON nissi_quotations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_invoices" ON nissi_invoices;
CREATE POLICY "Public access on nissi_invoices" ON nissi_invoices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_orders" ON nissi_orders;
CREATE POLICY "Public access on nissi_orders" ON nissi_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_payments" ON nissi_payments;
CREATE POLICY "Public access on nissi_payments" ON nissi_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_expenses" ON nissi_expenses;
CREATE POLICY "Public access on nissi_expenses" ON nissi_expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on nissi_products" ON nissi_products;
CREATE POLICY "Public access on nissi_products" ON nissi_products FOR ALL USING (true) WITH CHECK (true);
```

---

## 3. Set Up Local Environment Variables (`.env.local`)

1. In the root of your project folder, create a file named `.env.local`:
```bash
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-or-anon-key"
```

2. Retrieve these values from your Supabase Dashboard:
   - Go to **Project Settings** → **API**.
   - Copy **Project URL** and paste as `VITE_SUPABASE_URL`.
   - Copy **anon / public key** and paste as `VITE_SUPABASE_PUBLISHABLE_KEY`.

3. Restart your development server:
```bash
npm run dev
```

---

## 4. For Deployed Sites (e.g., Vercel / Netlify / Cloud Run)

Add the two environment variables in your hosting provider's project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Then trigger a redeployment.

---

## Result

- Every quotation, invoice, customer, order, payment, and expense is immediately synced to the cloud.
- Fast offline local cache remains active so the UI opens instantly.
- Access your data seamlessly across multiple laptops, tablets, or phones.
