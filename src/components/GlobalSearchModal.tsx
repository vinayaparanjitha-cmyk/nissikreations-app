import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Package,
  Receipt,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    customers,
    quotations,
    invoices,
    orders,
    payments,
    expenses,
    setActiveTab,
    openDocumentView,
    openModal,
    settings,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    const matchedCustomers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
    );

    const matchedInvoices = invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.customerPhone.includes(q) ||
        i.items.some((it) => it.description.toLowerCase().includes(q))
    );

    const matchedQuotations = quotations.filter(
      (qt) =>
        qt.quotationNumber.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q) ||
        qt.customerPhone.includes(q) ||
        qt.items.some((it) => it.description.toLowerCase().includes(q))
    );

    const matchedOrders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.dimensions && o.dimensions.toLowerCase().includes(q))
    );

    const matchedPayments = payments.filter(
      (p) =>
        p.paymentNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
    );

    const matchedExpenses = expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.vendorName && e.vendorName.toLowerCase().includes(q))
    );

    return {
      customers: matchedCustomers,
      invoices: matchedInvoices,
      quotations: matchedQuotations,
      orders: matchedOrders,
      payments: matchedPayments,
      expenses: matchedExpenses,
      totalCount:
        matchedCustomers.length +
        matchedInvoices.length +
        matchedQuotations.length +
        matchedOrders.length +
        matchedPayments.length +
        matchedExpenses.length,
    };
  }, [query, customers, invoices, quotations, orders, payments, expenses]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search customers, invoices (NK-INV-...), quotations, orders, payments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5 text-xs flex-1">
          {!query && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600 text-sm">Quick Global Lookup</p>
              <p className="text-xs text-slate-400 mt-1">
                Type customer name, phone number, invoice number, quotation ID or description.
              </p>
            </div>
          )}

          {query && searchResults && searchResults.totalCount === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="font-semibold text-slate-600 text-sm">No matching records found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or number.</p>
            </div>
          )}

          {/* Invoices */}
          {searchResults && searchResults.invoices.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                Invoices ({searchResults.invoices.length})
              </h4>
              <div className="space-y-1.5">
                {searchResults.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      openDocumentView('invoice', inv);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="text-slate-600 ml-2">{inv.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quotations */}
          {searchResults && searchResults.quotations.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                Quotations ({searchResults.quotations.length})
              </h4>
              <div className="space-y-1.5">
                {searchResults.quotations.map((qt) => (
                  <div
                    key={qt.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      openDocumentView('quotation', qt);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{qt.quotationNumber}</span>
                      <span className="text-slate-600 ml-2">{qt.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(qt.grandTotal, settings.currencySymbol)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {qt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {searchResults && searchResults.orders.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-sky-500" />
                Orders ({searchResults.orders.length})
              </h4>
              <div className="space-y-1.5">
                {searchResults.orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('orders');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="text-slate-600 ml-2">{ord.customerName}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ord.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {searchResults && searchResults.customers.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Customers ({searchResults.customers.length})
              </h4>
              <div className="space-y-1.5">
                {searchResults.customers.map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('customers');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{cust.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">{cust.phone}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{cust.address.split(',')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {searchResults && searchResults.payments.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                Payments ({searchResults.payments.length})
              </h4>
              <div className="space-y-1.5">
                {searchResults.payments.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      openDocumentView('receipt', p);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.paymentNumber}</span>
                      <span className="text-slate-600 ml-2">{p.customerName}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(p.amount, settings.currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
