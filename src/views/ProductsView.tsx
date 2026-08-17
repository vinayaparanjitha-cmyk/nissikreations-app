import React, { useState } from 'react';
import {
  Edit2,
  Layers,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductService } from '../types';
import { formatCurrency } from '../utils/formatters';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Flex');
  const [unit, setUnit] = useState<'sq.ft' | 'pcs' | 'sets' | 'sq.inch' | 'meter' | 'hours'>('sq.ft');
  const [defaultRate, setDefaultRate] = useState<number>(0);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState<number>(18);
  const [description, setDescription] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Flex');
    setUnit('sq.ft');
    setDefaultRate(0);
    setDefaultTaxPercent(18);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductService) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setUnit(p.unit);
    setDefaultRate(p.defaultRate);
    setDefaultTaxPercent(p.defaultTaxPercent);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        category,
        unit,
        defaultRate: Number(defaultRate) || 0,
        defaultTaxPercent: Number(defaultTaxPercent) || 18,
        description,
      });
    } else {
      addProduct({
        name,
        category,
        unit,
        defaultRate: Number(defaultRate) || 0,
        defaultTaxPercent: Number(defaultTaxPercent) || 18,
        description,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (p: ProductService) => {
    openConfirmation({
      title: `Delete ${p.name}?`,
      message: `Are you sure you want to remove "${p.name}" from your service & pricing catalog?`,
      confirmLabel: 'Delete Product',
      isDangerous: true,
      onConfirm: () => {
        deleteProduct(p.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Price List & Catalog
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products & Services</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your standard media types, default rates per sq.ft / pcs, and tax percentages for instant autofill.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media / Service</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, flex grades, acrylic, vinyl..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors text-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{p.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {p.description && <p className="text-[11px] text-slate-500 mt-1.5">{p.description}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Default Rate</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(p.defaultRate, settings.currencySymbol)} / {p.unit}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">GST Rate</span>
                <span className="font-mono font-semibold text-slate-700">{p.defaultTaxPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Catalog Service' : 'Add New Media / Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Media Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Star Frontlit Flex Banner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
                  >
                    <option value="Flex">Flex Printing</option>
                    <option value="Vinyl">Vinyl & Decals</option>
                    <option value="Signboards">Signboards & Letters</option>
                    <option value="Design">Design Service</option>
                    <option value="Offset">Offset & Cards</option>
                    <option value="Apparel">T-Shirts & Mugs</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculation Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-medium"
                  >
                    <option value="sq.ft">sq.ft (Square Feet)</option>
                    <option value="pcs">pcs (Per Piece)</option>
                    <option value="sets">sets (Per Set)</option>
                    <option value="sq.inch">sq.inch (Square Inch)</option>
                    <option value="meter">meter (Running Meter)</option>
                    <option value="hours">hours (Hourly Design)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Rate (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default GST %</label>
                  <select
                    value={defaultTaxPercent}
                    onChange={(e) => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specifications / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Thickness (gsm/microns), media brand, finishing included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
