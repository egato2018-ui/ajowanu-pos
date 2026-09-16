/**
 * Main Application Shell for Offline Grocery Shop Management Software (Desktop POS)
 */

import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  ShopSettings, 
  Product, 
  Sale, 
  IncomingStockLog, 
  CartItem,
  DashboardMetrics 
} from './types';
import { sqliteDB } from './db/sqliteStorage';

// Components
import { NavbarHeader } from './components/NavbarHeader';
import { Sidebar } from './components/Sidebar';
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal';
import { DashboardView } from './components/DashboardView';
import { POSBillingView } from './components/POSBillingView';
import { ProductManagementView } from './components/ProductManagementView';
import { IncomingStockView } from './components/IncomingStockView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { BarcodeGeneratorView } from './components/BarcodeGeneratorView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { InvoiceModal } from './components/InvoiceModal';
import { CameraScannerModal } from './components/CameraScannerModal';

// Enterprise Commercial Modules
import { CustomerManagementView } from './components/CustomerManagementView';
import { SupplierManagementView } from './components/SupplierManagementView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { ExpenseManagementView } from './components/ExpenseManagementView';
import { EmployeeManagementView } from './components/EmployeeManagementView';
import { AttendanceView } from './components/AttendanceView';
import { InventoryIntelligenceView } from './components/InventoryIntelligenceView';
import { ReturnsExchangesView } from './components/ReturnsExchangesView';
import { AuditLogsView } from './components/AuditLogsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PinLockModal } from './components/PinLockModal';
import { LabelDesignerModal } from './components/LabelDesignerModal';

// Modules 28-50 Advanced Enterprise Views
import { CashRegisterView } from './components/CashRegisterView';
import { SmartReorderView } from './components/SmartReorderView';
import { BranchManagementView } from './components/BranchManagementView';
import { RecycleBinView } from './components/RecycleBinView';
import { HealthMonitorView } from './components/HealthMonitorView';
import { PriceHistoryView } from './components/PriceHistoryView';
import { UpiSettingsSection } from './components/UpiSettingsSection';
import { PageHeader } from './components/ui/PageHeader';
import { Badge } from './components/ui/Badge';

