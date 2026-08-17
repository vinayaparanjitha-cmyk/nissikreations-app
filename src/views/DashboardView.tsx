import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Eye,
  FileCheck,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayString } from '../utils/formatters';

type DateFilter = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

export const DashboardView: React.FC = () => {
  const {
    invoices,
    quotations,
    orders,
    payments,
    expenses,
    openModal,
    openDocumentView,
    convertQuotationToInvoice,
    setActiveTab,
    settings,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(getTodayString());

  const todayStr = getTodayString();

  // Metrics Calculations
  const metrics = useMemo(() => {
    // Today
    const todayInvoices = invoices.filter((i) => i.date === todayStr);
    const todaySales = todayInvoices.reduce((acc, i) => acc + i.grandTotal, 0);

    const todayExpensesList = expenses.filter((e) => e.date === todayStr);
    const todayExpenses = todayExpensesList.reduce((acc, e) => acc + e.amount, 0);

    const todayPayments = payments.filter((p) => p.date === todayStr);
    const todayCollections = todayPayments.reduce((acc, p) => acc + p.amount, 0);
    const todayProfit = todayCollections - todayExpenses; // Cash profit / net

    // Total Overall
    const totalSales = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
    const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalNetProfit = totalCollected - totalExpenses;

    // Orders
    const pendingOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
    const completedOrders = orders.filter((o) => o.status === 'Delivered');

    return {
      todaySales,
      todayExpenses,
      todayProfit,
      todayCollections,
      totalSales,
      totalCollected,
      totalOutstanding,
      totalExpenses,
      totalNetProfit,
      pendingOrdersCount: pendingOrders.length,
      completedOrdersCount: completedOrders.length,
      totalQuotationsCount: quotations.length,
      totalInvoicesCount: invoices.length,
    };
  }, [invoices, expenses, payments, orders, quotations, todayStr]);

  // Chart Data based on dateFilter
  const chartData = useMemo(() => {
    const now = new Date();
    const days: { dateStr: string; label: string; sales: number; expenses: number; profit: number }[] = [];

    let daysToInclude = 14;
    if (dateFilter === 'today') daysToInclude = 1;
    else if (dateFilter === 'this_week') daysToInclude = 7;
    else if (dateFilter === 'this_month') daysToInclude = 30;
    else if (dateFilter === 'this_year') daysToInclude = 12; // months

    if (dateFilter === 'this_year') {
      // Month by month for current year
      const year = now.getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let m = 0; m < 12; m++) {
        const monthPrefix = `${year}-${String(m + 1).padStart(2, '0')}`;
        const monthSales = invoices
          .filter((i) => i.date.startsWith(monthPrefix))
          .reduce((sum, i) => sum + i.grandTotal, 0);
        const monthExp = expenses
          .filter((e) => e.date.startsWith(monthPrefix))
          .reduce((sum, e) => sum + e.amount, 0);
        const monthCollections = payments
          .filter((p) => p.date.startsWith(monthPrefix))
          .reduce((sum, p) => sum + p.amount, 0);
        days.push({
          dateStr: monthPrefix,
          label: monthNames[m],
          sales: Math.round(monthSales),
          expenses: Math.round(monthExp),
          profit: Math.round(monthCollections - monthExp),
        });
      }
      return days;
    }

    if (dateFilter === 'custom') {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.min(60, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

      for (let i = diffDays - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const daySales = invoices
          .filter((inv) => inv.date === dStr)
          .reduce((sum, inv) => sum + inv.grandTotal, 0);
        const dayExp = expenses
          .filter((e) => e.date === dStr)
          .reduce((sum, e) => sum + e.amount, 0);
        const dayColl = payments
          .filter((p) => p.date === dStr)
          .reduce((sum, p) => sum + p.amount, 0);

        days.push({
          dateStr: dStr,
          label: formatDate(dStr).slice(0, 6),
          sales: Math.round(daySales),
          expenses: Math.round(dayExp),
          profit: Math.round(dayColl - dayExp),
        });
      }
      return days;
    }

    // Default daily backwards from today
    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const daySales = invoices
        .filter((inv) => inv.date === dStr)
        .reduce((sum, inv) => sum + inv.grandTotal, 0);
      const dayExp = expenses
        .filter((e) => e.date === dStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const dayColl = payments
        .filter((p) => p.date === dStr)
        .reduce((sum, p) => sum + p.amount, 0);

      days.push({
        dateStr: dStr,
        label: formatDate(dStr).slice(0, 6),
        sales: Math.round(daySales),
        expenses: Math.round(dayExp),
        profit: Math.round(dayColl - dayExp),
      });
    }

    return days;
  }, [dateFilter, customStart, customEnd, invoices, expenses, payments]);

  // Recent Invoices & Pending Orders
  const recentInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [invoices]);

  const urgentOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled')
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
      .slice(0, 4);
  }, [orders]);

  const pendingQuotations = useMemo(() => {
    return quotations
      .filter((q) => q.status === 'Sent' || q.status === 'Accepted' || q.status === 'Draft')
      .slice(0, 4);
  }, [quotations]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Business Overview
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            {settings.businessName} Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Flex printing, vinyl, signboards & digital production management.
          </p>
        </div>

        {/* Prominent Quick Actions Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openModal('quotation')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>+ Quotation</span>
          </button>

          <button
            onClick={() => openModal('invoice')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>+ Tax Invoice</span>
          </button>

          <button
            onClick={() => openModal('order')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4 text-sky-600" />
            <span>+ Order Job</span>
          </button>

          <button
            onClick={() => openModal('payment')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => openModal('expense')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-rose-600" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today's Snapshot vs Overall Position
          </h2>
          <span className="text-[11px] font-medium text-slate-500">Date: {formatDate(todayStr)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Today's Sales */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Today's Sales</span>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatCurrency(metrics.todaySales, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>Billed today</span>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Today's Expenses</span>
            <p className="text-lg font-black text-rose-600 font-mono mt-1">
              {formatCurrency(metrics.todayExpenses, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>Workshop outlays</span>
            </div>
          </div>

          {/* Today's Profit */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Today's Net Cash</span>
            <p className={`text-lg font-black font-mono mt-1 ${metrics.todayProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(metrics.todayProfit, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>Cash In vs Out</span>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Sales</span>
            <p className="text-lg font-black text-slate-900 font-mono mt-1">
              {formatCurrency(metrics.totalSales, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>{metrics.totalInvoicesCount} invoices</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Expenses</span>
            <p className="text-lg font-black text-rose-600 font-mono mt-1">
              {formatCurrency(metrics.totalExpenses, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <span>Materials + overheads</span>
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Net Realized Profit</span>
            <p className={`text-lg font-black font-mono mt-1 ${metrics.totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(metrics.totalNetProfit, settings.currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
              <span>Receipts − Expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pending Payments / Outstanding */}
        <div
          onClick={() => setActiveTab('invoices')}
          className="bg-amber-50/70 hover:bg-amber-50 p-4 rounded-xl border border-amber-200 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Balance</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 font-mono mt-2">
            {formatCurrency(metrics.totalOutstanding, settings.currencySymbol)}
          </p>
          <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
            <span>Click to view unpaid invoices</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Pending Orders in Production */}
        <div
          onClick={() => setActiveTab('orders')}
          className="bg-orange-50/70 hover:bg-orange-50 p-4 rounded-xl border border-orange-200 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Active Jobs</span>
            <Package className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-black text-orange-900 font-mono mt-2">
            {metrics.pendingOrdersCount} <span className="text-xs font-semibold text-orange-700">In Production</span>
          </p>
          <p className="text-[11px] text-orange-700 mt-1 flex items-center gap-1">
            <span>{metrics.completedOrdersCount} delivered successfully</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Quotations Count */}
        <div
          onClick={() => setActiveTab('quotations')}
          className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quotations</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono mt-2">
            {metrics.totalQuotationsCount} <span className="text-xs font-semibold text-slate-500">Estimates</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
            <span>Manage price proposals</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Invoices Count */}
        <div
          onClick={() => setActiveTab('invoices')}
          className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tax Invoices</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono mt-2">
            {metrics.totalInvoicesCount} <span className="text-xs font-semibold text-slate-500">Bills</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
            <span>View billing history</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Dynamic Sales / Expenses / Profit Chart Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>Sales, Expenses & Profit Trend</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visual analytics for billing revenue, expenditures, and net collections.
            </p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['today', 'this_week', 'this_month', 'this_year', 'custom'] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  dateFilter === f
                    ? 'bg-white text-orange-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range selector if 'custom' is active */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white border border-slate-300 rounded p-1.5 outline-none"
            />
            <span className="font-semibold text-slate-700">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white border border-slate-300 rounded p-1.5 outline-none"
            />
          </div>
        )}

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '11px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(val) => (
                  <span className="capitalize text-slate-700 font-semibold">{val}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Daily Sales"
                stroke="#EA580C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#E11D48"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Production & Transaction Activity Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Printing Orders In Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Printing Jobs</h3>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
            >
              View All ({orders.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {urgentOrders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-500" />
              <p>All printing orders are delivered! No pending jobs.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{ord.orderNumber}</span>
                      <span className="font-semibold text-slate-700">{ord.customerName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate max-w-xs">{ord.description}</p>
                    <p className="text-[10px] text-slate-400">
                      Delivery: <span className="font-semibold text-orange-700">{formatDate(ord.deliveryDate)}</span>
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                      {ord.status}
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(ord.amount, settings.currencySymbol)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tax Invoices & Billing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Invoices</h3>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer flex items-center gap-1"
            >
              View Invoices ({invoices.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>
                    <span className="font-semibold text-slate-700">{inv.customerName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Date: {formatDate(inv.date)} | Due: {formatDate(inv.dueDate)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, settings.currencySymbol)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <button
                    onClick={() => openDocumentView('invoice', inv)}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="View & Print Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Quotations ready for Conversion */}
      {pendingQuotations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-slate-50 p-5 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>Pending Customer Quotations ({pendingQuotations.length})</span>
            </h3>
            <button
              onClick={() => setActiveTab('quotations')}
              className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
            >
              All Quotations
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {pendingQuotations.map((qtn) => (
              <div
                key={qtn.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200/70 shadow-2xs space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 font-mono">{qtn.quotationNumber}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {qtn.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-700 mt-1 truncate">{qtn.customerName}</p>
                  <p className="text-[11px] text-slate-500">
                    Total: <span className="font-mono font-bold text-slate-800">{formatCurrency(qtn.grandTotal, settings.currencySymbol)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openDocumentView('quotation', qtn)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] text-center cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => convertQuotationToInvoice(qtn.id)}
                    className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[11px] text-center cursor-pointer shadow-2xs"
                  >
                    Convert → Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
