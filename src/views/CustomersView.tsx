import React, { useMemo, useState } from 'react';
import {
  Edit2,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatCurrency, shareViaWhatsApp } from '../utils/formatters';

export const CustomersView: React.FC = () => {
  const { customers, invoices, quotations, openModal, deleteCustomer, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');

  const customerStatsMap = useMemo(() => {
    const map = new Map<string, { totalBilled: number; totalPaid: number; balanceDue: number; invoiceCount: number }>();

    customers.forEach((c) => {
      const custInvoices = invoices.filter((i) => i.customerId === c.id || i.customerName === c.name);
      const totalBilled = custInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
      const totalPaid = custInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
      const balanceDue = custInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
      map.set(c.id, { totalBilled, totalPaid, balanceDue, invoiceCount: custInvoices.length });
    });

    return map;
  }, [customers, invoices]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase()) ||
        (c.gstNumber && c.gstNumber.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [customers, search]);

  const overallStats = useMemo(() => {
    const totalCustomers = customers.length;
    let totalBilled = 0;
    let totalOutstanding = 0;

    customerStatsMap.forEach((val) => {
      totalBilled += val.totalBilled;
      totalOutstanding += val.balanceDue;
    });

    return { totalCustomers, totalBilled, totalOutstanding };
  }, [customers, customerStatsMap]);

  const handleDelete = (cust: Customer) => {
    openConfirmation({
      title: `Delete Customer ${cust.name}?`,
      message: `Are you sure you want to remove ${cust.name} from your customer directory?`,
      confirmLabel: 'Delete Customer',
      isDangerous: true,
      onConfirm: () => {
        deleteCustomer(cust.id);
      },
    });
  };

  const handleWhatsApp = (cust: Customer) => {
    const text = `Hello ${cust.name}, greetings from ${settings.businessName}! Thank you for your business. Let us know if you have any printing or design requirements today.`;
    shareViaWhatsApp(cust.phone, text);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            CRM & Client Accounts
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your client contacts, GST details, billing balances and job histories.
          </p>
        </div>

        <button
          onClick={() => openModal('customer')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Registered Clients</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{overallStats.totalCustomers}</p>
          <span className="text-[10px] text-slate-400">Direct & business accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Lifetime Customer Sales</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(overallStats.totalBilled, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Across all completed bills</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Total Receivable Balance</span>
          <p className="text-xl font-black text-amber-800 font-mono mt-1">
            {formatCurrency(overallStats.totalOutstanding, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-amber-700 font-medium">Pending payments</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, city, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customers List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No customers found</p>
            <p className="text-xs text-slate-400">
              {search ? 'Try adjusting your search criteria.' : 'Click "Add New Customer" to register your first client.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const stat = customerStatsMap.get(cust.id) || {
              totalBilled: 0,
              totalPaid: 0,
              balanceDue: 0,
              invoiceCount: 0,
            };

            return (
              <div
                key={cust.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors text-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                      {cust.gstNumber && (
                        <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          GST: {cust.gstNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('customer', cust)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"
                        title="Edit Customer Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cust)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>

                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-500 line-clamp-2">{cust.address}</span>
                    </div>
                  </div>

                  {/* Financial Balance Summary */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Billed</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(stat.totalBilled, settings.currencySymbol)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Balance Due</span>
                      <span className={`font-mono font-bold ${stat.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrency(stat.balanceDue, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openModal('quotation', { customerId: cust.id })}
                    className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-amber-600" />
                    <span>Quote</span>
                  </button>

                  <button
                    onClick={() => openModal('invoice', { customerId: cust.id })}
                    className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Bill</span>
                  </button>

                  <button
                    onClick={() => handleWhatsApp(cust)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
