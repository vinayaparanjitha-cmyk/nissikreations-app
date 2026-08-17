import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';

export const CustomerModal: React.FC = () => {
  const { activeModal, modalInitialData, closeModal, addCustomer, updateCustomer } = useApp();

  const isEditing = Boolean(modalInitialData && modalInitialData.id);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (modalInitialData && modalInitialData.id) {
      setName(modalInitialData.name || '');
      setPhone(modalInitialData.phone || '');
      setEmail(modalInitialData.email || '');
      setAddress(modalInitialData.address || '');
      setGstNumber(modalInitialData.gstNumber || '');
      setNotes(modalInitialData.notes || '');
    }
  }, [modalInitialData]);

  if (activeModal !== 'customer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a customer or business name');
      return;
    }

    if (isEditing) {
      updateCustomer(modalInitialData.id, {
        name,
        phone,
        email,
        address,
        gstNumber,
        notes,
      });
    } else {
      addCustomer({
        name,
        phone,
        email,
        address,
        gstNumber,
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
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              {isEditing ? 'Customer Directory' : 'New Contact Profile'}
            </span>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer / Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Supermarket & Stores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 9849012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Postal / Billing Address</label>
            <textarea
              rows={2}
              placeholder="Shop / Unit, Street, Area, City, Pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
            <input
              type="text"
              placeholder="36AAACR1234F1Z8"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Notes / Specifications</label>
            <textarea
              rows={2}
              placeholder="Preferred material grades, usual delivery location, credit notes..."
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
              className="px-5 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
