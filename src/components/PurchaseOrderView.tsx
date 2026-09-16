import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Product, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  FileCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Building2, 
  Printer, 
  ChevronRight,
  PackageCheck,
  Truck,
  Receipt,
  ArrowDownToLine,
  Trash2,
  Calendar,
  Store,
  ShieldCheck,
  Search
} from 'lucide-react';

interface PurchaseOrderViewProps {
  settings: ShopSettings;
}

export const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({ settings }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => sqliteDB.getPurchaseOrders());
  const suppliers = sqliteDB.getSuppliers();
  const products = sqliteDB.getProducts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPOForPrint, setSelectedPOForPrint] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ordered' | 'Received'>('all');

  // Form state for creating PO
  const [supplierId, setSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<{ productId: string; productName: string; qty: number; purchasePrice: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const currency = settings.currencySymbol || 'FCFA';

  const refreshPOs = () => {
    setPurchaseOrders(sqliteDB.getPurchaseOrders());
  };

  const handleAddItemToPO = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setPoItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: prod.id, productName: prod.name, qty: 1, purchasePrice: prod.purchasePrice }];
    });
  };

  const handleRemoveItemFromPO = (productId: string) => {
    setPoItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || poItems.length === 0) return;

    const supplier = suppliers.find(s => s.id === supplierId);
    const totalAmount = poItems.reduce((acc, item) => acc + (item.qty * item.purchasePrice), 0);

    sqliteDB.savePurchaseOrder({
      supplierId,
      supplierName: supplier?.companyName || supplier?.name || 'Distributeur Grossiste',
      status: 'Ordered',
      items: poItems,
      totalAmount,
      notes,
    });

    setShowCreateModal(false);
    setPoItems([]);
    setNotes('');
    refreshPOs();
  };

  const handleMarkReceived = (poId: string) => {
    if (window.confirm('Confirmer la réception de cette commande ? Le stock de chaque article sera automatiquement augmenté.')) {
      sqliteDB.markPOAsReceived(poId);
      refreshPOs();
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && po.status !== statusFilter) return false;
    return true;
  });

  const totalOrderedAmount = purchaseOrders.reduce((acc, po) => acc + (po.totalAmount || 0), 0);
  const pendingCount = purchaseOrders.filter(po => po.status === 'Ordered').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête style Ticket & Registre */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECE5D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#D85C3A]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Bons de Commande & Réapprovisionnement Grossiste
              </h1>
              <p className="text-xs text-slate-500">
                Émission des commandes fournisseurs. À la réception, les stocks et prix de revient s'incrémentent automatiquement.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (suppliers.length === 0) {
              alert('Veuillez d\'abord ajouter un fournisseur dans l\'annuaire.');
              return;
            }
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F2C14E]" />
          <span>Créer un Bon de Commande</span>
        </button>
      </div>

      {/* Cartes KPI synthétiques façon Reçu de Caisse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Commandes Émises
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono-data">
              {purchaseOrders.length}
            </div>
            <span className="text-[11px] text-slate-500">Bons enregistrés dans l'historique</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-slate-700">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Volume d'Achat Global
            </span>
            <div className="text-2xl font-black text-[#123F46] font-mono-data">
              {formatFCFA(totalOrderedAmount, currency)}
            </div>
            <span className="text-[11px] text-slate-500">Montant total des approvisionnements</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              En Attente de Livraison
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono-data">
              {pendingCount}
            </div>
            <span className="text-[11px] text-slate-500">Colis en cours d'acheminement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2D9C8] flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#ECE5D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par N° Bon ou fournisseur..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('Ordered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'Ordered'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En transit ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('Received')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              statusFilter === 'Received'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Réceptionnées ({purchaseOrders.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Tableau des Bons de Commande avec alignement type Ticket */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] text-slate-600 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">N° Bon d'Achat</th>
                <th className="py-3 px-4">Fournisseur Grossiste</th>
                <th className="py-3 px-4">Date Émission</th>
                <th className="py-3 px-4">Contenu</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">Aucun bon de commande trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">Créez votre première commande pour réapprovisionner le magasin.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-[#FAF7F2] border border-[#E2D9C8] px-2 py-0.5 rounded-md text-[11px]">
                        #{po.poNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{po.supplierName}</div>
                      {po.notes && <div className="text-[10px] text-slate-400 truncate max-w-xs">{po.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {formatDateFR(po.orderDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{po.items.length}</span> article(s) •{' '}
                      <span className="font-mono text-slate-500">
                        {po.items.reduce((acc, i) => acc + i.qty, 0)} unités
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono-data text-slate-900 text-sm">
                      {formatFCFA(po.totalAmount, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        po.status === 'Received' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status === 'Received' ? (
                          <>
                            <PackageCheck className="w-3 h-3 text-emerald-700" />
                            <span>Réceptionné</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>En Transit</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status !== 'Received' && (
                          <button
                            onClick={() => handleMarkReceived(po.id)}
                            className="px-2.5 py-1.5 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Valider la réception et incrémenter les stocks"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#F2C14E]" />
                            <span>Réceptionner</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPOForPrint(po)}
                          className="p-1.5 hover:bg-[#FAF7F2] border border-[#E2D9C8] rounded-lg text-slate-700 hover:text-[#123F46] transition cursor-pointer"
                          title="Imprimer le Bordereau de Commande"
                        >
                          <Printer className="w-4 h-4" />
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

      {/* Modal Création de Bon de Commande */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#123F46] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Émission d'un Bon de Commande Fournisseur</h3>
                  <p className="text-[11px] text-slate-500">Sélectionnez le grossiste et les articles à réapprovisionner</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur Grossiste *</label>
                  <select
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.companyName} ({s.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Instructions logistiques</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ex. Livraison au magasin principal avant midi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-slate-900 focus:outline-none focus:border-[#123F46]"
                  />
                </div>
              </div>

              {/* Sélecteur de produits */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5D7] space-y-2">
                <label className="block font-bold text-slate-800">Ajouter un produit au bon de commande :</label>
                <div className="flex gap-2">
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddItemToPO(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#123F46]"
                  >
                    <option value="">-- Choisir un produit du catalogue --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock actuel : {p.quantity} | P.U Achat : {formatFCFA(p.purchasePrice, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tableau épuré des articles ajoutés */}
              {poItems.length > 0 ? (
                <div className="border border-[#ECE5D7] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#FAF7F2] text-slate-600 font-bold border-b border-[#ECE5D7] text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Article</th>
                        <th className="p-2.5 text-center">Qté Commandée</th>
                        <th className="p-2.5 text-right">P.U Achat ({currency})</th>
                        <th className="p-2.5 text-right">Sous-total</th>
                        <th className="p-2.5 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {poItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={e => {
                                const newQty = Math.max(1, Number(e.target.value));
                                setPoItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: newQty } : it));
                              }}
                              className="w-16 p-1 border border-slate-200 rounded-lg text-center font-mono font-bold bg-[#FAF7F2]"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              min={0}
                              value={item.purchasePrice}
                              onChange={e => {
                                const newPrice = Math.max(0, Number(e.target.value));
                                setPoItems(prev => prev.map((it, i) => i === idx ? { ...it, purchasePrice: newPrice } : it));
                              }}
                              className="w-24 p-1 border border-slate-200 rounded-lg text-right font-mono font-bold bg-[#FAF7F2]"
                            />
                          </td>
                          <td className="p-2.5 text-right font-bold font-mono-data text-slate-900">
                            {formatFCFA(item.qty * item.purchasePrice, currency)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromPO(item.productId)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400">
                  Aucun article sélectionné. Choisissez un produit ci-dessus pour composer le bon.
                </div>
              )}

              {/* Total et validation */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-slate-200">
                <div className="p-2 px-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5D7]">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Montant Total du Bon</span>
                  <span className="font-mono-data font-black text-slate-900 text-base">
                    {formatFCFA(poItems.reduce((acc, i) => acc + (i.qty * i.purchasePrice), 0), currency)}
                  </span>
                </div>

                <div className="flex gap-2 self-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-200 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={poItems.length === 0}
                    className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Émettre le Bon de Commande
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bordereau / Reçu Imprimable du Bon de Commande */}
      {selectedPOForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 shadow-2xl border border-[#ECE5D7]">
            {/* Header du Ticket de Commande */}
            <div className="border-b border-dashed border-slate-300 pb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-5 h-5 text-[#D85C3A]" />
                  <h2 className="font-black text-base uppercase tracking-tight">{settings.shopName}</h2>
                </div>
                <p className="text-[11px] text-slate-500">Bordereau Officiel de Réapprovisionnement</p>
                <div className="font-mono font-black text-xs text-[#123F46] mt-1">
                  BON D'ACHAT N° #{selectedPOForPrint.poNumber}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPOForPrint(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Méta Fournisseur & Date */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE5D7] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Grossiste :</span>
                <span className="font-bold text-slate-900">{selectedPOForPrint.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date d'émission :</span>
                <span className="text-slate-700 font-medium">{formatDateFR(selectedPOForPrint.orderDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Statut :</span>
                <span className={`font-bold text-[11px] ${
                  selectedPOForPrint.status === 'Received' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selectedPOForPrint.status === 'Received' ? 'Colis Réceptionné' : 'En Cours d\'Acheminement'}
                </span>
              </div>
            </div>

            {/* Tableau Articles épuré style ticket */}
            <div className="border border-[#ECE5D7] rounded-xl overflow-hidden text-xs">
              <div className="bg-[#FAF7F2] p-2.5 font-bold text-slate-700 border-b border-[#ECE5D7] flex justify-between text-[11px] uppercase">
                <span>Désignation Article</span>
                <span>Qté × P.U = Total</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                {selectedPOForPrint.items.map((it, idx) => (
                  <div key={idx} className="p-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">{it.productName}</span>
                    <span className="font-mono text-slate-600 text-right">
                      {it.qty} × {formatFCFA(it.purchasePrice, currency)} = <strong className="text-slate-900">{formatFCFA(it.qty * it.purchasePrice, currency)}</strong>
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-[#FAF7F2] p-3 border-t-2 border-slate-900 flex justify-between items-center font-black">
                <span className="uppercase text-xs tracking-wider">Montant Total à Payer</span>
                <span className="font-mono-data text-[#D85C3A] text-base">
                  {formatFCFA(selectedPOForPrint.totalAmount, currency)}
                </span>
              </div>
            </div>

            {/* Zone de signature & cachet */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] text-slate-400 text-center">
              <div className="p-3 border border-dashed border-slate-200 rounded-xl">
                <span>Visa Gérant / Magasin</span>
              </div>
              <div className="p-3 border border-dashed border-slate-200 rounded-xl">
                <span>Visa Livreur Grossiste</span>
              </div>
            </div>

            {/* Actions modal */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Bordereau</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
