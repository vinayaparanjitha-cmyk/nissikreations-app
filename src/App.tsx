import React, { useEffect, useState } from 'react';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DocumentViewerModal } from './components/documents/DocumentViewerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Header } from './components/Header';
import { CustomerModal } from './components/modals/CustomerModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { OrderModal } from './components/modals/OrderModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { QuotationModal } from './components/modals/QuotationModal';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { AppProvider, useApp } from './context/AppContext';

// Views
import { CustomersView } from './views/CustomersView';
import { DailySalesView } from './views/DailySalesView';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { InvoicesView } from './views/InvoicesView';
import { OrdersView } from './views/OrdersView';
import { PaymentsView } from './views/PaymentsView';
import { ProductsView } from './views/ProductsView';
import { ProfitLossView } from './views/ProfitLossView';
import { QuotationsView } from './views/QuotationsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, setIsSearchOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcut: ⌘K or Ctrl+K opens global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'quotations':
        return <QuotationsView />;
      case 'invoices':
        return <InvoicesView />;
      case 'orders':
        return <OrdersView />;
      case 'customers':
        return <CustomersView />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'profit-loss':
        return <ProfitLossView />;
      case 'daily-sales':
        return <DailySalesView />;
      case 'reports':
        return <ReportsView />;
      case 'products':
        return <ProductsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-800 flex flex-col md:flex-row antialiased selection:bg-[#5A5A40] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F5]">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-print">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Modals & Overlays */}
      <QuotationModal />
      <InvoiceModal />
      <OrderModal />
      <PaymentModal />
      <ExpenseModal />
      <CustomerModal />
      <DocumentViewerModal />
      <GlobalSearchModal />
      <ConfirmationModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
