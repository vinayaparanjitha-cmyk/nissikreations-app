import React, { useMemo, useState } from 'react';
import {
  Coins,
  CreditCard,
  Download,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const InvoicesView: React.FC = () => {
  const { invoices, openModal, openDocumentView, deleteInvoice, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchQuery =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerPhone.includes(search) ||
        inv.items.some((it) => it.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalPaid = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalBalance = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
    const paidCount = invoices.filter((i) => i.status === 'Paid').length;
    const unpaidCount = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue' || i.status === 'Partially Paid').length;

    return { totalBilled, totalPaid, totalBalance, paidCount, unpaidCount, totalCount: invoices.length };
  }, [invoices]);

  const handleDelete = (invoice: Invoice) => {
    openConfirmation({
      title: `Delete Invoice ${invoice.invoiceNumber}?`,
      message: `Are you sure you want to remove tax invoice for ${invoice.customerName} (Amount: ${formatCurrency(invoice.grandTotal, settings.currencySymbol)})?`,
      confirmLabel: 'Delete Invoice',
      isDangerous: true,
      onConfirm: () => {
        deleteInvoice(invoice.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            GST & Sales Billing
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create GST compliant printing invoices, track payments, and send instant receipts.
          </p>
        </div>

        <button
          onClick={() => openModal('invoice')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tax Invoice</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Billed</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(stats.totalBilled, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{stats.totalCount} invoices total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Total Collected</span>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(stats.totalPaid, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">{stats.paidCount} fully paid</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Outstanding Balance</span>
          <p className="text-xl font-black text-amber-800 font-mono mt-1">
            {formatCurrency(stats.totalBalance, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-amber-700 font-medium">{stats.unpaidCount} pending collection</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Collection Ratio</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {stats.totalBilled > 0
              ? `${Math.round((stats.totalPaid / stats.totalBilled) * 100)}%`
              : '100%'}
          </p>
          <span className="text-[10px] text-slate-400">Cash recovery rate</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer, phone, item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="all">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No tax invoices found</p>
            <p className="text-xs text-slate-400">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or status filter.'
                : 'Click "Create Tax Invoice" to bill your first order.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date / Due</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const statusColors: Record<InvoiceStatus, string> = {
                    Paid: 'bg-emerald-100 text-emerald-800',
                    'Partially Paid': 'bg-amber-100 text-amber-800',
                    Unpaid: 'bg-rose-100 text-rose-800',
                    Overdue: 'bg-red-100 text-red-800',
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(inv.date)}
                        {inv.dueDate && (
                          <span className="block text-[10px] text-slate-400">
                            Due: {formatDate(inv.dueDate)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{inv.customerName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{inv.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                        {formatCurrency(inv.amountPaid, settings.currencySymbol)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                          {formatCurrency(inv.balanceDue, settings.currencySymbol)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Record Payment if balance due */}
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => openModal('payment', { invoiceId: inv.id })}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-emerald-200"
                              title="Record Customer Payment"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Pay</span>
                            </button>
                          )}

                          <button
                            onClick={() => openDocumentView('invoice', inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View / Print A4 Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openModal('invoice', inv)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(inv)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
