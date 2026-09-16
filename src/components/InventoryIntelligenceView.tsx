import React, { useState } from 'react';
import { Product, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  PackageX, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface InventoryIntelligenceViewProps {
  settings: ShopSettings;
}

export const InventoryIntelligenceView: React.FC<InventoryIntelligenceViewProps> = ({ settings }) => {
  const products = sqliteDB.getProducts();
  const sales = sqliteDB.getSales();

  const [activeTab, setActiveTab] = useState<'fast' | 'slow' | 'dead' | 'low' | 'expiring'>('fast');
  const currency = settings.currencySymbol || 'FCFA';

  // Compute product sales quantities
  const productSalesMap: Record<string, number> = {};
  sales.forEach(s => {
    s.items.forEach(i => {
      productSalesMap[i.productId] = (productSalesMap[i.productId] || 0) + i.quantity;
    });
  });

  // Fast moving: highest sales
  const fastMovingProducts = [...products]
    .sort((a, b) => (productSalesMap[b.id] || 0) - (productSalesMap[a.id] || 0))
    .slice(0, 8);

  // Slow moving: 1-2 sales
  const slowMovingProducts = products.filter(p => (productSalesMap[p.id] || 0) > 0 && (productSalesMap[p.id] || 0) <= 2);

  // Dead stock: zero sales
  const deadStockProducts = products.filter(p => !productSalesMap[p.id] || productSalesMap[p.id] === 0);

  // Low stock
  const lowStockProducts = products.filter(p => p.quantity <= (p.minStockLevel || settings.lowStockThreshold));

  // Expiring soon (<30 days)
  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate).getTime();
    const thirtyDays = Date.now() + 30 * 24 * 3600 * 1000;
    return exp <= thirtyDays;
  });

  const getActiveList = () => {
    switch (activeTab) {
      case 'fast': return fastMovingProducts;
      case 'slow': return slowMovingProducts;
      case 'dead': return deadStockProducts;
      case 'low': return lowStockProducts;
      case 'expiring': return expiringProducts;
    }
  };

  const currentList = getActiveList();

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Intelligence & Rotation des Stocks"
        subtitle="Analyses prédictives du rayon : identification des meilleures ventes, stocks dormants à déstocker et alertes de réapprovisionnement."
        icon={<Sparkles className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <Badge variant="teal" size="sm">
            Moteur d'Optimisation Local
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ECE5D7] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'fast' 
              ? 'bg-[#123F46] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#F2C14E]" />
          <span>Forte Rotation / Best-sellers ({fastMovingProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'slow' 
              ? 'bg-[#123F46] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-amber-500" />
          <span>Rotation Lente ({slowMovingProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dead')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'dead' 
              ? 'bg-[#123F46] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
          }`}
        >
          <PackageX className="w-4 h-4 text-rose-500" />
          <span>Stock Dormant / Invendus ({deadStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('low')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'low' 
              ? 'bg-[#123F46] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#D85C3A]" />
          <span>Réapprovisionnement Urgent ({lowStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'expiring' 
              ? 'bg-[#123F46] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-[#FAF8F5] border border-[#ECE5D7]'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-500" />
          <span>Risque Péremption &lt; 30j ({expiringProducts.length})</span>
        </button>
      </div>

      {/* Product List Grid */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ECE5D7] p-12 shadow-xs">
          <EmptyState
            title="Aucun produit dans cette catégorie"
            description="L'analyse en temps réel ne détecte aucun article correspondant à ce critère."
            icon={<Sparkles className="w-6 h-6 text-[#123F46]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentList.map(product => {
            const soldCount = productSalesMap[product.id] || 0;
            const isCriticalStock = product.quantity <= (product.minStockLevel || settings.lowStockThreshold);

            return (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl border border-[#ECE5D7] p-5 space-y-3.5 shadow-xs hover:border-[#D85C3A]/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono bg-[#FAF8F5] border border-[#ECE5D7] px-2 py-0.5 rounded-md text-slate-500">
                      {product.category || 'Général'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5 line-clamp-1">{product.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D85C3A]" />
                      <span>Emplacement : <strong className="text-slate-700">{product.shelfLocation || 'Rayon principal'}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">En Rayon</span>
                    <span className={`text-base font-bold font-mono-data ${
                      isCriticalStock ? 'text-rose-600' : 'text-[#123F46]'
                    }`}>
                      {product.quantity} {product.unit || 'u'}
                    </span>
                  </div>
                </div>

                {product.expiryDate && (
                  <div className="text-[11px] p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>DLC / DLUO : {formatDateFR(product.expiryDate)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Volume Écoulé</span>
                    <span className="font-bold text-emerald-700 font-mono-data">{soldCount} vendus</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Prix de Vente</span>
                    <span className="font-bold text-slate-900 font-mono-data">{formatFCFA(product.sellingPrice, currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
