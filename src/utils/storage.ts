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
} from './initialData';

const STORAGE_KEYS = {
  SETTINGS: 'nissi_settings_v1',
  CUSTOMERS: 'nissi_customers_v1',
  QUOTATIONS: 'nissi_quotations_v1',
  INVOICES: 'nissi_invoices_v1',
  ORDERS: 'nissi_orders_v1',
  PAYMENTS: 'nissi_payments_v1',
  EXPENSES: 'nissi_expenses_v1',
  PRODUCTS: 'nissi_products_v1',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  getSettings(): BusinessSettings {
    const stored = getItem<BusinessSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...stored };
  },

  saveSettings(settings: BusinessSettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getCustomers(): Customer[] {
    const stored = getItem<Customer[] | null>(STORAGE_KEYS.CUSTOMERS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return stored;
  },

  saveCustomers(customers: Customer[]): void {
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getQuotations(): Quotation[] {
    const stored = getItem<Quotation[] | null>(STORAGE_KEYS.QUOTATIONS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
      return INITIAL_QUOTATIONS;
    }
    return stored;
  },

  saveQuotations(quotations: Quotation[]): void {
    setItem(STORAGE_KEYS.QUOTATIONS, quotations);
  },

  getInvoices(): Invoice[] {
    const stored = getItem<Invoice[] | null>(STORAGE_KEYS.INVOICES, null);
    if (!stored) {
      setItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
      return INITIAL_INVOICES;
    }
    return stored;
  },

  saveInvoices(invoices: Invoice[]): void {
    setItem(STORAGE_KEYS.INVOICES, invoices);
  },

  getOrders(): Order[] {
    const stored = getItem<Order[] | null>(STORAGE_KEYS.ORDERS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    return stored;
  },

  saveOrders(orders: Order[]): void {
    setItem(STORAGE_KEYS.ORDERS, orders);
  },

  getPayments(): Payment[] {
    const stored = getItem<Payment[] | null>(STORAGE_KEYS.PAYMENTS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      return INITIAL_PAYMENTS;
    }
    return stored;
  },

  savePayments(payments: Payment[]): void {
    setItem(STORAGE_KEYS.PAYMENTS, payments);
  },

  getExpenses(): Expense[] {
    const stored = getItem<Expense[] | null>(STORAGE_KEYS.EXPENSES, null);
    if (!stored) {
      setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    return stored;
  },

  saveExpenses(expenses: Expense[]): void {
    setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  getProducts(): ProductService[] {
    const stored = getItem<ProductService[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (!stored) {
      setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return stored;
  },

  saveProducts(products: ProductService[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  getNextNumber(prefix: string, list: Array<{ [key: string]: any }>, fieldName: string): string {
    const numbers = list
      .map((item) => {
        const val = item[fieldName] as string;
        if (!val) return 0;
        const match = val.replace(prefix, '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const highest = numbers.length > 0 ? Math.max(...numbers) : 0;
    const next = highest + 1;
    return `${prefix}${String(next).padStart(4, '0')}`;
  },

  exportAllData(): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      business: 'NISSI KREATIONS',
      settings: this.getSettings(),
      customers: this.getCustomers(),
      quotations: this.getQuotations(),
      invoices: this.getInvoices(),
      orders: this.getOrders(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
      products: this.getProducts(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.customers) setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.quotations) setItem(STORAGE_KEYS.QUOTATIONS, data.quotations);
      if (data.invoices) setItem(STORAGE_KEYS.INVOICES, data.invoices);
      if (data.orders) setItem(STORAGE_KEYS.ORDERS, data.orders);
      if (data.payments) setItem(STORAGE_KEYS.PAYMENTS, data.payments);
      if (data.expenses) setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.products) setItem(STORAGE_KEYS.PRODUCTS, data.products);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  resetToDefault(): void {
    setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setItem(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    setItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  clearAll(): void {
    this.resetToDefault();
  },
};
