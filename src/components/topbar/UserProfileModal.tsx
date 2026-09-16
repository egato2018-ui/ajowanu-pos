import React, { useState, useRef } from 'react';
import { Employee, ShopSettings } from '../../types';
import { sqliteDB } from '../../db/sqliteStorage';
import { X, User, Phone, MapPin, Calendar, ShieldCheck, KeyRound, Check, AlertCircle, Camera } from 'lucide-react';

interface UserProfileModalProps {
  user: Employee;
  settings: ShopSettings;
  onClose: () => void;
  onUserUpdated: (updatedUser: Employee) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  settings,
  onClose,
  onUserUpdated
}) => {
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updated = sqliteDB.saveEmployee({
          ...user,
          photoUrl: reader.result as string,
        });
        if (updated) {
          onUserUpdated(updated);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('Le code PIN doit comporter exactement 4 chiffres.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Les deux codes PIN ne correspondent pas.');
      return;
    }

    const updated = sqliteDB.saveEmployee({
      ...user,
      pin: newPin,
    });

    if (updated) {
      onUserUpdated(updated);
      setPinSuccess(true);
      setIsEditingPin(false);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      setTimeout(() => setPinSuccess(false), 3000);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Owner':
        return <span className="px-2 py-0.5 rounded-md bg-[#123F46] text-white text-[10px] font-bold">Gérant / Propriétaire</span>;
      case 'Cashier':
        return <span className="px-2 py-0.5 rounded-md bg-[#D85C3A] text-white text-[10px] font-bold">Caissier Principal</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-[#F2C14E] text-slate-900 text-[10px] font-bold">Gestionnaire Stock</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#ECE5D7] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D7]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Profil Utilisateur</h3>
              <p className="text-[11px] text-slate-500">{settings.shopName || 'AJOWANU'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Identity Overview with Photo */}
        <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] flex items-center gap-3">
          <div className="relative group">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-[#123F46] text-white font-bold text-xl flex items-center justify-center shadow-xs">
                {user.name.charAt(0)}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white border border-[#ECE5D7] shadow-xs flex items-center justify-center text-slate-600 hover:text-[#D85C3A] cursor-pointer transition"
              title="Changer de photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
              {getRoleBadge(user.role)}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 font-bold">Identifiant : {user.id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Téléphone
            </span>
            <span className="font-medium text-slate-800">{user.phone || 'Non renseigné'}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Adresse
            </span>
            <span className="font-medium text-slate-800 truncate max-w-[200px]">{user.address || 'Cotonou'}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date d'embauche
            </span>
            <span className="font-medium text-slate-800">{user.joiningDate || 'Actif'}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Statut du compte
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {user.status === 'Active' ? 'Actif & Opérationnel' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Security PIN Section */}
        <div className="pt-2 border-t border-[#ECE5D7]">
          {pinSuccess && (
            <div className="mb-2 p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Code PIN mis à jour avec succès !</span>
            </div>
          )}

          {!isEditingPin ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#D85C3A]" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Code PIN de sécurité Caisse</p>
                  <p className="text-[10px] text-slate-400">Utilisé pour déverrouiller la caisse rapidement</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPin(true)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-[#ECE5D7] shadow-2xs transition cursor-pointer"
              >
                Modifier
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePin} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Modifier le code PIN</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPin(false);
                    setPinError('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Annuler
                </button>
              </div>

              {pinError && (
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Nouveau PIN (4 chiffres)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-2.5 py-1.5 text-center font-mono font-bold tracking-widest text-sm bg-white border border-[#ECE5D7] rounded-lg focus:outline-none focus:border-[#123F46]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Confirmer PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-2.5 py-1.5 text-center font-mono font-bold tracking-widest text-sm bg-white border border-[#ECE5D7] rounded-lg focus:outline-none focus:border-[#123F46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                Enregistrer le nouveau code PIN
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