import { Store, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<ShopSettings>(() => sqliteDB.getSettings());
  const [products, setProducts] = useState<Product[]>(() => sqliteDB.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => sqliteDB.getSales());
  const [stockLogs, setStockLogs] = useState<IncomingStockLog[]>(() => sqliteDB.getStockLogs());
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Sale | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [productForBarcodeLabel, setProductForBarcodeLabel] = useState<Product | null>(null);

  // Enterprise Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [isLabelDesignerOpen, setIsLabelDesignerOpen] = useState(false);
  const [settingsResetModal, setSettingsResetModal] = useState<'clear' | 'sample' | null>(null);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  // Keyboard Shortcuts (Ctrl+K for Search, F2 for POS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enforce light theme always, independent of OS settings
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Refresh local memory state from SQLite storage
  const refreshAllState = () => {
    setSettings(sqliteDB.getSettings());
    setProducts(sqliteDB.getProducts());
    setSales(sqliteDB.getSales());
    setStockLogs(sqliteDB.getStockLogs());
  };

  // --- Handlers ---
  const handleUpdateSettings = (newSettings: Partial<ShopSettings>) => {
    const updated = sqliteDB.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleSaveProduct = (productData: Partial<Product> & { name: string; barcode: string; purchasePrice: number; sellingPrice: number; quantity: number }) => {
    sqliteDB.saveProduct(productData);
    refreshAllState();
  };

  const handleDeleteProduct = (id: string) => {
    sqliteDB.deleteProduct(id);
    refreshAllState();
  };

  const handleAddExistingStock = (
    productId: string, 
    qtyToAdd: number, 
    newPurchasePrice?: number, 
    newSellingPrice?: number, 
    supplierName?: string
  ) => {
    sqliteDB.addStock(productId, qtyToAdd, newPurchasePrice, newSellingPrice, supplierName);
    refreshAllState();
  };

  const handleRecordSale = (
    cartItems: CartItem[],
    customerName: string,
    customerPhone: string,
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit',
    receivedAmount: number,
    discountAmount: number,
    taxPercent: number
  ): Sale => {
    const sale = sqliteDB.recordSale(
      cartItems,
      customerName,
      customerPhone,
      paymentMode,
      receivedAmount,
      discountAmount,
      taxPercent
    );

    refreshAllState();

    // Automatically trigger Invoice Print Modal
    setSelectedInvoiceForModal(sale);
    setIsInvoiceModalOpen(true);

    return sale;
  };

  const handleCancelSale = (saleId: string) => {
    sqliteDB.cancelSale(saleId);
    refreshAllState();
  };

  const handleExportBackup = () => {
    try {
      const backupJsonStr = sqliteDB.exportBackupJSON();
      const blob = new Blob([backupJsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ajowanu_pos_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('Backup export failed:', err);
    }
  };

  const handleImportBackup = (jsonContent: string): boolean => {
    const ok = sqliteDB.importBackupJSON(jsonContent);
    if (ok) {
      refreshAllState();
    }
    return ok;
  };

  const handleResetToSampleData = () => {
    sqliteDB.resetToSampleData();
    refreshAllState();
  };

  const handleClearAllDataForFreshStart = (customSettings?: Partial<ShopSettings>) => {
    sqliteDB.clearAllDataForFreshStart(customSettings);
    refreshAllState();
  };

  const handleViewInvoice = (sale: Sale) => {
    setSelectedInvoiceForModal(sale);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenBarcodeGeneratorForProduct = (product: Product) => {
    setProductForBarcodeLabel(product);
    setActiveTab('barcodes');
  };

  const metrics: DashboardMetrics = sqliteDB.getMetrics();
  const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel || settings.lowStockThreshold));

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6F4EE] text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Application Navbar Titlebar */}
      <NavbarHeader
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onNavigate={setActiveTab}
        activeTab={activeTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLockTerminal={() => setIsTerminalLocked(true)}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          lowStockCount={metrics.lowStockCount}
        />

        {/* Main Content Workspace View */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentSales={sales}
              lowStockProducts={lowStockProducts}
              settings={settings}
              onNavigate={setActiveTab}
              onViewInvoice={handleViewInvoice}
              onQuickAddProduct={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'pos' && (
            <POSBillingView
              products={products}
              settings={settings}
              onRecordSale={handleRecordSale}
              onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
              scannedBarcode={scannedBarcode}
              onClearScannedBarcode={() => setScannedBarcode(null)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagementView
              settings={settings}
              onSelectCustomerForPOS={(cust) => {
                setActiveTab('pos');
              }}
            />
          )}

          {activeTab === 'cash_register' && (
            <CashRegisterView />
          )}

          {activeTab === 'smart_reorder' && (
            <SmartReorderView />
          )}

          {activeTab === 'branches' && (
            <BranchManagementView />
          )}

          {activeTab === 'recycle_bin' && (
            <RecycleBinView />
          )}

          {activeTab === 'health_monitor' && (
            <HealthMonitorView />
          )}

          {activeTab === 'price_history' && (
            <PriceHistoryView />
          )}

          {activeTab === 'suppliers' && (
            <SupplierManagementView
              settings={settings}
            />
          )}

          {activeTab === 'purchase_orders' && (
            <PurchaseOrderView
              settings={settings}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManagementView
              settings={settings}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManagementView
              settings={settings}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              settings={settings}
            />
          )}

          {activeTab === 'inventory_intel' && (
            <InventoryIntelligenceView
              settings={settings}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnsExchangesView
              settings={settings}
              onViewInvoice={handleViewInvoice}
              onReturnProcessed={refreshAllState}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsView
              settings={settings}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagementView
              products={products}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onOpenBarcodeGenerator={handleOpenBarcodeGeneratorForProduct}
            />
          )}

          {activeTab === 'stock_in' && (
            <IncomingStockView
              products={products}
              settings={settings}
              onAddExistingStock={handleAddExistingStock}
              onSaveNewProduct={handleSaveProduct}
              stockLogs={stockLogs}
              onOpenCameraScanner={() => setIsCameraScannerOpen(true)}
              scannedBarcode={scannedBarcode}
              onClearScannedBarcode={() => setScannedBarcode(null)}
            />
          )}

          {activeTab === 'sales_history' && (
            <SalesHistoryView
              sales={sales}
              settings={settings}
              onViewInvoice={handleViewInvoice}
              onCancelSale={handleCancelSale}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              sales={sales}
              products={products}
              settings={settings}
            />
          )}

          {activeTab === 'barcodes' && (
            <BarcodeGeneratorView
              products={products}
              selectedProductForLabel={productForBarcodeLabel}
              settings={settings}
            />
          )}

          {activeTab === 'backup' && (
            <BackupRestoreView
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetToSampleData={handleResetToSampleData}
              onClearAllData={handleClearAllDataForFreshStart}
            />
          )}

          {activeTab === 'settings' && (
            <div className="p-5 sm:p-7 max-w-4xl mx-auto space-y-6">
              <PageHeader
                title="Profil Commercial & Paramètres"
                subtitle="Identité de l'établissement, en-tête des tickets thermiques et seuils de réapprovisionnement."
                icon={<Store className="w-5 h-5 text-[#D85C3A]" />}
                badge={
                  <Badge variant="teal" size="sm">
                    Stockage Local Sécurisé
                  </Badge>
                }
              />

              <div className="bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Coordonnées & Fiscalité</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Imprimé sur les tickets & factures</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">Nom de la Boutique / Enseigne</label>
                    <input
                      type="text"
                      value={settings.shopName}
                      onChange={e => handleUpdateSettings({ shopName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl outline-none focus:border-[#D85C3A] text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">Nom du Gérant / Propriétaire</label>
                    <input
                      type="text"
                      value={settings.ownerName}
                      onChange={e => handleUpdateSettings({ ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl outline-none focus:border-[#D85C3A] text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">Téléphone de contact / WhatsApp</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={e => handleUpdateSettings({ phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl outline-none focus:border-[#D85C3A] font-mono text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">N° IFU / RCCM (Fiscalité)</label>
                    <input
                      type="text"
                      value={settings.gstNumber || ''}
                      onChange={e => handleUpdateSettings({ gstNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl outline-none focus:border-[#D85C3A] font-mono text-slate-900 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold mb-1.5 text-slate-700">Adresse géographique</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={e => handleUpdateSettings({ address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl outline-none focus:border-[#D85C3A] text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">Alerte stock bas (quantité minimale)</label>
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={e => handleUpdateSettings({ lowStockThreshold: parseInt(e.target.value) || 10 })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl font-mono-data outline-none focus:border-[#D85C3A] text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1.5 text-slate-700">Taux de TVA par défaut (%)</label>
                    <input
                      type="number"
                      value={settings.defaultTaxPercent}
                      onChange={e => handleUpdateSettings({ defaultTaxPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl font-mono-data outline-none focus:border-[#D85C3A] text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] text-xs text-slate-600 flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#123F46] shrink-0" />
                  <span>Modifications sauvegardées automatiquement dans la base de données locale.</span>
                </div>
              </div>

              {/* Dynamic Mobile Money & QR Payment Settings Card */}
              <UpiSettingsSection
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />

              {/* Fresh Start Store Deployment Card */}
              <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  Réinitialisation des données & Mise en production
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pour installer le logiciel chez un commerçant réel, vous pouvez purger toutes les données de test (produits d'exemple, historique de vente, clients démo) afin de démarrer un inventaire réel vierge.
                </p>

                {settingsToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 animate-fadeIn">
                    {settingsToast}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal('clear')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Vider les données démo & Démarrer à zéro
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal('sample')}
                    className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#ECE5D7] text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer border border-[#ECE5D7]"
                  >
                    Recharger les données démo (Bénin)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Reset Confirmation Modal */}
          {settingsResetModal && (
            <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#ECE5D7] shadow-2xl animate-fadeIn">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {settingsResetModal === 'clear' ? 'Purger toutes les données démo ?' : 'Recharger les données démo locales ?'}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {settingsResetModal === 'clear'
                    ? 'Êtes-vous sûr de vouloir supprimer les données d\'exemple ? Les produits tests, clients et ventes démo seront effacés pour vous permettre de saisir les vrais stocks du magasin.'
                    : 'Êtes-vous sûr de vouloir recharger les articles démo (Riz Parfumé, Huile Mayor, Gari Sohoui, Savon BF, etc.) ?'}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSettingsResetModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (settingsResetModal === 'clear') {
                        handleClearAllDataForFreshStart();
                        setSettingsToast('Toutes les données démo ont été purgées ! Vous avez une base propre.');
                      } else {
                        handleResetToSampleData();
                        setSettingsToast('Jeux d\'échantillons locaux AJOWANU chargé dans la base.');
                      }
                      setSettingsResetModal(null);
                      setTimeout(() => setSettingsToast(null), 4000);
                    }}
                    className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer ${
                      settingsResetModal === 'clear' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#D85C3A] hover:bg-[#C24B2B]'
                    }`}
                  >
                    {settingsResetModal === 'clear' ? 'Oui, purger et démarrer propre' : 'Oui, charger les données démo'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          settings={settings}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Terminal PIN Lock Screen */}
      {isTerminalLocked && (
        <PinLockModal
          onUnlock={() => setIsTerminalLocked(false)}
        />
      )}

      {/* First Time Setup Wizard Modal */}
      <FirstTimeSetupModal
        isOpen={!settings.isSetupCompleted}
        onSave={handleUpdateSettings}
        onClearAllData={handleClearAllDataForFreshStart}
        initialSettings={settings}
      />

      {/* Invoice Modal for Thermal / A4 Print */}
      <InvoiceModal
        sale={selectedInvoiceForModal}
        settings={settings}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      {/* Webcam Camera Barcode Reader Modal */}
      <CameraScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={(barcode) => {
          setScannedBarcode(barcode);
        }}
      />

    </div>
  );
}
