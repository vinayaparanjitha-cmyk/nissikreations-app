import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_CONFIG_KEY = 'nissi_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch (e) {
    console.error('Error reading Supabase configuration:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    if (!config.url || !config.anonKey) {
      localStorage.removeItem(STORAGE_CONFIG_KEY);
    } else {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    }
    // Reset cached client
    cachedClient = null;
  } catch (e) {
    console.error('Error saving Supabase configuration:', e);
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getStoredSupabaseConfig();
  return Boolean(
    config.url &&
    config.anonKey &&
    config.url.startsWith('http') &&
    config.url !== 'https://your-project.supabase.co' &&
    config.anonKey !== 'your-supabase-anon-key'
  );
}

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith('http')) {
    return null;
  }

  const key = `${config.url}:::${config.anonKey}`;
  if (cachedClient && currentConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentConfigKey = key;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- NISSI KREATIONS - POSTGRESQL SCHEMA FOR SUPABASE
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==========================================================

-- 1. Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT NOT NULL DEFAULT 'Nissi Kreations',
  tagline TEXT DEFAULT 'Flex, Vinyl, Signboards & Digital Printing',
  logo_url TEXT DEFAULT '',
  phone TEXT DEFAULT '+91 98765 43210',
  alternate_phone TEXT DEFAULT '',
  email TEXT DEFAULT 'contact@nissikreations.com',
  website TEXT DEFAULT 'www.nissikreations.com',
  address_line1 TEXT DEFAULT 'Shop #12, Industrial Main Road',
  address_line2 TEXT DEFAULT 'Near City Circle, Printing Hub',
  city TEXT DEFAULT 'Bengaluru',
  state TEXT DEFAULT 'Karnataka',
  pincode TEXT DEFAULT '560001',
  gst_number TEXT DEFAULT '29ABCDE1234F1Z5',
  pan_number TEXT DEFAULT 'ABCDE1234F',
  upi_id TEXT DEFAULT 'nissikreations@upi',
  upi_qr_code_url TEXT DEFAULT '',
  bank_name TEXT DEFAULT 'State Bank of India',
  bank_account_name TEXT DEFAULT 'NISSI KREATIONS',
  account_number TEXT DEFAULT '38901234567',
  ifsc_code TEXT DEFAULT 'SBIN0001234',
  branch_name TEXT DEFAULT 'Industrial Hub Branch',
  invoice_prefix TEXT DEFAULT 'NK-INV-',
  quotation_prefix TEXT DEFAULT 'NK-QTN-',
  receipt_prefix TEXT DEFAULT 'NK-REC-',
  order_prefix TEXT DEFAULT 'NK-ORD-',
  currency_symbol TEXT DEFAULT '₹',
  default_gst_rate NUMERIC DEFAULT 18,
  default_terms TEXT DEFAULT '1. 50% advance along with confirmed work order.\\n2. Goods once delivered will not be taken back.\\n3. Full payment due on delivery.',
  custom_expense_categories JSONB DEFAULT '["Printing Material","Flex","Vinyl","Ink","Design","Electricity","Rent","Transport","Labour","Maintenance","Other"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  gst_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT UNIQUE NOT NULL,
  date TEXT DEFAULT CURRENT_DATE::text,
  valid_until TEXT DEFAULT '',
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  customer_gst_number TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount_total NUMERIC DEFAULT 0,
  tax_total NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  notes TEXT DEFAULT '',
  terms_and_conditions TEXT DEFAULT '',
  converted_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  quotation_id TEXT,
  quotation_number TEXT,
  order_id TEXT,
  order_number TEXT,
  date TEXT DEFAULT CURRENT_DATE::text,
  due_date TEXT DEFAULT '',
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  customer_email TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  customer_gst_number TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount_total NUMERIC DEFAULT 0,
  tax_total NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Unpaid',
  notes TEXT DEFAULT '',
  terms_and_conditions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  order_date TEXT DEFAULT CURRENT_DATE::text,
  delivery_date TEXT DEFAULT '',
  description TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  quantity NUMERIC DEFAULT 1,
  amount NUMERIC DEFAULT 0,
  advance_paid NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'New',
  notes TEXT DEFAULT '',
  quotation_id TEXT,
  invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_number TEXT UNIQUE NOT NULL,
  date TEXT DEFAULT CURRENT_DATE::text,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  invoice_id TEXT,
  invoice_number TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  reference_number TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  remaining_balance_after NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT DEFAULT CURRENT_DATE::text,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  reference_number TEXT DEFAULT '',
  vendor_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Products & Services Catalog Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  unit TEXT DEFAULT 'sq.ft',
  default_rate NUMERIC DEFAULT 0,
  default_tax_percent NUMERIC DEFAULT 18,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow read and write for all with the Anon / Public key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_settings' AND policyname = 'Public Access for business_settings') THEN
    CREATE POLICY "Public Access for business_settings" ON business_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Public Access for customers') THEN
    CREATE POLICY "Public Access for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotations' AND policyname = 'Public Access for quotations') THEN
    CREATE POLICY "Public Access for quotations" ON quotations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Public Access for invoices') THEN
    CREATE POLICY "Public Access for invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Public Access for orders') THEN
    CREATE POLICY "Public Access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Public Access for payments') THEN
    CREATE POLICY "Public Access for payments" ON payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Public Access for expenses') THEN
    CREATE POLICY "Public Access for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public Access for products') THEN
    CREATE POLICY "Public Access for products" ON products FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE business_settings, customers, quotations, invoices, orders, payments, expenses, products;
`;
