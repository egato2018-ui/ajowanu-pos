import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { Branch } from '../types';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Trash2, 
  Edit, 
  Check, 
  Store 
} from 'lucide-react';

export const BranchManagementView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(sqliteDB.getBranches());
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const refresh = () => {
    setBranches(sqliteDB.getBranches());
  };

  const openAddModal = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setIsPrimary(false);
    setShowModal(true);
  };

  const openEditModal = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setCode(b.code);
    setAddress(b.address);
    setPhone(b.phone);
    setIsPrimary(b.isPrimary);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    sqliteDB.saveBranch({
      id: editingBranch?.id,
      name,
      code: code.toUpperCase(),
      address,
      phone,
      isPrimary,
    });

    setShowModal(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce point de vente ?')) {
      sqliteDB.deleteBranch(id);
      refresh();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#123F46]" />
            <span>Gestion Multi-Boutiques & Points de Vente</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos différents magasins, dépôts et succursales avec leurs codes caisses et coordonnées.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Boutique</span>
        </button>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(b => (
          <div 
            key={b.id} 
            className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs relative transition ${
              b.isPrimary 
                ? 'border-[#123F46] ring-2 ring-[#123F46]/20' 
                : 'border-[#ECE5D7]'
            }`}
          >
            {b.isPrimary && (
              <span className="absolute top-4 right-4 px-2.5 py-1 bg-teal-50 text-[#123F46] rounded-full text-[10px] font-bold flex items-center gap-1 border border-teal-200">
                <Check className="w-3 h-3 text-[#123F46]" />
                <span>Siège / Principal</span>
              </span>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#123F46] flex items-center justify-center font-bold border border-[#ECE5D7]">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                <span className="font-mono text-[10px] bg-[#FAF7F2] px-2 py-0.5 rounded-md text-slate-600 font-semibold">
                  CODE : {b.code}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{b.address || 'Adresse non renseignée'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono">{b.phone || 'Téléphone non renseigné'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ECE5D7] flex items-center justify-between">
              <button
                onClick={() => openEditModal(b)}
                className="text-xs font-semibold text-slate-600 hover:text-[#123F46] flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>

              {!b.isPrimary && branches.length > 1 && (
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#123F46]" />
              <span>{editingBranch ? 'Modifier le Point de Vente' : 'Ajouter une Nouvelle Boutique'}</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom du Point de Vente *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex : Boutique Cotonou Ganhi, Dépôt Calavi..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#D85C3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code Court (3 à 5 lettres) *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex : COT, CAL, AKPAK..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-[#D85C3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Adresse Géographique</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ex : Akpakpa, en face de la pharmacie..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone de Contact</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={e => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded-md text-[#123F46] accent-[#123F46]"
              />
              <label htmlFor="isPrimary" className="text-xs font-medium text-slate-700">
                Définir comme Boutique Principale / Siège
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Enregistrer la Boutique
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
