import React, { useState } from 'react';
import { Customer, ShopSettings, Sale } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateTimeFR } from '../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Award, 
  CreditCard, 
  Wallet, 
  Edit, 
  Trash2, 
  X, 
  FileText,
  MapPin,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface CustomerManagementViewProps {
  settings: ShopSettings;
  onSelectCustomerForPOS?: (customer: Customer) => void;
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = ({
  settings,
  onSelectCustomerForPOS
}) => {
  const [customers, setCustomers] = useState<Customer[]>(() => sqliteDB.getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('TOUS');
  
  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [showDuesModal, setShowDuesModal] = useState<Customer | null>(null);
  const [payDuesAmount, setPayDuesAmount] = useState<number>(0);
  const [showHistoryModal, setShowHistoryModal] = useState<Customer | null>(null);

  const currency = settings.currencySymbol || 'FCFA';

  const refreshCustomers = () => {
    setCustomers(sqliteDB.getCustomers());
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = 
      selectedTag === 'TOUS' || 
      (selectedTag === 'VIP' && c.tag === 'VIP') ||
      (selectedTag === 'Régulier' && (c.tag === 'Regular' || c.tag === 'Régulier')) ||
      (selectedTag === 'Grossiste' && (c.tag === 'Wholesale' || c.tag === 'Grossiste'));

    return matchesSearch && matchesTag;
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.name || !editingCustomer?.phone) return;

    sqliteDB.saveCustomer({
      ...editingCustomer,
      name: editingCustomer.name,
      phone: editingCustomer.phone,
    });

    setShowAddEditModal(false);
    setEditingCustomer(null);
    refreshCustomers();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Voulez-vous supprimer la fiche de ce client ?')) {
      sqliteDB.deleteCustomer(id);
      refreshCustomers();
    }
  };

  const handlePayDues = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDuesModal || payDuesAmount <= 0) return;

    sqliteDB.payCustomerDues(showDuesModal.id, payDuesAmount);
    setShowDuesModal(null);
    setPayDuesAmount(0);
    refreshCustomers();
  };

  const getCustomerSales = (phone: string): Sale[] => {
    return sqliteDB.getSales().filter(s => s.customerPhone === phone);
  };

  const totalDues = customers.reduce((acc, c) => acc + (c.outstandingDues || 0), 0);
  const totalLoyalty = customers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0);

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <PageHeader
        title="Fichier Clients & Carnet de Crédits"
        subtitle="Historique des ventes nominatives, encaissement des créances et fidélité de vos habitués."
        icon={<Users className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <Badge variant="teal" size="sm">
            {customers.length} contacts
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setEditingCustomer({ tag: 'Regular' });
              setShowAddEditModal(true);
            }}
          >
            Nouveau Client
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fiches</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-slate-900 font-mono-data">{customers.length}</span>
            <span className="text-xs text-slate-500 font-medium">Clients enregistrés</span>
          </div>
        </div>

        <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D85C3A] flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Créances & Crédits Clients
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#D85C3A] font-mono-data">
              {formatFCFA(totalDues, currency)}
            </span>
            <span className="text-[11px] text-slate-500">À recouvrer</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comptes VIP</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#123F46] font-mono-data">
              {customers.filter(c => c.tag === 'VIP').length}
            </span>
            <Badge variant="mango" size="sm">Privilégiés</Badge>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fidélité Distribuée</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-emerald-700 font-mono-data">{totalLoyalty}</span>
            <span className="text-xs text-emerald-800 font-semibold">Points cumulés</span>
          </div>
        </div>

      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5D7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou numéro de téléphone..."
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['TOUS', 'VIP', 'Régulier', 'Grossiste'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#123F46] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-[#ECE5D7] border border-[#ECE5D7]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-slate-500 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4 text-right">Volume d'Achats</th>
                <th className="py-3.5 px-4 text-right">Fidélité</th>
                <th className="py-3.5 px-4 text-right">Créance / Reste Dû</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE5D7] text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun client ne correspond à cette recherche.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{customer.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{customer.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-mono text-xs">
                        <Phone className="w-3.5 h-3.5 text-[#D85C3A]" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {customer.tag === 'VIP' ? (
                        <Badge variant="mango" size="sm">VIP</Badge>
                      ) : customer.tag === 'Wholesale' || customer.tag === 'Grossiste' ? (
                        <Badge variant="clay" size="sm">Grossiste</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Régulier</Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono-data font-bold text-slate-900">
                      {formatFCFA(customer.totalSpent, currency)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono-data">
                      {customer.loyaltyPoints} pts
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {customer.outstandingDues > 0 ? (
                        <span className="font-bold text-[#D85C3A] bg-[#FDF3F0] border border-[#D85C3A]/20 px-2.5 py-1 rounded-lg font-mono-data text-xs">
                          {formatFCFA(customer.outstandingDues, currency)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Réglé (0)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onSelectCustomerForPOS && (
                          <button
                            onClick={() => onSelectCustomerForPOS(customer)}
                            className="p-1.5 bg-[#FDF3F0] text-[#D85C3A] hover:bg-[#FBE4DD] rounded-lg font-bold text-[11px] px-2.5 transition cursor-pointer"
                            title="Sélectionner pour la caisse"
                          >
                            Caisse
                          </button>
                        )}

                        <button
                          onClick={() => setShowHistoryModal(customer)}
                          className="p-1.5 hover:bg-[#ECE5D7] rounded-lg text-slate-600 transition cursor-pointer"
                          title="Historique des reçus de vente"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {customer.outstandingDues > 0 && (
                          <button
                            onClick={() => {
                              setShowDuesModal(customer);
                              setPayDuesAmount(customer.outstandingDues);
                            }}
                            className="px-2.5 py-1 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                            title="Régler la créance"
                          >
                            Régler
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setShowAddEditModal(true);
                          }}
                          className="p-1.5 hover:bg-[#ECE5D7] rounded-lg text-slate-600 transition cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Customer Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FDF3F0] text-[#D85C3A] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCustomer?.id ? 'Modifier la Fiche Client' : 'Nouveau Client'}
                </h3>
              </div>
              <button onClick={() => setShowAddEditModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet du client *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer?.name || ''}
                  onChange={e => setEditingCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex : Koffi Mensah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Numéro de Téléphone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editingCustomer?.phone || ''}
                  onChange={e => setEditingCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex : +229 97 00 00 00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie Client</label>
                  <select
                    value={editingCustomer?.tag || 'Regular'}
                    onChange={e => setEditingCustomer(prev => ({ ...prev, tag: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none"
                  >
                    <option value="Regular">Régulier</option>
                    <option value="VIP">Client VIP</option>
                    <option value="Wholesale">Grossiste / Revendeur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Créance Initiale ({currency})</label>
                  <input
                    type="number"
                    value={editingCustomer?.outstandingDues || 0}
                    onChange={e => setEditingCustomer(prev => ({ ...prev, outstandingDues: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse ou Quartier</label>
                <input
                  type="text"
                  value={editingCustomer?.address || ''}
                  onChange={e => setEditingCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex : Cotonou Akpakpa, rue 12..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#ECE5D7] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddEditModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Enregistrer la Fiche
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Outstanding Dues Modal */}
      {showDuesModal && (
        <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <h3 className="font-bold text-slate-900 text-base">Règlement de Créance</h3>
              <button onClick={() => setShowDuesModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] text-xs text-slate-600 space-y-1">
              <div>Client : <span className="font-bold text-slate-900">{showDuesModal.name}</span></div>
              <div>Dette actuelle : <span className="font-bold text-[#D85C3A] font-mono-data">{formatFCFA(showDuesModal.outstandingDues, currency)}</span></div>
            </div>

            <form onSubmit={handlePayDues} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Montant Encaissé ({currency})</label>
                <input
                  type="number"
                  min={1}
                  max={showDuesModal.outstandingDues}
                  value={payDuesAmount}
                  onChange={e => setPayDuesAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none font-bold text-base font-mono-data"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowDuesModal(null)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Valider l'Encaissement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Historique des Ventes : {showHistoryModal.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Tél : {showHistoryModal.phone}</p>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
              {getCustomerSales(showHistoryModal.phone).length === 0 ? (
                <p className="text-center py-8 text-slate-400">Aucun reçu de vente trouvé pour ce numéro de téléphone.</p>
              ) : (
                getCustomerSales(showHistoryModal.phone).map(sale => (
                  <div key={sale.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between border border-[#ECE5D7]">
                    <div>
                      <div className="font-bold text-slate-900 font-mono">{sale.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400">{formatDateTimeFR(sale.dateTime)} • {sale.paymentMode === 'Cash' ? 'Espèces' : sale.paymentMode === 'UPI' ? 'MoMo' : sale.paymentMode}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#D85C3A] font-mono-data text-sm">{formatFCFA(sale.totalAmount, currency)}</div>
                      <div className="text-[10px] text-slate-400">{sale.items.length} article(s)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
