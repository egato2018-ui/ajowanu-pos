import React, { useState } from 'react';
import { AttendanceRecord, ShopSettings } from '../types';
import { sqliteDB } from '../db/sqliteStorage';
import { formatDateFR } from '../utils/formatters';
import { 
  Clock, 
  LogIn, 
  LogOut,
  CalendarCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';

interface AttendanceViewProps {
  settings: ShopSettings;
}

export const AttendanceView: React.FC<AttendanceViewProps> = () => {
  const employees = sqliteDB.getEmployees();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => sqliteDB.getAttendance());

  const refreshAttendance = () => {
    setAttendance(sqliteDB.getAttendance());
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCheckIn = (empId: string) => {
    sqliteDB.checkInEmployee(empId);
    refreshAttendance();
  };

  const handleCheckOut = (empId: string) => {
    sqliteDB.checkOutEmployee(empId);
    refreshAttendance();
  };

  const roleLabels: Record<string, string> = {
    'Owner': 'Propriétaire',
    'Manager': 'Gérant',
    'Cashier': 'Caissier(ère)',
    'Inventory Staff': 'Gestionnaire Stock',
    'Accountant': 'Comptable',
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Pointage Journalier & Présences"
        subtitle={`Suivi des heures de prise de service, départs et ponctualité de l'équipe de caisse et magasin. Aujourd'hui : ${formatDateFR(todayStr)}`}
        icon={<Clock className="w-5 h-5 text-[#D85C3A]" />}
        badge={
          <Badge variant="mango" size="sm">
            {formatDateFR(todayStr)}
          </Badge>
        }
      />

      {/* Staff Action Cards for Today */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map(emp => {
          const todayRecord = attendance.find(a => a.employeeId === emp.id && a.date === todayStr);

          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-[#ECE5D7] p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{emp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{roleLabels[emp.role] || emp.role}</p>
                </div>

                {todayRecord ? (
                  <Badge 
                    variant={todayRecord.status === 'Late' ? 'mango' : 'teal'}
                    size="sm"
                  >
                    {todayRecord.status === 'Late' ? 'En retard' : 'Présent(e)'}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Non pointé
                  </Badge>
                )}
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl text-xs space-y-1.5 font-mono text-slate-700 border border-[#ECE5D7]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[11px]">Prise de poste :</span>
                  <span className="font-bold text-slate-900">{todayRecord?.checkInTime || '--:--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans text-[11px]">Fin de service :</span>
                  <span className="font-bold text-slate-900">{todayRecord?.checkOutTime || '--:--'}</span>
                </div>
              </div>

              <div>
                {!todayRecord ? (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={<LogIn className="w-4 h-4" />}
                    onClick={() => handleCheckIn(emp.id)}
                  >
                    Pointer l'Arrivée
                  </Button>
                ) : !todayRecord.checkOutTime ? (
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    icon={<LogOut className="w-4 h-4" />}
                    onClick={() => handleCheckOut(emp.id)}
                  >
                    Pointer le Départ
                  </Button>
                ) : (
                  <div className="w-full py-2.5 bg-[#FAF8F5] border border-[#ECE5D7] text-slate-500 text-xs font-bold text-center rounded-xl">
                    Service Terminé pour Aujourd'hui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance History Log Table */}
      <div className="bg-white rounded-2xl border border-[#ECE5D7] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#ECE5D7] flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Historique Récent des Pointages
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Horodatage local certifié</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-slate-500 border-b border-[#ECE5D7] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Arrivée</th>
                <th className="py-3 px-4">Départ</th>
                <th className="py-3 px-4 text-center">Ponctualité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10">
                    <EmptyState
                      title="Aucun pointage enregistré"
                      description="Les heures de prise de service et de sortie apparaîtront dans ce registre."
                      icon={<Clock className="w-6 h-6 text-[#123F46]" />}
                    />
                  </td>
                </tr>
              ) : (
                attendance.map(att => (
                  <tr key={att.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{formatDateFR(att.date)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{att.employeeName}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{att.checkInTime}</td>
                    <td className="py-3.5 px-4 font-mono text-[#D85C3A] font-bold">{att.checkOutTime || 'Service en cours'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge 
                        variant={att.status === 'Late' ? 'mango' : 'teal'}
                        size="sm"
                      >
                        {att.status === 'Late' ? 'En retard' : 'À l\'heure'}
                      </Badge>
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
