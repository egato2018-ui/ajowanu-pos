import React, { useState } from 'react';
import { Sale, Product, ShopSettings } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  BarChart3, 
  Download, 
  PieChart, 
  Award,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface ReportsViewProps {
  sales: Sale[];
  products: Product[];
  settings: ShopSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  settings,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const currency = settings.currencySymbol || 'FCFA';

  // Date filtering logic
  const now = new Date();
  const filteredSales = sales.filter(s => {
    if (s.status !== 'Completed') return false;
    const saleDate = new Date(s.dateTime);

    if (timeRange === 'today') {
      return saleDate.toDateString() === now.toDateString();
    } else if (timeRange === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return saleDate >= sevenDaysAgo;
    } else if (timeRange === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      return saleDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate totals
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + s.totalProfit, 0);
  const totalDiscount = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalTax = filteredSales.reduce((acc, s) => acc + s.taxAmount, 0);
  const totalTransactions = filteredSales.length;

  // Best Selling Products Aggregation
  const itemSalesMap: { [productName: string]: { qty: number; revenue: number; profit: number } } = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (!itemSalesMap[item.productName]) {
        itemSalesMap[item.productName] = { qty: 0, revenue: 0, profit: 0 };
      }
      itemSalesMap[item.productName].qty += item.quantity;
      itemSalesMap[item.productName].revenue += item.totalPrice;
      const profitPerUnit = item.unitSellingPrice - item.unitPurchasePrice;
      itemSalesMap[item.productName].profit += profitPerUnit * item.quantity;
    });
  });

  const bestSellers = Object.entries(itemSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Payment Breakdown
  const paymentBreakdown = {
    'Espèces': {
      amount: filteredSales.filter(s => s.paymentMode === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0),
      color: 'bg-[#123F46]'
    },
    'Mobile Money (MoMo / QR)': {
      amount: filteredSales.filter(s => s.paymentMode === 'UPI').reduce((acc, s) => acc + s.totalAmount, 0),
      color: 'bg-[#D85C3A]'
    },
    'Carte bancaire': {
      amount: filteredSales.filter(s => s.paymentMode === 'Card').reduce((acc, s) => acc + s.totalAmount, 0),
      color: 'bg-[#F2C14E]'
    },
    'Crédit client': {
      amount: filteredSales.filter(s => s.paymentMode === 'Credit').reduce((acc, s) => acc + s.totalAmount, 0),
      color: 'bg-slate-400'
    },
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvStr = `N° Facture,Date & Heure,Client,Telephone,Nombre Articles,Sous-Total,Remise,TVA,Net a Payer,Mode de Reglement,Marge Beneficiaire\n`;
    filteredSales.forEach(s => {
      csvStr += `"${s.invoiceNumber}","${s.dateTime}","${s.customerName || 'Client Comptant'}","${s.customerPhone || ''}",${s.items.length},${s.subtotal},${s.discountAmount},${s.taxAmount},${s.totalAmount},"${s.paymentMode === 'Cash' ? 'Espèces' : s.paymentMode === 'UPI' ? 'MoMo' : s.paymentMode}",${s.totalProfit}\n`;
    });

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ajowanu_rapport_ventes_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <PageHeader
        title="Rapports & Rentabilité Commerciale"
        subtitle="Chiffre d'affaires net, marges réelles encaissées, répartition des règlements et palmarès des ventes."
        icon={<BarChart3 className="w-5 h-5 text-[#D85C3A]" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time Filter Toggle */}
            <div className="bg-[#FAF8F5] p-1 rounded-xl flex text-xs font-semibold border border-[#ECE5D7]">
              {([
                { key: 'today', label: "Aujourd'hui" },
                { key: 'week', label: '7 jours' },
                { key: 'month', label: '30 jours' },
                { key: 'all', label: 'Tout' }
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    timeRange === key
                      ? 'bg-[#123F46] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCSV}
            >
              Exporter CSV
            </Button>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaires Net</p>
          <div className="text-2xl font-black font-mono-data text-slate-900 mt-2">
            {formatFCFA(totalRevenue, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalTransactions} encaissement(s)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#123F46] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Marge Bénéficiaire Nette
          </p>
          <div className="text-2xl font-black font-mono-data text-[#123F46] mt-2">
            {formatFCFA(totalProfit, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Taux de marge : <strong className="text-slate-800">{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%</strong>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remises Accordées</p>
          <div className="text-2xl font-black font-mono-data text-[#D85C3A] mt-2">
            {formatFCFA(totalDiscount, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Avantages clients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TVA Déclarable</p>
          <div className="text-2xl font-black font-mono-data text-slate-700 mt-2">
            {formatFCFA(totalTax, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Provision fiscale collectée</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 10 Best Selling Items (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#FEF9EB] text-[#B47805] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Top 10 des Articles les Plus Vendus
              </h3>
              <p className="text-[11px] text-slate-400">Classés par volume de pièces écoulées sur la période</p>
            </div>
          </div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              Aucune donnée d'encaissement sur cette période.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#ECE5D7] text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-3">Rang</th>
                    <th className="pb-3">Désignation</th>
                    <th className="pb-3 text-center">Volume Écoulé</th>
                    <th className="pb-3 text-right">Chiffre d'Affaires</th>
                    <th className="pb-3 text-right">Marge Bénéficiaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE5D7]">
                  {bestSellers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-3 font-bold font-mono text-slate-400">#{idx + 1}</td>
                      <td className="py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FDF3F0] text-[#D85C3A] font-mono-data font-bold text-xs">
                          {item.qty} pcs
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono-data font-bold text-slate-900">
                        {formatFCFA(item.revenue, currency)}
                      </td>
                      <td className="py-3 text-right font-mono-data text-[#123F46] font-bold">
                        {formatFCFA(item.profit, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Mode Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#123F46] border border-[#ECE5D7] flex items-center justify-center font-bold">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Canaux de Règlement
                </h3>
                <p className="text-[11px] text-slate-400">Part respective de chaque moyen de paiement</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {Object.entries(paymentBreakdown).map(([mode, { amount, color }]) => {
                const percent = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

                return (
                  <div key={mode} className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5D7] text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{mode}</span>
                      <span className="font-mono-data text-slate-900 font-bold">
                        {formatFCFA(amount, currency)} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-[#ECE5D7] h-2 rounded-full overflow-hidden mt-2.5">
                      <div
                        className={`${color} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
