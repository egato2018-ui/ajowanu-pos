import React, { useState } from 'react';
import { AuditLog, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatDateTimeFR } from '../utils/formatters';
import { 
  ShieldCheck, 
  Search,
  Lock,
  UserCheck
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface AuditLogsViewProps {
  settings: ShopSettings;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = () => {
  const [logs] = useState<AuditLog[]>(() => sqliteDB.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => 
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Journal d'Audit & Sécurité"
        subtitle="Historique certifié et immuable des ouvertures/clôtures de caisse, modifications de prix, entrées en stock et événements système."
        icon={<ShieldCheck className="w-5 h-5 text-[#123F46]" />}
        badge={
          <Badge variant="teal" size="sm">
            Registre Immuable
          </Badge>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE5D7] shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par caissier, intitulé d'action ou mot-clé..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-[#FAF8F5] text-slate-900 focus:outline-none focus:border-[#D85C3A] font-medium"
          />
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 hidden sm:inline-block">
          {filteredLogs.length} événements répertoriés
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-slate-500 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Opérateur / Caissier</th>
                <th className="py-3 px-4">Nature de l'Action</th>
                <th className="py-3 px-4">Détails de l'opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12">
                    <EmptyState
                      title="Aucune entrée d'audit trouvée"
                      description="Toutes les opérations sensibles effectuées sur la caisse ou les stocks apparaîtront dans cette piste d'audit."
                      icon={<ShieldCheck className="w-6 h-6 text-[#123F46]" />}
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] transition text-xs">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTimeFR(log.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
