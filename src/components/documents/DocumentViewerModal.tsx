import React from 'react';
import { Download, Mail, MessageCircle, Printer, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getEmailShareUrl, getWhatsAppShareUrl } from '../../utils/formatters';
import { InvoiceDocument } from './InvoiceDocument';
import { QuotationDocument } from './QuotationDocument';
import { ReceiptDocument } from './ReceiptDocument';

export const DocumentViewerModal: React.FC = () => {
  const { viewDocument, closeDocumentView, settings, showToast } = useApp();

  if (!viewDocument.type || !viewDocument.data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let message = '';
    let phone = '';

    if (viewDocument.type === 'quotation') {
      const q = viewDocument.data;
      phone = q.customerPhone || '';
      message = `Hello ${q.customerName},\n\nHere is your quotation ${q.quotationNumber} from ${settings.businessName}.\n\nTotal Amount: ${formatCurrency(q.grandTotal, settings.currencySymbol)}\nDate: ${formatDate(q.date)}\nValid Until: ${formatDate(q.validUntil)}\n\nThank you for choosing ${settings.businessName}!`;
    } else if (viewDocument.type === 'invoice') {
      const inv = viewDocument.data;
      phone = inv.customerPhone || '';
      message = `Hello ${inv.customerName},\n\nHere is your Tax Invoice ${inv.invoiceNumber} from ${settings.businessName}.\n\nTotal Amount: ${formatCurrency(inv.grandTotal, settings.currencySymbol)}\nAmount Paid: ${formatCurrency(inv.amountPaid, settings.currencySymbol)}\nBalance Due: ${formatCurrency(inv.balanceDue, settings.currencySymbol)}\nDue Date: ${formatDate(inv.dueDate)}\n\nUPI ID: ${settings.upiId}\nBank: ${settings.bankName}, A/C: ${settings.accountNumber}, IFSC: ${settings.ifscCode}\n\nThank you and visit again!\n${settings.businessName}`;
    } else if (viewDocument.type === 'receipt') {
      const p = viewDocument.data;
      phone = '';
      message = `Hello ${p.customerName},\n\nPayment Receipt ${p.paymentNumber} of ${formatCurrency(p.amount, settings.currencySymbol)} received towards Invoice ${p.invoiceNumber} on ${formatDate(p.date)} via ${p.paymentMethod}.\n\nRemaining Invoice Balance: ${formatCurrency(p.remainingBalanceAfter, settings.currencySymbol)}\n\nThank you!\n${settings.businessName}`;
    }

    const url = getWhatsAppShareUrl(phone, message);
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    let email = '';
    let subject = '';
    let body = '';

    if (viewDocument.type === 'quotation') {
      const q = viewDocument.data;
      email = q.customerEmail || '';
      subject = `Quotation ${q.quotationNumber} - ${settings.businessName}`;
      body = `Dear ${q.customerName},\n\nPlease find attached the quotation details from ${settings.businessName}.\n\nQuotation No: ${q.quotationNumber}\nDate: ${formatDate(q.date)}\nGrand Total: ${formatCurrency(q.grandTotal, settings.currencySymbol)}\n\nPlease feel free to contact us at ${settings.phone} if you have any questions.\n\nWarm regards,\n${settings.businessName}`;
    } else if (viewDocument.type === 'invoice') {
      const inv = viewDocument.data;
      email = inv.customerEmail || '';
      subject = `Invoice ${inv.invoiceNumber} - ${settings.businessName}`;
      body = `Dear ${inv.customerName},\n\nThank you for choosing ${settings.businessName}. Here is your invoice summary:\n\nInvoice No: ${inv.invoiceNumber}\nDate: ${formatDate(inv.date)}\nTotal: ${formatCurrency(inv.grandTotal, settings.currencySymbol)}\nBalance Due: ${formatCurrency(inv.balanceDue, settings.currencySymbol)}\n\nBank Details:\nBank: ${settings.bankName}\nAccount Name: ${settings.bankAccountName}\nAccount No: ${settings.accountNumber}\nIFSC: ${settings.ifscCode}\nUPI: ${settings.upiId}\n\nThank you and visit again!\n\nRegards,\n${settings.businessName}`;
    } else if (viewDocument.type === 'receipt') {
      const p = viewDocument.data;
      email = '';
      subject = `Payment Receipt ${p.paymentNumber} - ${settings.businessName}`;
      body = `Dear ${p.customerName},\n\nWe have recorded your payment of ${formatCurrency(p.amount, settings.currencySymbol)} towards Invoice ${p.invoiceNumber}.\n\nReceipt No: ${p.paymentNumber}\nDate: ${formatDate(p.date)}\nMode: ${p.paymentMethod}\n\nThank you!\n${settings.businessName}`;
    }

    const url = getEmailShareUrl(email, subject, body);
    window.location.href = url;
  };

  const getDocTitle = () => {
    if (viewDocument.type === 'quotation') return `Quotation ${viewDocument.data.quotationNumber}`;
    if (viewDocument.type === 'invoice') return `Invoice ${viewDocument.data.invoiceNumber}`;
    if (viewDocument.type === 'receipt') return `Receipt ${viewDocument.data.paymentNumber}`;
    return 'Document Preview';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block">
              A4 Document Preview
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{getDocTitle()}</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleEmailShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Share via Email"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </button>

            <button
              onClick={closeDocumentView}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Scroll Canvas */}
        <div className="overflow-y-auto p-4 md:p-8 bg-slate-100 flex-1">
          {viewDocument.type === 'quotation' && (
            <QuotationDocument quotation={viewDocument.data} settings={settings} />
          )}
          {viewDocument.type === 'invoice' && (
            <InvoiceDocument invoice={viewDocument.data} settings={settings} />
          )}
          {viewDocument.type === 'receipt' && (
            <ReceiptDocument payment={viewDocument.data} settings={settings} />
          )}
        </div>
      </div>
    </div>
  );
};
