import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { PriceHistoryRecord } from '../types';
import { formatFCFA, formatDateTimeFR, formatDateFR } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown,
  History, 
  User, 
  Calendar, 
  Search,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Printer,
  Coins,
  Percent
} from 'lucide-react';

export const PriceHistoryView: React.FC = () => {
  const [records, setRecords] = useState<PriceHistoryRecord[]>(() => sqliteDB.getPriceHistory());
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'up' | 'down'>('all');
  const settings = sqliteDB.getSettings();
  const currency = settings.currencySymbol || 'FCFA';

  const filtered = records.filter(r => {
    const matchesSearch = 
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.changedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (directionFilter === 'up') {
      return r.newSellingPrice > r.oldSellingPrice;
    }
    if (directionFilter === 'down') {
      return r.newSellingPrice < r.oldSellingPrice;
    }
    return true;
  });

  const priceIncreases = records.filter(r => r.newSellingPrice > r.oldSellingPrice).length;
  const priceDecreases = records.filter(r => r.newSellingPrice < r.oldSellingPrice).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête style Ticket & Registre */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Piste d'Audit & Historique des Tarifs
              </h1>
              <p className="text-xs text-slate-500">
                Traçabilité certifiée des fluctuations de prix d'achat grossiste, révisions tarifaires et protection de vos marges commerciales.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F6F1E7] border border-[#E2D9C8] text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs cursor-pointer self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-[#D85C3A]" />
          <span>Imprimer Registre Tarifaire</span>
        </button>
      </div>

      {/* Cartes KPI synthétiques façon Reçu de Caisse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Ajustements Enregistrés
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono-data">
              {records.length}
            </div>
            <span className="text-[11px] text-slate-500">Modifications de prix auditées</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-slate-700">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Révisions à la Hausse
            </span>
            <div className="text-2xl font-black text-[#123F46] font-mono-data">
              {priceIncreases}
            </div>
            <span className="text-[11px] text-slate-500">Augmentations pour préservation marge</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Révisions à la Baisse
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono-data">
              {priceDecreases}
            </div>
            <span className="text-[11px] text-slate-500">Ajustements promotionnels ou concurrence</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-amber-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres épurée */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#ECE5D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom d'article ou collaborateur..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setDirectionFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              directionFilter === 'all'
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({records.length})
          </button>
          <button
            onClick={() => setDirectionFilter('up')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              directionFilter === 'up'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hausses ({priceIncreases})
          </button>
          <button
            onClick={() => setDirectionFilter('down')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              directionFilter === 'down'
                ? 'bg-[#D85C3A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Baisses ({priceDecreases})
          </button>
        </div>
      </div>

      {/* Tableau d'Audit avec alignement type Ticket */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-slate-600 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Désignation de l'Article</th>
                <th className="py-3 px-4 text-center">Coût d'Achat Grossiste</th>
                <th className="py-3 px-4 text-center">Prix de Vente Public</th>
                <th className="py-3 px-4 text-center">Évolution Vente</th>
                <th className="py-3 px-4 text-center">Marge Brute Finale</th>
                <th className="py-3 px-4 text-right">Auteur de la Modification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">Aucune modification tarifaire trouvée</p>
                    <p className="text-xs text-slate-400 mt-1">Chaque modification de prix dans le catalogue est consignée ici.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
                  const sellingDiff = r.newSellingPrice - r.oldSellingPrice;
                  const purchaseDiff = r.newPurchasePrice - r.oldPurchasePrice;
                  const marginAmount = r.newSellingPrice - r.newPurchasePrice;
                  const marginPercent = r.newSellingPrice > 0 ? Math.round((marginAmount / r.newSellingPrice) * 100) : 0;

                  return (
                    <tr key={r.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{formatDateFR(r.dateChanged)}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(r.dateChanged).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {r.productName}
                      </td>

                      {/* Coût d'achat */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-slate-400 line-through">{formatFCFA(r.oldPurchasePrice, currency)}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-bold text-slate-800">{formatFCFA(r.newPurchasePrice, currency)}</span>
                        </div>
                        {purchaseDiff !== 0 && (
                          <div className={`text-[10px] font-mono ${purchaseDiff > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {purchaseDiff > 0 ? `+${formatFCFA(purchaseDiff, currency)}` : formatFCFA(purchaseDiff, currency)}
                          </div>
                        )}
                      </td>

                      {/* Prix de vente */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-slate-400 line-through">{formatFCFA(r.oldSellingPrice, currency)}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-black text-slate-900">{formatFCFA(r.newSellingPrice, currency)}</span>
                        </div>
                      </td>

                      {/* Évolution vente badge */}
                      <td className="py-3 px-4 text-center">
                        {sellingDiff > 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                            <ArrowUpRight className="w-3 h-3" />
                            +{formatFCFA(sellingDiff, currency)}
                          </span>
                        ) : sellingDiff < 0 ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 font-mono">
                            <ArrowDownRight className="w-3 h-3" />
                            {formatFCFA(sellingDiff, currency)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-mono">Inchangé</span>
                        )}
                      </td>

                      {/* Marge brute */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono-data font-bold text-slate-800 text-xs">
                          {formatFCFA(marginAmount, currency)}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          ({marginPercent}% de marge)
                        </span>
                      </td>

                      {/* Auteur */}
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#123F46] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E2D9C8]">
                          <User className="w-3 h-3" />
                          {r.changedBy}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
