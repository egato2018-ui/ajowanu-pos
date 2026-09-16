import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA } from '../utils/formatters';
import { 
  Zap, 
  ShoppingCart, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Sparkles,
  Layers,
  Search,
  Receipt,
  Store,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame
} from 'lucide-react';

export const SmartReorderView: React.FC = () => {
  const settings = sqliteDB.getSettings();
  const currency = settings.currencySymbol || 'FCFA';

  const suggestions = sqliteDB.getSmartReorderSuggestions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>(suggestions.map(s => s.productId));
  const [createdPoSuccess, setCreatedPoSuccess] = useState<string | null>(null);
  const [showPrintSheet, setShowPrintSheet] = useState(false);

  const filtered = suggestions.filter(s => 
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSuggestions = suggestions.filter(s => selectedItems.includes(s.productId));
  const totalCost = selectedSuggestions.reduce((acc, s) => acc + s.estimatedCost, 0);
  const totalSuggestedUnits = selectedSuggestions.reduce((acc, s) => acc + s.suggestedQty, 0);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGeneratePOs = () => {
    if (selectedSuggestions.length === 0) return;

    // Group by supplier
    const grouped: Record<string, typeof selectedSuggestions> = {};
    selectedSuggestions.forEach(item => {
      const sup = item.supplierName || 'Grossiste Général';
      if (!grouped[sup]) grouped[sup] = [];
      grouped[sup].push(item);
    });

    const suppliersList = sqliteDB.getSuppliers();
    let generatedCount = 0;

    Object.entries(grouped).forEach(([supplierName, items]) => {
      const matchedSup = suppliersList.find(s => s.companyName.toLowerCase() === supplierName.toLowerCase());
      const poItems = items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        qty: i.suggestedQty,
        purchasePrice: i.purchasePrice,
      }));

      sqliteDB.savePurchaseOrder({
        supplierId: matchedSup?.id || 'SUP-AUTO',
        supplierName,
        items: poItems,
        totalAmount: items.reduce((acc, i) => acc + i.estimatedCost, 0),
        status: 'Ordered',
        notes: 'Généré automatiquement par le Moteur Intelligent de Réapprovisionnement',
      });
      generatedCount++;
    });

    setCreatedPoSuccess(`${generatedCount} bon(s) de commande créé(s) avec succès dans le module Achats !`);
    setTimeout(() => setCreatedPoSuccess(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête style Ticket & Registre */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Moteur Intelligent de Réapprovisionnement
              </h1>
              <p className="text-xs text-slate-500">
                Calcul dynamique de vélocité de vente, délais de réassort et seuils critiques pour prévenir les ruptures de stock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowPrintSheet(true)}
            className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F6F1E7] border border-[#E2D9C8] text-slate-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#D85C3A]" />
            <span>Fiche Réassort</span>
          </button>
          <button
            onClick={handleGeneratePOs}
            disabled={selectedItems.length === 0}
            className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#F2C14E]" />
            <span>Émettre Bons de Commande ({selectedItems.length})</span>
          </button>
        </div>
      </div>

      {createdPoSuccess && (
        <div className="p-4 bg-[#FAF7F2] border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{createdPoSuccess}</span>
        </div>
      )}

      {/* Cartes KPI synthétiques façon Reçu de Caisse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Articles en Alerte Stock
            </span>
            <div className="text-2xl font-black text-[#D85C3A] font-mono-data">
              {suggestions.length}
            </div>
            <span className="text-[11px] text-slate-500">Produits au seuil minimum ou épuisés</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Quantité Totale Suggérée
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono-data">
              {totalSuggestedUnits} unités
            </div>
            <span className="text-[11px] text-slate-500">Pour regarnir les rayons de vente</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Budget Réassort Estimé
            </span>
            <div className="text-2xl font-black text-[#123F46] font-mono-data">
              {formatFCFA(totalCost, currency)}
            </div>
            <span className="text-[11px] text-slate-500">Pour {selectedItems.length} article(s) coché(s)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tableau d'Analyse avec alignement type Ticket */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ECE5D7] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par article, catégorie ou fournisseur..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <button
              onClick={() => setSelectedItems(suggestions.map(s => s.productId))}
              className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F6F1E7] border border-[#E2D9C8] rounded-lg font-bold text-slate-700 cursor-pointer"
            >
              Tout Cocher
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F6F1E7] border border-[#E2D9C8] rounded-lg font-bold text-slate-700 cursor-pointer"
            >
              Tout Décocher
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#ECE5D7]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-slate-600 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 w-10 text-center">Choix</th>
                <th className="p-3">Désignation Article</th>
                <th className="p-3">Fournisseur Attitré</th>
                <th className="p-3 text-center">Stock Actuel</th>
                <th className="p-3 text-center">Seuil Min.</th>
                <th className="p-3 text-center">Vélocité / Jour</th>
                <th className="p-3 text-center">Rupture dans</th>
                <th className="p-3 text-center">Qté Suggérée</th>
                <th className="p-3 text-right">Coût Estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tous les stocks sont à niveau optimal !</p>
                    <p className="text-xs text-slate-500 mt-1">Aucun produit ne requiert de réapprovisionnement urgent.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.productId} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(s.productId)}
                        onChange={() => toggleSelect(s.productId)}
                        className="w-4 h-4 rounded text-[#123F46] accent-[#123F46] cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 leading-tight">{s.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{s.category}</div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {s.supplierName}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                        s.currentStock === 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.currentStock} {s.unit}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-500">
                      {s.minStockLevel} {s.unit}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600">
                      ~{s.avgDailySales} / jour
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        s.currentStock === 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : s.daysRemaining <= 2 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.currentStock === 0 ? 'RUPTURE' : `${s.daysRemaining} j restants`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-mono-data font-black text-emerald-700 text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        +{s.suggestedQty} {s.unit}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black font-mono-data text-slate-900 text-xs">
                      {formatFCFA(s.estimatedCost, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Fiche / Reçu de Réassort Imprimable */}
      {showPrintSheet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 shadow-2xl border border-[#ECE5D7]">
            {/* Header du Bordereau */}
            <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-5 h-5 text-[#D85C3A]" />
                  <h2 className="font-black text-base uppercase tracking-tight">{settings.shopName}</h2>
                </div>
                <p className="text-[11px] text-slate-500">Plan Prévisionnel de Réassort Automatisé</p>
                <div className="font-mono font-bold text-[11px] text-[#123F46] mt-0.5">
                  Édité le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button 
                onClick={() => setShowPrintSheet(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tableau Articles épuré style ticket */}
            <div className="border border-[#ECE5D7] rounded-xl overflow-hidden text-xs max-h-80 overflow-y-auto">
              <div className="bg-[#FAF7F2] p-2.5 font-bold text-slate-700 border-b border-[#ECE5D7] flex justify-between text-[10px] uppercase">
                <span>Article / Fournisseur</span>
                <span>Stock / Commande</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                {selectedSuggestions.map((s, idx) => (
                  <div key={idx} className="p-2 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{s.productName}</div>
                      <div className="text-[10px] text-slate-500">{s.supplierName} • Stock actuel : {s.currentStock}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-data font-bold text-emerald-700">+{s.suggestedQty} {s.unit}</div>
                      <div className="font-mono text-[10px] text-slate-500">{formatFCFA(s.estimatedCost, currency)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#FAF7F2] p-3 border-t-2 border-slate-900 flex justify-between items-center font-black">
                <span className="uppercase text-xs tracking-wider">Total Estimé du Réassort</span>
                <span className="font-mono-data text-[#D85C3A] text-base">
                  {formatFCFA(totalCost, currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Fiche</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
