import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { RecycleBinItem } from '../types';
import { formatDateFR } from '../utils/formatters';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Users, 
  Truck, 
  TrendingDown,
  Search,
  ShieldCheck,
  Calendar,
  User,
  Info,
  X
} from 'lucide-react';

export const RecycleBinView: React.FC = () => {
  const [items, setItems] = useState<RecycleBinItem[]>(() => sqliteDB.getRecycleBin());
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<RecycleBinItem | null>(null);

  const refresh = () => {
    setItems(sqliteDB.getRecycleBin());
  };

  const handleRestore = (id: string, title: string) => {
    const ok = sqliteDB.restoreFromRecycleBin(id);
    if (ok) {
      setSuccessMsg(`L'élément "${title}" a été restauré avec succès dans la base active !`);
      setTimeout(() => setSuccessMsg(''), 4000);
      refresh();
      if (previewItem?.id === id) setPreviewItem(null);
    }
  };

  const handlePermanentDelete = (id: string, title: string) => {
    if (window.confirm(`Supprimer définitivement "${title}" ? Cette action est irréversible.`)) {
      sqliteDB.deletePermanentlyFromRecycleBin(id);
      refresh();
      if (previewItem?.id === id) setPreviewItem(null);
    }
  };

  const handleEmpty = () => {
    if (window.confirm('Vider intégralement la corbeille de sécurité ? Tous les éléments archivés seront définitivement purgés.')) {
      sqliteDB.emptyRecycleBin();
      refresh();
      setPreviewItem(null);
      setSuccessMsg('Corbeille de sécurité entièrement vidée.');
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const getItemIcon = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'Product': return <Package className="w-4 h-4 text-emerald-700" />;
      case 'Customer': return <Users className="w-4 h-4 text-[#123F46]" />;
      case 'Supplier': return <Truck className="w-4 h-4 text-[#D85C3A]" />;
      case 'Expense': return <TrendingDown className="w-4 h-4 text-rose-600" />;
    }
  };

  const getTypeLabel = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'Product': return 'Article Produit';
      case 'Customer': return 'Fiche Client';
      case 'Supplier': return 'Fiche Fournisseur';
      case 'Expense': return 'Dépense / Charge';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deletedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const countProducts = items.filter(i => i.type === 'Product').length;
  const countCustomers = items.filter(i => i.type === 'Customer').length;
  const countSuppliers = items.filter(i => i.type === 'Supplier').length;
  const countExpenses = items.filter(i => i.type === 'Expense').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête style Ticket & Registre */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Corbeille de Sécurité & Centre de Récupération
              </h1>
              <p className="text-xs text-slate-500">
                Conservation sécurisée des suppressions accidentelles avec restauration immédiate sans perte de données.
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleEmpty}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Vider la Corbeille</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-[#FAF7F2] border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-800 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cartes KPI synthétiques façon Reçu de Caisse */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Articles Produits
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono-data">
            {countProducts}
          </div>
          <span className="text-[10px] text-slate-500">Prêts à restaurer</span>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Fiches Clients
          </span>
          <div className="text-2xl font-black text-[#123F46] font-mono-data">
            {countCustomers}
          </div>
          <span className="text-[10px] text-slate-500">Profils sauvegardés</span>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Fournisseurs
          </span>
          <div className="text-2xl font-black text-[#D85C3A] font-mono-data">
            {countSuppliers}
          </div>
          <span className="text-[10px] text-slate-500">Grossistes archivés</span>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Dépenses & Frais
          </span>
          <div className="text-2xl font-black text-rose-700 font-mono-data">
            {countExpenses}
          </div>
          <span className="text-[10px] text-slate-500">Écritures comptables</span>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#ECE5D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un élément supprimé ou son identifiant..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({items.length})
          </button>
          <button
            onClick={() => setFilterType('Product')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'Product'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Articles ({countProducts})
          </button>
          <button
            onClick={() => setFilterType('Customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'Customer'
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clients ({countCustomers})
          </button>
          <button
            onClick={() => setFilterType('Supplier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'Supplier'
                ? 'bg-[#D85C3A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Fournisseurs ({countSuppliers})
          </button>
          <button
            onClick={() => setFilterType('Expense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'Expense'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dépenses ({countExpenses})
          </button>
        </div>
      </div>

      {/* Tableau des Éléments Archivés façon Reçu & Ticket */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-slate-600 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Type de Donnée</th>
                <th className="py-3 px-4">Élément / Identifiant Référence</th>
                <th className="py-3 px-4">Date de Suppression</th>
                <th className="py-3 px-4">Supprimé par</th>
                <th className="py-3 px-4 text-right">Actions de Récupération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">La corbeille est parfaitement vide</p>
                    <p className="text-xs text-slate-400 mt-1">Aucun enregistrement supprimé n'est en attente de restauration.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-[#FAF7F2] border border-[#E2D9C8] px-2.5 py-1 rounded-lg text-[11px]">
                        {getItemIcon(item.type)}
                        <span>{getTypeLabel(item.type)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Réf. d'origine : {item.originalId}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div>{formatDateFR(item.deletedAt)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.deletedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" />
                        {item.deletedBy}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 hover:bg-[#FAF7F2] border border-[#E2D9C8] text-slate-600 rounded-lg transition cursor-pointer"
                          title="Aperçu des données"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestore(item.id, item.title)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Restaurer</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id, item.title)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 rounded-lg transition cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Aperçu des Données Archivées */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-900 shadow-2xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#123F46] flex items-center justify-center">
                  {getItemIcon(previewItem.type)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Détail de l'élément archivé</h3>
                  <p className="text-[11px] text-slate-500">{getTypeLabel(previewItem.type)}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewItem(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5D7] text-xs space-y-1">
              <p><strong>Titre :</strong> {previewItem.title}</p>
              <p><strong>Identifiant :</strong> <span className="font-mono">{previewItem.originalId}</span></p>
              <p><strong>Date suppression :</strong> {formatDateFR(previewItem.deletedAt)}</p>
              <p><strong>Auteur :</strong> {previewItem.deletedBy}</p>
            </div>

            {/* Visualisation JSON formatée propre */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Contenu sauvegardé :</span>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 text-slate-700">
                {JSON.stringify(previewItem.data, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition text-xs"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => handleRestore(previewItem.id, previewItem.title)}
                className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-bold transition shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F2C14E]" />
                <span>Restaurer l'Élément</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
