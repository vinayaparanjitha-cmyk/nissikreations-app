export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted to Invoice';

export type InvoiceStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';

export type OrderStatus = 'New' | 'Confirmed' | 'Designing' | 'Printing' | 'Ready' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'QR Payment' | 'Cheque' | 'Other';

export interface DocumentItem {
  id: string;
  description: string;
  width?: number;
  height?: number;
  quantity: number;
  unit: string; // 'sq.ft', 'sq.inch', 'pcs', 'sets', 'meter', 'rolls', 'hours'
  rate: number;
  discount: number; // percentage or fixed amount
  taxPercent: number; // 0, 5, 12, 18, 28
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. NK-QTN-0001
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerGstNumber?: string;
  items: DocumentItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  termsAndConditions?: string;
  convertedInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. NK-INV-0001
  quotationId?: string;
  quotationNumber?: string;
  orderId?: string;
  orderNumber?: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerGstNumber?: string;
  items: DocumentItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. NK-ORD-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  deliveryDate: string;
  description: string;
  dimensions?: string; // e.g. 10x4 ft
  quantity: number;
  amount: number;
  advancePaid: number;
  balance: number;
  status: OrderStatus;
  notes?: string;
  quotationId?: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. NK-REC-0001
  date: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  remainingBalanceAfter: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  vendorName?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductService {
  id: string;
  name: string;
  category?: string;
  description: string;
  unit: string;
  defaultRate: number;
  defaultTaxPercent: number;
  isActive: boolean;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  logoUrl: string; // Data URL or URL
  phone: string;
  alternatePhone?: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber?: string;
  upiId: string;
  upiQrCodeUrl: string; // Data URL
  bankName: string;
  bankAccountName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  invoicePrefix: string;
  quotationPrefix: string;
  receiptPrefix: string;
  orderPrefix: string;
  currencySymbol: string;
  defaultGstRate: number;
  defaultTerms: string;
  customExpenseCategories: string[];
}

export type AppSettings = BusinessSettings;

export type ActiveTab =
  | 'dashboard'
  | 'quotations'
  | 'invoices'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'expenses'
  | 'profit-loss'
  | 'daily-sales'
  | 'reports'
  | 'products'
  | 'settings';
