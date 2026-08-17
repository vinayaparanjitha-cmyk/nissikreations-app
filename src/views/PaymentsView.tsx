import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  Eye,
  Filter,
  Plus,
  Receipt,
  Search,
  Share2,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Payment, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PaymentsView: React.FC = () => {
  const { payments, openModal, openDocumentView, deletePayment, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchQuery =
        p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      return matchQuery && matchMethod;
    });
  }, [payments, search, methodFilter]);

  const stats = useMemo(() => {
    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const upiCollected = payments
      .filter((p) => p.paymentMethod === 'UPI' || p.paymentMethod === 'QR Payment')
      .reduce((acc, p) => acc + p.amount, 0);
    const cashCollected = payments
      .filter((p) => p.paymentMethod === 'Cash')
      .reduce((acc, p) => acc + p.amount, 0);
    const bankCollected = payments
      .filter((p) => p.paymentMethod === 'Bank Transfer' || p.paymentMethod === 'Cheque')
      .reduce((acc, p) => acc + p.amount, 0);

    return { totalCollected, upiCollected, cashCollected, bankCollected, count: payments.length };
  }, [payments]);

  const handleDelete = (payment: Payment) => {
    openConfirmation({
      title: `Delete Payment ${payment.paymentNumber}?`,
      message: `Are you sure you want to delete this payment record of ${formatCurrency(payment.amount, settings.currencySymbol)} for ${payment.customerName}? The invoice balance will be updated automatically.`,
      confirmLabel: 'Delete Payment',
      isDangerous: true,
      onConfirm: () => {
        deletePayment(payment.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Collections & Payment Receipts
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Receipts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log incoming payments via UPI, Cash, or Bank transfers and generate printable payment vouchers.
          </p>
        </div>

        <button
          onClick={() => openModal('payment')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Collections</span>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(stats.totalCollected, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{stats.count} payment entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-sky-700 block">UPI / QR Collections</span>
          <p className="text-xl font-black text-sky-800 font-mono mt-1">
            {formatCurrency(stats.upiCollected, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Cash in Hand</span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1">
            {formatCurrency(stats.cashCollected, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Direct cash receipts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 block">Bank / Cheques</span>
          <p className="text-xl font-black text-purple-800 font-mono mt-1">
            {formatCurrency(stats.bankCollected, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">NEFT, RTGS & cheques</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt #, customer, invoice #, UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="all">All Payment Methods</option>
            <option value="UPI">UPI / GPay / PhonePe</option>
            <option value="Cash">Cash in Hand</option>
            <option value="Bank Transfer">Bank Transfer (NEFT)</option>
            <option value="QR Payment">QR Payment</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Payments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No payment records found</p>
            <p className="text-xs text-slate-400">
              {search || methodFilter !== 'all'
                ? 'Try adjusting your search criteria or filter.'
                : 'Click "Record Payment" to log your first transaction.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Against Invoice</th>
                  <th className="py-3.5 px-4">Mode / Reference</th>
                  <th className="py-3.5 px-4 text-right">Amount Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {pay.paymentNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{formatDate(pay.date)}</td>

                    <td className="py-3 px-4 font-semibold text-slate-900">{pay.customerName}</td>

                    <td className="py-3 px-4 font-mono text-slate-600">{pay.invoiceNumber}</td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {pay.paymentMethod}
                      </span>
                      {pay.referenceNumber && (
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {pay.referenceNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrency(pay.amount, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDocumentView('receipt', pay)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View / Print A4 Payment Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(pay)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Payment Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
