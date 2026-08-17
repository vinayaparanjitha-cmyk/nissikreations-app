import React, { useState } from 'react';
import {
  ChevronDown,
  CreditCard,
  Database,
  FileSpreadsheet,
  FileText,
  Menu,
  Package,
  Plus,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { setIsSearchOpen, openModal, settings, dbStatus, setActiveTab } = useApp();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <header className="bg-[#FAF9F5] border-b border-[#ECEAE4] sticky top-0 z-30 px-4 md:px-8 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-stone-600 hover:bg-[#EFECE6] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center">
            <Logo customLogoUrl={settings.logoUrl} size="sm" />
          </div>
        </div>

        {/* Middle: Global Search bar trigger */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#F4F2EC] hover:bg-[#EBE8E0] border border-[#E0DDD3] rounded-xl text-xs text-stone-600 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <span>Search invoices, quotations, clients, orders...</span>
            </div>
            <kbd className="hidden lg:inline-block px-2 py-0.5 bg-[#FAF9F5] border border-[#D6D3C7] rounded text-[10px] font-mono text-stone-500">
              ⌘K / Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Quick Action Button, DB Status & Search icon on mobile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('settings')}
            title="Database Connection & Persistence Settings"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer bg-white border-[#E0DDD3] hover:border-stone-400 text-stone-700"
          >
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected'
                  ? 'bg-emerald-500'
                  : dbStatus === 'connecting'
                  ? 'bg-amber-500 animate-pulse'
                  : dbStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-sky-500'
              }`}
            />
            <span className="hidden md:inline text-stone-600">
              {dbStatus === 'connected'
                ? 'DB Connected'
                : dbStatus === 'connecting'
                ? 'Connecting...'
                : dbStatus === 'error'
                ? 'DB Error'
                : 'Cloud Persist'}
            </span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 text-stone-600 hover:bg-[#EFECE6] rounded-lg cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionsOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#5A5A40] hover:bg-[#4B4B35] text-[#FAF9F5] text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuickActionsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F5] rounded-xl shadow-xl border border-[#E0DDD3] py-1.5 z-50 text-xs font-medium animate-slideDown">
                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      openModal('quotation');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EFECE6] text-stone-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>New Quotation</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      openModal('invoice');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EFECE6] text-stone-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>New Tax Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      openModal('order');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EFECE6] text-stone-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-[#5A5A40]" />
                    <span>New Order Job</span>
                  </button>

                  <div className="my-1 border-t border-[#ECEAE4]" />

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      openModal('payment');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EFECE6] text-stone-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Record Payment</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickActionsOpen(false);
                      openModal('expense');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EFECE6] text-stone-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-stone-500" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
