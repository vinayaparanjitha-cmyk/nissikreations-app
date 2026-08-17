import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BusinessSettings,
  Customer,
  Expense,
  Invoice,
  Order,
  Payment,
  ProductService,
  Quotation,
} from '../types';

// Read Vite environment variables safely (supporting both VITE_SUPABASE_PUBLISHABLE_KEY and VITE_SUPABASE_ANON_KEY)
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const SUPABASE_URL = (metaEnv.VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('YOUR_SUPABASE')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// Table name constants
export const TABLES = {
  SETTINGS: 'nissi_settings',
  CUSTOMERS: 'nissi_customers',
  QUOTATIONS: 'nissi_quotations',
  INVOICES: 'nissi_invoices',
  ORDERS: 'nissi_orders',
  PAYMENTS: 'nissi_payments',
  EXPENSES: 'nissi_expenses',
  PRODUCTS: 'nissi_products',
};

// Database operations helper
export const SupabaseDB = {
  // Settings
  async fetchSettings(): Promise<BusinessSettings | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.SETTINGS)
        .select('data')
        .eq('id', 'default_settings')
        .maybeSingle();

      if (error) {
        console.warn('Supabase fetchSettings error:', error.message);
        return null;
      }
      return data?.data || null;
    } catch (e) {
      console.warn('Supabase fetchSettings exception:', e);
      return null;
    }
  },

  async saveSettings(settings: BusinessSettings): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.SETTINGS).upsert({
        id: 'default_settings',
        data: settings,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase saveSettings exception:', e);
    }
  },

  // Generic List Fetchers
  async fetchCustomers(): Promise<Customer[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.CUSTOMERS)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchCustomers error:', e);
      return null;
    }
  },

  async saveCustomers(customers: Customer[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = customers.map((c) => ({
        id: c.id,
        data: c,
        created_at: c.createdAt || new Date().toISOString(),
        updated_at: c.updatedAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.CUSTOMERS).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveCustomers error:', e);
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.CUSTOMERS).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteCustomer error:', e);
    }
  },

  // Quotations
  async fetchQuotations(): Promise<Quotation[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.QUOTATIONS)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchQuotations error:', e);
      return null;
    }
  },

  async saveQuotations(quotations: Quotation[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = quotations.map((q) => ({
        id: q.id,
        data: q,
        created_at: q.createdAt || new Date().toISOString(),
        updated_at: q.updatedAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.QUOTATIONS).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveQuotations error:', e);
    }
  },

  async deleteQuotation(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.QUOTATIONS).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteQuotation error:', e);
    }
  },

  // Invoices
  async fetchInvoices(): Promise<Invoice[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.INVOICES)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchInvoices error:', e);
      return null;
    }
  },

  async saveInvoices(invoices: Invoice[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = invoices.map((inv) => ({
        id: inv.id,
        data: inv,
        created_at: inv.createdAt || new Date().toISOString(),
        updated_at: inv.updatedAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.INVOICES).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveInvoices error:', e);
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.INVOICES).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteInvoice error:', e);
    }
  },

  // Orders
  async fetchOrders(): Promise<Order[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.ORDERS)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchOrders error:', e);
      return null;
    }
  },

  async saveOrders(orders: Order[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = orders.map((ord) => ({
        id: ord.id,
        data: ord,
        created_at: ord.createdAt || new Date().toISOString(),
        updated_at: ord.updatedAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.ORDERS).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveOrders error:', e);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.ORDERS).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteOrder error:', e);
    }
  },

  // Payments
  async fetchPayments(): Promise<Payment[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.PAYMENTS)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchPayments error:', e);
      return null;
    }
  },

  async savePayments(payments: Payment[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = payments.map((p) => ({
        id: p.id,
        data: p,
        created_at: p.createdAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.PAYMENTS).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase savePayments error:', e);
    }
  },

  async deletePayment(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.PAYMENTS).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deletePayment error:', e);
    }
  },

  // Expenses
  async fetchExpenses(): Promise<Expense[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.EXPENSES)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchExpenses error:', e);
      return null;
    }
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = expenses.map((exp) => ({
        id: exp.id,
        data: exp,
        created_at: exp.createdAt || new Date().toISOString(),
      }));
      if (rows.length > 0) {
        await client.from(TABLES.EXPENSES).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveExpenses error:', e);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.EXPENSES).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteExpense error:', e);
    }
  },

  // Products
  async fetchProducts(): Promise<ProductService[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from(TABLES.PRODUCTS)
        .select('data');
      if (error) throw error;
      return data ? data.map((row: any) => row.data) : [];
    } catch (e) {
      console.warn('Supabase fetchProducts error:', e);
      return null;
    }
  },

  async saveProducts(products: ProductService[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const rows = products.map((p) => ({
        id: p.id,
        data: p,
      }));
      if (rows.length > 0) {
        await client.from(TABLES.PRODUCTS).upsert(rows);
      }
    } catch (e) {
      console.warn('Supabase saveProducts error:', e);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      await client.from(TABLES.PRODUCTS).delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteProduct error:', e);
    }
  },

  // Bulk Initial Sync (push all local data to Supabase if newly configured)
  async syncAllToCloud(payload: {
    settings: BusinessSettings;
    customers: Customer[];
    quotations: Quotation[];
    invoices: Invoice[];
    orders: Order[];
    payments: Payment[];
    expenses: Expense[];
    products: ProductService[];
  }): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await this.saveSettings(payload.settings);
      await this.saveCustomers(payload.customers);
      await this.saveQuotations(payload.quotations);
      await this.saveInvoices(payload.invoices);
      await this.saveOrders(payload.orders);
      await this.savePayments(payload.payments);
      await this.saveExpenses(payload.expenses);
      await this.saveProducts(payload.products);
      return true;
    } catch (e) {
      console.error('Supabase bulk sync failed:', e);
      return false;
    }
  },
};

// SQL Schema for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `
-- =========================================================
-- NISSI KREATIONS POSTGRESQL SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor to set up cloud persistence
-- =========================================================

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

-- Allow public anonymous access (safe for applet / single business frontend access)
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
`;
