import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, PaymentMethod } from '../../types';
import { getTodayString } from '../../utils/formatters';

export const ExpenseModal: React.FC = () => {
  const { activeModal, modalInitialData, closeModal, addExpense, updateExpense, settings } = useApp();

  const isEditing = Boolean(modalInitialData && modalInitialData.id);

  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState('Flex Material');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [vendorName, setVendorName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (modalInitialData && modalInitialData.id) {
      setDate(modalInitialData.date || getTodayString());
      setCategory(modalInitialData.category || 'Flex Material');
      setDescription(modalInitialData.description || '');
      setAmount(modalInitialData.amount || 0);
      setPaymentMethod(modalInitialData.paymentMethod || 'Cash');
      setVendorName(modalInitialData.vendorName || '');
      setReferenceNumber(modalInitialData.referenceNumber || '');
      setNotes(modalInitialData.notes || '');
    }
  }, [modalInitialData]);

  if (activeModal !== 'expense') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter an expense description');
      return;
    }

    const expAmount = Number(amount);
    if (isNaN(expAmount) || expAmount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    if (isEditing) {
      updateExpense(modalInitialData.id, {
        date,
        category,
        description,
        amount: expAmount,
        paymentMethod,
        vendorName,
        referenceNumber,
        notes,
      });
    } else {
      addExpense({
        date,
        category,
        description,
        amount: expAmount,
        paymentMethod,
        vendorName,
        referenceNumber,
        notes,
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              {isEditing ? 'Modify Expense' : 'Expenditure Entry'}
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Business Expense' : 'Add Business Expense'}
            </h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-medium"
              >
                {(settings.customExpenseCategories || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Item Bought *</label>
            <input
              type="text"
              required
              placeholder="e.g. Star Flex Media 10ft rolls purchase"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-rose-800 mb-1">Amount Spent (₹) *</label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-rose-50/60 border border-rose-300 rounded-lg p-2.5 outline-none font-mono font-bold text-rose-900 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                <option value="QR Payment">QR Payment</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Paid To (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sri Balaji Flex Media"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference / Bill No</label>
              <input
                type="text"
                placeholder="e.g. Bill #8892 or TXN-123"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Additional Notes</label>
            <input
              type="text"
              placeholder="e.g. Workshop overhead expense"
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
              className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer"
            >
              {isEditing ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
