import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  BusinessSettings,
  Customer,
  Expense,
  Invoice,
  Order,
  OrderStatus,
  Payment,
  ProductService,
  Quotation,
} from '../types';
import { calculateDocumentTotals, getTodayString } from '../utils/formatters';
import { StorageService } from '../utils/storage';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ViewDocumentState {
  type: 'quotation' | 'invoice' | 'receipt' | 'order' | null;
  data: any;
}

interface AppContextType {
  // Navigation & View
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Global Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Settings
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;

  // Entities
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  products: ProductService[];

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  // Quotation Operations
  addQuotation: (quotation: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  duplicateQuotation: (id: string) => Quotation;
  deleteQuotation: (id: string) => void;
  convertQuotationToInvoice: (quotationId: string) => Invoice;

  // Invoice Operations
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  duplicateInvoice: (id: string) => Invoice;
  deleteInvoice: (id: string) => boolean;

  // Order Operations
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  // Payment Operations
  addPayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'remainingBalanceAfter'>) => Payment;
  deletePayment: (id: string) => void;

  // Expense Operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Product Operations
  addProduct: (product: Omit<ProductService, 'id'>) => ProductService;
  updateProduct: (id: string, updates: Partial<ProductService>) => void;
  deleteProduct: (id: string) => void;

  // Document Viewer/Printer modal
  viewDocument: ViewDocumentState;
  openDocumentView: (type: 'quotation' | 'invoice' | 'receipt' | 'order', data: any) => void;
  closeDocumentView: () => void;

  // Global Quick Action Modals
  activeModal: 'none' | 'quotation' | 'invoice' | 'order' | 'payment' | 'expense' | 'customer';
  modalInitialData: any;
  openModal: (modal: 'quotation' | 'invoice' | 'order' | 'payment' | 'expense' | 'customer', initialData?: any) => void;
  closeModal: () => void;

