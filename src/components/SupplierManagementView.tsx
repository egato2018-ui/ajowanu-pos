import React, { useState } from 'react';
import { Supplier, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA } from '../utils/formatters';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Edit3, 
  Trash2, 
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Coins
} from 'lucide-react';

interface SupplierManagementViewProps {
  settings: ShopSettings;
}

export const SupplierManagementView: React.FC<SupplierManagementViewProps> = ({ settings }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => sqliteDB.getSuppliers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'clear'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  const [paymentModalSupplier, setPaymentModalSupplier] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const currency = settings.currencySymbol || 'FCFA';

  const refreshSuppliers = () => {
    setSuppliers(sqliteDB.getSuppliers());
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterType === 'due') return (s.outstandingBalance || 0) > 0;
    if (filterType === 'clear') return (s.outstandingBalance || 0) === 0;
    return true;
  });

  const totalOutstanding = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  const dueCount = suppliers.filter(s => (s.outstandingBalance || 0) > 0).length;

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier?.name || !editingSupplier?.companyName || !editingSupplier?.phone) return;

    sqliteDB.saveSupplier({
      ...editingSupplier,
      name: editingSupplier.name,
      companyName: editingSupplier.companyName,
      phone: editingSupplier.phone,
      paymentTerms: editingSupplier.paymentTerms || 'Paiement à la livraison',
    });

    setShowAddModal(false);
    setEditingSupplier(null);
    refreshSuppliers();
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    if (window.confirm(`Déplacer le fournisseur "${name}" vers la corbeille de récupération ?`)) {
      sqliteDB.deleteSupplier(id);
      refreshSuppliers();
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalSupplier || paymentAmount <= 0) return;

    sqliteDB.recordSupplierPayment(paymentModalSupplier.id, paymentAmount, paymentMode, paymentNotes);
    setPaymentModalSupplier(null);
    setPaymentAmount(0);
    setPaymentNotes('');
    refreshSuppliers();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête style Ticket & Registre */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Annuaire Fournisseurs & Comptes Grossistes
              </h1>
              <p className="text-xs text-slate-500">
                Suivi des grossistes, conditions d'approvisionnement, IFU et balance des dettes à régler.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingSupplier({ paymentTerms: 'Paiement à la livraison' });
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F2C14E]" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* Cartes KPI synthétiques façon Reçu de Caisse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Grossistes Référencés
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono-data">
              {suppliers.length}
            </div>
            <span className="text-[11px] text-slate-500">Partenaires d'approvisionnement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Dette Fournisseurs Globale
            </span>
            <div className="text-2xl font-black text-[#D85C3A] font-mono-data">
              {formatFCFA(totalOutstanding, currency)}
            </div>
            <span className="text-[11px] text-slate-500">Encours à régler aux grossistes</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Comptes avec Dettes
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono-data">
              {dueCount}
            </div>
            <span className="text-[11px] text-slate-500">Grossistes en attente de paiement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-amber-600">
            <Receipt className="w-5 h-5" />
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par société, contact ou téléphone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({suppliers.length})
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'due'
                ? 'bg-[#D85C3A] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Avec dettes ({dueCount})
          </button>
          <button
            onClick={() => setFilterType('clear')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'clear'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            À jour ({suppliers.length - dueCount})
          </button>
        </div>
      </div>

      {/* Grille des Fournisseurs au format Fiche/Ticket épuré */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => (
          <div 
            key={sup.id} 
            className="bg-white rounded-2xl border border-[#ECE5D7] shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
          >
            {/* Haut de fiche */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-[#FAF7F2] text-[#123F46] border border-[#E2D9C8] px-2 py-0.5 rounded-md">
                      {sup.id}
                    </span>
                    {sup.gstin && (
                      <span className="text-[10px] font-mono text-slate-500">
                        IFU : {sup.gstin}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                    {sup.companyName}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="text-slate-400">Contact :</span> {sup.name}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSupplier(sup);
                      setShowAddModal(true);
                    }}
                    title="Modifier la fiche fournisseur"
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(sup.id, sup.companyName)}
                    title="Supprimer / Corbeille"
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Ligne pointillée type ticket */}
              <div className="border-b border-dashed border-slate-200"></div>

              {/* Coordonnées */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-800">{sup.phone}</span>
                </div>

                {sup.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-700">{sup.email}</span>
                  </div>
                )}

                {sup.address && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bas de ticket : Modalités & Dette */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-[#ECE5D7] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Condition</span>
                <span className="font-semibold text-slate-700 text-[11px]">
                  {sup.paymentTerms || 'Comptant'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Encours Dette</span>
                <span className={`font-mono-data font-black text-sm ${
                  (sup.outstandingBalance || 0) > 0 ? 'text-[#D85C3A]' : 'text-emerald-700'
                }`}>
                  {formatFCFA(sup.outstandingBalance || 0, currency)}
                </span>
              </div>
            </div>

            {/* Bouton de règlement rapide si dette active */}
            {(sup.outstandingBalance || 0) > 0 && (
              <div className="px-3.5 pb-3 bg-[#FAF7F2] border-t border-slate-100">
                <button
                  onClick={() => {
                    setPaymentModalSupplier(sup);
                    setPaymentAmount(sup.outstandingBalance || 0);
                  }}
                  className="w-full mt-2 py-1.5 px-3 bg-white border border-[#D85C3A]/40 hover:bg-[#D85C3A] hover:text-white text-[#D85C3A] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Régler un acompte</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Aucun fournisseur trouvé</p>
          <p className="text-xs text-slate-500 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau grossiste.</p>
        </div>
      )}

      {/* Modal Ajout / Modification Fournisseur */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#123F46] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {editingSupplier?.id ? 'Modifier la Fiche Fournisseur' : 'Nouveau Fournisseur Partenaire'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Raison Sociale / Grossiste *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier?.companyName || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="ex. SOBEBRA Distribution"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom du Contact / Représentant *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier?.name || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex. Mathieu Soglo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier?.phone || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="ex. +229 97 00 11 22"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numéro IFU (Fiscalité)</label>
                  <input
                    type="text"
                    value={editingSupplier?.gstin || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="3202100000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email professionnel</label>
                  <input
                    type="email"
                    value={editingSupplier?.email || ''}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@fournisseur.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalités de Règlement</label>
                  <input
                    type="text"
                    value={editingSupplier?.paymentTerms || 'Paiement à la livraison'}
                    onChange={e => setEditingSupplier(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="ex. À la livraison / Crédit 15j"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse de l'Entrepôt / Dépôt</label>
                <input
                  type="text"
                  value={editingSupplier?.address || ''}
                  onChange={e => setEditingSupplier(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="ex. Zone Industrielle Akpakpa, Cotonou"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Enregistrer le Fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Règlement Paiement Fournisseur */}
      {paymentModalSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#D85C3A] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Règlement Dette Fournisseur</h3>
                  <p className="text-[11px] text-slate-500">{paymentModalSupplier.companyName}</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentModalSupplier(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5D7] flex justify-between items-center text-xs">
              <span className="text-slate-600">Dette actuelle due :</span>
              <span className="font-mono-data font-black text-[#D85C3A] text-sm">
                {formatFCFA(paymentModalSupplier.outstandingBalance || 0, currency)}
              </span>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Montant versé ({currency}) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentModalSupplier.outstandingBalance || 999999999}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 font-mono-data font-bold text-base focus:outline-none focus:border-[#123F46]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mode de règlement *</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                >
                  <option value="Cash">Espèces (CASH)</option>
                  <option value="Mobile Money">Mobile Money (MTN / Moov)</option>
                  <option value="Virement">Virement bancaire</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence / Note (Facultatif)</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  placeholder="ex. N° Reçu ou chèque 45102"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalSupplier(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Valider le Paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
