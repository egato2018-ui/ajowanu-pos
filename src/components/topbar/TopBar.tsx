import React, { useState, useEffect, useRef } from 'react';
import { ShopSettings, Employee, TabType } from '../../types';
import { sqliteDB } from '../../db/sqliteStorage';
import { 
  Search, 
  Clock, 
  Calculator, 
  Banknote, 
  Maximize2, 
  Minimize2, 
  Bell, 
  HelpCircle, 
  ShoppingCart,
  ChevronRight,
  BookOpen
} from 'lucide-react';

import { CalculatorPopover } from './CalculatorPopover';
import { CashCounterPopover } from './CashCounterPopover';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserProfileMenu } from './UserProfileMenu';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { GuidesModal } from './GuidesModal';

interface TopBarProps {
  settings: ShopSettings;
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  onOpenSearch: () => void;
  onLockTerminal: () => void;
  onLogout: () => void;
  currentUser: Employee | null;
  onUserUpdated: (user: Employee) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  activeTab,
  onNavigate,
  onOpenSearch,
  onLockTerminal,
  onLogout,
  currentUser,
  onUserUpdated,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Popover & Modal toggles
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isCashCounterOpen, setIsCashCounterOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isGuidesOpen, setIsGuidesOpen] = useState<boolean>(false);

  // References for outside click handling
  const calcRef = useRef<HTMLDivElement>(null);
  const cashRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Live French Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calcRef.current && !calcRef.current.contains(event.target as Node)) {
        setIsCalcOpen(false);
      }
      if (cashRef.current && !cashRef.current.contains(event.target as Node)) {
        setIsCashCounterOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Plein écran non disponible dans ce contexte:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.warn(err));
      }
    }
  };

  // Human-readable French breadcrumbs
  const tabLabels: Record<string, string> = {
    dashboard: 'Tableau de bord',
    pos: 'Point de vente & Caisse',
    sales_history: 'Historique des ventes',
    products: 'Catalogue des articles',
    stock_in: 'Entrée en stock',
    customers: 'Clients & Crédits',
    suppliers: 'Fournisseurs',
    purchase_orders: 'Commandes d\'achat',
    returns: 'Retours & Échanges',
    expenses: 'Dépenses',
    reports: 'Rapports & Rentabilité',
    inventory_intel: 'Intelligence des stocks',
    smart_reorder: 'Réapprovisionnement',
    price_history: 'Audit des prix',
    barcodes: 'Étiquettes code-barres',
    cash_register: 'Registre de caisse',
    employees: 'Personnel & Accès',
    attendance: 'Pointage présence',
    branches: 'Points de vente',
    backup: 'Sauvegarde & Données',
    audit_logs: 'Journal de sécurité',
    recycle_bin: 'Corbeille',
    health_monitor: 'Santé système',
    settings: 'Paramètres',
  };

  // Real alerts count for the notification badge
  const products = sqliteDB.getProducts();
  const lowStockThreshold = settings.lowStockThreshold || 5;
  const lowStockCount = products.filter(p => p.quantity <= (p.minStockLevel || lowStockThreshold)).length;
  const pendingOrdersCount = sqliteDB.getPurchaseOrders().filter(po => po.status === 'Ordered').length;
  const heldBillsCount = sqliteDB.getHeldBills().length;
  const totalAlertsCount = lowStockCount + pendingOrdersCount + heldBillsCount;

  return (
    <header className="no-print bg-white border-b border-[#ECE5D7] h-14 px-3 sm:px-4 flex items-center justify-between shadow-2xs sticky top-0 z-40 select-none gap-2 sm:gap-3">
      
      {/* 1. Zone Gauche: Contexte de Boutique & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
        {/* Subtle decorative desktop dots */}
        <div className="hidden md:flex items-center gap-1.5 mr-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D85C3A]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F2C14E]/90" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#123F46]/70" />
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] hidden sm:inline">
            {settings.shopName || 'Boutique AJOWANU'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:inline" />
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-[#ECE5D7] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#123F46] shrink-0" />
            <span className="text-xs font-bold text-slate-900 truncate">
              {tabLabels[activeTab] || 'Tableau de bord'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Zone Centre: Recherche Compacte & Outils Rapides Caisse */}
      <div className="flex items-center gap-2 min-w-0">
        
        {/* Compact Search Bar */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center justify-between px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE0] text-slate-500 rounded-xl text-xs transition border border-[#ECE5D7] group cursor-pointer shadow-2xs w-48 lg:w-56 shrink-0"
          title="Rechercher un article, un client, un ticket... (Ctrl + K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#123F46] transition shrink-0" />
            <span className="text-slate-500 group-hover:text-slate-800 text-[11px] truncate">
              Rechercher...
            </span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-white text-slate-400 rounded-md text-[9px] font-mono border border-slate-200 shrink-0 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-600 hover:bg-[#FAF7F2] rounded-xl border border-[#ECE5D7] transition cursor-pointer shrink-0"
          title="Rechercher (Ctrl + K)"
          aria-label="Recherche globale"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 🧮 Quick Calculator Popover */}
        <div className="relative shrink-0" ref={calcRef}>
          <button
            onClick={() => {
              setIsCalcOpen(!isCalcOpen);
              setIsCashCounterOpen(false);
              setIsNotifOpen(false);
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isCalcOpen 
                ? 'bg-[#123F46] text-white border-[#123F46]' 
                : 'bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 border-[#ECE5D7]'
            }`}
            title="Calculatrice commerciale"
            aria-label="Calculatrice"
          >
            <Calculator className="w-4 h-4" />
          </button>
          {isCalcOpen && <CalculatorPopover onClose={() => setIsCalcOpen(false)} />}
        </div>

        {/* 💵 FCFA Cash Denomination Counter */}
        <div className="relative shrink-0" ref={cashRef}>
          <button
            onClick={() => {
              setIsCashCounterOpen(!isCashCounterOpen);
              setIsCalcOpen(false);
              setIsNotifOpen(false);
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isCashCounterOpen 
                ? 'bg-[#123F46] text-white border-[#123F46]' 
                : 'bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 border-[#ECE5D7]'
            }`}
            title="Calculateur de coupures FCFA & fond de caisse"
            aria-label="Comptage de caisse"
          >
            <Banknote className="w-4 h-4" />
          </button>
          {isCashCounterOpen && (
            <CashCounterPopover
              onClose={() => setIsCashCounterOpen(false)}
              currency={settings.currencySymbol || 'FCFA'}
            />
          )}
        </div>

      </div>

      {/* 3. Zone Droite: Guides, Notifications, Heure/Date Embellies, Profil & Caisse */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        
        {/* 💡 Guides & Astuces d'Utilisation AJOWANU */}
        <button
          onClick={() => setIsGuidesOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 rounded-xl border border-[#ECE5D7] transition cursor-pointer shadow-2xs group shrink-0"
          title="Guides d'utilisation & astuces de caisse AJOWANU"
          aria-label="Guides et astuces"
        >
          <BookOpen className="w-4 h-4 text-[#D85C3A] group-hover:scale-110 transition shrink-0" />
          <span className="hidden xl:inline text-xs font-bold text-slate-800">
            Guides
          </span>
        </button>

        {/* 🔔 Notifications Centre */}
        <div className="relative shrink-0" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsCalcOpen(false);
              setIsCashCounterOpen(false);
            }}
            className={`p-2 rounded-xl border relative transition cursor-pointer ${
              isNotifOpen 
                ? 'bg-[#123F46] text-white border-[#123F46]' 
                : 'bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 border-[#ECE5D7]'
            }`}
            title="Alertes opérationnelles"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D85C3A] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <NotificationsDropdown
              onClose={() => setIsNotifOpen(false)}
              onNavigate={onNavigate}
            />
          )}
        </div>

        {/* ❓ Shortcuts Modal Trigger */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="hidden md:flex p-2 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 rounded-xl border border-[#ECE5D7] transition cursor-pointer shrink-0"
          title="Raccourcis clavier (F1/Aide)"
          aria-label="Raccourcis clavier"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* ⛶ Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-slate-700 rounded-xl border border-[#ECE5D7] transition cursor-pointer shrink-0"
          title={isFullscreen ? 'Quitter le plein écran (F11)' : 'Plein écran (F11)'}
          aria-label="Plein écran"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Separator */}
        <div className="hidden lg:block w-px h-6 bg-[#ECE5D7] my-auto shrink-0" />

        {/* 🕒 Subtly Embellished Live Clock & Date */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-[#FAF8F5] via-[#F6F1E7] to-[#FAF8F5] rounded-xl border border-[#ECE5D7] shadow-2xs shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#123F46]" />
            <span className="font-bold text-slate-900 font-mono text-xs tracking-tight">
              {timeStr}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[11px] font-semibold text-slate-600 capitalize">
            {dateStr}
          </span>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 bg-[#ECE5D7] my-auto shrink-0" />

        {/* 👤 User Profile Dropdown */}
        {currentUser && (
          <UserProfileMenu
            user={currentUser}
            settings={settings}
            onLockTerminal={onLockTerminal}
            onLogout={onLogout}
            onUserUpdated={onUserUpdated}
          />
        )}

        {/* 🛒 Direct POS Button */}
        <button
          onClick={() => onNavigate('pos')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs ${
            activeTab === 'pos'
              ? 'bg-[#123F46] text-white'
              : 'bg-[#D85C3A] hover:bg-[#C24B2B] text-white'
          }`}
          title="Point de vente direct (F2)"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{activeTab === 'pos' ? 'Caisse active' : 'Caisse (F2)'}</span>
        </button>

      </div>

      {/* Shortcuts Modal */}
      {isShortcutsOpen && <KeyboardShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}

      {/* Guides Modal */}
      {isGuidesOpen && (
        <GuidesModal 
          onClose={() => setIsGuidesOpen(false)} 
          onNavigate={onNavigate}
          onOpenCashCounter={() => setIsCashCounterOpen(true)}
          onOpenCalculator={() => setIsCalcOpen(true)}
        />
      )}
    </header>
  );
};
