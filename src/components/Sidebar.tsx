import React from 'react';
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Layers,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, orders, invoices, settings } = useApp();

  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const unpaidInvoicesCount = invoices.filter(
    (i) => i.status === 'Unpaid' || i.status === 'Overdue' || i.status === 'Partially Paid'
  ).length;

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <FileText className="w-4 h-4" />,
      badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Package className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'profit-loss',
      label: 'Profit & Loss',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'daily-sales',
      label: 'Daily Sales',
      icon: <CalendarCheck className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'Products & Services',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#232622] text-[#D3D1C8] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static border-r border-[#323630] no-print ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#323630] flex items-center justify-between">
          <div className="bg-[#FAF9F5] px-3 py-1.5 rounded-xl shadow-xs border border-[#ECEAE4]">
            <Logo customLogoUrl={settings.logoUrl} size="sm" />
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-[#A4A198] hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5A5A40] text-[#FAF9F5] font-bold shadow-xs'
                    : 'text-[#C9C7BD] hover:bg-[#2F332D] hover:text-[#FAF9F5]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#FAF9F5]' : 'text-[#8E8C82]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#FAF9F5] text-[#5A5A40]' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#323630] text-[11px] text-[#8E8C82] flex items-center justify-between">
          <span>NISSI KREATIONS</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#A6C098]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#759E65]"></span>
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
