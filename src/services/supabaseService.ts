import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
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
import {
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_SETTINGS,
} from '../utils/initialData';

// Data Mappers: Model <-> DB Record

export function mapSettingsFromDb(row: any): BusinessSettings {
  return {
    businessName: row.business_name || INITIAL_SETTINGS.businessName,
    tagline: row.tagline || INITIAL_SETTINGS.tagline,
    logoUrl: row.logo_url || INITIAL_SETTINGS.logoUrl,
    phone: row.phone || INITIAL_SETTINGS.phone,
    alternatePhone: row.alternate_phone || INITIAL_SETTINGS.alternatePhone,
    email: row.email || INITIAL_SETTINGS.email,
    website: row.website || INITIAL_SETTINGS.website,
    addressLine1: row.address_line1 || INITIAL_SETTINGS.addressLine1,
    addressLine2: row.address_line2 || INITIAL_SETTINGS.addressLine2,
    city: row.city || INITIAL_SETTINGS.city,
    state: row.state || INITIAL_SETTINGS.state,
    pincode: row.pincode || INITIAL_SETTINGS.pincode,
    gstNumber: row.gst_number || INITIAL_SETTINGS.gstNumber,
    panNumber: row.pan_number || INITIAL_SETTINGS.panNumber,
    upiId: row.upi_id || INITIAL_SETTINGS.upiId,
    upiQrCodeUrl: row.upi_qr_code_url || INITIAL_SETTINGS.upiQrCodeUrl,
    bankName: row.bank_name || INITIAL_SETTINGS.bankName,
    bankAccountName: row.bank_account_name || INITIAL_SETTINGS.bankAccountName,
    accountNumber: row.account_number || INITIAL_SETTINGS.accountNumber,
    ifscCode: row.ifsc_code || INITIAL_SETTINGS.ifscCode,
    branchName: row.branch_name || INITIAL_SETTINGS.branchName,
    invoicePrefix: row.invoice_prefix || INITIAL_SETTINGS.invoicePrefix,
    quotationPrefix: row.quotation_prefix || INITIAL_SETTINGS.quotationPrefix,
    receiptPrefix: row.receipt_prefix || INITIAL_SETTINGS.receiptPrefix,
    orderPrefix: row.order_prefix || INITIAL_SETTINGS.orderPrefix,
    currencySymbol: row.currency_symbol || INITIAL_SETTINGS.currencySymbol,
    defaultGstRate: Number(row.default_gst_rate) || INITIAL_SETTINGS.defaultGstRate,
    defaultTerms: row.default_terms || INITIAL_SETTINGS.defaultTerms,
    customExpenseCategories: Array.isArray(row.custom_expense_categories)
      ? row.custom_expense_categories
      : INITIAL_SETTINGS.customExpenseCategories,
  };
}

export function mapSettingsToDb(settings: BusinessSettings) {
  return {
    id: 'default',
    business_name: settings.businessName,
    tagline: settings.tagline,
    logo_url: settings.logoUrl,
    phone: settings.phone,
    alternate_phone: settings.alternatePhone || '',
    email: settings.email,
    website: settings.website,
    address_line1: settings.addressLine1,
    address_line2: settings.addressLine2 || '',
    city: settings.city,
    state: settings.state,
    pincode: settings.pincode,
    gst_number: settings.gstNumber,
    pan_number: settings.panNumber || '',
    upi_id: settings.upiId,
    upi_qr_code_url: settings.upiQrCodeUrl,
    bank_name: settings.bankName,
    bank_account_name: settings.bankAccountName,
    account_number: settings.accountNumber,
    ifsc_code: settings.ifscCode,
    branch_name: settings.branchName,
    invoice_prefix: settings.invoicePrefix,
    quotation_prefix: settings.quotationPrefix,
    receipt_prefix: settings.receiptPrefix,
    order_prefix: settings.orderPrefix,
    currency_symbol: settings.currencySymbol,
    default_gst_rate: settings.defaultGstRate,
    default_terms: settings.defaultTerms,
    custom_expense_categories: settings.customExpenseCategories,
    updated_at: new Date().toISOString(),
  };
}