  // Confirmation Modal
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  };
  requestConfirmation: (params: {
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }) => void;
  openConfirmation: (params: {
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirmation: () => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Backup / Reset
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<BusinessSettings>(() => StorageService.getSettings());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [quotations, setQuotations] = useState<Quotation[]>(() => StorageService.getQuotations());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [payments, setPayments] = useState<Payment[]>(() => StorageService.getPayments());
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [products, setProducts] = useState<ProductService[]>(() => StorageService.getProducts());

  const [viewDocument, setViewDocument] = useState<ViewDocumentState>({ type: null, data: null });
  const [activeModal, setActiveModal] = useState<'none' | 'quotation' | 'invoice' | 'order' | 'payment' | 'expense' | 'customer'>('none');
  const [modalInitialData, setModalInitialData] = useState<any>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keyboard shortcut for global search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestConfirmation = (params: {
    title: string;
    message: string;
    confirmLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: params.title,
      message: params.message,
      confirmLabel: params.confirmLabel || 'Confirm',
      isDangerous: params.isDangerous ?? true,
      onConfirm: () => {
        params.onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeConfirmation = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const openDocumentView = (type: 'quotation' | 'invoice' | 'receipt' | 'order', data: any) => {
    setViewDocument({ type, data });
  };

  const closeDocumentView = () => {
    setViewDocument({ type: null, data: null });
  };

  const openModal = (
    modal: 'quotation' | 'invoice' | 'order' | 'payment' | 'expense' | 'customer',
    initialData: any = null
  ) => {
    setModalInitialData(initialData);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal('none');
    setModalInitialData(null);
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
    showToast('Business settings updated successfully');
  };

  // Customer Management
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    showToast(`Customer "${newCustomer.name}" added successfully`);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = customers.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    showToast('Customer information updated');
  };

  const deleteCustomer = (id: string): boolean => {
    const hasInvoices = invoices.some((i) => i.customerId === id);
    const hasQuotations = quotations.some((q) => q.customerId === id);
    const hasOrders = orders.some((o) => o.customerId === id);

    if (hasInvoices || hasQuotations || hasOrders) {
      showToast('Cannot delete customer with linked invoices, orders or quotations', 'error');
      return false;
    }

    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    showToast('Customer deleted');
    return true;
  };

  // Quotation Management
  const addQuotation = (
    qtnData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>
  ): Quotation => {
    const quotationNumber = StorageService.getNextNumber(
      settings.quotationPrefix || 'NK-QTN-',
      quotations,
      'quotationNumber'
    );
    const totals = calculateDocumentTotals(qtnData.items);
    const newQuotation: Quotation = {
      ...qtnData,
      id: `qtn-${Date.now()}`,
      quotationNumber,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newQuotation, ...quotations];
    setQuotations(updated);
    StorageService.saveQuotations(updated);
    showToast(`Quotation ${newQuotation.quotationNumber} created`);
    return newQuotation;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    const updated = quotations.map((q) => {
      if (q.id === id) {
        const items = updates.items || q.items;
        const totals = calculateDocumentTotals(items);
        return {
          ...q,
          ...updates,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          grandTotal: totals.grandTotal,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    setQuotations(updated);
    StorageService.saveQuotations(updated);
    showToast('Quotation updated successfully');
  };

  const duplicateQuotation = (id: string): Quotation => {
    const original = quotations.find((q) => q.id === id);
    if (!original) throw new Error('Quotation not found');
    const quotationNumber = StorageService.getNextNumber(
      settings.quotationPrefix || 'NK-QTN-',
      quotations,
      'quotationNumber'
    );
    const newQuotation: Quotation = {
      ...original,
      id: `qtn-${Date.now()}`,
      quotationNumber,
      date: getTodayString(),
      status: 'Draft',
      convertedInvoiceId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newQuotation, ...quotations];
    setQuotations(updated);
    StorageService.saveQuotations(updated);
    showToast(`Duplicated into ${newQuotation.quotationNumber}`);
    return newQuotation;
  };

  const deleteQuotation = (id: string) => {
    const updated = quotations.filter((q) => q.id !== id);
    setQuotations(updated);
    StorageService.saveQuotations(updated);
    showToast('Quotation removed');
  };

  const convertQuotationToInvoice = (quotationId: string): Invoice => {
    const qtn = quotations.find((q) => q.id === quotationId);
    if (!qtn) throw new Error('Quotation not found');

    const invoiceNumber = StorageService.getNextNumber(
      settings.invoicePrefix || 'NK-INV-',
      invoices,
      'invoiceNumber'
    );

    // default due date: 10 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      quotationId: qtn.id,
      quotationNumber: qtn.quotationNumber,
      date: getTodayString(),
      dueDate: dueDateStr,
      customerId: qtn.customerId,
      customerName: qtn.customerName,
      customerPhone: qtn.customerPhone,
      customerEmail: qtn.customerEmail,
      customerAddress: qtn.customerAddress,
      customerGstNumber: qtn.customerGstNumber,
      items: [...qtn.items],
      subtotal: qtn.subtotal,
      discountTotal: qtn.discountTotal,
      taxTotal: qtn.taxTotal,
      grandTotal: qtn.grandTotal,
      amountPaid: 0,
      balanceDue: qtn.grandTotal,
      status: 'Unpaid',
      notes: `Converted from Quotation ${qtn.quotationNumber}. ${qtn.notes || ''}`,
      termsAndConditions: qtn.termsAndConditions || settings.defaultTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update quotation status
    const updatedQuotations = quotations.map((q) =>
      q.id === quotationId
        ? { ...q, status: 'Converted to Invoice' as const, convertedInvoiceId: newInvoice.id }
        : q
    );
    setQuotations(updatedQuotations);
    StorageService.saveQuotations(updatedQuotations);

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    StorageService.saveInvoices(updatedInvoices);

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Converted to Invoice ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  // Invoice Management
  const addInvoice = (
    invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>
  ): Invoice => {
    const invoiceNumber = StorageService.getNextNumber(
      settings.invoicePrefix || 'NK-INV-',
      invoices,
      'invoiceNumber'
    );
    const totals = calculateDocumentTotals(invData.items);
    const amountPaid = Number(invData.amountPaid) || 0;
    const grandTotal = totals.grandTotal;
    const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

    let status: Invoice['status'] = 'Unpaid';
    if (balanceDue === 0 && grandTotal > 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';

    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxTotal: totals.taxTotal,
      grandTotal,
      amountPaid,
      balanceDue,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    showToast(`Invoice ${newInvoice.invoiceNumber} created`);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) => {
      if (inv.id === id) {
        const items = updates.items || inv.items;
        const totals = calculateDocumentTotals(items);
        const grandTotal = totals.grandTotal;
        const amountPaid =
          updates.amountPaid !== undefined ? Number(updates.amountPaid) : inv.amountPaid;
        const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

        let status = updates.status || inv.status;
        if (balanceDue === 0 && grandTotal > 0) status = 'Paid';
        else if (amountPaid > 0 && amountPaid < grandTotal) status = 'Partially Paid';
        else if (amountPaid === 0) status = 'Unpaid';

        return {
          ...inv,
          ...updates,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          grandTotal,
          amountPaid,
          balanceDue,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return inv;
    });
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    showToast('Invoice updated');
  };

  const duplicateInvoice = (id: string): Invoice => {
    const original = invoices.find((i) => i.id === id);
    if (!original) throw new Error('Invoice not found');
    const invoiceNumber = StorageService.getNextNumber(
      settings.invoicePrefix || 'NK-INV-',
      invoices,
      'invoiceNumber'
    );
    const newInvoice: Invoice = {
      ...original,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      date: getTodayString(),
      amountPaid: 0,
      balanceDue: original.grandTotal,
      status: 'Unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    showToast(`Duplicated to ${newInvoice.invoiceNumber}`);
    return newInvoice;
  };

  const deleteInvoice = (id: string): boolean => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return false;

    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    showToast(`Invoice ${inv.invoiceNumber} deleted`);
    return true;
  };

  // Order Management
  const addOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Order => {
    const orderNumber = StorageService.getNextNumber(
      settings.orderPrefix || 'NK-ORD-',
      orders,
      'orderNumber'
    );
    const amount = Number(orderData.amount) || 0;
    const advancePaid = Number(orderData.advancePaid) || 0;
    const balance = Math.max(0, amount - advancePaid);

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      amount,
      advancePaid,
      balance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    StorageService.saveOrders(updated);
    showToast(`Order ${newOrder.orderNumber} created`);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const updated = orders.map((o) => {
      if (o.id === id) {
        const amount = updates.amount !== undefined ? Number(updates.amount) : o.amount;
        const advancePaid =
          updates.advancePaid !== undefined ? Number(updates.advancePaid) : o.advancePaid;
        const balance = Math.max(0, amount - advancePaid);
        return {
          ...o,
          ...updates,
          amount,
          advancePaid,
          balance,
          updatedAt: new Date().toISOString(),
        };
      }
      return o;
    });
    setOrders(updated);
    StorageService.saveOrders(updated);
    showToast('Order details updated');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    setOrders(updated);
    StorageService.saveOrders(updated);
    showToast(`Order status updated to "${status}"`);
  };

  const deleteOrder = (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    StorageService.saveOrders(updated);
    showToast('Order removed');
  };

  // Payment Management
  const addPayment = (
    paymentData: Omit<Payment, 'id' | 'paymentNumber' | 'createdAt' | 'remainingBalanceAfter'>
  ): Payment => {
    const paymentNumber = StorageService.getNextNumber(
      settings.receiptPrefix || 'NK-REC-',
      payments,
      'paymentNumber'
    );

    const inv = invoices.find((i) => i.id === paymentData.invoiceId);
    let remainingBalanceAfter = 0;

    if (inv) {
      const newPaid = Math.round((inv.amountPaid + paymentData.amount) * 100) / 100;
      remainingBalanceAfter = Math.max(0, Math.round((inv.grandTotal - newPaid) * 100) / 100);

      let newStatus: Invoice['status'] = 'Unpaid';
      if (remainingBalanceAfter === 0) newStatus = 'Paid';
      else if (newPaid > 0) newStatus = 'Partially Paid';

      const updatedInvoices = invoices.map((i) =>
        i.id === inv.id
          ? {
              ...i,
              amountPaid: newPaid,
              balanceDue: remainingBalanceAfter,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : i
      );
      setInvoices(updatedInvoices);
      StorageService.saveInvoices(updatedInvoices);
    }

    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentNumber,
      remainingBalanceAfter,
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    showToast(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} recorded (${paymentNumber})`);
    return newPayment;
  };

  const deletePayment = (id: string) => {
    const pay = payments.find((p) => p.id === id);
    if (!pay) return;

    // Recalculate invoice
    const inv = invoices.find((i) => i.id === pay.invoiceId);
    if (inv) {
      const newPaid = Math.max(0, Math.round((inv.amountPaid - pay.amount) * 100) / 100);
      const newBalance = Math.round((inv.grandTotal - newPaid) * 100) / 100;
      let newStatus: Invoice['status'] = 'Unpaid';
      if (newBalance === 0 && inv.grandTotal > 0) newStatus = 'Paid';
      else if (newPaid > 0) newStatus = 'Partially Paid';

      const updatedInvoices = invoices.map((i) =>
        i.id === inv.id
          ? {
              ...i,
              amountPaid: newPaid,
              balanceDue: newBalance,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : i
      );
      setInvoices(updatedInvoices);
      StorageService.saveInvoices(updatedInvoices);
    }

    const updated = payments.filter((p) => p.id !== id);
    setPayments(updated);
    StorageService.savePayments(updated);
    showToast('Payment record removed');
  };

  // Expense Management
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    showToast(`Expense of ₹${newExpense.amount.toLocaleString('en-IN')} recorded`);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    showToast('Expense updated');
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    showToast('Expense removed');
  };

  // Product Catalog Management
  const addProduct = (prodData: Omit<ProductService, 'id'>): ProductService => {
    const newProd: ProductService = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    const updated = [...products, newProd];
    setProducts(updated);
    StorageService.saveProducts(updated);
    showToast(`Product "${newProd.name}" added to catalog`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<ProductService>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    StorageService.saveProducts(updated);
    showToast('Product catalog updated');
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    StorageService.saveProducts(updated);
    showToast('Product removed');
  };

  // Backup / Reset
  const exportData = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nissi_kreations_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Business backup file downloaded');
  };

  const importData = (jsonStr: string): boolean => {
    const success = StorageService.importAllData(jsonStr);
    if (success) {
      setSettings(StorageService.getSettings());
      setCustomers(StorageService.getCustomers());
      setQuotations(StorageService.getQuotations());
      setInvoices(StorageService.getInvoices());
      setOrders(StorageService.getOrders());
      setPayments(StorageService.getPayments());
      setExpenses(StorageService.getExpenses());
      setProducts(StorageService.getProducts());
      showToast('All business records restored successfully');
      return true;
    }
    showToast('Invalid backup file format', 'error');
    return false;
  };

  const resetAllData = () => {
    StorageService.resetToDefault();
    setSettings(StorageService.getSettings());
    setCustomers(StorageService.getCustomers());
    setQuotations(StorageService.getQuotations());
    setInvoices(StorageService.getInvoices());
    setOrders(StorageService.getOrders());
    setPayments(StorageService.getPayments());
    setExpenses(StorageService.getExpenses());
    setProducts(StorageService.getProducts());
    showToast('Reset to demo business data');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSearchOpen,
        setIsSearchOpen,
        settings,
        updateSettings,
        customers,
        quotations,
        invoices,
        orders,
        payments,
        expenses,
        products,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addQuotation,
        updateQuotation,
        duplicateQuotation,
        deleteQuotation,
        convertQuotationToInvoice,
        addInvoice,
        updateInvoice,
        duplicateInvoice,
        deleteInvoice,
        addOrder,
        updateOrder,
        updateOrderStatus,
        deleteOrder,
        addPayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        addProduct,
        updateProduct,
        deleteProduct,
        viewDocument,
        openDocumentView,
        closeDocumentView,
        activeModal,
        modalInitialData,
        openModal,
        closeModal,
        confirmDialog,
        requestConfirmation,
        openConfirmation: requestConfirmation,
        closeConfirmation,
        toasts,
        showToast,
        addToast: showToast,
        removeToast,
        exportData,
        importData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
