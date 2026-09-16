import React, { useState } from 'react';
import { ShopSettings } from '../types';
import { Store, User, MapPin, Phone, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface FirstTimeSetupModalProps {
  isOpen: boolean;
  onSave: (settings: Partial<ShopSettings>) => void;
  onClearAllData?: (settings: Partial<ShopSettings>) => void;
  initialSettings: ShopSettings;
}

export const FirstTimeSetupModal: React.FC<FirstTimeSetupModalProps> = ({
  isOpen,
  onSave,
  onClearAllData,
  initialSettings,
}) => {
  const [dataMode, setDataMode] = useState<'clean' | 'sample'>('sample');
  const [formData, setFormData] = useState({
    shopName: initialSettings.shopName || 'Boutique AJOWANU',
    ownerName: initialSettings.ownerName || 'Bio Gado',
    address: initialSettings.address || 'Avenue Steinmetz, Tokpa Hoho, Cotonou, Bénin',
    phone: initialSettings.phone || '+229 97 00 12 34',
    gstNumber: initialSettings.gstNumber || 'IFU 3202100000000',
    invoicePrefix: initialSettings.invoicePrefix || 'FACT',
    currencySymbol: initialSettings.currencySymbol || 'FCFA',
    receiptType: initialSettings.receiptType || 'thermal',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone) {
      alert('Veuillez renseigner le nom de la boutique et le numéro de téléphone.');
      return;
    }

    const settingsObj = {
      ...formData,
      isSetupCompleted: true,
    };

    if (dataMode === 'clean' && onClearAllData) {
      onClearAllData(settingsObj);
    } else {
      onSave(settingsObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#ECE5D7] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Banner AJOWANU Teal */}
        <div className="bg-[#123F46] p-6 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Store className="w-8 h-8 text-[#F2C14E]" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>Bienvenue sur</span>
                <span className="text-[#D85C3A] font-extrabold bg-white px-2 py-0.5 rounded-lg text-lg">AJOWANU</span>
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">Configurez votre commerce pour démarrer les encaissements et la gestion de stock</p>
            </div>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-[#D85C3A]" />
                Nom de la Boutique / Commerce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Boutique AJOWANU Cotonou"
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#D85C3A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#D85C3A]" />
                Nom du Gérant / Propriétaire *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Bio Gado"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#D85C3A] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D85C3A]" />
              Adresse du Commerce
            </label>
            <input
              type="text"
              placeholder="Ex: Avenue Steinmetz, Tokpa Hoho, Cotonou"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#D85C3A] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#D85C3A]" />
                Téléphone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="+229 97 00 12 34"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#D85C3A] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#D85C3A]" />
                N° IFU / RCCM (Optionnel)
              </label>
              <input
                type="text"
                placeholder="IFU 3202100000000"
                value={formData.gstNumber}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#D85C3A] outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#ECE5D7]">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Facturation & Monnaie
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Préfixe Facture
                </label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-center font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Devise
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-center font-bold text-[#D85C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Format Reçu
                </label>
                <select
                  value={formData.receiptType}
                  onChange={e => setFormData({ ...formData, receiptType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="thermal">Ticket thermique (80mm)</option>
                  <option value="a4">Format A4 complet</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ECE5D7] space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mode d'initialisation des données
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  dataMode === 'sample' 
                    ? 'border-[#D85C3A] bg-[#FDF3F0] ring-2 ring-[#D85C3A]/20' 
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D85C3A]" />
                    Données de Démonstration (Bénin)
                  </span>
                  <input
                    type="radio"
                    name="dataMode"
                    value="sample"
                    checked={dataMode === 'sample'}
                    onChange={() => setDataMode('sample')}
                    className="w-4 h-4 accent-[#D85C3A]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Précharge les produits locaux (Riz Parfumé, Huile Mayor, Gari Sohoui, Savon BF) pour explorer immédiatement l'application.
                </p>
              </label>

              <label 
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  dataMode === 'clean' 
                    ? 'border-[#D85C3A] bg-[#FDF3F0] ring-2 ring-[#D85C3A]/20' 
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#123F46]" />
                    Base Vierge (Démarrage Réel)
                  </span>
                  <input
                    type="radio"
                    name="dataMode"
                    value="clean"
                    checked={dataMode === 'clean'}
                    onChange={() => setDataMode('clean')}
                    className="w-4 h-4 accent-[#D85C3A]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Idéal pour un vrai commerçant. Démarre avec un stock vierge pour saisir directement vos propres produits et prix.
                </p>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F6F1E7] border border-[#ECE5D7] text-slate-800 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#123F46]" />
            <div>
              <p className="font-semibold text-slate-900">Stockage Local 100% Hors-Ligne</p>
              <p className="text-[11px] text-slate-600">Vos ventes, factures et marges restent confidentielles sur cet ordinateur sans dépendance internet.</p>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#D85C3A] hover:bg-[#C24B2B] text-white font-semibold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Valider & Ouvrir AJOWANU</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
