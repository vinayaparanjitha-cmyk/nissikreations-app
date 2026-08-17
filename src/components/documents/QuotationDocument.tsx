import React from 'react';
import { BusinessSettings, Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Logo } from '../Logo';

interface QuotationDocumentProps {
  quotation: Quotation;
  settings: BusinessSettings;
}

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({ quotation, settings }) => {
  return (
    <div
      id="printable-document"
      className="bg-white p-8 md:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 text-slate-800 text-sm leading-relaxed rounded-md"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <Logo customLogoUrl={settings.logoUrl} size="lg" />
          <p className="text-xs text-slate-500 font-medium mt-1.5">{settings.tagline}</p>
        </div>
        <div className="text-right md:text-right">
          <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 font-bold text-xs uppercase tracking-wider mb-2">
            Formal Quotation
          </div>
          <h2 className="text-xl font-bold text-slate-900">{quotation.quotationNumber}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Date: <span className="font-semibold text-slate-700">{formatDate(quotation.date)}</span></p>
          <p className="text-xs text-slate-500">Valid Until: <span className="font-semibold text-slate-700">{formatDate(quotation.validUntil)}</span></p>
        </div>
      </div>

      {/* Business & Customer Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From:</h3>
          <p className="font-bold text-slate-900">{settings.businessName}</p>
          <p className="text-xs text-slate-600 mt-0.5">{settings.addressLine1}</p>
          {settings.addressLine2 && <p className="text-xs text-slate-600">{settings.addressLine2}</p>}
          <p className="text-xs text-slate-600">{settings.city}, {settings.state} - {settings.pincode}</p>
          <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">Phone:</span> {settings.phone} {settings.alternatePhone ? `/ ${settings.alternatePhone}` : ''}</p>
          <p className="text-xs text-slate-600"><span className="font-medium text-slate-700">Email:</span> {settings.email}</p>
          {settings.gstNumber && <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">GSTIN:</span> {settings.gstNumber}</p>}
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Quotation For:</h3>
          <p className="font-bold text-slate-900 text-base">{quotation.customerName}</p>
          {quotation.customerAddress && <p className="text-xs text-slate-600 mt-0.5">{quotation.customerAddress}</p>}
          <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">Phone:</span> {quotation.customerPhone || 'N/A'}</p>
          {quotation.customerEmail && <p className="text-xs text-slate-600"><span className="font-medium text-slate-700">Email:</span> {quotation.customerEmail}</p>}
          {quotation.customerGstNumber && <p className="text-xs text-slate-600 mt-1"><span className="font-medium text-slate-700">GST No:</span> {quotation.customerGstNumber}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50">
              <th className="py-3 px-3 w-10">#</th>
              <th className="py-3 px-3">Item & Description</th>
              <th className="py-3 px-2 text-center">Dimensions</th>
              <th className="py-3 px-2 text-center">Qty / Unit</th>
              <th className="py-3 px-3 text-right">Rate</th>
              <th className="py-3 px-2 text-right">Disc %</th>
              <th className="py-3 px-2 text-right">GST %</th>
              <th className="py-3 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {quotation.items.map((item, idx) => {
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

      {/* Totals & Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200">
        <div className="space-y-4">
          {quotation.notes && (
            <div className="bg-amber-50/50 p-3 rounded border border-amber-200/60 text-xs">
              <h4 className="font-bold text-amber-900 mb-1">Notes / Remarks:</h4>
              <p className="text-slate-700 whitespace-pre-line">{quotation.notes}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Terms & Conditions:</h4>
            <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
              {quotation.termsAndConditions || settings.defaultTerms}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">{formatCurrency(quotation.subtotal, settings.currencySymbol)}</span>
          </div>
          {quotation.discountTotal > 0 && (
            <div className="flex justify-between py-1.5 text-emerald-600 font-medium">
              <span>Total Discount:</span>
              <span className="font-mono">- {formatCurrency(quotation.discountTotal, settings.currencySymbol)}</span>
            </div>
          )}
          {quotation.taxTotal > 0 && (
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>GST / Tax Total:</span>
              <span className="font-mono">{formatCurrency(quotation.taxTotal, settings.currencySymbol)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-bold text-slate-900">
            <span>Estimated Grand Total:</span>
            <span className="font-mono text-orange-600">{formatCurrency(quotation.grandTotal, settings.currencySymbol)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end text-xs text-slate-500 gap-6">
        <div>
          <p className="font-medium text-slate-700">Thank you for considering NISSI KREATIONS!</p>
          <p className="text-[11px] text-slate-400 mt-0.5">This quotation is computer generated and valid for 15 days.</p>
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
    </div>
  );
};
