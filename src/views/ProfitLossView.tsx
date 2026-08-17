import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Layers,
  PieChart as PieIcon,
  Printer,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTodayString } from '../utils/formatters';

type TimeRange = 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'all' | 'custom';

export const ProfitLossView: React.FC = () => {
  const { invoices, payments, expenses, settings } = useApp();

  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(getTodayString());

  // Filtered dataset calculations
  const pnlData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (timeRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeRange === 'last_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (timeRange === 'this_quarter') {
      const q = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), q * 3, 1);
      endDate = new Date(now.getFullYear(), (q + 1) * 3, 0);
    } else if (timeRange === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    } else if (timeRange === 'custom') {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      // 'all'
      startDate = new Date('2020-01-01');
      endDate = new Date('2030-12-31');
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const rangeInvoices = invoices.filter((i) => i.date >= startStr && i.date <= endStr);
    const rangePayments = payments.filter((p) => p.date >= startStr && p.date <= endStr);
    const rangeExpenses = expenses.filter((e) => e.date >= startStr && e.date <= endStr);

    const grossSalesBilled = rangeInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const totalCollected = rangePayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = rangeExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Direct Materials (Flex, Vinyl, Inks)
    const directMaterialExpenses = rangeExpenses
      .filter((e) => e.category === 'Flex Material' || e.category === 'Vinyl & Lamination' || e.category === 'Printing Inks & Solvents')
      .reduce((sum, e) => sum + e.amount, 0);

    // Overheads
    const overheadExpenses = totalExpenses - directMaterialExpenses;

    const grossProfit = grossSalesBilled - directMaterialExpenses;
    const grossMargin = grossSalesBilled > 0 ? (grossProfit / grossSalesBilled) * 100 : 0;

    const netProfitBilled = grossSalesBilled - totalExpenses;
    const netProfitCash = totalCollected - totalExpenses;
    const netMargin = grossSalesBilled > 0 ? (netProfitBilled / grossSalesBilled) * 100 : 0;

    // Expenses breakdown by category
    const categoryTotals: Record<string, number> = {};
    rangeExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryList = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      startStr,
      endStr,
      grossSalesBilled,
      totalCollected,
      totalExpenses,
      directMaterialExpenses,
      overheadExpenses,
      grossProfit,
      grossMargin,
      netProfitBilled,
      netProfitCash,
      netMargin,
      categoryList,
      invoicesCount: rangeInvoices.length,
      expensesCount: rangeExpenses.length,
    };
  }, [invoices, payments, expenses, timeRange, customStart, customEnd]);

  const COLORS = ['#EA580C', '#E11D48', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Financial Analysis & P&L Statement
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profit & Loss Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Realized margins, material costs vs overheads, and net profitability calculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print P&L Report</span>
          </button>
        </div>
      </div>

      {/* Time Range Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['this_month', 'last_month', 'this_quarter', 'this_year', 'all', 'custom'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-white text-orange-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded p-1.5 outline-none"
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded p-1.5 outline-none"
            />
          </div>
        )}

        <div className="text-xs text-slate-500 font-medium">
          Period: <span className="font-bold text-slate-800">{formatDate(pnlData.startStr)}</span> to{' '}
          <span className="font-bold text-slate-800">{formatDate(pnlData.endStr)}</span>
        </div>
      </div>

      {/* Core P&L Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Gross Revenue (Billed)</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrency(pnlData.grossSalesBilled, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{pnlData.invoicesCount} billed jobs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 block">Total Costs (COGS + OpEx)</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatCurrency(pnlData.totalExpenses, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-slate-400">{pnlData.expensesCount} expense items</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Net Realized Profit</span>
          <p className={`text-xl font-black font-mono mt-1 ${pnlData.netProfitCash >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {formatCurrency(pnlData.netProfitCash, settings.currencySymbol)}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Cash Collected − Outlays</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Operating Net Margin</span>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">
            {pnlData.netMargin.toFixed(1)}%
          </p>
          <span className="text-[10px] text-slate-400">Gross margin: {pnlData.grossMargin.toFixed(1)}%</span>
        </div>
      </div>

      {/* Financial Statement Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detailed P&L Statement */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Income & Expense Statement</h3>
            <p className="text-xs text-slate-500">Structured financial statement for the selected date range.</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue section */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span>1. Revenue & Inflows</span>
                <span className="text-emerald-700">Credit</span>
              </h4>

              <div className="divide-y divide-slate-100 mt-1">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600 pl-2">Total Sales Invoiced</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(pnlData.grossSalesBilled, settings.currencySymbol)}
                  </span>
                </div>
                <div className="py-2 flex justify-between bg-slate-50/50">
                  <span className="text-slate-600 pl-2">Actual Cash Received / Collected</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {formatCurrency(pnlData.totalCollected, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Cost of Goods */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span>2. Direct Material Costs (COGS)</span>
                <span className="text-rose-700">Debit</span>
              </h4>

              <div className="divide-y divide-slate-100 mt-1">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600 pl-2">Flex, Vinyl & Printing Inks</span>
                  <span className="font-mono font-semibold text-rose-600">
                    - {formatCurrency(pnlData.directMaterialExpenses, settings.currencySymbol)}
                  </span>
                </div>

                <div className="py-2 flex justify-between font-bold bg-amber-50/50 px-2 rounded">
                  <span className="text-amber-900">Gross Margin (Revenue − Material Costs)</span>
                  <span className="font-mono text-amber-900">
                    {formatCurrency(pnlData.grossProfit, settings.currencySymbol)} ({pnlData.grossMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Operating Overheads */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span>3. Operating & Administrative Overheads</span>
                <span className="text-rose-700">Debit</span>
              </h4>

              <div className="divide-y divide-slate-100 mt-1">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-600 pl-2">Rent, Power, Maintenance & Staff Wages</span>
                  <span className="font-mono font-semibold text-rose-600">
                    - {formatCurrency(pnlData.overheadExpenses, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Bottom Line */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Accrual Net Profit (Billed − All Expenses):</span>
                <span className="font-mono font-bold text-sm">
                  {formatCurrency(pnlData.netProfitBilled, settings.currencySymbol)}
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-slate-800 text-sm font-black">
                <span>Realized Cash Net Profit (Collected − All Expenses):</span>
                <span className="font-mono text-base">
                  {formatCurrency(pnlData.netProfitCash, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category Breakdown & Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Expense Allocation</h3>
              <p className="text-xs text-slate-500">Distribution of expenditures by type.</p>
            </div>

            {pnlData.categoryList.length > 0 ? (
              <div className="space-y-3 pt-3">
                {pnlData.categoryList.map((cat, idx) => {
                  const percent = pnlData.totalExpenses > 0 ? (cat.value / pnlData.totalExpenses) * 100 : 0;
                  return (
                    <div key={cat.name} className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(cat.value, settings.currencySymbol)}{' '}
                          <span className="text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No expense entries found for this period.
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            💡 <strong className="text-slate-700">Pro Tip:</strong> Keep direct raw material costs under 45% of billed sales to maintain healthy net margins in printing studios.
          </div>
        </div>
      </div>
    </div>
  );
};
