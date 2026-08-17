import React from 'react';
import { BusinessSettings, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Logo } from '../Logo';

interface ReceiptDocumentProps {
  payment: Payment;
  settings: BusinessSettings;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({ payment, settings }) => {
  return (
    <div
      id="printable-document"
      className="bg-white p-8 md:p-10 max-w-3xl mx-auto shadow-sm border border-slate-200 text-slate-800 text-sm leading-relaxed rounded-md"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <Logo customLogoUrl={settings.logoUrl} size="md" />
          <p className="text-xs text-slate-500 font-medium mt-1">{settings.tagline}</p>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            Official Payment Receipt
          </div>
          <h2 className="text-xl font-bold text-slate-900">{payment.paymentNumber}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Date: <span className="font-semibold text-slate-700">{formatDate(payment.date)}</span></p>
        </div>
      </div>

      {/* Received From Box */}
      <div className="my-6 p-5 bg-gradient-to-r from-orange-50/70 to-amber-50/50 rounded-xl border border-orange-200/80">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs text-orange-700 font-semibold uppercase tracking-wider">Received With Thanks From:</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{payment.customerName}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Against Invoice: <span className="font-semibold text-slate-800">{payment.invoiceNumber}</span>
            </p>
          </div>
          <div className="bg-white px-5 py-3 rounded-lg border border-orange-200 shadow-sm text-right">
            <span className="text-xs text-slate-500 font-medium uppercase block">Amount Received</span>
            <span className="text-2xl font-black text-orange-600 font-mono">
              {formatCurrency(payment.amount, settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-slate-200 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
          </div>
          {payment.referenceNumber && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Txn / Ref Number:</span>
              <span className="font-mono font-medium text-slate-800">{payment.referenceNumber}</span>
            </div>
          )}
          {payment.notes && (
            <div className="py-1">
              <span className="text-slate-500 block mb-0.5">Notes:</span>
              <span className="text-slate-700">{payment.notes}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">Settled Amount:</span>
            <span className="font-mono font-bold text-emerald-700">{formatCurrency(payment.amount, settings.currencySymbol)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-600 font-medium">Remaining Invoice Balance:</span>
            <span className={`font-mono font-bold ${payment.remainingBalanceAfter > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {formatCurrency(payment.remainingBalanceAfter, settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Business Info & Authorized Signatory */}
      <div className="mt-8 pt-6 flex flex-col md:flex-row justify-between items-end text-xs text-slate-500 gap-6">
        <div>
          <p className="font-semibold text-slate-800">{settings.businessName}</p>
          <p className="text-[11px] text-slate-500">{settings.addressLine1}, {settings.city} - {settings.pincode}</p>
          <p className="text-[11px] text-slate-500">Phone: {settings.phone} | GSTIN: {settings.gstNumber}</p>
        </div>
        <div className="text-center md:text-right">
          <div className="h-10 flex items-end justify-center md:justify-end">
            <span className="text-[11px] font-semibold text-slate-800">For NISSI KREATIONS</span>
          </div>
          <div className="w-44 border-t border-slate-400 pt-1 text-[11px] text-slate-500">
            Authorized Signatory
          </div>
        </div>
      </div>
    </div>
  );
};
