import React, { useMemo } from 'react';
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
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';

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

  // 7-day revenue trend
  const last7DaysData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      
      const daySales = recentSales.filter(s => {
        if (s.status !== 'Completed') return false;
        return new Date(s.dateTime).toDateString() === dateStr;
      });

      const amount = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
      data.push({
        name: label,
        montant: amount,
        ventes: daySales.length,
      });
    }
    return data;
  }, [recentSales]);

  // Payment Breakdown for Donut Chart
  const paymentBreakdownData = useMemo(() => {
    const data = [
      { name: 'Espèces', value: todayCash, color: '#123F46' },
      { name: 'MoMo / QR', value: todayUpi, color: '#D85C3A' },
      { name: 'Carte', value: todayCard, color: '#F2C14E' },
      { name: 'À Crédit', value: todayCredit, color: '#64748B' },
    ];
    return data.filter(d => d.value > 0);
  }, [todayCash, todayUpi, todayCard, todayCredit]);

  // Top Selling Products aggregated from completed sales
  const topProducts = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    recentSales.filter(s => s.status === 'Completed').forEach(sale => {
      sale.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        itemMap[item.name].qty += item.quantity;
        itemMap[item.name].revenue += item.total;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
  }, [recentSales]);

  // Total Real Inventory Valuation
  const realInventoryValue = useMemo(() => {
    return metrics.totalStockValue || 0;
  }, [metrics.totalStockValue]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header & Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border border-[#ECE5D7] p-5 sm:p-6 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-[#D85C3A] uppercase tracking-wider">
                Système Prêt & Opérationnel
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Base Locale SQLite Sécurisée
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bonjour, {settings.ownerName || 'Gérant'} — {settings.shopName}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Vos transactions, encaissements et niveaux de stock sont traités en temps réel et stockés localement sur votre terminal.
            </p>
          </div>

          {/* Quick Action Buttons */}
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
      </motion.div>

      {/* 2. Key Performance Indicators (4 Clean Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Chiffre d'Affaires du Jour */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-[#ECE5D7] p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CA du Jour
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono-data mt-1.5">
                {formatFCFA(metrics.todaySalesAmount, currency)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FDF3F0] text-[#D85C3A] flex items-center justify-center shrink-0 border border-[#D85C3A]/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-slate-800 font-mono">{metrics.todaySalesCount}</strong> vente(s) conclue(s)
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Actif</span>
          </div>
        </motion.div>

        {/* KPI 2: Bénéfice Net Estimé */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#ECE5D7] p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Marge Nette du Jour
              </span>
              <div className="text-2xl font-black text-[#123F46] font-mono-data mt-1.5">
                {formatFCFA(metrics.todayProfit, currency)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F1F2] text-[#123F46] flex items-center justify-center shrink-0 border border-[#123F46]/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium truncate">
              Cumul : <strong className="text-slate-800 font-mono-data">{formatFCFA(metrics.totalProfitAllTime, currency)}</strong>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Global</span>
          </div>
        </motion.div>

        {/* KPI 3: Valeur du Stock en Rayon */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#ECE5D7] p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Valeur du Stock
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono-data mt-1.5">
                {formatFCFA(realInventoryValue, currency)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#123F46] flex items-center justify-center shrink-0 border border-[#ECE5D7]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              <strong className="text-slate-800 font-mono">{metrics.totalProductsCount}</strong> articles au catalogue
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Inventaire</span>
          </div>
        </motion.div>

        {/* KPI 4: Alertes Réapprovisionnement */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#ECE5D7] p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Articles en Rupture
              </span>
              <div className={`text-2xl font-black font-mono-data mt-1.5 ${
                lowStockProducts.length > 0 ? 'text-[#D85C3A]' : 'text-slate-900'
              }`}>
                {lowStockProducts.length} référence(s)
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#FEF9EB] text-[#B47805] flex items-center justify-center shrink-0 border border-[#F2C14E]/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Seuil d'alerte : <strong className="text-slate-800 font-mono">{settings.lowStockThreshold || 5} u.</strong>
            </span>
            <button
              onClick={() => onNavigate('smart_reorder')}
              className="text-[10px] text-[#D85C3A] font-bold hover:underline cursor-pointer"
            >
              Commander
            </button>
          </div>
        </motion.div>

      </div>

      {/* 3. Modern Charts Section (2 Columns: AreaChart Trend + Donut Payment Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Sales Evolution AreaChart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#ECE5D7] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] flex items-center justify-center text-[#123F46]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Évolution du Chiffre d'Affaires</h3>
                <p className="text-[11px] text-slate-400">Tendance des transactions sur les 7 derniers jours</p>
              </div>
            </div>
            <Badge variant="teal" size="sm">
              7 Derniers Jours
            </Badge>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#123F46" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#123F46" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#ECE5D7' }} 
                  tick={{ fontFamily: "'IBM Plex Sans', monospace", fill: '#64748b', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontFamily: "'IBM Plex Sans', monospace", fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <RechartsTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-bold capitalize text-slate-300">{label}</p>
                          <p className="text-sm font-black font-mono text-[#F2C14E]">
                            {formatFCFA(data.montant, currency)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {data.ventes} vente(s) enregistrée(s)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="montant" 
                  stroke="#123F46" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorMontant)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Payment Mode Distribution Donut Chart */}
        <div className="bg-white rounded-3xl border border-[#ECE5D7] p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] flex items-center justify-center text-[#D85C3A]">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Règlements du Jour</h3>
                  <p className="text-[11px] text-slate-400">Ventilation par moyen de paiement</p>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-44 w-full relative flex items-center justify-center my-2">
              {paymentBreakdownData.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">
                  Aucun encaissement aujourd'hui
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: any) => formatFCFA(Number(val), currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment Breakdown Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#ECE5D7]">
            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7]">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#123F46]" />
                <span>Espèces</span>
              </div>
              <div className="font-bold font-mono text-slate-900 text-xs">
                {formatFCFA(todayCash, currency)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7]">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#D85C3A]" />
                <span>MoMo / QR</span>
              </div>
              <div className="font-bold font-mono text-slate-900 text-xs">
                {formatFCFA(todayUpi, currency)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7]">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F2C14E]" />
                <span>Carte</span>
              </div>
              <div className="font-bold font-mono text-slate-900 text-xs">
                {formatFCFA(todayCard, currency)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7]">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                <span>À Crédit</span>
              </div>
              <div className="font-bold font-mono text-slate-900 text-xs">
                {formatFCFA(todayCredit, currency)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Recent Sales Activity Feed & Top Products (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Sales Activity */}
        <div className="bg-white rounded-3xl border border-[#ECE5D7] p-5 shadow-xs space-y-3">
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
              Historique complet
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Aucune vente enregistrée pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-[#ECE5D7]">
              {recentSales.slice(0, 4).map((sale) => (
                <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#FAF7F2] px-2 rounded-xl transition">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono text-slate-900">
                        {sale.invoiceNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FAF7F2] text-slate-600 border border-[#ECE5D7] font-semibold">
                        {sale.paymentMode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {sale.customerName || 'Client Comptoir'} • {sale.items.length} art. • {new Date(sale.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {formatFCFA(sale.totalAmount, currency)}
                    </span>
                    <button
                      onClick={() => onViewInvoice(sale)}
                      className="p-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#ECE5D7] text-slate-700 transition cursor-pointer border border-[#ECE5D7]"
                      title="Voir le ticket"
                      aria-label="Voir le ticket"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#123F46]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products / Most Demanded */}
        <div className="bg-white rounded-3xl border border-[#ECE5D7] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Articles les Plus Demandés
              </h3>
              <p className="text-[11px] text-slate-400">
                Rotation et volumes vendus
              </p>
            </div>
            <button
              onClick={() => onNavigate('inventory_intel')}
              className="text-xs font-bold text-[#D85C3A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Intelligence stock
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Aucune statistique de vente disponible.
            </div>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#123F46] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        CA généré : {formatFCFA(p.revenue, currency)}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-white border border-[#ECE5D7] text-slate-800 shrink-0 shadow-2xs">
                    {p.qty} vendus
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