export function mapCustomerFromDb(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    companyName: row.company_name || undefined,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    gstNumber: row.gst_number || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapCustomerToDb(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    company_name: c.companyName || '',
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    gst_number: c.gstNumber || '',
    notes: c.notes || '',
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString(),
  };
}

export function mapQuotationFromDb(row: any): Quotation {
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    date: row.date,
    validUntil: row.valid_until || '',
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    customerEmail: row.customer_email || '',
    customerAddress: row.customer_address || '',
    customerGstNumber: row.customer_gst_number || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    discountTotal: Number(row.discount_total) || 0,
    taxTotal: Number(row.tax_total) || 0,
    grandTotal: Number(row.grand_total) || 0,
    status: row.status || 'Draft',
    notes: row.notes || undefined,
    termsAndConditions: row.terms_and_conditions || undefined,
    convertedInvoiceId: row.converted_invoice_id || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapQuotationToDb(q: Quotation) {
  return {
    id: q.id,
    quotation_number: q.quotationNumber,
    date: q.date,
    valid_until: q.validUntil || '',
    customer_id: q.customerId,
    customer_name: q.customerName,
    customer_phone: q.customerPhone || '',
    customer_email: q.customerEmail || '',
    customer_address: q.customerAddress || '',
    customer_gst_number: q.customerGstNumber || '',
    items: q.items || [],
    subtotal: q.subtotal,
    discount_total: q.discountTotal,
    tax_total: q.taxTotal,
    grand_total: q.grandTotal,
    status: q.status,
    notes: q.notes || '',
    terms_and_conditions: q.termsAndConditions || '',
    converted_invoice_id: q.convertedInvoiceId || null,
    created_at: q.createdAt || new Date().toISOString(),
    updated_at: q.updatedAt || new Date().toISOString(),
  };
}

export function mapInvoiceFromDb(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    quotationId: row.quotation_id || undefined,
    quotationNumber: row.quotation_number || undefined,
    orderId: row.order_id || undefined,
    orderNumber: row.order_number || undefined,
    date: row.date,
    dueDate: row.due_date || '',
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    customerEmail: row.customer_email || '',
    customerAddress: row.customer_address || '',
    customerGstNumber: row.customer_gst_number || undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    discountTotal: Number(row.discount_total) || 0,
    taxTotal: Number(row.tax_total) || 0,
    grandTotal: Number(row.grand_total) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    balanceDue: Number(row.balance_due) || 0,
    status: row.status || 'Unpaid',
    notes: row.notes || undefined,
    termsAndConditions: row.terms_and_conditions || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapInvoiceToDb(inv: Invoice) {
  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber,
    quotation_id: inv.quotationId || null,
    quotation_number: inv.quotationNumber || '',
    order_id: inv.orderId || null,
    order_number: inv.orderNumber || '',
    date: inv.date,
    due_date: inv.dueDate || '',
    customer_id: inv.customerId,
    customer_name: inv.customerName,
    customer_phone: inv.customerPhone || '',
    customer_email: inv.customerEmail || '',
    customer_address: inv.customerAddress || '',
    customer_gst_number: inv.customerGstNumber || '',
    items: inv.items || [],
    subtotal: inv.subtotal,
    discount_total: inv.discountTotal,
    tax_total: inv.taxTotal,
    grand_total: inv.grandTotal,
    amount_paid: inv.amountPaid,
    balance_due: inv.balanceDue,
    status: inv.status,
    notes: inv.notes || '',
    terms_and_conditions: inv.termsAndConditions || '',
    created_at: inv.createdAt || new Date().toISOString(),
    updated_at: inv.updatedAt || new Date().toISOString(),
  };
}

export function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    customerPhone: row.customer_phone || '',
    orderDate: row.order_date,
    deliveryDate: row.delivery_date || '',
    description: row.description || '',
    dimensions: row.dimensions || undefined,
    quantity: Number(row.quantity) || 1,
    amount: Number(row.amount) || 0,
    advancePaid: Number(row.advance_paid) || 0,
    balance: Number(row.balance) || 0,
    status: row.status || 'New',
    notes: row.notes || undefined,
    quotationId: row.quotation_id || undefined,
    invoiceId: row.invoice_id || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export function mapOrderToDb(ord: Order) {
  return {
    id: ord.id,
    order_number: ord.orderNumber,
    customer_id: ord.customerId,
    customer_name: ord.customerName,
    customer_phone: ord.customerPhone || '',
    order_date: ord.orderDate,
    delivery_date: ord.deliveryDate || '',
    description: ord.description,
    dimensions: ord.dimensions || '',
    quantity: ord.quantity,
    amount: ord.amount,
    advance_paid: ord.advancePaid,
    balance: ord.balance,
    status: ord.status,
    notes: ord.notes || '',
    quotation_id: ord.quotationId || null,
    invoice_id: ord.invoiceId || null,
    created_at: ord.createdAt || new Date().toISOString(),
    updated_at: ord.updatedAt || new Date().toISOString(),
  };
}

export function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    paymentNumber: row.payment_number,
    date: row.date,
    customerId: row.customer_id || '',
    customerName: row.customer_name || '',
    invoiceId: row.invoice_id || '',
    invoiceNumber: row.invoice_number || '',
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method || 'Cash',
    referenceNumber: row.reference_number || undefined,
    notes: row.notes || undefined,
    remainingBalanceAfter: Number(row.remaining_balance_after) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapPaymentToDb(p: Payment) {
  return {
    id: p.id,
    payment_number: p.paymentNumber,
    date: p.date,
    customer_id: p.customerId,
    customer_name: p.customerName,
    invoice_id: p.invoiceId,
    invoice_number: p.invoiceNumber,
    amount: p.amount,
    payment_method: p.paymentMethod,
    reference_number: p.referenceNumber || '',
    notes: p.notes || '',
    remaining_balance_after: p.remainingBalanceAfter,
    created_at: p.createdAt || new Date().toISOString(),
  };
}

export function mapExpenseFromDb(row: any): Expense {
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    description: row.description || '',
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method || 'Cash',
    referenceNumber: row.reference_number || undefined,
    vendorName: row.vendor_name || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapExpenseToDb(e: Expense) {
  return {
    id: e.id,
    date: e.date,
    category: e.category,
    description: e.description,
    amount: e.amount,
    payment_method: e.paymentMethod,
    reference_number: e.referenceNumber || '',
    vendor_name: e.vendorName || '',
    notes: e.notes || '',
    created_at: e.createdAt || new Date().toISOString(),
  };
}

export function mapProductFromDb(row: any): ProductService {
  return {
    id: row.id,
    name: row.name,
    category: row.category || undefined,
    description: row.description || '',
    unit: row.unit || 'sq.ft',
    defaultRate: Number(row.default_rate) || 0,
    defaultTaxPercent: Number(row.default_tax_percent) || 18,
    isActive: row.is_active ?? true,
  };
}

export function mapProductToDb(p: ProductService) {
  return {
    id: p.id,
    name: p.name,
    category: p.category || '',
    description: p.description || '',
    unit: p.unit || 'sq.ft',
    default_rate: p.defaultRate,
    default_tax_percent: p.defaultTaxPercent,
    is_active: p.isActive,
    updated_at: new Date().toISOString(),
  };
}

// Supabase Database Service API
export const SupabaseService = {
  // Test connection
  async testConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        ok: false,
        message: 'Supabase is not configured. Please set URL and Anon Key in Settings or environment variables.',
      };
    }

    try {
      // Test querying business_settings table
      const { data, error } = await client
        .from('business_settings')
        .select('id, business_name')
        .limit(1);

      if (error) {
        return {
          ok: false,
          message: `Database error: ${error.message}. Make sure you have run the SQL setup script in Supabase!`,
          details: error,
        };
      }

      return {
        ok: true,
        message: 'Successfully connected to Supabase PostgreSQL database!',
        details: data,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: `Connection failed: ${err.message || 'Unknown network error'}`,
        details: err,
      };
    }
  },

  // Fetch all business records from Supabase
  async fetchAllData(): Promise<{
    settings?: BusinessSettings;
    customers: Customer[];
    quotations: Quotation[];
    invoices: Invoice[];
    orders: Order[];
    payments: Payment[];
    expenses: Expense[];
    products: ProductService[];
  } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const [
        settingsRes,
        customersRes,
        quotationsRes,
        invoicesRes,
        ordersRes,
        paymentsRes,
        expensesRes,
        productsRes,
      ] = await Promise.all([
        client.from('business_settings').select('*').limit(1),
        client.from('customers').select('*').order('created_at', { ascending: false }),
        client.from('quotations').select('*').order('created_at', { ascending: false }),
        client.from('invoices').select('*').order('created_at', { ascending: false }),
        client.from('orders').select('*').order('created_at', { ascending: false }),
        client.from('payments').select('*').order('created_at', { ascending: false }),
        client.from('expenses').select('*').order('created_at', { ascending: false }),
        client.from('products').select('*').order('name', { ascending: true }),
      ]);

      if (
        customersRes.error &&
        customersRes.error.code === '42P01' // relation does not exist
      ) {
        console.warn('Supabase tables do not exist yet. Please run SQL setup script.');
        return null;
      }

      const settings =
        settingsRes.data && settingsRes.data.length > 0
          ? mapSettingsFromDb(settingsRes.data[0])
          : undefined;

      const customers = (customersRes.data || []).map(mapCustomerFromDb);
      const quotations = (quotationsRes.data || []).map(mapQuotationFromDb);
      const invoices = (invoicesRes.data || []).map(mapInvoiceFromDb);
      const orders = (ordersRes.data || []).map(mapOrderFromDb);
      const payments = (paymentsRes.data || []).map(mapPaymentFromDb);
      const expenses = (expensesRes.data || []).map(mapExpenseFromDb);
      const products = (productsRes.data || []).map(mapProductFromDb);

      return {
        settings,
        customers,
        quotations,
        invoices,
        orders,
        payments,
        expenses,
        products,
      };
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
      return null;
    }
  },

  // Seed / Initialize Supabase with Initial Data if empty
  async seedIfEmpty(currentData?: {
    settings?: BusinessSettings;
    customers?: Customer[];
    quotations?: Quotation[];
    invoices?: Invoice[];
    orders?: Order[];
    payments?: Payment[];
    expenses?: Expense[];
    products?: ProductService[];
  }): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      // Check if customers table is empty
      const { count, error } = await client
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.warn('Could not check table count:', error.message);
        return false;
      }

      if (count && count > 0) {
        // Already populated
        return true;
      }

      console.log('Seeding initial data into Supabase PostgreSQL...');

      const s = currentData?.settings || INITIAL_SETTINGS;
      const cList = currentData?.customers || INITIAL_CUSTOMERS;
      const qList = currentData?.quotations || INITIAL_QUOTATIONS;
      const iList = currentData?.invoices || INITIAL_INVOICES;
      const oList = currentData?.orders || INITIAL_ORDERS;
      const pList = currentData?.payments || INITIAL_PAYMENTS;
      const eList = currentData?.expenses || INITIAL_EXPENSES;
      const prList = currentData?.products || INITIAL_PRODUCTS;

      await client.from('business_settings').upsert([mapSettingsToDb(s)]);
      if (cList.length > 0) await client.from('customers').upsert(cList.map(mapCustomerToDb));
      if (qList.length > 0) await client.from('quotations').upsert(qList.map(mapQuotationToDb));
      if (iList.length > 0) await client.from('invoices').upsert(iList.map(mapInvoiceToDb));
      if (oList.length > 0) await client.from('orders').upsert(oList.map(mapOrderToDb));
      if (pList.length > 0) await client.from('payments').upsert(pList.map(mapPaymentToDb));
      if (eList.length > 0) await client.from('expenses').upsert(eList.map(mapExpenseToDb));
      if (prList.length > 0) await client.from('products').upsert(prList.map(mapProductToDb));

      console.log('Successfully seeded initial business data into Supabase!');
      return true;
    } catch (err) {
      console.error('Failed to seed Supabase database:', err);
      return false;
    }
  },

  // Sync entire dataset to Supabase
  async syncAllToSupabase(data: {
    settings: BusinessSettings;
    customers: Customer[];
    quotations: Quotation[];
    invoices: Invoice[];
    orders: Order[];
    payments: Payment[];
    expenses: Expense[];
    products: ProductService[];
  }): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured' };
    }

    try {
      await client.from('business_settings').upsert([mapSettingsToDb(data.settings)]);

      if (data.customers.length > 0) {
        const { error } = await client.from('customers').upsert(data.customers.map(mapCustomerToDb));
        if (error) throw error;
      }

      if (data.quotations.length > 0) {
        const { error } = await client.from('quotations').upsert(data.quotations.map(mapQuotationToDb));
        if (error) throw error;
      }

      if (data.invoices.length > 0) {
        const { error } = await client.from('invoices').upsert(data.invoices.map(mapInvoiceToDb));
        if (error) throw error;
      }

      if (data.orders.length > 0) {
        const { error } = await client.from('orders').upsert(data.orders.map(mapOrderToDb));
        if (error) throw error;
      }

      if (data.payments.length > 0) {
        const { error } = await client.from('payments').upsert(data.payments.map(mapPaymentToDb));
        if (error) throw error;
      }

      if (data.expenses.length > 0) {
        const { error } = await client.from('expenses').upsert(data.expenses.map(mapExpenseToDb));
        if (error) throw error;
      }

      if (data.products.length > 0) {
        const { error } = await client.from('products').upsert(data.products.map(mapProductToDb));
        if (error) throw error;
      }

      return {
        success: true,
        message: 'All records have been synchronized and persisted to Supabase database!',
      };
    } catch (e: any) {
      console.error('Sync all error:', e);
      return {
        success: false,
        message: `Sync failed: ${e.message || 'Check your database schema and policies.'}`,
      };
    }
  },

  // Settings
  async saveSettings(settings: BusinessSettings): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const { error } = await client.from('business_settings').upsert([mapSettingsToDb(settings)]);
      if (error) console.error('Error saving settings to Supabase:', error.message);
    } catch (e) {
      console.error('Error in saveSettings:', e);
    }
  },

  // Customers
  async upsertCustomer(customer: Customer): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('customers').upsert([mapCustomerToDb(customer)]);
      if (error) {
        console.error('Supabase customer upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertCustomer:', e);
      return false;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('customers').delete().eq('id', id);
      if (error) {
        console.error('Supabase customer delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteCustomer:', e);
      return false;
    }
  },

  // Quotations
  async upsertQuotation(quotation: Quotation): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('quotations').upsert([mapQuotationToDb(quotation)]);
      if (error) {
        console.error('Supabase quotation upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertQuotation:', e);
      return false;
    }
  },

  async deleteQuotation(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('quotations').delete().eq('id', id);
      if (error) {
        console.error('Supabase quotation delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteQuotation:', e);
      return false;
    }
  },

  // Invoices
  async upsertInvoice(invoice: Invoice): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('invoices').upsert([mapInvoiceToDb(invoice)]);
      if (error) {
        console.error('Supabase invoice upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertInvoice:', e);
      return false;
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('invoices').delete().eq('id', id);
      if (error) {
        console.error('Supabase invoice delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteInvoice:', e);
      return false;
    }
  },

  // Orders
  async upsertOrder(order: Order): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('orders').upsert([mapOrderToDb(order)]);
      if (error) {
        console.error('Supabase order upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertOrder:', e);
      return false;
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('orders').delete().eq('id', id);
      if (error) {
        console.error('Supabase order delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteOrder:', e);
      return false;
    }
  },

  // Payments
  async upsertPayment(payment: Payment): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('payments').upsert([mapPaymentToDb(payment)]);
      if (error) {
        console.error('Supabase payment upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertPayment:', e);
      return false;
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('payments').delete().eq('id', id);
      if (error) {
        console.error('Supabase payment delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deletePayment:', e);
      return false;
    }
  },

  // Expenses
  async upsertExpense(expense: Expense): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('expenses').upsert([mapExpenseToDb(expense)]);
      if (error) {
        console.error('Supabase expense upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertExpense:', e);
      return false;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('expenses').delete().eq('id', id);
      if (error) {
        console.error('Supabase expense delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteExpense:', e);
      return false;
    }
  },

  // Products
  async upsertProduct(product: ProductService): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('products').upsert([mapProductToDb(product)]);
      if (error) {
        console.error('Supabase product upsert error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertProduct:', e);
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) {
        console.error('Supabase product delete error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in deleteProduct:', e);
      return false;
    }
  },
};
