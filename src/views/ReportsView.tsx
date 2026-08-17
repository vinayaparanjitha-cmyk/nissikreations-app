import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Printer,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayString } from '../utils/formatters';

type ReportType = 'sales' | 'gst' | 'outstanding' | 'expenses' | 'products';

export const ReportsView: React.FC = () => {
  const { invoices, payments, expenses, customers, products, settings } = useApp();

  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(getTodayString());

  // Filtered dataset
  const filteredData = useMemo(() => {
    const rangeInvoices = invoices.filter((i) => i.date >= startDate && i.date <= endDate);
    const rangePayments = payments.filter((p) => p.date >= startDate && p.date <= endDate);
    const rangeExpenses = expenses.filter((e) => e.date >= startDate && e.date <= endDate);

    // GST report
    const totalTaxable = rangeInvoices.reduce((sum, i) => sum + i.subtotal - i.discountTotal, 0);
    const totalGst = rangeInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    // Outstanding report
    const outstandingCustomers = customers
      .map((c) => {
        const custInvoices = invoices.filter((i) => i.customerId === c.id || i.customerName === c.name);
        const totalBilled = custInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
        const totalPaid = custInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
        const balance = custInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
        return { customer: c, totalBilled, totalPaid, balance, count: custInvoices.length };
      })
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    // Products / Services report
    const productStats: Record<string, { name: string; quantity: number; revenue: number; unit: string }> = {};
    rangeInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const key = item.description;
        if (!productStats[key]) {
          productStats[key] = { name: key, quantity: 0, revenue: 0, unit: item.unit };
        }
        productStats[key].quantity += item.quantity;
        productStats[key].revenue += item.total;
      });
    });

    const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    return {
      rangeInvoices,
      rangePayments,
      rangeExpenses,
      totalTaxable,
      totalGst,
      cgst,
      sgst,
      outstandingCustomers,
      topProducts,
    };
  }, [invoices, payments, expenses, customers, startDate, endDate]);

  // Export to CSV helper
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sales') {
      csvContent += 'Invoice Number,Date,Customer Name,Phone,Subtotal,Tax,Grand Total,Amount Paid,Balance Due,Status\n';
      filteredData.rangeInvoices.forEach((i) => {
        csvContent += `"${i.invoiceNumber}","${i.date}","${i.customerName}","${i.customerPhone}",${i.subtotal},${i.taxTotal},${i.grandTotal},${i.amountPaid},${i.balanceDue},"${i.status}"\n`;
      });
    } else if (reportType === 'gst') {
      csvContent += 'Invoice Number,Date,Customer Name,GSTIN,Taxable Amount,CGST 9%,SGST 9%,Total Tax,Invoice Total\n';
      filteredData.rangeInvoices.forEach((i) => {
        const taxable = i.subtotal - i.discountTotal;
        const cgstVal = (i.taxTotal / 2).toFixed(2);
        const sgstVal = (i.taxTotal / 2).toFixed(2);
        csvContent += `"${i.invoiceNumber}","${i.date}","${i.customerName}","${i.customerGstNumber || ''}",${taxable.toFixed(2)},${cgstVal},${sgstVal},${i.taxTotal.toFixed(2)},${i.grandTotal.toFixed(2)}\n`;
      });
    } else if (reportType === 'outstanding') {
      csvContent += 'Customer Name,Phone,Email,Total Billed,Total Paid,Balance Due\n';
      filteredData.outstandingCustomers.forEach((c) => {
        csvContent += `"${c.customer.name}","${c.customer.phone}","${c.customer.email}",${c.totalBilled},${c.totalPaid},${c.balance}\n`;
      });
    } else if (reportType === 'expenses') {
      csvContent += 'Date,Category,Description,Vendor,Payment Mode,Reference Number,Amount\n';
      filteredData.rangeExpenses.forEach((e) => {
        csvContent += `"${e.date}","${e.category}","${e.description}","${e.vendorName || ''}","${e.paymentMethod}","${e.referenceNumber || ''}",${e.amount}\n`;
      });
    } else if (reportType === 'products') {
      csvContent += 'Item Description,Quantity Sold,Unit,Total Revenue\n';
      filteredData.topProducts.forEach((p) => {
        csvContent += `"${p.name}",${p.quantity},"${p.unit}",${p.revenue.toFixed(2)}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nissi_${reportType}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Analytics & Exports
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download GST reports, sales ledgers, customer receivables, and media sales stats in CSV/Excel format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setReportType('sales')}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            reportType === 'sales'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sales Ledger</span>
        </button>

        <button
          onClick={() => setReportType('gst')}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            reportType === 'gst'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>GST / Tax Summary</span>
        </button>

        <button
          onClick={() => setReportType('outstanding')}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            reportType === 'outstanding'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Receivables / Dues</span>
        </button>

        <button
          onClick={() => setReportType('expenses')}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            reportType === 'expenses'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Expenses Journal</span>
        </button>

        <button
          onClick={() => setReportType('products')}
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            reportType === 'products'
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Top Media Sold</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700">Filter Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
          />
        </div>

        <div className="text-slate-500 font-medium">
          Showing records between <strong className="text-slate-800">{formatDate(startDate)}</strong> and{' '}
          <strong className="text-slate-800">{formatDate(endDate)}</strong>
        </div>
      </div>

      {/* Dynamic Report Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* 1. SALES REPORT */}
        {reportType === 'sales' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 text-right">GST</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredData.rangeInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans">{formatDate(inv.date)}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{inv.customerName}</td>
                    <td className="py-2.5 px-4 text-right">{formatCurrency(inv.subtotal, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right">{formatCurrency(inv.taxTotal, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(inv.grandTotal, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-700">{formatCurrency(inv.amountPaid, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right text-rose-600">{formatCurrency(inv.balanceDue, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. GST REPORT */}
        {reportType === 'gst' && (
          <div className="overflow-x-auto text-xs">
            <div className="p-4 bg-orange-50/50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Taxable Turnover:</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(filteredData.totalTaxable, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total CGST (Output):</span>
                <span className="text-base font-bold font-mono text-orange-700">
                  {formatCurrency(filteredData.cgst, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total SGST (Output):</span>
                <span className="text-base font-bold font-mono text-orange-700">
                  {formatCurrency(filteredData.sgst, settings.currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Total Output GST:</span>
                <span className="text-base font-black font-mono text-slate-900">
                  {formatCurrency(filteredData.totalGst, settings.currencySymbol)}
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">GSTIN</th>
                  <th className="py-3.5 px-4 text-right">Taxable Value</th>
                  <th className="py-3.5 px-4 text-right">CGST</th>
                  <th className="py-3.5 px-4 text-right">SGST</th>
                  <th className="py-3.5 px-4 text-right">Total GST</th>
                  <th className="py-3.5 px-4 text-right">Invoice Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredData.rangeInvoices.map((inv) => {
                  const taxable = inv.subtotal - inv.discountTotal;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{inv.customerName}</td>
                      <td className="py-2.5 px-4 text-slate-500">{inv.customerGstNumber || 'B2C (Unregistered)'}</td>
                      <td className="py-2.5 px-4 text-right">{formatCurrency(taxable, settings.currencySymbol)}</td>
                      <td className="py-2.5 px-4 text-right">{formatCurrency(inv.taxTotal / 2, settings.currencySymbol)}</td>
                      <td className="py-2.5 px-4 text-right">{formatCurrency(inv.taxTotal / 2, settings.currencySymbol)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-orange-700">{formatCurrency(inv.taxTotal, settings.currencySymbol)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCurrency(inv.grandTotal, settings.currencySymbol)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RECEIVABLES / OUTSTANDING */}
        {reportType === 'outstanding' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4 text-right">Total Billed</th>
                  <th className="py-3.5 px-4 text-right">Total Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.outstandingCustomers.map((c) => (
                  <tr key={c.customer.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{c.customer.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{c.customer.phone}</td>
                    <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">{c.customer.address}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(c.totalBilled, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-700">{formatCurrency(c.totalPaid, settings.currencySymbol)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatCurrency(c.balance, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. EXPENSES */}
        {reportType === 'expenses' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.rangeExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono text-slate-600">{formatDate(e.date)}</td>
                    <td className="py-2.5 px-4 font-bold text-rose-800">{e.category}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{e.description}</td>
                    <td className="py-2.5 px-4 text-slate-600">{e.vendorName || '-'}</td>
                    <td className="py-2.5 px-4 text-slate-600">{e.paymentMethod}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. TOP PRODUCTS */}
        {reportType === 'products' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Media / Service Description</th>
                  <th className="py-3.5 px-4 text-right">Units / Quantity</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredData.topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-4 text-right">
                      {p.quantity} <span className="text-slate-400 font-normal">{p.unit}</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(p.revenue, settings.currencySymbol)}
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
