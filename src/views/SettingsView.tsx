import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  QrCode,
  RotateCcw,
  Save,
  Settings,
  Upload,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useApp } from '../context/AppContext';
import { AppSettings } from '../types';
import { StorageService } from '../utils/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, openConfirmation, addToast } = useApp();

  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleChange('logoUrl', base64);
      addToast('Business logo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomLogo = () => {
    handleChange('logoUrl', '');
    addToast('Reverted to default NISSI KREATIONS brand logo', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      customers: StorageService.getCustomers(),
      products: StorageService.getProducts(),
      quotations: StorageService.getQuotations(),
      invoices: StorageService.getInvoices(),
      orders: StorageService.getOrders(),
      payments: StorageService.getPayments(),
      expenses: StorageService.getExpenses(),
      settings: StorageService.getSettings(),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nissi_kreations_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Backup exported successfully!', 'success');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.customers && json.invoices) {
          openConfirmation({
            title: 'Restore Database Backup?',
            message: 'This will replace all current business records with the data from your backup file. Are you sure you want to proceed?',
            confirmLabel: 'Restore Database',
            isDangerous: true,
            onConfirm: () => {
              if (json.customers) StorageService.saveCustomers(json.customers);
              if (json.products) StorageService.saveProducts(json.products);
              if (json.quotations) StorageService.saveQuotations(json.quotations);
              if (json.invoices) StorageService.saveInvoices(json.invoices);
              if (json.orders) StorageService.saveOrders(json.orders);
              if (json.payments) StorageService.savePayments(json.payments);
              if (json.expenses) StorageService.saveExpenses(json.expenses);
              if (json.settings) StorageService.saveSettings(json.settings);
              window.location.reload();
            },
          });
        } else {
          addToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        addToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to Initial Seed Data
  const handleResetDemoData = () => {
    openConfirmation({
      title: 'Reset to Sample Demonstration Data?',
      message: 'This will reset all invoices, customers, orders, and quotations to the default NISSI KREATIONS sample catalog. Any customized records will be replaced.',
      confirmLabel: 'Reset Data',
      isDangerous: true,
      onConfirm: () => {
        StorageService.clearAll();
        window.location.reload();
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            System & Company Profile
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure business information, GSTIN, UPI payment QR details, bank account, and document terms.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Changes Saved!' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand & Logo Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <ImageIcon className="w-4 h-4 text-orange-600" />
            <span>Brand Logo & Identity</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center min-w-[200px] h-24">
              <Logo customLogoUrl={formData.logoUrl} size="md" />
            </div>

            <div className="space-y-2 flex-1">
              <p className="font-semibold text-slate-800">Company Logo on Documents</p>
              <p className="text-slate-500 text-[11px]">
                This logo appears unchanged across Quotations, Tax Invoices, Receipts, and the Dashboard.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold rounded-lg border border-orange-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Image</span>
                </button>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomLogo}
                    className="px-3 py-1.5 text-slate-600 hover:text-rose-600 font-semibold rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    Reset to Default Vector
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Profile Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-orange-600" />
            <span>Business Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Services</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                placeholder="36AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono uppercase focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website / Portfolio</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address Line 2</label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Payment QR & Banking Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>UPI Payment QR & Bank Account (Printed on Invoices)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block font-semibold text-emerald-800 mb-1">UPI ID (VPA) for QR Code</label>
              <input
                type="text"
                placeholder="nissikreations@okaxis"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2.5 font-mono font-bold text-emerald-900 outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Generates instant UPI QR code on all printed invoices.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.bankAccountName}
                onChange={(e) => handleChange('bankAccountName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono uppercase focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Invoice & Document Terms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Default Terms & Billing Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default GST Rate (%)</label>
              <select
                value={formData.defaultGstRate}
                onChange={(e) => handleChange('defaultGstRate', parseFloat(e.target.value) || 18)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono"
              >
                <option value="0">0% (Exempt / Unregistered)</option>
                <option value="5">5% (Composite)</option>
                <option value="12">12% (Standard Print)</option>
                <option value="18">18% (Commercial Flex/Signage)</option>
                <option value="28">28% (Luxury Signboards)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Default Terms & Conditions (Printed on A4 Bills)</label>
              <textarea
                rows={3}
                value={formData.defaultTerms}
                onChange={(e) => handleChange('defaultTerms', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Database Backup & Maintenance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Download className="w-4 h-4 text-sky-600" />
            <span>Database Backup & Restore</span>
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">Offline Data Safety</p>
              <p className="text-slate-500 text-[11px]">
                Export all invoices, quotations, customer contacts, orders, and payment records to a single backup file.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (JSON)</span>
              </button>

              <input
                type="file"
                ref={backupInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded-xl border border-sky-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Backup</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSaved ? 'Settings Saved Successfully!' : 'Save Business Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
