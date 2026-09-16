import React, { useState } from 'react';
import { Expense, ExpenseCategory, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  X, 
  TrendingDown, 
  PieChart, 
  Calendar,
  Wallet,
  Building2,
  Zap,
  Users,
  Truck,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface ExpenseManagementViewProps {
  settings: ShopSettings;
}

export const ExpenseManagementView: React.FC<ExpenseManagementViewProps> = ({ settings }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => sqliteDB.getExpenses());
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('TOUS');

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Rent');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank' | 'Card'>('Cash');
  const [notes, setNotes] = useState('');

  const currency = settings.currencySymbol || 'FCFA';

  const refreshExpenses = () => {
    setExpenses(sqliteDB.getExpenses());
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

    sqliteDB.saveExpense({
      title,
      category,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      paymentMode,
      notes,
    });

    setShowAddModal(false);
    setTitle('');
    setAmount('');
    setNotes('');
    refreshExpenses();
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Voulez-vous supprimer cette ligne de dépense ?')) {
      sqliteDB.deleteExpense(id);
      refreshExpenses();
    }
  };

  const categoryLabels: Record<string, string> = {
    'Rent': 'Loyer boutique',
    'Electricity': 'Électricité & Eau',
    'Salary': 'Salaires employés',
    'Internet': 'Internet & Télécom',
    'Transport': 'Transport & Fret',
    'Miscellaneous': 'Divers / Entretien',
  };

  const filteredExpenses = categoryFilter === 'TOUS' 
    ? expenses 
    : expenses.filter(e => e.category === categoryFilter);

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenseAmount = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Dépenses & Charges d'Exploitation"
        subtitle="Suivi rigoureux des charges fixes, factures d'eau/énergie, salaires et frais de transport pour le calcul du résultat net."
        icon={<TrendingDown className="w-5 h-5 text-[#D85C3A]" />}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Enregistrer une Dépense
          </Button>
        }
      />

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Charges du Jour</p>
            <p className="text-2xl font-black text-[#D85C3A] font-mono-data mt-1">
              {formatFCFA(todayExpenseAmount, currency)}
            </p>
          </div>
          <div className="p-3 bg-[#FDF3F0] rounded-xl text-[#D85C3A] border border-[#D85C3A]/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cumul Dépenses Global</p>
            <p className="text-2xl font-black text-slate-900 font-mono-data mt-1">
              {formatFCFA(totalExpenseAmount, currency)}
            </p>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#123F46] border border-[#ECE5D7]">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#ECE5D7] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lignes Enregistrées</p>
            <p className="text-2xl font-black text-[#123F46] mt-1 font-mono-data">
              {expenses.length}
            </p>
          </div>
          <div className="p-3 bg-[#FEF9EB] rounded-xl text-[#B47805] border border-[#F2C14E]/40">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white p-3 rounded-2xl border border-[#ECE5D7] flex items-center gap-2 overflow-x-auto shadow-xs">
        {[
          { key: 'TOUS', label: 'Toutes les charges' },
          { key: 'Rent', label: 'Loyer boutique' },
          { key: 'Electricity', label: 'Électricité & Eau' },
          { key: 'Salary', label: 'Salaires' },
          { key: 'Internet', label: 'Télécom' },
          { key: 'Transport', label: 'Transport' },
          { key: 'Miscellaneous', label: 'Divers' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              categoryFilter === cat.key
                ? 'bg-[#123F46] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-slate-700 hover:bg-[#ECE5D7] border border-[#ECE5D7]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-slate-500 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Motif & Justificatif</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode de Règlement</th>
                <th className="py-3 px-4 text-right">Montant Décaissé</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="Aucune dépense enregistrée"
                      description="Toutes les charges et sorties de caisse saisies s'afficheront ici."
                      icon={<Receipt className="w-6 h-6 text-[#123F46]" />}
                    />
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      {exp.notes && <div className="text-[11px] text-slate-400 mt-0.5">{exp.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm">
                        {categoryLabels[exp.category] || exp.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDateFR(exp.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        {exp.paymentMode === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-[#D85C3A]" />}
                        {exp.paymentMode === 'Cash' ? 'Espèces (Caisse)' : exp.paymentMode === 'UPI' ? 'Mobile Money' : exp.paymentMode === 'Bank' ? 'Virement' : 'Carte'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#D85C3A] font-mono-data text-sm">
                      {formatFCFA(exp.amount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                        title="Supprimer la dépense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#171614]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Enregistrer une Dépense</h3>
                <p className="text-[11px] text-slate-400">Sortie de caisse ou règlement fournisseur</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Motif / Désignation de la dépense *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex : Facture SBEE électricité, Loyer boutique..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
                  >
                    <option value="Rent">Loyer du magasin</option>
                    <option value="Electricity">Électricité / Eau (SBEE/SONEB)</option>
                    <option value="Salary">Salaires du personnel</option>
                    <option value="Internet">Internet / Télécom</option>
                    <option value="Transport">Transport & Fret</option>
                    <option value="Miscellaneous">Frais divers / Entretien</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-mono-data font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mode de Paiement</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
                >
                  <option value="Cash">Espèces (Caisse)</option>
                  <option value="UPI">Mobile Money (MTN / Moov / Celtiis)</option>
                  <option value="Bank">Virement Bancaire</option>
                  <option value="Card">Carte Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">N° Pièce / Réf Reçu ou Commentaire</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex : Reçu N° 4412, Quittance SBEE..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Valider la Dépense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
