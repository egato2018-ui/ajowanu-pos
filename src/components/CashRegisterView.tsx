import React, { useState } from 'react';
import { sqliteDB } from '../db/sqliteStorage';
import { CashRegisterShift, CashTransaction } from '../types';
import { formatFCFA, formatDateTimeFR } from '../utils/formatters';
import { 
  Lock, 
  Unlock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Receipt,
  FileText,
  Clock,
  PlusCircle,
  Calculator,
  ShoppingBag,
  CreditCard,
  Coins
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const [currentShift, setCurrentShift] = useState<CashRegisterShift | undefined>(sqliteDB.getCurrentCashShift());
  const [shiftsHistory, setShiftsHistory] = useState<CashRegisterShift[]>(sqliteDB.getCashShifts());
  const [transactions, setTransactions] = useState<CashTransaction[]>(sqliteDB.getCashTransactions());

  // Modal forms
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);

  // Form inputs
  const [openingFloat, setOpeningFloat] = useState(25000);
  const [closingCashCount, setClosingCashCount] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState('');

  const [txnType, setTxnType] = useState<'CashIn' | 'CashOut' | 'SafeDeposit'>('CashIn');
  const [txnAmount, setTxnAmount] = useState<number | ''>('');
  const [txnReason, setTxnReason] = useState('');

  const refreshData = () => {
    setCurrentShift(sqliteDB.getCurrentCashShift());
    setShiftsHistory(sqliteDB.getCashShifts());
    setTransactions(sqliteDB.getCashTransactions());
  };

  const shiftCalc = currentShift ? sqliteDB.getShiftExpectedCash(currentShift) : null;
  const shiftPaymentBreakdown = currentShift ? sqliteDB.getShiftPaymentBreakdown(currentShift) : null;

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    sqliteDB.openCashShift(Number(openingFloat), shiftNotes);
    setShowOpenModal(false);
    setShiftNotes('');
    refreshData();
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    sqliteDB.closeCashShift(Number(closingCashCount), shiftNotes);
    setShowCloseModal(false);
    setShiftNotes('');
    refreshData();
  };

  const handleAddTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || Number(txnAmount) <= 0 || !txnReason.trim()) return;
    sqliteDB.addCashTransaction(txnType, Number(txnAmount), txnReason);
    setShowTxnModal(false);
    setTxnAmount('');
    setTxnReason('');
    refreshData();
  };

  const currency = sqliteDB.getSettings().currencySymbol || 'FCFA';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ECE5D7] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#D85C3A]" />
            <span>Tiroir-Caisse & Clôture de Service (Z de Caisse)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi du fond de caisse, encaissements espèces, apports/retraits de monnaie et réconciliation de fin de journée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentShift ? (
            <>
              <button
                onClick={() => setShowTxnModal(true)}
                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F6F1E7] text-[#123F46] border border-[#ECE5D7] rounded-xl font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#D85C3A]" />
                <span>Apport / Retrait Espèces</span>
              </button>
              <button
                onClick={() => {
                  if (currentShift) {
                    const calc = sqliteDB.getShiftExpectedCash(currentShift);
                    setClosingCashCount(calc.expectedCash);
                  }
                  setShowCloseModal(true);
                }}
                className="px-4 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Clôturer le Service (Z)</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Ouvrir une Session Caisse</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Shift Summary Cards */}
      {currentShift && shiftCalc ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Opening Cash Float */}
          <div className="bg-[#FAF7F2] border border-[#ECE5D7] p-4 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Fond de Caisse Initial</div>
            <div className="text-xl font-bold font-mono-data text-slate-900 mt-1">
              {formatFCFA(shiftCalc.openingCash, currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(currentShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Shift Cash Sales */}
          <div className="bg-teal-50/60 border border-teal-200/70 p-4 rounded-2xl">
            <div className="text-xs text-teal-800 font-medium flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ventes Espèces</span>
            </div>
            <div className="text-xl font-bold font-mono-data text-[#123F46] mt-1">
              +{formatFCFA(shiftCalc.totalCashSales, currency)}
            </div>
            <div className="text-[10px] text-teal-600 mt-1">
              Tickets encaissés
            </div>
          </div>

          {/* Cash Added */}
          <div className="bg-sky-50/60 border border-sky-200/70 p-4 rounded-2xl">
            <div className="text-xs text-sky-800 font-medium">Apport Espèces (Entrée)</div>
            <div className="text-xl font-bold font-mono-data text-sky-900 mt-1">
              +{formatFCFA(shiftCalc.cashInTotal, currency)}
            </div>
            <div className="text-[10px] text-sky-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>Monnaie ajoutée</span>
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-amber-50/60 border border-amber-200/70 p-4 rounded-2xl">
            <div className="text-xs text-amber-800 font-medium">Retrait Caisse (Sortie)</div>
            <div className="text-xl font-bold font-mono-data text-amber-900 mt-1">
              -{formatFCFA(shiftCalc.cashOutTotal, currency)}
            </div>
            <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Petites dépenses</span>
            </div>
          </div>

          {/* Safe Drops */}
          <div className="bg-purple-50/60 border border-purple-200/70 p-4 rounded-2xl">
            <div className="text-xs text-purple-800 font-medium">Dépôt Coffre</div>
            <div className="text-xl font-bold font-mono-data text-purple-900 mt-1">
              -{formatFCFA(shiftCalc.safeDepositTotal, currency)}
            </div>
            <div className="text-[10px] text-purple-600 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Versements gérance</span>
            </div>
          </div>

          {/* Expected Drawer Total */}
          <div className="bg-[#123F46] text-white p-4 rounded-2xl shadow-xs">
            <div className="text-xs text-[#ECE5D7] font-medium flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-[#F2C14E]" />
              <span>Théorique Caisse</span>
            </div>
            <div className="text-xl font-bold font-mono-data text-white mt-1">
              {formatFCFA(shiftCalc.expectedCash, currency)}
            </div>
            <div className="text-[10px] text-[#ECE5D7]/80 mt-1">
              Solde en temps réel
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[#FAF7F2] border border-[#ECE5D7] rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-[#D85C3A] mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Aucune Session Caisse Ouverte</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            L'ouverture de session permet d'enregistrer le fond de monnaie initial et d'assurer une traçabilité rigoureuse des espèces jusqu'au Z de caisse.
          </p>
          <button
            onClick={() => setShowOpenModal(true)}
            className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white rounded-xl font-semibold text-xs shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Ouvrir une Session Caisse</span>
          </button>
        </div>
      )}

      {/* Recent Cash Drawer Transactions */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#D85C3A]" />
            <span>Journal des Mouvements de Caisse</span>
          </h3>
          <span className="text-xs text-slate-500">{transactions.length} écritures</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#FAF7F2] uppercase text-[10px] font-bold text-slate-500 border-b border-[#ECE5D7]">
              <tr>
                <th className="p-3">Heure</th>
                <th className="p-3">Type</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Motif / Justificatif</th>
                <th className="p-3">Caissier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Aucun mouvement de caisse enregistré aujourd'hui.</td>
                </tr>
              ) : (
                transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className="hover:bg-[#FAF7F2]">
                    <td className="p-3 text-slate-500 font-mono">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.type === 'CashIn' ? 'bg-emerald-100 text-emerald-800' :
                        t.type === 'CashOut' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {t.type === 'CashIn' ? 'Apport (+)' : t.type === 'CashOut' ? 'Retrait (-)' : 'Dépôt coffre'}
                      </span>
                    </td>
                    <td className="p-3 font-bold font-mono-data text-slate-900">
                      {formatFCFA(t.amount, currency)}
                    </td>
                    <td className="p-3">{t.reason}</td>
                    <td className="p-3 text-slate-500">{t.cashierName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shifts History */}
      <div className="bg-white p-5 rounded-2xl border border-[#ECE5D7] space-y-4 shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#123F46]" />
          <span>Historique des Clôtures (Z de Caisse)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#FAF7F2] uppercase text-[10px] font-bold text-slate-500 border-b border-[#ECE5D7]">
              <tr>
                <th className="p-3">Session</th>
                <th className="p-3">Début</th>
                <th className="p-3">Clôture</th>
                <th className="p-3">Fond initial</th>
                <th className="p-3">Théorique</th>
                <th className="p-3">Compté réel</th>
                <th className="p-3">Écart</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shiftsHistory.map(s => (
                <tr key={s.id} className="hover:bg-[#FAF7F2]">
                  <td className="p-3 font-mono text-[11px] font-semibold text-slate-900">{s.id}</td>
                  <td className="p-3 text-slate-500">{new Date(s.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-3 text-slate-500">{s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En cours'}</td>
                  <td className="p-3 font-semibold font-mono-data">{formatFCFA(s.openingCash, currency)}</td>
                  <td className="p-3 font-mono-data">{s.expectedCash !== undefined ? formatFCFA(s.expectedCash, currency) : '—'}</td>
                  <td className="p-3 font-bold font-mono-data">{s.closingCash !== undefined ? formatFCFA(s.closingCash, currency) : '—'}</td>
                  <td className="p-3 font-mono-data">
                    {s.cashDifference !== undefined ? (
                      <span className={`font-bold ${s.cashDifference === 0 ? 'text-emerald-700' : s.cashDifference > 0 ? 'text-sky-700' : 'text-[#D85C3A]'}`}>
                        {s.cashDifference >= 0 ? `+${formatFCFA(s.cashDifference, currency)}` : `-${formatFCFA(Math.abs(s.cashDifference), currency)}`}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {s.status === 'Open' ? 'Ouverte' : 'Clôturée'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Open Shift */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleOpenShift} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-[#123F46]" />
              <span>Ouverture de Session Caisse</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fond de Caisse Initial ({currency})
              </label>
              <input
                type="number"
                value={openingFloat}
                onChange={e => setOpeningFloat(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono-data focus:outline-none focus:border-[#D85C3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Remarques / Observations
              </label>
              <textarea
                value={shiftNotes}
                onChange={e => setShiftNotes(e.target.value)}
                placeholder="Ex : Billets de 10 000 et pièces de 100/200/500 FCFA..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Valider l'Ouverture
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Close Shift with Full Calculation Breakdown */}
      {showCloseModal && currentShift && shiftCalc && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCloseShift} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D85C3A]" />
              <span>Clôture & Réconciliation de Caisse (Z)</span>
            </h3>

            {/* Shift Cash Calculation Breakdown Box */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE5D7] space-y-2.5 text-xs">
              <div className="font-bold text-slate-800 pb-2 border-b border-[#ECE5D7] flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#D85C3A]" />
                  <span>Décomposition du Théorique Espèces</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Session en cours</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>(+) Fond de caisse initial</span>
                <span className="font-mono-data font-semibold">{formatFCFA(shiftCalc.openingCash, currency)}</span>
              </div>

              <div className="flex justify-between text-[#123F46] font-medium">
                <span>(+) Ventes Espèces enregistrées</span>
                <span className="font-mono-data font-semibold">+{formatFCFA(shiftCalc.totalCashSales, currency)}</span>
              </div>

              <div className="flex justify-between text-sky-800">
                <span>(+) Apports d'espèces</span>
                <span className="font-mono-data font-semibold">+{formatFCFA(shiftCalc.cashInTotal, currency)}</span>
              </div>

              <div className="flex justify-between text-amber-800">
                <span>(-) Sorties de caisse (dépenses)</span>
                <span className="font-mono-data font-semibold">-{formatFCFA(shiftCalc.cashOutTotal, currency)}</span>
              </div>

              <div className="flex justify-between text-purple-800">
                <span>(-) Dépôts coffre-fort</span>
                <span className="font-mono-data font-semibold">-{formatFCFA(shiftCalc.safeDepositTotal, currency)}</span>
              </div>

              <div className="pt-2 border-t border-[#ECE5D7] flex justify-between items-center font-bold text-slate-900 text-sm">
                <span>= Théorique physique en caisse</span>
                <span className="font-mono-data text-[#123F46]">{formatFCFA(shiftCalc.expectedCash, currency)}</span>
              </div>
            </div>

            {/* Non-Cash Sales Notice */}
            {shiftPaymentBreakdown && (shiftPaymentBreakdown.totalSales - shiftPaymentBreakdown.cashSales > 0) && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Paiements hors espèces (non inclus dans le tiroir) :</span>
                  </span>
                  <span className="font-mono-data font-bold">{formatFCFA(shiftPaymentBreakdown.totalSales - shiftPaymentBreakdown.cashSales, currency)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 text-[11px] text-blue-800">
                  {shiftPaymentBreakdown.upiSales > 0 && <span>MoMo : {formatFCFA(shiftPaymentBreakdown.upiSales, currency)}</span>}
                  {shiftPaymentBreakdown.cardSales > 0 && <span>Carte : {formatFCFA(shiftPaymentBreakdown.cardSales, currency)}</span>}
                  {shiftPaymentBreakdown.creditSales > 0 && <span>Crédit : {formatFCFA(shiftPaymentBreakdown.creditSales, currency)}</span>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Montant Réellement Compté dans le Tiroir ({currency})
              </label>
              <input
                type="number"
                value={closingCashCount}
                onChange={e => setClosingCashCount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono-data focus:outline-none focus:border-[#D85C3A]"
                required
              />
            </div>

            {/* Live Variance / Discrepancy indicator */}
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              closingCashCount - shiftCalc.expectedCash === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : closingCashCount - shiftCalc.expectedCash > 0
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>Écart de Caisse :</span>
              <span className="font-bold font-mono-data text-xs">
                {closingCashCount - shiftCalc.expectedCash === 0
                  ? '✓ Caisse parfaitement équilibrée (Écart = 0)'
                  : closingCashCount - shiftCalc.expectedCash > 0
                  ? `+${formatFCFA(closingCashCount - shiftCalc.expectedCash, currency)} (Excédent)`
                  : `-${formatFCFA(Math.abs(closingCashCount - shiftCalc.expectedCash), currency)} (Déficit / Manquant)`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Justificatif ou Explication de l'Écart
              </label>
              <textarea
                value={shiftNotes}
                onChange={e => setShiftNotes(e.target.value)}
                placeholder="Explication en cas d'écart constaté..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Valider & Clôturer le Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Cash In/Out */}
      {showTxnModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddTxn} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#ECE5D7]">
            <h3 className="text-base font-bold text-slate-800">
              Enregistrer un Mouvement d'Espèces
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nature du Mouvement</label>
              <select
                value={txnType}
                onChange={e => setTxnType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none"
              >
                <option value="CashIn">Apport de Monnaie (Entrée)</option>
                <option value="CashOut">Sortie de Caisse / Menue dépense</option>
                <option value="SafeDeposit">Versement au Coffre-Fort</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Montant ({currency})</label>
              <input
                type="number"
                value={txnAmount}
                onChange={e => setTxnAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 font-mono-data focus:outline-none focus:border-[#D85C3A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Motif / Justification</label>
              <input
                type="text"
                value={txnReason}
                onChange={e => setTxnReason(e.target.value)}
                placeholder="Ex : Apport rouleaux de 100 FCFA, Achat glace..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTxnModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#123F46] hover:bg-[#0E3238] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Enregistrer l'Écriture
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
