import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Layers,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrdersView: React.FC = () => {
  const { orders, openModal, updateOrder, deleteOrder, openConfirmation, settings } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchQuery =
        ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(search.toLowerCase()) ||
        ord.customerPhone.includes(search) ||
        ord.description.toLowerCase().includes(search.toLowerCase()) ||
        (ord.dimensions && ord.dimensions.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || ord.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const inPrinting = orders.filter((o) => o.status === 'Printing').length;
    const ready = orders.filter((o) => o.status === 'Ready').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;

    return { total, active, inPrinting, ready, delivered };
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrder(orderId, { status: newStatus });
  };

  const handleDelete = (order: Order) => {
    openConfirmation({
      title: `Delete Order ${order.orderNumber}?`,
      message: `Are you sure you want to remove job ticket for ${order.customerName} (${order.description})?`,
      confirmLabel: 'Delete Order',
      isDangerous: true,
      onConfirm: () => {
        deleteOrder(order.id);
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Workshop & Job Tracking
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Printing Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage flex, vinyl, signboard and banner jobs through designing, printing and delivery stages.
          </p>
        </div>

        <button
          onClick={() => openModal('order')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Order Job</span>
        </button>
      </div>

      {/* Workshop KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Job Tickets</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-400">All registered jobs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-orange-700 block">In Production Queue</span>
          <p className="text-xl font-black text-orange-800 font-mono mt-1">{stats.active}</p>
          <span className="text-[10px] text-orange-600 font-medium">Pending completion</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-700 block">On Printing Press</span>
          <p className="text-xl font-black text-indigo-800 font-mono mt-1">{stats.inPrinting}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Active printing stage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Ready For Dispatch</span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1">{stats.ready}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Ready for customer pickup</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, description, size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'New', 'Confirmed', 'Designing', 'Printing', 'Ready', 'Delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Jobs' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-700 text-sm">No printing orders found</p>
            <p className="text-xs text-slate-400">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or status tab.'
                : 'Click "New Order Job" to schedule your first job.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Job Specs / Description</th>
                  <th className="py-3.5 px-4">Delivery Due</th>
                  <th className="py-3.5 px-4 text-right">Job Value</th>
                  <th className="py-3.5 px-4 text-center">Stage / Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const statusColors: Record<OrderStatus, string> = {
                    New: 'bg-slate-100 text-slate-800 border-slate-300',
                    Confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
                    Designing: 'bg-purple-50 text-purple-800 border-purple-200',
                    Printing: 'bg-amber-50 text-amber-800 border-amber-200',
                    Ready: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    Delivered: 'bg-slate-100 text-slate-600 border-slate-200',
                    Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {formatDate(ord.orderDate)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{ord.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block">{ord.description}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {ord.dimensions && <span className="font-mono bg-slate-100 px-1 rounded">{ord.dimensions}</span>}
                          <span>Qty: {ord.quantity}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-orange-800 block">{formatDate(ord.deliveryDate)}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <span className="font-bold text-slate-900 block">{formatCurrency(ord.amount, settings.currencySymbol)}</span>
                        {ord.advancePaid > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Adv: {formatCurrency(ord.advancePaid, settings.currencySymbol)}
                          </span>
                        )}
                      </td>

                      {/* Quick stage selector */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${statusColors[ord.status]}`}
                        >
                          <option value="New">New</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Designing">Designing</option>
                          <option value="Printing">Printing</option>
                          <option value="Ready">Ready</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal('order', ord)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Order Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(ord)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
