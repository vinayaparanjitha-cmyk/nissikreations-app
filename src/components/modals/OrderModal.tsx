import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { getTodayString } from '../../utils/formatters';

export const OrderModal: React.FC = () => {
  const { activeModal, modalInitialData, closeModal, addOrder, updateOrder, customers } = useApp();

  const isEditing = Boolean(modalInitialData && modalInitialData.id);

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderDate, setOrderDate] = useState(getTodayString());
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [status, setStatus] = useState<OrderStatus>('New');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (modalInitialData) {
      if (modalInitialData.id) {
        setCustomerId(modalInitialData.customerId || '');
        setCustomerName(modalInitialData.customerName || '');
        setCustomerPhone(modalInitialData.customerPhone || '');
        setOrderDate(modalInitialData.orderDate || getTodayString());
        setDeliveryDate(modalInitialData.deliveryDate || '');
        setDescription(modalInitialData.description || '');
        setDimensions(modalInitialData.dimensions || '');
        setQuantity(modalInitialData.quantity || 1);
        setAmount(modalInitialData.amount || 0);
        setAdvancePaid(modalInitialData.advancePaid || 0);
        setStatus(modalInitialData.status || 'New');
        setNotes(modalInitialData.notes || '');
      } else if (modalInitialData.customerId) {
        const cust = customers.find((c) => c.id === modalInitialData.customerId);
        if (cust) {
          setCustomerId(cust.id);
          setCustomerName(cust.name);
          setCustomerPhone(cust.phone);
        }
      }
    }
  }, [modalInitialData, customers]);

  if (activeModal !== 'order') return null;

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    if (!id) return;
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
    }
  };

  const calculatedBalance = Math.max(0, (Number(amount) || 0) - (Number(advancePaid) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !description.trim()) {
      alert('Please fill customer name and order description');
      return;
    }

    if (isEditing) {
      updateOrder(modalInitialData.id, {
        customerId: customerId || `cust-${Date.now()}`,
        customerName,
        customerPhone,
        orderDate,
        deliveryDate,
        description,
        dimensions,
        quantity: Number(quantity) || 1,
        amount: Number(amount) || 0,
        advancePaid: Number(advancePaid) || 0,
        balance: calculatedBalance,
        status,
        notes,
      });
    } else {
      addOrder({
        customerId: customerId || `cust-${Date.now()}`,
        customerName,
        customerPhone,
        orderDate,
        deliveryDate,
        description,
        dimensions,
        quantity: Number(quantity) || 1,
        amount: Number(amount) || 0,
        advancePaid: Number(advancePaid) || 0,
        balance: calculatedBalance,
        status,
        notes,
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              {isEditing ? 'Modify Print Job' : 'Workshop Job Ticket'}
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? `Edit Order (${modalInitialData.orderNumber})` : 'New Printing Order'}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 bg-slate-50/50 text-xs">
          {/* Customer Selection */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block font-semibold text-slate-700">Customer Selection</label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-lg p-2.5 outline-none"
            >
              <option value="">-- Choose Existing Customer or Type Below --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Supermarket"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9849012345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Job Specifications */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
              Job Specifications
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description / Media Type *</label>
              <input
                type="text"
                required
                placeholder="e.g. Star Frontlit Flex Banner with Eyelets"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dimensions / Specs</label>
                <input
                  type="text"
                  placeholder="e.g. 10x4 ft, 3mm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workflow Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-bold text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Designing">Designing</option>
                  <option value="Printing">Printing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Date</label>
                <input
                  type="date"
                  required
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-semibold text-orange-800 bg-orange-50/30"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Advance */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Order Amount (₹) *</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-800 mb-1">Advance Token Paid (₹)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2.5 outline-none font-mono font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remaining Balance</label>
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 text-sm">
                ₹{calculatedBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Internal Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="Design links, eyelet placement, special finishing notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-6 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer"
            >
              {isEditing ? 'Save Order' : 'Create Order Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
