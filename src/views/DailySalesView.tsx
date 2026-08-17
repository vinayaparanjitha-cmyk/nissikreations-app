import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Printer,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayString } from '../utils/formatters';

export const DailySalesView: React.FC = () => {
  const { invoices, payments, expenses, openDocumentView, settings } = useApp();

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dayData = useMemo(() => {
    const dayInvoices = invoices.filter((i) => i.date === selectedDate);
    const dayPayments = payments.filter((p) => p.date === selectedDate);
    const dayExpenses = expenses.filter((e) => e.date === selectedDate);

    const totalBilled = dayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalCollected = dayPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netCashInflow = totalCollected - totalExpenses;

    return {
      dayInvoices,
      dayPayments,
      dayExpenses,
      totalBilled,
      totalCollected,
      totalExpenses,
      netCashInflow,
    };
  }, [invoices, payments, expenses, selectedDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Daily Cashbook & Day-End Settlement
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Sales Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily drawer cash, UPI settlements, bills cut and workshop daily expenses.
          </p>
        </div>

        {/* Date Selector with prev / next navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-white text-slate-600 rounded-lg cursor-pointer transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent px-3 py-1 text-xs font-bold text-slate-800 outline-none"
            />

            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-white text-slate-600 rounded-lg cursor-pointer transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(getTodayString())}
            className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold rounded-xl text-xs border border-orange-200 cursor-pointer transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
            title="Print Day Sheet"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Sales Billed</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(dayData.totalBilled, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{dayData.dayInvoices.length} invoices generated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Cash & UPI Received</span>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(dayData.totalCollected, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">{dayData.dayPayments.length} payment entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 block">Daily Expenses Paid</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatCurrency(dayData.totalExpenses, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{dayData.dayExpenses.length} expense entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Net Daily Drawer Balance</span>
          <p className={`text-xl font-black font-mono mt-1 ${dayData.netCashInflow >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {formatCurrency(dayData.netCashInflow, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Collections − Outlays</span>
        </div>
      </div>

      {/* 3 Columns: Invoices Generated, Payments Received, Expenses Incurred */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices Generated Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-600" />
              <span>Invoices Billed ({dayData.dayInvoices.length})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-900">
              {formatCurrency(dayData.totalBilled, settings.currencySymbol)}
            </span>
          </div>

          {dayData.dayInvoices.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No invoices generated on this date.</div>
          ) : (
            <div className="space-y-2">
              {dayData.dayInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>
                      <span className="font-semibold text-slate-700">{inv.customerName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                      {inv.items[0]?.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => openDocumentView('invoice', inv)}
                      className="p-1 text-slate-400 hover:text-orange-600 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collections Received Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Payments Received ({dayData.dayPayments.length})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700">
              {formatCurrency(dayData.totalCollected, settings.currencySymbol)}
            </span>
          </div>

          {dayData.dayPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No collections recorded on this date.</div>
          ) : (
            <div className="space-y-2">
              {dayData.dayPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{p.customerName}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {p.paymentMethod}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Inv: {p.invoiceNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(p.amount, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => openDocumentView('receipt', p)}
                      className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Incurred Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-rose-600" />
              <span>Expenses Paid ({dayData.dayExpenses.length})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-rose-600">
              {formatCurrency(dayData.totalExpenses, settings.currencySymbol)}
            </span>
          </div>

          {dayData.dayExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No expenses incurred on this date.</div>
          ) : (
            <div className="space-y-2">
              {dayData.dayExpenses.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{e.description}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {e.category} ({e.paymentMethod})
                    </span>
                  </div>

                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(e.amount, settings.currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
