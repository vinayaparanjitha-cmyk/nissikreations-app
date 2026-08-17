import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, Quotation, QuotationStatus } from '../../types';
import { calculateDocumentTotals, calculateItemTotal, getTodayString } from '../../utils/formatters';

export const QuotationModal: React.FC = () => {
  const { activeModal, modalInitialData, closeModal, addQuotation, updateQuotation, customers, products, settings } = useApp();

  const isEditing = Boolean(modalInitialData && modalInitialData.id);

  // Form State
  const [date, setDate] = useState(getTodayString());
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstNumber, setCustomerGstNumber] = useState('');
  const [status, setStatus] = useState<QuotationStatus>('Draft');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(settings.defaultTerms);

  const [items, setItems] = useState<DocumentItem[]>([
    {
      id: 'item-1',
      description: '',
      width: undefined,
      height: undefined,
      quantity: 1,
      unit: 'sq.ft',
      rate: 0,
      discount: 0,
      taxPercent: settings.defaultGstRate || 18,
      total: 0,
    },
  ]);

  useEffect(() => {
    if (modalInitialData) {
      if (modalInitialData.id) {
        // Editing existing
        setDate(modalInitialData.date || getTodayString());
        setValidUntil(modalInitialData.validUntil || '');
        setCustomerId(modalInitialData.customerId || '');
        setCustomerName(modalInitialData.customerName || '');
        setCustomerPhone(modalInitialData.customerPhone || '');
        setCustomerEmail(modalInitialData.customerEmail || '');
        setCustomerAddress(modalInitialData.customerAddress || '');
        setCustomerGstNumber(modalInitialData.customerGstNumber || '');
        setStatus(modalInitialData.status || 'Draft');
        setNotes(modalInitialData.notes || '');
        setTerms(modalInitialData.termsAndConditions || settings.defaultTerms);
        if (modalInitialData.items && modalInitialData.items.length > 0) {
          setItems(modalInitialData.items);
        }
      } else if (modalInitialData.customerId) {
        // Prefilled customer
        const cust = customers.find((c) => c.id === modalInitialData.customerId);
        if (cust) {
          setCustomerId(cust.id);
          setCustomerName(cust.name);
          setCustomerPhone(cust.phone);
          setCustomerEmail(cust.email);
          setCustomerAddress(cust.address);
          setCustomerGstNumber(cust.gstNumber || '');
        }
      }
    }
  }, [modalInitialData, customers, settings]);

  if (activeModal !== 'quotation') return null;

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    if (!id) return;
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
      setCustomerEmail(cust.email);
      setCustomerAddress(cust.address);
      setCustomerGstNumber(cust.gstNumber || '');
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    const current = newItems[index];
    const updated = {
      ...current,
      description: prod.name + (prod.description ? ` (${prod.description})` : ''),
      unit: prod.unit,
      rate: prod.defaultRate,
      taxPercent: prod.defaultTaxPercent,
    };
    updated.total = calculateItemTotal(updated);
    newItems[index] = updated;
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const newItems = [...items];
    const current = { ...newItems[index], [field]: value };
    current.total = calculateItemTotal(current);
    newItems[index] = current;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        description: '',
        width: undefined,
        height: undefined,
        quantity: 1,
        unit: 'sq.ft',
        rate: 0,
        discount: 0,
        taxPercent: settings.defaultGstRate || 18,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = calculateDocumentTotals(items);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter or select a customer name');
      return;
    }

    const cleanedItems = items.filter((it) => it.description.trim().length > 0);
    if (cleanedItems.length === 0) {
      alert('Please enter at least one item description');
      return;
    }

    if (isEditing) {
      updateQuotation(modalInitialData.id, {
        date,
        validUntil,
        customerId: customerId || `cust-${Date.now()}`,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerGstNumber,
        items: cleanedItems,
        status,
        notes,
        termsAndConditions: terms,
      });
    } else {
      addQuotation({
        date,
        validUntil,
        customerId: customerId || `cust-${Date.now()}`,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerGstNumber,
        items: cleanedItems,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        grandTotal: totals.grandTotal,
        status,
        notes,
        termsAndConditions: terms,
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              {isEditing ? 'Modify Record' : 'New Transaction'}
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? `Edit Quotation (${modalInitialData.quotationNumber})` : 'Create Quotation'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-50/50">
          {/* Customer & Basic Info Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Customer Details</span>
              <span className="text-xs font-normal text-slate-400 lowercase">Choose existing or enter new</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Existing Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">-- Choose Customer (or type below) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quotation Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Supermarket"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9849012345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="customer@domain.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="36AAAAA0000A1Z5"
                  value={customerGstNumber}
                  onChange={(e) => setCustomerGstNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Address</label>
                <input
                  type="text"
                  placeholder="Street, Area, City"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quotation Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none font-semibold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                  {isEditing && <option value="Converted to Invoice">Converted to Invoice</option>}
                </select>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Printing Items & Services ({items.length})
              </h3>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2.5 items-end text-xs"
                >
                  {/* Quick Catalog Autofill */}
                  <div className="col-span-12 md:col-span-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-700">Item Description *</label>
                      <select
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="text-[10px] text-orange-700 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5 outline-none"
                      >
                        <option value="">⚡ Autofill from Catalog</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Star Frontlit Flex Banner"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {/* Width & Height */}
                  <div className="col-span-3 md:col-span-1">
                    <label className="font-medium text-slate-500 block mb-1">W (ft/in)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="W"
                      value={item.width || ''}
                      onChange={(e) => handleItemChange(idx, 'width', parseFloat(e.target.value) || undefined)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-1">
                    <label className="font-medium text-slate-500 block mb-1">H (ft/in)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="H"
                      value={item.height || ''}
                      onChange={(e) => handleItemChange(idx, 'height', parseFloat(e.target.value) || undefined)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono"
                    />
                  </div>

                  {/* Qty & Unit */}
                  <div className="col-span-3 md:col-span-1">
                    <label className="font-semibold text-slate-700 block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-semibold"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-1">
                    <label className="font-medium text-slate-500 block mb-1">Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                    >
                      <option value="sq.ft">sq.ft</option>
                      <option value="pcs">pcs</option>
                      <option value="sets">sets</option>
                      <option value="sq.inch">sq.inch</option>
                      <option value="meter">meter</option>
                      <option value="hours">hours</option>
                    </select>
                  </div>

                  {/* Rate */}
                  <div className="col-span-4 md:col-span-1">
                    <label className="font-semibold text-slate-700 block mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono font-semibold"
                    />
                  </div>

                  {/* GST % */}
                  <div className="col-span-3 md:col-span-1">
                    <label className="font-medium text-slate-500 block mb-1">GST %</label>
                    <select
                      value={item.taxPercent}
                      onChange={(e) => handleItemChange(idx, 'taxPercent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  {/* Total */}
                  <div className="col-span-4 md:col-span-1 text-right">
                    <label className="font-bold text-slate-700 block mb-1">Total</label>
                    <div className="p-2 bg-slate-200/70 border border-slate-300 rounded font-mono font-bold text-slate-900 text-right">
                      ₹{item.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 flex justify-center pb-2">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className={`p-1.5 rounded transition-colors ${
                        items.length <= 1
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals, Remarks & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or job specifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-[11px] outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                Calculation Summary
              </h3>

              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Base Items):</span>
                <span className="font-mono font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Item Discounts:</span>
                  <span className="font-mono">- ₹{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Total GST / Tax:</span>
                <span className="font-mono font-medium">₹{totals.taxTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 border-t-2 border-slate-900 text-base font-black text-slate-900 bg-orange-50/60 p-3 rounded-lg">
                <span>Grand Total:</span>
                <span className="font-mono text-orange-600">₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Generate Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
