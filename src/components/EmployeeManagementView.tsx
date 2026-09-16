import React, { useState } from 'react';
import { Employee, EmployeeRole, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatFCFA, formatDateFR } from '../utils/formatters';
import { 
  UserCheck, 
  UserPlus, 
  KeyRound, 
  Phone, 
  Edit, 
  X, 
  Calendar, 
  BadgeCheck,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface EmployeeManagementViewProps {
  settings: ShopSettings;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({ settings }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => sqliteDB.getEmployees());
  const currentUser = sqliteDB.getCurrentUser();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);

  const currency = settings.currencySymbol || 'FCFA';

  const refreshEmployees = () => {
    setEmployees(sqliteDB.getEmployees());
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee?.name || !editingEmployee?.phone || !editingEmployee?.pin) return;

    sqliteDB.saveEmployee({
      ...editingEmployee,
      name: editingEmployee.name,
      phone: editingEmployee.phone,
      role: editingEmployee.role || 'Cashier',
      pin: editingEmployee.pin,
    });

    setShowAddModal(false);
    setEditingEmployee(null);
    refreshEmployees();
  };

  const handleSwitchUser = (emp: Employee) => {
    sqliteDB.setCurrentUser(emp);
    refreshEmployees();
  };

  const roleLabels: Record<string, string> = {
    'Owner': 'Propriétaire / Directeur',
    'Manager': 'Gérant de Boutique',
    'Cashier': 'Caissier(ère)',
    'Inventory Staff': 'Gestionnaire Stock',
    'Accountant': 'Comptable',
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Personnel & Droits d'Accès"
        subtitle="Gestion des collaborateurs, attribution des codes PIN secrets à 4 chiffres et affectation des postes de caisse."
        icon={<UserCheck className="w-5 h-5 text-[#D85C3A]" />}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => {
              setEditingEmployee({ role: 'Cashier', pin: '1234', salary: 60000 });
              setShowAddModal(true);
            }}
          >
            Ajouter un Employé
          </Button>
        }
      />

      {/* Active Logged-in Staff Banner */}
      <div className="bg-[#123F46] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-[#0E3238]">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-xl text-[#F2C14E] shrink-0">
            {currentUser?.name.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#F2C14E] text-[#123F46] px-2.5 py-0.5 rounded-full">
                Session Active
              </span>
              <span className="text-xs text-[#ECE5D7] font-medium flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#F2C14E]" />
                {roleLabels[currentUser?.role || 'Owner'] || currentUser?.role}
              </span>
            </div>
            <h3 className="text-lg font-extrabold mt-1 text-white">{currentUser?.name || 'Administrateur'}</h3>
            <p className="text-xs text-[#ECE5D7]/80">Poste de caisse déverrouillé et habilité</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] text-[#ECE5D7]/80 font-medium">Contrôle de Sécurité PIN</p>
          <div className="text-xs font-mono font-bold bg-black/30 border border-white/10 px-3.5 py-1.5 rounded-xl mt-1 inline-flex items-center gap-2 text-white">
            <Lock className="w-3.5 h-3.5 text-[#F2C14E]" />
            <span>PIN : ••••</span>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map(emp => (
          <div 
            key={emp.id} 
            className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition relative ${
              currentUser?.id === emp.id ? 'border-[#123F46] ring-2 ring-[#123F46]/15' : 'border-[#ECE5D7]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono bg-[#FAF8F5] border border-[#ECE5D7] px-2 py-0.5 rounded-md text-slate-500">{emp.id}</span>
                <h3 className="font-bold text-slate-900 text-base mt-1.5">{emp.name}</h3>
                <div className="mt-1">
                  <Badge 
                    variant={
                      emp.role === 'Owner' ? 'purple' :
                      emp.role === 'Manager' ? 'indigo' :
                      emp.role === 'Cashier' ? 'orange' : 'teal'
                    }
                    size="sm"
                  >
                    {roleLabels[emp.role] || emp.role}
                  </Badge>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingEmployee(emp);
                  setShowAddModal(true);
                }}
                className="p-2 hover:bg-[#FAF8F5] text-slate-400 hover:text-slate-800 rounded-xl cursor-pointer transition border border-transparent hover:border-[#ECE5D7]"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-[#ECE5D7]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800 font-medium">{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Prise de fonction : <strong className="text-slate-800">{formatDateFR(emp.joiningDate)}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-600">Code PIN : <strong className="text-slate-900">{emp.pin}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ECE5D7] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Rémunération</span>
                <span className="font-bold text-slate-900 font-mono-data text-sm">
                  {formatFCFA(emp.salary, currency)}
                </span>
              </div>

              {currentUser?.id !== emp.id ? (
                <button
                  onClick={() => handleSwitchUser(emp)}
                  className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#123F46] hover:text-white text-slate-800 border border-[#ECE5D7] rounded-xl font-bold text-[11px] transition cursor-pointer"
                >
                  Prendre le poste
                </button>
              ) : (
                <span className="text-[11px] font-bold text-[#123F46] bg-[#123F46]/10 px-2.5 py-1 rounded-lg">
                  En poste
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#171614]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ECE5D7]">
            <div className="flex items-center justify-between border-b border-[#ECE5D7] pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingEmployee?.id ? 'Modifier le Profil Employé' : 'Ajouter un Collaborateur'}
                </h3>
                <p className="text-[11px] text-slate-400">Attribution des identifiants et du code secret PIN</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom et Prénom de l'employé *</label>
                <input
                  type="text"
                  required
                  value={editingEmployee?.name || ''}
                  onChange={e => setEditingEmployee(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex : Bio Guéra, Mariam Soglo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee?.phone || ''}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+229 97 00 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code PIN (4 chiffres) *</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={editingEmployee?.pin || ''}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none font-mono text-center font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle / Poste</label>
                  <select
                    value={editingEmployee?.role || 'Cashier'}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, role: e.target.value as EmployeeRole }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none font-medium"
                  >
                    <option value="Owner">Propriétaire / Gérant</option>
                    <option value="Manager">Responsable Magasin</option>
                    <option value="Cashier">Caissier(ère)</option>
                    <option value="Inventory Staff">Gestionnaire Stock</option>
                    <option value="Accountant">Comptable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Salaire Mensuel ({currency})</label>
                  <input
                    type="number"
                    value={editingEmployee?.salary || 60000}
                    onChange={e => setEditingEmployee(prev => ({ ...prev, salary: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none font-mono-data font-bold"
                  />
                </div>
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
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
