import React, { useMemo, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Edit2,
  Filter,
  Layers,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ExpensesView: React.FC = () => {
  const { expenses, openModal, deleteExpense, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchQuery =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.vendorName && e.vendorName.toLowerCase().includes(search.toLowerCase())) ||
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchQuery && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const stats = useMemo(() => {
    const total = expenses.reduce((acc, e) => acc + e.amount, 0);

    const materialExpenses = expenses
      .filter((e) => e.category === 'Flex Material' || e.category === 'Vinyl & Lamination' || e.category === 'Printing Inks & Solvents')
      .reduce((acc, e) => acc + e.amount, 0);

    const overheadExpenses = expenses
      .filter((e) => e.category === 'Workshop Rent' || e.category === 'Electricity & Power' || e.category === 'Machine Maintenance & Spares')
      .reduce((acc, e) => acc + e.amount, 0);

    const staffExpenses = expenses
      .filter((e) => e.category === 'Staff Wages' || e.category === 'Delivery & Transport')
      .reduce((acc, e) => acc + e.amount, 0);

    return { total, materialExpenses, overheadExpenses, staffExpenses, count: expenses.length };
  }, [expenses]);

  const handleDelete = (expense: Expense) => {
    openConfirmation({
      title: 'Delete Expense Entry?',
      message: `Are you sure you want to remove the expense "${expense.description}" (${formatCurrency(expense.amount, settings.currencySymbol)})?`,
      confirmLabel: 'Delete Expense',
      isDangerous: true,
      onConfirm: () => {
        deleteExpense(expense.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Cost & Overhead Tracking
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log printing raw materials (flex rolls, vinyls, inks), rent, machine upkeep and operator wages.
          </p>
        </div>

        <button
          onClick={() => openModal('expense')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Expenditures</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatCurrency(stats.total, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{stats.count} logged entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-orange-700 block">Raw Materials & Inks</span>
          <p className="text-xl font-black text-orange-800 font-mono mt-1">
            {formatCurrency(stats.materialExpenses, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Flex rolls, vinyl, inks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-700 block">Workshop & Utilities</span>
          <p className="text-xl font-black text-indigo-800 font-mono mt-1">
            {formatCurrency(stats.overheadExpenses, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Rent, power, maintenance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Staff & Logistics</span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1">
            {formatCurrency(stats.staffExpenses, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">Operator wages & deliveries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, category, vendor, bill #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {(settings.customExpenseCategories || []).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No expenses found</p>
            <p className="text-xs text-slate-400">
              {search || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or category filter.'
                : 'Click "Add Expense" to log your first business expenditure.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description / Item</th>
                  <th className="py-3.5 px-4">Vendor / Paid To</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{formatDate(exp.date)}</td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                      {exp.description}
                      {exp.notes && (
                        <span className="block text-[10px] text-slate-400 font-normal truncate">
                          {exp.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {exp.vendorName || '-'}
                      {exp.referenceNumber && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Ref: {exp.referenceNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {exp.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                      {formatCurrency(exp.amount, settings.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal('expense', exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
