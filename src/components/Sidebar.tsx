import React from 'react';
import { TabType } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  PackagePlus, 
  Receipt, 
  BarChart3, 
  Barcode, 
  DatabaseBackup, 
  Settings,
  AlertTriangle,
  Users,
  Truck,
  FileCheck,
  TrendingDown,
  UserCheck,
  Clock,
  RotateCcw,
  Zap,
  ShieldCheck,
  DollarSign,
  Building2,
  Trash2,
  Activity,
  History,
  Sparkles,
  Store,
  WifiOff
} from 'lucide-react';
import { sqliteDB } from '../db/sqliteStorage';

interface SidebarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  lowStockCount,
}) => {
  const currentUser = sqliteDB.getCurrentUser();
  const settings = sqliteDB.getSettings();

  const navGroups: {
    title: string;
    items: { id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: React.ReactNode }[];
  }[] = [
    {
      title: 'Vente & Caisse',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { 
          id: 'pos', 
          label: 'Caisse Directe (F2)', 
          icon: ShoppingCart,
          badge: <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FDF3F0] text-[#D85C3A] font-bold border border-[#D85C3A]/20">F2</span>
        },
        { id: 'sales_history', label: 'Historique des ventes', icon: Receipt },
        { 
          id: 'products', 
          label: 'Catalogue produits', 
          icon: Package,
          badge: lowStockCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 bg-[#FEF9EB] text-[#B47805] border border-[#F2C14E]/60 font-mono">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              {lowStockCount}
            </span>
          ) : undefined
        },
        { id: 'stock_in', label: 'Réception de stock', icon: PackagePlus },
      ]
    },
    {
      title: 'Relations & Commerce',
      items: [
        { id: 'customers', label: 'Clients & Crédits', icon: Users },
        { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
        { id: 'purchase_orders', label: 'Commandes d\'achat', icon: FileCheck },
        { id: 'returns', label: 'Retours & Échanges', icon: RotateCcw },
        { id: 'expenses', label: 'Dépenses courantes', icon: TrendingDown },
      ]
    },
    {
      title: 'Pilotage & Décisions',
      items: [
        { id: 'reports', label: 'Rapports & Marge', icon: BarChart3 },
        { id: 'inventory_intel', label: 'Intelligence stock', icon: Sparkles },
        { id: 'smart_reorder', label: 'Réapprovisionnement', icon: Zap },
        { id: 'price_history', label: 'Historique des prix', icon: History },
        { id: 'barcodes', label: 'Générateur étiquettes', icon: Barcode },
      ]
    },
    {
      title: 'Gestion & Système',
      items: [
        { id: 'cash_register', label: 'Registre de caisse', icon: DollarSign },
        { id: 'employees', label: 'Personnel & Accès', icon: UserCheck },
        { id: 'attendance', label: 'Pointage présence', icon: Clock },
        { id: 'branches', label: 'Points de vente', icon: Building2 },
        { id: 'backup', label: 'Sauvegarde locale', icon: DatabaseBackup },
        { id: 'audit_logs', label: 'Journal d\'audit', icon: ShieldCheck },
        { id: 'recycle_bin', label: 'Corbeille', icon: Trash2 },
        { id: 'health_monitor', label: 'Diagnostic système', icon: Activity },
        { id: 'settings', label: 'Configuration boutique', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="no-print w-64 h-full bg-white border-r border-[#ECE5D7] flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      {/* Brand & Store Header */}
      <div className="p-4 border-b border-[#ECE5D7] bg-[#FAF8F5]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D85C3A] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
            A
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">AJOWANU</span>
              <span className="text-[9px] bg-[#123F46] text-white font-bold px-1.5 py-0.2 rounded font-mono">
                POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {settings.shopName || 'Boutique Principale'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="p-3 space-y-5 flex-1">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 relative group cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF8F5] text-slate-950 font-bold border border-[#D85C3A]/30 shadow-2xs'
                        : 'text-slate-600 hover:bg-[#FAF8F5] hover:text-slate-900 font-medium'
                    }`}
                  >
                    {/* Active lateral accent pill */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#D85C3A]" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#D85C3A]' : 'text-slate-400 group-hover:text-slate-600'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Session & Terminal Status */}
      <div className="p-3 border-t border-[#ECE5D7] bg-[#FAF8F5]/80 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-medium text-slate-600 truncate">
              {currentUser ? currentUser.name : 'Caisse Principale'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Hors-ligne</span>
        </div>

        <div className="p-2.5 bg-white rounded-xl border border-[#ECE5D7] text-[10px] text-slate-500 flex items-center justify-between">
          <span className="font-semibold text-[#123F46] flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            100% Autonome
          </span>
          <span className="font-mono text-slate-400">v1.0 Pro</span>
        </div>
      </div>
    </aside>
  );
};
