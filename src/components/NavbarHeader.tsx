import React, { useState, useEffect } from 'react';
import { ShopSettings } from '../types';
import { ShoppingCart, Store, Clock, HardDrive, WifiOff, Search, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import { sqliteDB } from '../db/sqliteStorage';

interface NavbarHeaderProps {
  settings: ShopSettings;
  onUpdateSettings: (newSettings: Partial<ShopSettings>) => void;
  onNavigate: (tab: any) => void;
  activeTab: string;
  onOpenSearch?: () => void;
  onLockTerminal?: () => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  activeTab,
  onOpenSearch,
  onLockTerminal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const currentUser = sqliteDB.getCurrentUser();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabLabels: Record<string, string> = {
    dashboard: 'Tableau de bord',
    pos: 'Point de vente & Encaissement',
    sales_history: 'Historique des ventes',
    products: 'Catalogue des articles',
    stock_in: 'Entrée en stock',
    customers: 'Gestion clients & Crédits',
    suppliers: 'Fournisseurs',
    purchase_orders: 'Commandes d\'achat',
    returns: 'Retours & Échanges',
    expenses: 'Dépenses du commerce',
    reports: 'Rapports & Rentabilité',
    inventory_intel: 'Intelligence des stocks',
    smart_reorder: 'Réapprovisionnement intelligent',
    price_history: 'Évolution des prix',
    barcodes: 'Générateur d\'étiquettes',
    cash_register: 'Registre de caisse journalier',
    employees: 'Personnel & Droits d\'accès',
    attendance: 'Pointage de présence',
    branches: 'Points de vente & Agences',
    backup: 'Sauvegarde & Données locales',
    audit_logs: 'Journal de sécurité',
    recycle_bin: 'Corbeille',
    health_monitor: 'Santé du système',
    settings: 'Paramètres du commerce',
  };

  return (
    <header className="no-print bg-white border-b border-[#ECE5D7] h-14 px-4 flex items-center justify-between shadow-2xs sticky top-0 z-30 select-none">
      {/* Left: Brand Context & Module Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Desktop window controls simulation */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 hover:bg-rose-500 transition cursor-pointer" title="Fermer" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:bg-amber-500 transition cursor-pointer" title="Réduire" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 hover:bg-emerald-500 transition cursor-pointer" title="Agrandir" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden md:inline">
            {settings.shopName || 'AJOWANU'}
          </span>
          <span className="text-slate-300 hidden md:inline">/</span>
          <span className="text-xs font-bold text-slate-900 bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#ECE5D7]">
            {tabLabels[activeTab] || 'Tableau de bord'}
          </span>
        </div>
      </div>

      {/* Right: Tools, Clock, User Session & Primary Action */}
      <div className="flex items-center gap-2">
        {/* Quick Search Shortcut */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#ECE5D7] text-slate-700 rounded-xl text-xs font-medium transition border border-[#ECE5D7] cursor-pointer"
            title="Recherche globale (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Rechercher</span>
            <kbd className="px-1.5 py-0.5 bg-white rounded text-[9px] font-mono border border-slate-200 text-slate-400">Ctrl K</kbd>
          </button>
        )}

        {/* French Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#FAF8F5] text-slate-700 text-xs font-mono px-3 py-1.5 rounded-xl border border-[#ECE5D7]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-data font-medium">{timeStr}</span>
        </div>

        {/* Lock Terminal / Current Cashier */}
        {currentUser && (
          <button
            onClick={onLockTerminal}
            className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-[#ECE5D7] cursor-pointer"
            title="Verrouiller la caisse"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#123F46]" />
            <span className="hidden sm:inline">{currentUser.name}</span>
            <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        )}

        {/* Main Quick Action Button: POS / Caisse */}
        <button
          onClick={() => onNavigate('pos')}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'pos'
              ? 'bg-[#123F46] text-white shadow-xs'
              : 'bg-[#D85C3A] hover:bg-[#C24B2B] text-white shadow-xs'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{activeTab === 'pos' ? 'Caisse active' : 'Caisse (F2)'}</span>
        </button>
      </div>
    </header>
  );
};
