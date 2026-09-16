import React from 'react';
import { DashboardMetrics, Sale, Product, ShopSettings, TabType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Plus, 
  Receipt, 
  Coins, 
  CreditCard, 
  Smartphone, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardHeader } from './ui/Card';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentSales: Sale[];
  lowStockProducts: Product[];
  settings: ShopSettings;
  onNavigate: (tab: TabType) => void;
  onViewInvoice: (sale: Sale) => void;
  onQuickAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentSales,
  lowStockProducts,
  settings,
  onNavigate,
  onViewInvoice,
  onQuickAddProduct,
}) => {
  const currency = settings.currencySymbol || 'FCFA';

  // Calculate Today's Payment Mode Breakdown
  const todayStr = new Date().toDateString();
  const todaySales = recentSales.filter(s => new Date(s.dateTime).toDateString() === todayStr && s.status === 'Completed');
  const todayCash = todaySales.filter(s => s.paymentMode === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayUpi = todaySales.filter(s => s.paymentMode === 'UPI').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayCard = todaySales.filter(s => s.paymentMode === 'Card').reduce((acc, s) => acc + s.totalAmount, 0);
  const todayCredit = todaySales.filter(s => s.paymentMode === 'Credit').reduce((acc, s) => acc + s.totalAmount, 0);

  const formattedDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Editorial Welcome Banner */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] p-6 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#FAF8F5] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#D85C3A] uppercase tracking-wider">
                Commerce Opérationnel
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 capitalize flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bonjour, {settings.ownerName ? `${settings.ownerName}` : 'Gérant'} — {settings.shopName}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Vos transactions, encaissements et niveaux de stock sont traités en temps réel et stockés localement sur votre terminal.
            </p>
          </div>

          {/* Direct POS & Stock shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<ShoppingBag className="w-4 h-4" />}
              onClick={() => onNavigate('pos')}
            >
              Caisse Directe (F2)
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => onNavigate('stock_in')}
            >
              Réception Stock
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={<Package className="w-4 h-4 text-[#D85C3A]" />}
              onClick={onQuickAddProduct}
            >
              Nouvel Article
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Structured Commercial Cockpit (Asymmetric 2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Primary Financial Performance & Payment Distribution */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Summary Duo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Primary KPI 1: Chiffre d'affaires du jour */}
            <div className="bg-white rounded-2xl border border-[#ECE5D7] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chiffre d'Affaires du Jour
                  </span>
                  <div className="text-3xl font-black text-slate-900 font-mono-data mt-2">
                    {formatFCFA(metrics.todaySalesAmount, currency)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FDF3F0] text-[#D85C3A] flex items-center justify-center shrink-0 border border-[#D85C3A]/20">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Receipt className="w-3.5 h-3.5 text-[#D85C3A]" />
                  <strong className="text-slate-800">{metrics.todaySalesCount}</strong> vente(s) enregistrée(s)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Aujourd'hui</span>
              </div>
            </div>

            {/* Primary KPI 2: Marge Nette Réalisée */}
            <div className="bg-white rounded-2xl border border-[#ECE5D7] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bénéfice Net Estimé
                  </span>
                  <div className="text-3xl font-black text-[#123F46] font-mono-data mt-2">
                    {formatFCFA(metrics.todayProfit, currency)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#E8F1F2] text-[#123F46] flex items-center justify-center shrink-0 border border-[#123F46]/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium truncate">
                  Cumul total : <strong className="text-slate-800 font-mono-data">{formatFCFA(metrics.totalProfitAllTime, currency)}</strong>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Historique</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Repartition (Espèces vs Mobile Money vs Carte vs Crédit) */}
          <div className="bg-white rounded-2xl border border-[#ECE5D7] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Répartition des Règlements du Jour
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ventilation par mode d'encaissement
                </p>
              </div>
              <Badge variant="teal" size="sm">
                Caisse Active
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Cash */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#123F46]" />
                    Espèces
                  </span>
                </div>
                <div className="text-base font-bold font-mono-data text-slate-900">
                  {formatFCFA(todayCash, currency)}
                </div>
              </div>

              {/* Mobile Money / QR */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#D85C3A]" />
                    MoMo / QR
                  </span>
                </div>
                <div className="text-base font-bold font-mono-data text-slate-900">
                  {formatFCFA(todayUpi, currency)}
                </div>
              </div>

              {/* Card */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Carte
                  </span>
                </div>
                <div className="text-base font-bold font-mono-data text-slate-900">
                  {formatFCFA(todayCard, currency)}
                </div>
              </div>

              {/* Credit / Arrears */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    À Crédit
                  </span>
                </div>
                <div className="text-base font-bold font-mono-data text-slate-900">
                  {formatFCFA(todayCredit, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales Activity Feed */}
          <div className="bg-white rounded-2xl border border-[#ECE5D7] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Dernières Ventes Enregistrées
                </h3>
                <p className="text-[11px] text-slate-400">
                  Transactions récentes au comptoir
                </p>
              </div>
              <button
                onClick={() => onNavigate('sales_history')}
                className="text-xs font-bold text-[#D85C3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Voir tout l'historique
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucune vente enregistrée pour le moment.
              </div>
            ) : (
              <div className="divide-y divide-[#ECE5D7]">
                {recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] px-2 rounded-xl transition">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono text-slate-900">
                          {sale.invoiceNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF8F5] text-slate-600 border border-[#ECE5D7] font-semibold">
                          {sale.paymentMode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {sale.customerName || 'Client Comptoir'} • {sale.items.length} article(s) • {new Date(sale.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold font-mono-data text-slate-900">
                        {formatFCFA(sale.totalAmount, currency)}
                      </span>
                      <button
                        onClick={() => onViewInvoice(sale)}
                        className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#ECE5D7] text-slate-700 transition cursor-pointer border border-[#ECE5D7]"
                        title="Voir la facture / ticket"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#123F46]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts & Stock Health */}
        <div className="space-y-6">
          
          {/* Inventory Valuation Card */}
          <div className="bg-white rounded-2xl border border-[#ECE5D7] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inventaire & Stock
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#123F46] flex items-center justify-center border border-[#ECE5D7]">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-slate-400">Valeur marchande en rayon</span>
                <div className="text-xl font-bold font-mono-data text-slate-900">
                  {formatFCFA(metrics.totalStockValue, currency)}
                </div>
              </div>

              <div className="pt-2 border-t border-[#ECE5D7] flex items-center justify-between text-xs text-slate-500">
                <span>Références actives</span>
                <strong className="text-slate-800 font-mono-data">{metrics.totalProductsCount}</strong>
              </div>
            </div>
          </div>

          {/* Operational Low Stock Alert Card */}
          <div className="bg-white rounded-2xl border border-[#ECE5D7] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D85C3A]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Alertes Réapprovisionnement
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#FEF9EB] text-[#B47805] border border-[#F2C14E]/60 font-mono">
                {lowStockProducts.length}
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tous les articles sont au-dessus du seuil d'alerte.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Réf: {p.barcode || 'N/A'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                        {p.quantity} restant(s)
                      </span>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onNavigate('stock_in')}
                >
                  Entrer du stock maintenant
                </Button>
              </div>
            )}
          </div>

          {/* Quick System Integrity Badge */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#ECE5D7] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#123F46]" />
              <span>Base Locale SQLite & Données</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Le moteur SQLite local enregistre chaque vente de manière atomique. Aucune dépendance internet requise.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
