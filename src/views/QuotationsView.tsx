import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Quotation, QuotationStatus } from '../types';
import { formatCurrency, formatDate, shareViaWhatsApp } from '../utils/formatters';

export const QuotationsView: React.FC = () => {
  const { quotations, openModal, openDocumentView, convertQuotationToInvoice, deleteQuotation, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchQuery =
        q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.customerName.toLowerCase().includes(search.toLowerCase()) ||
        q.customerPhone.includes(search) ||
        q.items.some((it) => it.description.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [quotations, search, statusFilter]);

  const stats = useMemo(() => {
    const total = quotations.length;
    const accepted = quotations.filter((q) => q.status === 'Accepted').length;
    const converted = quotations.filter((q) => q.status === 'Converted to Invoice').length;
    const pending = quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length;
    const totalValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);

    return { total, accepted, converted, pending, totalValue };
  }, [quotations]);

  const handleDelete = (quotation: Quotation) => {
    openConfirmation({
      title: `Delete Quotation ${quotation.quotationNumber}?`,
      message: `Are you sure you want to remove this price estimate for ${quotation.customerName}? This action cannot be undone.`,
      confirmLabel: 'Delete Quotation',
      isDangerous: true,
      onConfirm: () => {
        deleteQuotation(quotation.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Sales Estimations
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations & Estimates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare itemized area-based quotes and convert them to tax invoices with one click.
          </p>
        </div>

        <button
          onClick={() => openModal('quotation')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Estimates</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400">Created to date</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Quoted Value</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(stats.totalValue, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">All proposals</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Pending Feedback</span>
          <p className="text-xl font-black text-amber-800 font-mono mt-1">{stats.pending}</p>
          <span className="text-[10px] text-slate-400">Awaiting client approval</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Converted to Invoices</span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1">{stats.converted}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Approved & Billed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotation #, customer, item..."
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
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Converted">Converted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No quotations found</p>
            <p className="text-xs text-slate-400">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter.'
                : 'Click "Create Quotation" to generate your first price estimate.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Summary</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((qtn) => {
                  const statusColors: Record<QuotationStatus, string> = {
                    Draft: 'bg-slate-100 text-slate-700',
                    Sent: 'bg-amber-100 text-amber-800',
                    Accepted: 'bg-blue-100 text-blue-800',
                    'Converted to Invoice': 'bg-emerald-100 text-emerald-800',
                    Rejected: 'bg-rose-100 text-rose-800',
                    Expired: 'bg-stone-100 text-stone-700',
                  };

                  return (
                    <tr key={qtn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {qtn.quotationNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(qtn.date)}
                        {qtn.validUntil && (
                          <span className="block text-[10px] text-slate-400">
                            Exp: {formatDate(qtn.validUntil)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{qtn.customerName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{qtn.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span>{qtn.items.length} item(s)</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                          {qtn.items[0]?.description || 'Custom print job'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(qtn.grandTotal, settings.currencySymbol)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[qtn.status]}`}>
                          {qtn.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1-Click Convert to Invoice button if not converted yet */}
                          {qtn.status !== 'Converted' && (
                            <button
                              onClick={() => convertQuotationToInvoice(qtn.id)}
                              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-orange-200"
                              title="Convert to Tax Invoice"
                            >
                              <span>Convert</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => openDocumentView('quotation', qtn)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View / Print A4 Quotation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openModal('quotation', qtn)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Quotation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(qtn)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Quotation"
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
