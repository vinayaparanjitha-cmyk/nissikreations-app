import React from 'react';
import { BusinessSettings, Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Logo } from '../Logo';

interface InvoiceDocumentProps {
  invoice: Invoice;
  settings: BusinessSettings;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, settings }) => {
  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'Paid':
        return (
          <div className="border-2 border-emerald-600 text-emerald-700 bg-emerald-50/70 font-black text-xs px-3 py-1 uppercase tracking-widest rounded rotate-[-4deg] inline-block shadow-sm">
            ✓ PAID IN FULL
          </div>
        );
      case 'Partially Paid':
        return (
          <div className="border-2 border-amber-500 text-amber-700 bg-amber-50/70 font-black text-xs px-3 py-1 uppercase tracking-widest rounded rotate-[-3deg] inline-block shadow-sm">
            ⚡ PARTIAL PAYMENT
          </div>
        );
      case 'Overdue':
        return (
          <div className="border-2 border-rose-600 text-rose-700 bg-rose-50/70 font-black text-xs px-3 py-1 uppercase tracking-widest rounded rotate-[-4deg] inline-block shadow-sm">
            ⚠ OVERDUE
          </div>
        );
      default:
        return (
          <div className="border-2 border-slate-400 text-slate-700 bg-slate-100 font-black text-xs px-3 py-1 uppercase tracking-widest rounded inline-block shadow-sm">
            PAYMENT DUE
          </div>
        );
    }
  };

  return (
    <div
      id="printable-document"
      className="bg-white p-8 md:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 text-slate-800 text-sm leading-relaxed rounded-md"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <Logo customLogoUrl={settings.logoUrl} size="lg" />
          <p className="text-xs text-slate-500 font-medium mt-1.5">{settings.tagline}</p>
        </div>
        <div className="text-right md:text-right">
          <div className="mb-2">{getStatusBadge()}</div>
          <div className="inline-block px-3 py-0.5 bg-orange-50 border border-orange-200 rounded text-orange-800 font-bold text-xs uppercase tracking-wider mb-1">
            Tax Invoice
          </div>
          <h2 className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Invoice Date: <span className="font-semibold text-slate-700">{formatDate(invoice.date)}</span></p>
          <p className="text-xs text-slate-500">Due Date: <span className="font-semibold text-slate-700">{formatDate(invoice.dueDate)}</span></p>
          {invoice.quotationNumber && (
            <p className="text-xs text-slate-500">Ref Quotation: <span className="font-medium text-slate-600">{invoice.quotationNumber}</span></p>
          )}
        </div>
      </div>

      {/* Bill From & Bill To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed By:</h3>
          <p className="font-bold text-slate-900 text-base">{settings.businessName}</p>
          <p className="text-xs text-slate-600 mt-0.5">{settings.addressLine1}</p>
          {settings.addressLine2 && <p className="text-xs text-slate-600">{settings.addressLine2}</p>}
          <p className="text-xs text-slate-600">{settings.city}, {settings.state} - {settings.pincode}</p>
          <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">Phone:</span> {settings.phone} {settings.alternatePhone ? `/ ${settings.alternatePhone}` : ''}</p>
          <p className="text-xs text-slate-600"><span className="font-medium text-slate-700">Email:</span> {settings.email}</p>
          {settings.gstNumber && <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">GSTIN:</span> {settings.gstNumber}</p>}
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Billed To (Customer):</h3>
          <p className="font-bold text-slate-900 text-base">{invoice.customerName}</p>
          {invoice.customerAddress && <p className="text-xs text-slate-600 mt-0.5">{invoice.customerAddress}</p>}
          <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">Phone:</span> {invoice.customerPhone || 'N/A'}</p>
          {invoice.customerEmail && <p className="text-xs text-slate-600"><span className="font-medium text-slate-700">Email:</span> {invoice.customerEmail}</p>}
          {invoice.customerGstNumber && <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">GSTIN / Tax ID:</span> {invoice.customerGstNumber}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50">
              <th className="py-3 px-3 w-10">#</th>
              <th className="py-3 px-3">Description & Specifications</th>
              <th className="py-3 px-2 text-center">Dimensions</th>
              <th className="py-3 px-2 text-center">Qty / Unit</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 px-2 text-right">Disc %</th>
              <th className="py-3 px-2 text-right">GST %</th>
              <th className="py-3 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoice.items.map((item, idx) => {
              const hasDimensions = item.width && item.height;
              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-slate-900">{item.description}</p>
                  </td>
                  <td className="py-3.5 px-2 text-center text-slate-600 font-mono">
                    {hasDimensions ? `${item.width} × ${item.height} ${item.unit}` : '-'}
                  </td>
                  <td className="py-3.5 px-2 text-center text-slate-700 font-medium">
                    {item.quantity} <span className="text-[11px] text-slate-500">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                    {formatCurrency(item.rate, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-600">
                    {item.discount > 0 ? `${item.discount}%` : '-'}
                  </td>
                  <td className="py-3.5 px-2 text-right text-slate-600">
                    {item.taxPercent > 0 ? `${item.taxPercent}%` : '0%'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(item.total, settings.currencySymbol)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculations & Payment Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
        <div className="space-y-4">
          {/* Bank & UPI payment information */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>💳</span> Bank & Payment Details
            </h4>
            <div className="text-xs space-y-1 text-slate-700">
              <p><span className="text-slate-500 font-medium">Bank Name:</span> {settings.bankName}</p>
              <p><span className="text-slate-500 font-medium">Account Name:</span> {settings.bankAccountName}</p>
              <p><span className="text-slate-500 font-medium">Account No:</span> <span className="font-mono font-bold text-slate-900">{settings.accountNumber}</span></p>
              <p><span className="text-slate-500 font-medium">IFSC Code:</span> <span className="font-mono font-bold text-slate-900">{settings.ifscCode}</span></p>
              <p><span className="text-slate-500 font-medium">UPI ID:</span> <span className="font-mono text-orange-600 font-semibold">{settings.upiId}</span></p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Terms & Conditions:</h4>
            <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
              {invoice.termsAndConditions || settings.defaultTerms}
            </div>
          </div>
        </div>

        {/* Calculation summary */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">{formatCurrency(invoice.subtotal, settings.currencySymbol)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between py-1.5 text-emerald-600 font-medium">
              <span>Total Discount:</span>
              <span className="font-mono">- {formatCurrency(invoice.discountTotal, settings.currencySymbol)}</span>
            </div>
          )}
          {invoice.taxTotal > 0 && (
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>GST / Tax Total:</span>
              <span className="font-mono">{formatCurrency(invoice.taxTotal, settings.currencySymbol)}</span>
            </div>
          )}
          <div className="flex justify-between py-2.5 border-t border-slate-200 text-sm font-bold text-slate-900">
            <span>Grand Total:</span>
            <span className="font-mono text-base">{formatCurrency(invoice.grandTotal, settings.currencySymbol)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-emerald-700 font-medium">
            <span>Amount Paid:</span>
            <span className="font-mono font-bold">{formatCurrency(invoice.amountPaid, settings.currencySymbol)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-black text-slate-900 bg-orange-50/50 px-3 rounded">
            <span>Balance Due:</span>
            <span className={`font-mono ${invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatCurrency(invoice.balanceDue, settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end text-xs text-slate-500 gap-6">
        <div>
          <p className="text-sm font-bold text-slate-900">Thank you and visit again!</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Please quote invoice number for all payment queries.</p>
        </div>
        <div className="text-center md:text-right">
          <div className="h-12 flex items-end justify-center md:justify-end">
            <span className="text-[11px] font-semibold text-slate-800 tracking-wide">For NISSI KREATIONS</span>
          </div>
          <div className="w-48 border-t border-slate-400 pt-1 text-[11px] text-slate-500">
            Authorized Signatory
          </div>
        </div>
      </div>

      {/* Bottom closing note */}
      <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center text-xs font-bold text-slate-700 tracking-wide bg-slate-50/60 py-2 rounded">
        Thank you and visit again!
      </div>
    </div>
  );
};
