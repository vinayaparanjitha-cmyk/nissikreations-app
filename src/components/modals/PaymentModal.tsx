import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { formatCurrency, getTodayString } from '../../utils/formatters';

export const PaymentModal: React.FC = () => {
  const { activeModal, modalInitialData, closeModal, addPayment, invoices, openDocumentView, settings } = useApp();

  const [date, setDate] = useState(getTodayString());
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);

  useEffect(() => {
    if (modalInitialData) {
      if (modalInitialData.invoiceId) {
        setInvoiceId(modalInitialData.invoiceId);
        const inv = invoices.find((i) => i.id === modalInitialData.invoiceId);
        if (inv) {
          setAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.grandTotal);
        }
      }
    } else if (invoices.length > 0) {
      const pendingInv = invoices.find((i) => i.balanceDue > 0) || invoices[0];
      if (pendingInv) {
        setInvoiceId(pendingInv.id);
        setAmount(pendingInv.balanceDue > 0 ? pendingInv.balanceDue : pendingInv.grandTotal);
      }
    }
  }, [modalInitialData, invoices]);

  if (activeModal !== 'payment') return null;

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.grandTotal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      alert('Please select an invoice');
      return;
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert('Please enter a valid positive payment amount');
      return;
    }

    const newPayment = addPayment({
      date,
      customerId: selectedInvoice.customerId,
      customerName: selectedInvoice.customerName,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      amount: payAmount,
      paymentMethod,
      referenceNumber,
      notes,
    });

    closeModal();

    // Prompt user to view / print official receipt
    setTimeout(() => {
      openDocumentView('receipt', newPayment);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Cash & Bank Collections
            </span>
            <h2 className="text-lg font-bold text-white">Record Customer Payment</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-slate-50/50">
          {/* Select Invoice */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Invoice to Settle *</label>
            <select
              required
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2.5 outline-none font-medium"
            >
              <option value="">-- Choose Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.customerName} (Bal: {formatCurrency(inv.balanceDue, settings.currencySymbol)})
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Summary Box */}
          {selectedInvoice && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Customer:</span>
                <span className="font-semibold text-slate-900">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Invoice Total:</span>
                <span className="font-mono font-medium">{formatCurrency(selectedInvoice.grandTotal, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Already Paid:</span>
                <span className="font-mono font-medium">{formatCurrency(selectedInvoice.amountPaid, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900 text-xs">
                <span>Outstanding Balance:</span>
                <span className="font-mono text-orange-600">
                  {formatCurrency(selectedInvoice.balanceDue, settings.currencySymbol)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-800 mb-1">Amount Received (₹) *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-50/60 border border-emerald-300 rounded-lg p-2.5 outline-none font-mono font-bold text-emerald-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-semibold text-slate-800"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="QR Payment">Store QR Code</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Txn Ref / UTR / Cheque No</label>
              <input
                type="text"
                placeholder="e.g. UPI-998811 or UTR-123"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Remarks</label>
            <input
              type="text"
              placeholder="e.g. Received via GPay QR, final settlement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
            >
              Record Payment & View Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
